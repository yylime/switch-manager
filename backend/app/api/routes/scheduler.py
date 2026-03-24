"""定时任务 API"""

import logging
import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlmodel import select
from apscheduler.triggers.cron import CronTrigger
import datetime

from app.services.scheduler import backup_scheduler
from app.api.deps import CurrentUser, get_current_active_superuser, SessionDep
from app.models import BackupScheduler

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/schedule", tags=["schedule"])


def validate_cron(cron: str):
    try:
        CronTrigger.from_crontab(cron)
        return True
    except ValueError as e:
        raise HTTPException(400, f"Cron 表达式错误: {e}")


class BackupJobCreate(BaseModel):
    name: str
    job_type: str = Field(pattern="^(full_backup|failed_backup)$")
    cron: str = Field(description="Cron 表达式，例如: 0 2 * * *")
    enabled: bool = True


@router.post("/", dependencies=[Depends(get_current_active_superuser)])
def create_backup_job(
    request: BackupJobCreate,
    session: SessionDep,
):
    """创建备份任务"""
    validate_cron(request.cron)
    job_id = (
        f"backup_{request.job_type}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    )

    existing = session.exec(
        select(BackupScheduler).where(BackupScheduler.job_id == job_id)
    ).first()

    if existing:
        return HTTPException(404, "任务已存在")

    job = BackupScheduler(
        name=request.name,
        job_id=job_id,
        job_type=request.job_type,
        cron=request.cron,
        enabled=request.enabled,
    )

    session.add(job)
    session.commit()

    if request.enabled:
        backup_scheduler.add_job(
            job_id=job.job_id,
            job_type=job.job_type,
            cron=job.cron,
            name=job.name,
        )

    return {"status": "success", "job_id": job.job_id, "job_type": job.job_type}


@router.get("/jobs", response_model=list[BackupScheduler])
def list_backup_jobs(session: SessionDep):
    jobs = session.exec(select(BackupScheduler)).all()
    # jobs = backup_scheduler.list_jobs()
    return jobs


class BackupJobUpdate(BaseModel):
    name: str | None = None
    job_type: str | None = Field(pattern="^(full_backup|failed_backup)$")
    cron: str | None = None
    enabled: bool | None = None


@router.put("/{id}")
def update_backup_job( session: SessionDep, request: BackupJobUpdate, id: uuid.UUID):
    job = session.get(BackupScheduler, id)
    if not job:
        raise HTTPException(404, "Job not found")

    validate_cron(request.cron)
        
    update_dict = request.model_dump(exclude_unset=True)
    job.sqlmodel_update(update_dict)

    session.add(job)
    session.commit()
    session.refresh(job)

    # 重新加载调度
    backup_scheduler.remove_job(job.job_id)
    if job.enabled:
        backup_scheduler.add_job(job.job_id, job.job_type, job.cron, job.name)

    return {"status": "success"}


@router.delete("/{id}")
def delete_backup_job(session: SessionDep, id: uuid.UUID):
    job = session.get(BackupScheduler, id)
    if not job:
        raise HTTPException(404, "Job not found")

    backup_scheduler.remove_job(job.job_id)
    session.delete(job)
    session.commit()

    return {"status": "deleted"}
