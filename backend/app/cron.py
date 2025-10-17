import datetime
import textfsm
import json
import argparse
import os

from app.models import Switch, SwitchConfig, Vrf
from app.api.deps import db_session
from app.switches.config.utils import get_diff
from app.switches.config.backup import backup_all_switch, backup_failed_switches
from app.switches.config.iptables import build_ip_interface



def build_everyday_switch_diff():
    today = datetime.date.today()
    with db_session() as session:
        # 获取今天和昨天的配置
        yesterday = datetime.datetime.today() - datetime.timedelta(days=1)
        switches = session.query(Switch).all()
        diff_all = ""
        for switch in switches:
            cur_cfg = (
                session.query(SwitchConfig)
                .filter(
                    SwitchConfig.switch_id == switch.id,
                    SwitchConfig.created == today,
                    SwitchConfig.status == "success",
                )
                .one_or_none()
            )
            last_cfg = (
                session.query(SwitchConfig)
                .filter(
                    SwitchConfig.switch_id == switch.id,
                    SwitchConfig.created == yesterday,
                    SwitchConfig.status == "success",
                )
                .one_or_none()
            )
            if cur_cfg and last_cfg:
                diff = get_diff(
                    last_cfg.get_config(),
                    cur_cfg.get_config(),
                    f"{yesterday}/{switch.name}",
                    f"{today}/{switch.name}",
                )
                if diff:
                    diff_all += diff + "\n\n"
        # 记录修改个数
        # modified_count = diff_all.count("+++")
        # log = session.query(NmsLogs).filter(NmsLogs.created == today).one_or_none()
        # if log is None:
        #     log = NmsLogs(created=today, switch_modified_count=modified_count)
        #     session.add(log)
        # else:
        #     log.switch_modified_count = modified_count
    if not os.path.exists("data/switch_diffs"):
        os.makedirs("data/switch_diffs")
    with open(f"data/switch_diffs/{today}", "w") as f:
        f.write(diff_all)


def cron():
    # 每天备份所有交换机配置 2000s
    backup_all_switch()
    # 构建每天的交换机配置差异
    build_everyday_switch_diff()
    # # 更新VRF表
    # update_vrf_tables()
    # # 构建IP接口数据
    build_ip_interface()
    # # 构建交换机接口使用情况 1000s
    # switches_interfaces_use_cron()


def cron_failed_switches():
    # 备份失败的交换机配置
    backup_failed_switches()
    # # 构建每天的交换机配置差异
    build_everyday_switch_diff()
    # # 更新VRF表
    # update_vrf_tables()
    # # 构建IP接口数据
    build_ip_interface()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--job", required=True, help="要执行的任务名称")
    args = parser.parse_args()

    if args.job == "backup_all_switches":
        cron()
    elif args.job == "backup_failed_switches":
        cron_failed_switches()
    else:
        print(f"未知任务: {args.job}")
