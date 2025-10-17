import datetime
import textfsm

from app.api.deps import db_session
from app.models import Vrf, SwitchConfig


def build_vrf_infomation():
    today = datetime.date.today()
    with db_session() as session:

        today_cfgs = (
            session.query(SwitchConfig)
            .filter(SwitchConfig.created >= today, SwitchConfig.status == "success")
            .all()
        )

        for cfg in today_cfgs:

            with open("app/switches/config/fsm_templates/vrf.textfsm") as f:
                re_table = textfsm.TextFSM(f)
            data = re_table.ParseText(cfg.get_config())
            if len(data) > 0:
                for vrf, rd, rt in data:
                    vrfs = session.query(Vrf).filter(Vrf.rd == rd).one_or_none()
                    if vrfs is None:
                        new_vrf = Vrf(name=vrf, rd=rd, rt=rt, description="")
                        session.add(new_vrf)
                        session.commit()
                        session.refresh(new_vrf)


if __name__ == "__main__":
    build_vrf_infomation()
