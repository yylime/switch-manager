# app/cron/scheduler.py

import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.api.deps import db_session
from app.models import BackupScheduler
from app.services.cron_func import backup_all_switch, backup_failed_switches, flush_arp

logger = logging.getLogger(__name__)


JOB_FUNC_MAP = {
    "full_backup": backup_all_switch,
    "failed_backup": backup_failed_switches,
    "flush_arp": flush_arp
}


class BackupSchedulerClass:
    def __init__(self):
        self.scheduler = BackgroundScheduler()

    def start(self):
        self.scheduler.start()
        self.load_jobs_from_db()
        logger.info("Scheduler started")

    def load_jobs_from_db(self):
        """从数据库加载任务"""
        with db_session() as session:
            jobs = session.query(BackupScheduler).filter(
                BackupScheduler.enabled == True
            ).all()
            for job in jobs:
                self.add_job(job.job_id, job.job_type, job.cron, job.name)

    def add_job(self, job_id: str, job_type: str, cron: str, name: str):
        """添加任务"""
        func = JOB_FUNC_MAP[job_type]
        trigger = CronTrigger.from_crontab(cron)
        try:
            self.scheduler.add_job(
                func,
                trigger,
                id=job_id,
                name=name,
                replace_existing=True,
            )
            logger.info(f"Added job {job_id} -> {cron}")
        except:
            logger.warning(f"Job {job_id} add failed")


    def remove_job(self, job_id: str):
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Removed job {job_id}")
        except Exception:
            logger.warning(f"Job {job_id} not found")

    def list_jobs(self):
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append(
                {
                    "job_id": job.id,
                    "name": job.name,
                    "next_run": str(job.next_run_time),
                    "trigger": str(job.trigger),
                }
            )
        return jobs


backup_scheduler = BackupSchedulerClass()
