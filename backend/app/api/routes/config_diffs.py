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
    权限验证：通过 current_user: CurrentUser 依赖项自动完成。
    """
    # current_user 已注入，表示权限验证通过
    
    config_diffs_dates = os.listdir("data/switch_diffs")
    config_diffs_dates.sort()
    keys = set(config_diffs_dates)
    
    # FastAPI 会自动验证 config_date 是否为有效的 date 类型
    # 如果前端未传递，会直接返回 422 错误，因此无需手动检查是否为空
    current_date_str = config_date.strftime("%Y-%m-%d")
    
    if current_date_str not in keys:
        return SwitchConfigDiffShow(date_list=config_diffs_dates, content="当前日期没有执行配置比对", current_date=current_date_str)
    
    with open(f"data/switch_diffs/{current_date_str}", "r") as f:
        config_diffs = f.read()
    
    return SwitchConfigDiffShow(date_list=config_diffs_dates, content=config_diffs, current_date=current_date_str)
    

# 前端应该分为三个部分
# 获取交换机列表、获取交换机配置可用日期、获取两个配置进行对比

class SwitchList(SQLModel):
    id: uuid.UUID
    name: str
@router.get("/get_switch_list", response_model=list[SwitchList])
def get_switch_list(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get switch list.
    id bind name
    """
    switch_list = session.exec(select(Switch.id, Switch.name)).all()
    return switch_list

@router.get("/get_switch_config_date", response_model=list[date])
def get_switch_config_date(session: SessionDep, current_user: CurrentUser, id: uuid.UUID | str) -> Any:
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
def get_switch_config_diffs(session: SessionDep, current_user: CurrentUser, source_id: uuid.UUID, source_date: date, target_id: uuid.UUID, target_date: date) -> Any:
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
