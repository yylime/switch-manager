import datetime
import os
from app.models import Switch, SwitchConfig
from app.api.deps import db_session
from app.services.switches.config.utils import get_diff

def build_everyday_switch_diff() -> None:
    """构建每天的交换机配置差异"""
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
    if not os.path.exists("data/switch_diffs"):
        os.makedirs("data/switch_diffs")
    # no need to save the file if there is no difference
    if "+++" in diff_all:
        with open(f"data/switch_diffs/{today}", "w") as f:
            f.write(diff_all)
