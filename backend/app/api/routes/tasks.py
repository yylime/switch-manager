from typing import Any
from fastapi import APIRouter, Query
from sqlmodel import func, select, or_, and_

from app.api.deps import SessionDep, CurrentUser
from app.models import BackupTask, BackupTasksPublic


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=BackupTasksPublic)
def read_backup_tasks(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    search_text: str = "",
    status: list[str] = Query(default=[], alias="status"),
) -> Any:
    """
    Retrieve backup tasks.
    """

    # 搜索条件（忽略大小写）
    search_param = (
        or_(
            BackupTask.task_type.ilike(f"%{search_text}%"),
            BackupTask.message.ilike(f"%{search_text}%"),
        )
        if search_text
        else True
    )
    filters = [search_param]

    if status:
        filters.append(BackupTask.status.in_(status))

    # 总数
    count_query = select(func.count()).select_from(BackupTask).where(and_(*filters))
    count = session.exec(count_query).one()

    # 查询 Switch 列表 + eager load latest_config
    items = session.exec(
        select(BackupTask).where(and_(*filters)).offset(skip).limit(limit).order_by(
            BackupTask.created_at.desc()
        )
    ).all()

    return BackupTasksPublic(data=items, count=count)
