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
from app.services.task import task

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
        
@task(task_type="full_backup", message="正在执行全量备份...")
def backup_all_switches_job() -> None:
    backup_all_switch()
    build_everyday_switch_diff()
    build_ip_interface()
    build_everyday_statics()
    get_vrf_for_switch()

@task(task_type="failed_switches_backup", message="正在执行失败交换机备份...")
def backup_failed_switches_job() -> None:
    backup_failed_switches()
    build_everyday_switch_diff()
    build_ip_interface()
    get_vrf_for_switch()
    build_everyday_statics()

@task(task_type="flush_arp", message="正在执行刷新ARP...")
def flush_arp():
    read_all_arp()

if __name__ == "__main__":
    build_everyday_statics()