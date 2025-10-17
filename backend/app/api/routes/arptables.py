
from typing import Any


from fastapi import APIRouter
from sqlmodel import func, select, or_

from sqlalchemy.orm import selectinload


from app.api.deps import SessionDep

from app.models import (
    Switch,
    ArpTable,
    ArpTablesPublic
)


router = APIRouter(prefix="/arptables", tags=["arptables"])


@router.get("/", response_model=ArpTablesPublic)
def read_arptables(
    session: SessionDep, skip: int = 0, limit: int = 100, search_text: str = ""
) -> Any:
    """
    Retrieve iptables.
    """

    # 搜索条件
    search_param = (
        or_(
            ArpTable.ip.ilike(f"%{search_text}%"),
            ArpTable.mac.ilike(f"%{search_text}%"),
            Switch.name.ilike(f"%{search_text}%"),
        )
        if search_text else True
    )

    # 总数
    count_query = (
        select(func.count())
        .select_from(ArpTable)
        .join(Switch, ArpTable.switch)  # 关联 Switch
        .where(search_param)
    )
    count = session.exec(count_query).one()

    # 查询 Switch 列表 + eager load latest_config
    items = session.exec(
        select(ArpTable)
        .join(Switch, ArpTable.switch)
        .where(search_param)
        .options(
            selectinload(ArpTable.switch).load_only(Switch.name, Switch.ip),
        )
        .offset(skip)
        .limit(limit)
    ).all()
    
    return ArpTablesPublic(data=items, count=count)
