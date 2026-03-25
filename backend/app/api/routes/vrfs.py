from typing import Any

from fastapi import APIRouter, BackgroundTasks
from sqlmodel import func, select, or_

from app.api.deps import SessionDep, CurrentUser
from app.models import Vrf, VrfsPublic
from app.services.switches.config.vrfs import build_vrf_infomation


router = APIRouter(prefix="/vrfs", tags=["vrfs"])


@router.get("/", response_model=VrfsPublic)
def read_vrfs(
    session: SessionDep, skip: int = 0, limit: int = 100, search_text: str = ""
) -> Any:
    """
    Retrieve iptables.
    """

    # 搜索条件
    search_param = (
        or_(
            Vrf.name.ilike(f"%{search_text}%"),
            Vrf.rt.ilike(f"%{search_text}%"),
            Vrf.rd.ilike(f"%{search_text}%"),
        )
        if search_text
        else True
    )

    # 总数
    count_query = select(func.count()).select_from(Vrf).where(search_param)
    count = session.exec(count_query).one()

    # 查询 Switch 列表 + eager load latest_config
    items = session.exec(
        select(Vrf).where(search_param).offset(skip).limit(limit)
    ).all()

    return VrfsPublic(data=items, count=count)

@router.get("/flush_vrf", response_model=dict)
def flush_vrf_background(
    session: SessionDep, current_user: CurrentUser, background_tasks: BackgroundTasks
) -> Any:
    """
    Flush iptables.
    """
    background_tasks.add_task(build_vrf_infomation)
    return {"status": "success", "message": "刷新成功"}
