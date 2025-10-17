import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import SwitchConfig, Vrf, Switch, IPtables

from datetime import date

router = APIRouter(prefix="/dashboard", tags=["dashboard"])



class Dashboard(SQLModel):
    switch_backup_count: int
    
    vrf_count: int
    vrf_diff_count: int
    iptable_count: int
    iptable_diff_count: int
    config_diff_count: int
    
    
@router.get("/", response_model=Dashboard)
def get_dashboard(session: SessionDep) -> Any:
    """
    Retrieve dashboard.
    """
    today = date.today()
    
    switch_backup_count_statement = select(func.count()).select_from(SwitchConfig).where(SwitchConfig.created == today)
    switch_backup_count = session.exec(switch_backup_count_statement).one()
    
    vrf_count_statement = select(func.count()).select_from(Vrf)
    vrf_count = session.exec(vrf_count_statement).one()
    
    iptable_count_statement = select(func.count()).select_from(IPtables)
    iptable_count = session.exec(iptable_count_statement).one()
    
    return Dashboard(
        switch_backup_count=switch_backup_count,
        vrf_count=vrf_count,
        vrf_diff_count=2,
        iptable_count=iptable_count,
        iptable_diff_count=9,
        config_diff_count=15,
    )
