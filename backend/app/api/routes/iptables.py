
from typing import Any


from fastapi import APIRouter
from sqlmodel import func, select, or_

from sqlalchemy.orm import selectinload


from app.api.deps import SessionDep

from app.models import (
    Switch,
    IPtables,
    IPtablesPublic
)


router = APIRouter(prefix="/iptables", tags=["iptables"])


@router.get("/", response_model=IPtablesPublic)
def read_iptables(
    session: SessionDep, skip: int = 0, limit: int = 100, search_text: str = ""
) -> Any:
    """
    Retrieve iptables.
    """

    # 搜索条件
    search_param = (
        or_(
            IPtables.ip.contains(search_text),
            Switch.name.contains(search_text, autoescape=True),
        )
        if search_text else True
    )

    # 总数
    count_query = (
        select(func.count())
        .select_from(IPtables)
        .join(Switch, IPtables.switch)  # 关联 Switch
        .where(search_param)
    )
    count = session.exec(count_query).one()

    # 查询 Switch 列表 + eager load latest_config
    items = session.exec(
        select(IPtables)
        .join(Switch, IPtables.switch)
        .where(search_param)
        .options(
            selectinload(IPtables.switch).load_only(Switch.name, Switch.ip),
            # selectinload(IPtables.switch).selectinload(Switch.branch)
        )
        .offset(skip)
        .limit(limit)
    ).all()
    
    return IPtablesPublic(data=items, count=count)
