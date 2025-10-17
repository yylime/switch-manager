import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, SessionDep

from app.models import SwitchLoginType, SwitchLoginTypesPublic


router = APIRouter(prefix="/switch_login_type", tags=["switch_login_type"])


@router.get("/", response_model=SwitchLoginTypesPublic)
def read_switch_login_types(
    session: SessionDep,
) -> Any:
    """
    Retrieve switch_login_type.
    """
    count_statement = select(func.count()).select_from(SwitchLoginType)
    count = session.exec(count_statement).one()
    statement = select(SwitchLoginType)
    items = session.exec(statement).all()

    return SwitchLoginTypesPublic(data=items, count=count)  # type: ignore
