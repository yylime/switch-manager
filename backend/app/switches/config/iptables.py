import datetime
import textfsm

from sqlalchemy import delete

from app.api.deps import db_session
from app.models import IPtables, SwitchConfig
from app.switches.config.utils import cal_mask_len


def build_ip_interface():
    today = datetime.date.today()
    with db_session() as session:
        # reset iptables
        session.execute(delete(IPtables))

        today_cfgs = (
            session.query(SwitchConfig)
            .filter(SwitchConfig.created >= today, SwitchConfig.status == "success")
            .all()
        )

        for cfg in today_cfgs:

            with open("app/switches/config/fsm_templates/show_run.textfsm") as f:
                re_table = textfsm.TextFSM(f)
            data = re_table.ParseText(cfg.get_config())
            for interface, ip, mask, vrf, acl, status in data:
                iptable_item = IPtables(
                    interface=interface,
                    ip=ip,
                    mask=cal_mask_len(mask),
                    status=status,
                    vrf=vrf,
                    acl=acl,
                    switch=cfg.switch,
                )
                session.add(iptable_item)


if __name__ == "__main__":
    build_ip_interface()
