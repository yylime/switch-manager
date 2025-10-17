import uuid
from typing import Any
from typing import List

from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Body
from sqlmodel import func, select, or_, and_, delete
from sqlalchemy import desc
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
import csv
from datetime import datetime, date

from app.api.deps import CurrentUser, SessionDep

from app.models import (
    Switch,
    SwitchCreate,
    SwitchPublic,
    SwitchesPublic,
    SwitchUpdate,
    Message,
    Branch,
    Inspector,
    SwitchLoginType,
    SwitchConfig,
    SwitchConfigShow,
    SwitchLite
)

from app.switches.config.backup import download_config

router = APIRouter(prefix="/switches", tags=["switches"])


@router.get("/", response_model=SwitchesPublic)
def read_switches(
    session: SessionDep, skip: int = 0, limit: int = 100, search_text: str = ""
) -> Any:
    """
    Retrieve switches with latest config.
    """

    # 搜索条件
    search_param = (
        or_(
            Switch.name.ilike(f"%{search_text}%"),
            Switch.ip.ilike(f"%{search_text}%"),
            Switch.hardware_type.ilike(f"%{search_text}%"),
            Switch.description.ilike(f"%{search_text}%"),
        )
        if search_text
        else True
    )

    # 总数
    count = session.exec(
        select(func.count()).select_from(Switch).where(search_param)
    ).one()

    # 查询 Switch 列表 + eager load latest_config
    switches = session.exec(
        select(Switch)
        .where(search_param)
        .options(
            selectinload(Switch.branch),
            selectinload(Switch.login_type),
            selectinload(Switch.latest_config),  # 一次性加载最新配置
        )
        .offset(skip)
        .limit(limit)
    ).all()

    return SwitchesPublic(data=switches, count=count)


