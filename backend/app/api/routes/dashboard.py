import uuid
from typing import Any

from fastapi import APIRouter
from sqlalchemy import case
from sqlmodel import SQLModel, func, select

from app.api.deps import SessionDep, CurrentUser
from app.models import SwitchConfig, Switch, EverydayStatistics, Branch

from datetime import date, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class Dashboard(SQLModel):
    switch_backup_count: int
    switch_backup_error_count: int = 0
    vrf_count: int
    vrf_diff_count: int
    iptable_count: int
    iptable_diff_count: int
    config_diff_count: int


@router.get("/card", response_model=Dashboard)
def get_card_data(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Retrieve dashboard.
    """
    today = date.today()

    stmt = select(
        func.count().label("total"),
        func.count().filter(SwitchConfig.status == "success").label("success_count"),
        func.count().filter(SwitchConfig.status != "success").label("fail_count"),
    ).where(SwitchConfig.created == today)
    total_count = session.exec(select(func.count()).select_from(Switch)).one()
    result = session.exec(stmt).one()

    today_statistics = session.exec(
        select(EverydayStatistics).where(EverydayStatistics.add_date == today)
    ).one_or_none()

    return Dashboard(
        switch_backup_count=result.success_count,
        switch_backup_error_count=total_count - result.success_count,
        vrf_count=today_statistics.vrf_count if today_statistics else 0,
        vrf_diff_count=today_statistics.vrf_different_count if today_statistics else 0,
        iptable_count=today_statistics.ip_count if today_statistics else 0,
        iptable_diff_count=(
            today_statistics.ip_different_count if today_statistics else 0
        ),
        config_diff_count=(
            today_statistics.switch_different_count if today_statistics else 0
        ),
    )


@router.get("/branch", response_model=list[dict[str, str | int | uuid.UUID | float]])
def get_branch_statistics(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Retrieve branch statistics.
    """
    today = date.today()
    stmt = (
        select(
            Branch.name.label("branch"),
            Branch.id.label("branch_id"),
            func.count(Switch.id).label("total"),
            func.coalesce(
                func.sum(case((SwitchConfig.status == "success", 1), else_=0)),
                0,
            ).label("success"),
        )
        .select_from(Switch)
        .join(Branch, Switch.branch_id == Branch.id)
        .outerjoin(
            SwitchConfig,
            (SwitchConfig.switch_id == Switch.id) & (SwitchConfig.created == today),
        )
        .group_by(Branch.name, Branch.id)
    )
    rows = session.exec(stmt).all()
    return [
        {
            "branch": row.branch,
            "id": row.branch_id,
            "total": row.total,
            "success": row.success,
            "fail": row.total - row.success,
            "rate": round(row.success / row.total * 100, 2) if row.total else 0,
        }
        for row in rows
    ]


@router.get("/success_count_by_day", response_model=list[Any])
def get_success_count_by_day(session: SessionDep, current_user: CurrentUser, past_day: int = 7) -> Any:
    start_date = date.today() - timedelta(days=past_day - 1)
    stmt = (
        select(
            func.date(SwitchConfig.created).label("time"),
            func.count().label("count"),
        )
        .where(
            SwitchConfig.status == "success",
            SwitchConfig.created >= start_date,
        )
        .group_by(func.date(SwitchConfig.created))
        .order_by(func.date(SwitchConfig.created))
    )
    rows = session.exec(stmt).all()
    # 查询结果转 dict
    data_map = {r.time: r.count for r in rows}

    result = []
    for i in range(past_day):
        day = start_date + timedelta(days=i)
        result.append({
            "time": day,
            "count": data_map.get(day, 0)  # 没有就补0
        })

    return result
