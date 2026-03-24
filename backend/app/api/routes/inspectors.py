import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, or_


from app.api.deps import SessionDep
from app.models import Message
from app.models import (
    Inspector,
    InspectorCreate,
    InspectorsPublic,
    InspectorPublic,
    InspectorUpdate,
)

router = APIRouter(prefix="/inspectors", tags=["inspectors"])


@router.get("/", response_model=InspectorsPublic)
def read_inspectors(
    session: SessionDep, skip: int = 0, limit: int = 100, search_text: str = ""
) -> Any:
    """
    Retrieve inspectors.
    """

    # if current_user.is_superuser:
    if search_text:
        search_param = or_(
            Inspector.name.ilike(f"%{search_text}%"),  # type: ignore
            Inspector.description.ilike(f"%{search_text}%"),  # type: ignore
        )
        count_statement = (
            select(func.count()).select_from(Inspector).where(search_param)
        )
        count = session.exec(count_statement).one()
        statement = select(Inspector).where(search_param).offset(skip).limit(limit)  # type: ignore
        items = session.exec(statement).all()
    else:
        count_statement = select(func.count()).select_from(Inspector)
        count = session.exec(count_statement).one()
        statement = select(Inspector).offset(skip).limit(limit)
        items = session.exec(statement).all()

    return InspectorsPublic(data=items, count=count)  # type: ignore


@router.get("/{id}", response_model=InspectorPublic)
def read_inspector(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get inspector by ID.
    """
    inspector = session.get(Inspector, id)
    if not inspector:
        raise HTTPException(status_code=404, detail="Inspector not found")
    return inspector


@router.post("/", response_model=InspectorPublic)
def create_inspector(*, session: SessionDep, inspector_in: InspectorCreate) -> Any:
    """
    Create new inspector.
    """

    inspector = Inspector.model_validate(inspector_in)
    session.add(inspector)
    session.commit()
    session.refresh(inspector)
    return inspector


@router.put("/{id}", response_model=InspectorPublic)
def update_inspector(
    *,
    session: SessionDep,
    # current_user: CurrentUser,
    id: uuid.UUID,
    inspector_in: InspectorUpdate,
) -> Any:
    """
    Update an inspector.
    """
    inspector = session.get(Inspector, id)
    if not inspector:
        raise HTTPException(status_code=404, detail="Inspector not found")

    update_dict = inspector_in.model_dump(exclude_unset=True)
    inspector.sqlmodel_update(update_dict)
    session.add(inspector)
    session.commit()
    session.refresh(inspector)
    return inspector


@router.delete("/{id}")
def delete_inspector(session: SessionDep, id: uuid.UUID) -> Message:
    """
    Delete an inspector.
    """
    inspector = session.get(Inspector, id)
    if not inspector:
        raise HTTPException(status_code=404, detail="Inspector not found")

    session.delete(inspector)
    session.commit()
    return Message(message="Inspector deleted successfully")
