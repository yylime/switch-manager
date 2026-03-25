import datetime
import logging
import os

from app.models import BackupTask, BackupTaskCreate, BackupTaskUpdate, EverydayStatistics, Vrf, IPtables
from app.api.deps import db_session
from app.crud import create_backup_task, update_backup_task
from app.services.switches.config.backup import backup_all_switch, backup_failed_switches
from app.services.switches.config.iptables import build_ip_interface
from app.services.switches.config.diffs import build_everyday_switch_diff
from app.services.switches.arp.main import read_all_arp, get_vrf_for_switch

logger = logging.getLogger(__name__)




def build_everyday_statics() -> None:
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)

    with db_session() as session:

        today_statics = (
            session.query(EverydayStatistics)
            .filter(EverydayStatistics.add_date == today)
            .one_or_none()
        )

        lastday_statics = (
            session.query(EverydayStatistics)
            .filter(EverydayStatistics.add_date == yesterday)
            .one_or_none()
        )

        if not today_statics:
            today_statics = EverydayStatistics(add_date=today)
            session.add(today_statics)
            session.commit()
            session.refresh(today_statics)

        # 当前统计
        vrf_count = session.query(Vrf).count()
        ip_count = session.query(IPtables).count()

        today_statics.vrf_count = vrf_count
        today_statics.ip_count = ip_count
        
        # 计算交换机差异总数
        if today.strftime("%Y-%m-%d") in os.listdir("data/switch_diffs"):
            with open(f"data/switch_diffs/{today}", "r") as f:
                text_diffs = f.read()
            today_statics.switch_different_count = text_diffs.count("+++")
        # 计算差值
        if lastday_statics:
            today_statics.vrf_different_count = vrf_count - lastday_statics.vrf_count
            today_statics.ip_different_count = ip_count - lastday_statics.ip_count
        else:
            today_statics.vrf_different_count = vrf_count
            today_statics.ip_different_count = ip_count
        
        session.commit()
        



def backup_all_switches_job() -> None:
    """定时备份所有交换机的任务"""
    task = None
    try:
        # 创建任务记录
        with db_session() as session:
            task_create = BackupTaskCreate(
                task_type="backup_all_switches",
                status="running",
                message="任务正在执行中..."
            )
            task = create_backup_task(session=session, task_in=task_create)
            task_id = task.id
        
        logger.info(f"[{task_id}] 开始执行每日备份任务...")
        backup_all_switch()
        build_everyday_switch_diff()
        build_ip_interface()
        build_everyday_statics()
        get_vrf_for_switch()
        
        # 更新任务为成功
        with db_session() as session:
            task_to_update = session.query(BackupTask).filter(BackupTask.id == task_id).one()
            task_update = BackupTaskUpdate(
                status="success",
                message="每日备份任务完成，已备份所有交换机配置",
                end_time=datetime.datetime.now()
            )
            update_backup_task(session=session, db_task=task_to_update, task_in=task_update)
        logger.info(f"[{task_id}] 每日备份任务完成")
    except Exception as e:
        logger.error(f"每日备份任务执行失败: {e}", exc_info=True)
        # 更新任务为失败
        if task:
            with db_session() as session:
                task_to_update = session.query(BackupTask).filter(BackupTask.id == task.id).one()
                task_update = BackupTaskUpdate(
                    status="failed",
                    message="备份任务执行失败",
                    error=str(e),
                    end_time=datetime.datetime.now()
                )
                update_backup_task(session=session, db_task=task_to_update, task_in=task_update)


def backup_failed_switches_job() -> None:
    """定时备份失败的交换机的任务"""
    task = None
    try:
        # 创建任务记录
        with db_session() as session:
            task_create = BackupTaskCreate(
                task_type="backup_failed_switches",
                status="running",
                message="任务正在执行中..."
            )
            task = create_backup_task(session=session, task_in=task_create)
            task_id = task.id
        
        logger.info(f"[{task_id}] 开始执行备份失败交换机任务...")
        backup_failed_switches()
        build_everyday_switch_diff()
        build_ip_interface()
        get_vrf_for_switch()
        build_everyday_statics()
        
        # 更新任务为成功
        with db_session() as session:
            task_to_update = session.query(BackupTask).filter(BackupTask.id == task_id).one()
            task_update = BackupTaskUpdate(
                status="success",
                message="备份失败交换机任务完成",
                end_time=datetime.datetime.now()
            )
            update_backup_task(session=session, db_task=task_to_update, task_in=task_update)
        logger.info(f"[{task_id}] 备份失败交换机任务完成")
    except Exception as e:
        logger.error(f"备份失败交换机任务执行失败: {e}", exc_info=True)
        # 更新任务为失败
        if task:
            with db_session() as session:
                task_to_update = session.query(BackupTask).filter(BackupTask.id == task.id).one()
                task_update = BackupTaskUpdate(
                    status="failed",
                    message="备份失败交换机任务执行失败",
                    error=str(e),
                    end_time=datetime.datetime.now()
                )
                update_backup_task(session=session, db_task=task_to_update, task_in=task_update)
                
### arp ###

def flush_arp():
    try:
        # 创建任务记录
        with db_session() as session:
            task_create = BackupTaskCreate(
                task_type="backup_failed_switches",
                status="running",
                message="任务正在执行中..."
            )
            task = create_backup_task(session=session, task_in=task_create)
            task_id = task.id
        
        logger.info(f"[{task_id}] 开始执行刷新ARP...")
        read_all_arp()
        # 更新任务为成功
        with db_session() as session:
            task_to_update = session.query(BackupTask).filter(BackupTask.id == task_id).one()
            task_update = BackupTaskUpdate(
                status="success",
                message="执行刷新ARP成功",
                end_time=datetime.datetime.now()
            )
            update_backup_task(session=session, db_task=task_to_update, task_in=task_update)
        logger.info(f"[{task_id}] 执行刷新ARP任务完成")
    except Exception as e:
        logger.error(f"刷新ARP任务失败: {e}", exc_info=True)
        # 更新任务为失败
        if task:
            with db_session() as session:
                task_to_update = session.query(BackupTask).filter(BackupTask.id == task.id).one()
                task_update = BackupTaskUpdate(
                    status="failed",
                    message="刷新ARP任务失败",
                    error=str(e),
                    end_time=datetime.datetime.now()
                )
                update_backup_task(session=session, db_task=task_to_update, task_in=task_update)

if __name__ == "__main__":
    build_everyday_statics()