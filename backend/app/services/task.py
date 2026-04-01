import datetime
import functools
import traceback
import logging

from app.api.deps import db_session
from app.crud import create_backup_task, update_backup_task
from app.models import BackupTaskCreate, BackupTaskUpdate, BackupTask

logger = logging.getLogger(__name__)

def task(task_type: str, message: str = ""):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            task_obj = None
            if callable(message):
                msg = message(*args, **kwargs)
            else:
                msg = message
            try:
                # 1. 创建任务记录
                with db_session() as session:
                    task_create = BackupTaskCreate(
                        task_type=task_type,
                        status="running",
                        message=f"任务开始: {msg}",
                    )
                    task_obj = create_backup_task(session=session, task_in=task_create)
                    task_id = task_obj.id

                logger.info(f"[{task_id}] 任务开始: {task_type}")

                # 2. 执行任务
                result = func(*args, **kwargs)

                # 3. 更新任务成功
                with db_session() as session:
                    task_to_update = session.query(BackupTask).filter(BackupTask.id == task_id).one()
                    task_update = BackupTaskUpdate(
                        status="success",
                        message=f"任务成功: {msg}",
                        end_time=datetime.datetime.now()
                    )
                    update_backup_task(session=session, db_task=task_to_update, task_in=task_update)

                logger.info(f"[{task_id}] 任务成功: {task_type}")
                return result

            except Exception as e:
                logger.error(f"任务执行失败: {e}")
                logger.error(traceback.format_exc())

                # 4. 更新任务失败
                if task_obj:
                    with db_session() as session:
                        task_to_update = session.query(BackupTask).filter(BackupTask.id == task_obj.id).one()
                        task_update = BackupTaskUpdate(
                            status="failed",
                            message=f"任务失败: {msg}",
                            error=str(e),
                            end_time=datetime.datetime.now()
                        )
                        update_backup_task(session=session, db_task=task_to_update, task_in=task_update)

                raise e
        return wrapper
    return decorator