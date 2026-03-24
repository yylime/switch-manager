import os
from typing import Any
import uuid
from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel
from sqlmodel import func, select
from sqlalchemy.exc import IntegrityError
from datetime import date

from app.api.deps import CurrentUser, SessionDep
from app.models import SwitchConfig, Switch
from app.services.switches.config.utils import get_diff

router = APIRouter(prefix="/diffs", tags=["diffs"])


class SwitchConfigDiffShow(SQLModel):
    date_list: list[str]
    content: str
    current_date: str


@router.post("/diff", response_model=SwitchConfigDiffShow)
def get_config_diffs(session: SessionDep, current_user: CurrentUser, config_date: date) -> Any:
    """
    Get switch configuration differences.
    """
    config_diffs_dates = os.listdir("data/switch_diffs")
    config_diffs_dates.sort()
    keys = set(config_diffs_dates)
    config_date = date.today().strftime("%Y-%m-%d") if not config_date else config_date.strftime("%Y-%m-%d")
    
    if config_date not in keys:
        return SwitchConfigDiffShow(date_list=config_diffs_dates, content="当前日期没有执行配置比对", current_date=config_date)
    
    with open(f"data/switch_diffs/{config_date}", "r") as f:
        config_diffs = f.read()
    
    return SwitchConfigDiffShow(date_list=config_diffs_dates, content=config_diffs, current_date=config_date)
    

# 前端应该分为三个部分
# 获取交换机列表、获取交换机配置可用日期、获取两个配置进行对比

class SwitchList(SQLModel):
    id: uuid.UUID
    name: str
@router.get("/get_switch_list", response_model=list[SwitchList])
def get_switch_list(session: SessionDep,) -> Any:
    """
    Get switch list.
    id bind name
    """
    switch_list = session.exec(select(Switch.id, Switch.name)).all()
    return switch_list

@router.get("/get_switch_config_date", response_model=list[date])
def get_switch_config_date(session: SessionDep, id: uuid.UUID | str) -> Any:
    """
    Get switch config date.
    """
    if not id:
        return []
    rows = session.exec(
        select(SwitchConfig.created)
        .where(SwitchConfig.switch_id == id)
        .order_by(SwitchConfig.created.asc())
    ).all()
    return rows

@router.post("/get_switch_config_diffs", response_model=str)
def get_switch_config_diffs(session: SessionDep, source_id: uuid.UUID, source_date: date, target_id: uuid.UUID, target_date: date) -> Any:
    """
    Get switch config diffs.
    """
    source_config = session.exec(
        select(SwitchConfig)
        .where(SwitchConfig.switch_id == source_id)
        .where(SwitchConfig.created == source_date)
        .where(SwitchConfig.status == "success")
    ).one_or_none()
    
    target_config = session.exec(
        select(SwitchConfig)
        .where(SwitchConfig.switch_id == target_id)
        .where(SwitchConfig.created == target_date)
        .where(SwitchConfig.status == "success")
    ).one_or_none()
    
    if not source_config or not target_config:
        raise HTTPException(status_code=404, detail="配置不存在")
    
    res = get_diff(source_config.get_config(), target_config.get_config(), f"{source_config.switch.name}_{source_date}", f"{target_config.switch.name}_{target_date}")
    return res