@router.get("/{id}", response_model=SwitchPublic)
def read_switch(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get switch by ID.
    """
    switch = session.get(Switch, id)
    if not switch:
        raise HTTPException(status_code=404, detail="Switch not found")
    return switch


@router.post("/", response_model=SwitchPublic)
def create_switch(*, session: SessionDep, switch_in: SwitchCreate) -> Any:
    """
    Create new switch.
    """
    ip = switch_in.ip
    # Pre-check to return a friendly 409 if IP already exists
    if session.exec(select(Switch).where(Switch.ip == ip)).first():
        raise HTTPException(
            status_code=409,
            detail={"message": "Switch IP already exists", "code": "switch_exists"},
        )

    switch = Switch.model_validate(switch_in)
    session.add(switch)
    try:
        session.commit()
        session.refresh(switch)
    except IntegrityError:
        # In case of a race condition where another process inserted the same IP
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail={"message": "Switch IP already exists", "code": "switch_exists"},
        )
    return switch


@router.put("/{id}", response_model=SwitchPublic)
def update_switch(
    *,
    session: SessionDep,
    id: uuid.UUID,
    switch_in: SwitchUpdate,
) -> Any:
    """
    Update a switch.
    """
    switch = session.get(Switch, id)
    if not switch:
        raise HTTPException(status_code=404, detail="Switch not found")

    if session.exec(select(Switch).where(Switch.ip == switch_in.ip)).first():
        raise HTTPException(
            status_code=409,
            detail={"message": "Switch IP already exists", "code": "switch_exists"},
        )

    update_dict = switch_in.model_dump(exclude_unset=True)
    switch.sqlmodel_update(update_dict)
    session.add(switch)
    try:
        session.commit()
        session.refresh(switch)
    except IntegrityError:
        session.rollback()
        # IP uniqueness conflict (or other integrity constraint)
        raise HTTPException(
            status_code=409,
            detail={"message": "Switch IP already exists", "code": "switch_exists"},
        )
    return switch


@router.delete("/{id}")
def delete_switch(session: SessionDep, id: uuid.UUID) -> Message:
    """
    Delete a switch.
    """
    switch = session.get(Switch, id)
    if not switch:
        raise HTTPException(status_code=404, detail="Switch not found")

    session.delete(switch)
    session.commit()
    return Message(message="Switch deleted successfully")


@router.post("/delete")
def delete_multiple_switches(
    session: SessionDep,
    ids: List[uuid.UUID] = Body(...),
) -> Message:
    """
    Delete multiple switches.
    """
    # 删除所有匹配的设备
    session.exec(delete(Switch).where(Switch.id.in_(ids)))
    session.commit()

    return Message(message="Switches deleted successfully")


@router.get("/backup/{id}")
def backup_switch(
    session: SessionDep, background_tasks: BackgroundTasks, id: uuid.UUID
) -> Any:
    """
    Backup a switch.
    """
    switch = session.get(Switch, id)
    if not switch:
        raise HTTPException(status_code=404, detail="Switch not found")

    # Implement your backup logic here
    # For example, you might copy the switch data to a backup table
    background_tasks.add_task(download_config, switch.id)
    return Message(message="Switch backed up successfully")


@router.post("/backup")
def backup_multiple_switches(
    session: SessionDep,
    background_tasks: BackgroundTasks,
    ids: List[uuid.UUID] = Body(...),
) -> Any:
    """
    Backup multiple switches.
    """
    # 查询所有匹配的设备
    switches = session.exec(select(Switch).where(Switch.id.in_(ids))).all()

    if not switches:
        raise HTTPException(status_code=404, detail="No switches found for given IDs")

    # 检查是否有未找到的 ID
    found_ids = {s.id for s in switches}
    missing = [str(i) for i in ids if i not in found_ids]

    # 添加备份任务
    for switch in switches:
        background_tasks.add_task(download_config, switch.id)

    message = f"Backups scheduled for {len(switches)} switches"
    if missing:
        message += f". Missing IDs: {', '.join(missing)}"

    return {"message": message}


@router.post("/import")
def import_switches(
    session: SessionDep,
    file: UploadFile = File(...),
) -> Any:
    """
    Import switches from a CSV file.
    """
    # 读取CSV文件

    csv_data = file.file.read().decode("utf-8-sig")
    reader = csv.DictReader(csv_data.splitlines())

    # 创建或更新设备

    for row in reader:
        row = {
            k.strip(): (v.strip().lstrip("\ufeff") if isinstance(v, str) else v)
            for k, v in row.items()
        }

        branch = session.exec(
            select(Branch).where(Branch.name == row["branch"])
        ).first()
        inspector = session.exec(
            select(Inspector).where(
                and_(
                    Inspector.name == row["inspector_name"],
                    Inspector.password == row["inspector_password"],
                )
            )
        ).first()
        login_type = session.exec(
            select(SwitchLoginType).where(SwitchLoginType.name == row["login_type"])
        ).first()
        switch = Switch(
            name=row["name"],
            ip=row["ip"],
            branch=branch,
            inspector=inspector,
            login_type=login_type,
        )
        session.add(switch)
    session.commit()
    return Message(message="Switches imported successfully")


@router.post("/config", response_model=SwitchConfigShow)
def get_switch_config(session: SessionDep, id: uuid.UUID, config_date: date) -> Any:
    """
    Get a switch's configuration.
    """
    switch = session.get(Switch, id)
    if not switch:
        raise HTTPException(status_code=404, detail="Switch not found")

    if not config_date:
        config_date = date.today()
        
    switch_config = session.exec(
        select(SwitchConfig).where(
            and_(SwitchConfig.switch_id == id, SwitchConfig.created == config_date)
        )
    ).first()
    
    start_date = session.exec(
        select(SwitchConfig)
        .where(SwitchConfig.switch_id == id)
        .order_by(SwitchConfig.created.asc())
    ).first()
    
    if not start_date:
        start_date = date.today()
    else:
        start_date = start_date.created

    if not switch_config:
        raise HTTPException(status_code=404, detail="Switch config not found")

    return SwitchConfigShow(
        content=switch_config.get_config(),
        switch=switch_config.switch and SwitchLite.model_validate(switch_config.switch),
        created=switch_config.created,
        updated=switch_config.updated,
        start_date=start_date,
    )
