import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, SessionDep
from app.models import Branch, BranchCreate, BranchPublic, BranchesPublic, BranchUpdate, Message

router = APIRouter(prefix="/branches", tags=["branches"])


@router.get("/", response_model=BranchesPublic)
def read_branches(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100, search_text: str = ""
) -> Any:
    """
    Retrieve branches.
    """

    # if current_user.is_superuser:
    if search_text:
        count_statement = select(func.count()).select_from(Branch).where(Branch.name.ilike(f"%{search_text}%")) # type: ignore
        count = session.exec(count_statement).one()
        statement = select(Branch).where(Branch.name.ilike(f"%{search_text}%")).offset(skip).limit(limit) # type: ignore
        items = session.exec(statement).all()
    else:
        count_statement = select(func.count()).select_from(Branch)
        count = session.exec(count_statement).one()
        statement = select(Branch).offset(skip).limit(limit)
        items = session.exec(statement).all()

    return BranchesPublic(data=items, count=count) # type: ignore


@router.get("/{id}", response_model=BranchPublic)
def read_branch(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get branch by ID.
    """
    branch = session.get(Branch, id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.post("/", response_model=BranchPublic)
def create_branch(
    *, session: SessionDep, branch_in: BranchCreate
) -> Any:
    """
    Create new branch.
    """
    name = branch_in.name
    # Pre-check to return a friendly 409 if name already exists
    if session.exec(select(Branch).where(Branch.name == name)).first():
        raise HTTPException(
            status_code=409,
            detail={"message": "Branch name already exists", "code": "branch_exists"},
        )

    branch = Branch.model_validate(branch_in)
    session.add(branch)
    try:
        session.commit()
        session.refresh(branch)
    except IntegrityError:
        # In case of a race condition where another process inserted the same name
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail={"message": "Branch name already exists", "code": "branch_exists"},
        )

    return branch


@router.put("/{id}", response_model=BranchPublic)
def update_branch(
    *,
    session: SessionDep,
    # current_user: CurrentUser,
    id: uuid.UUID,
    branch_in: BranchUpdate,
) -> Any:
    """
    Update a branch.
    """
    branch = session.get(Branch, id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    update_dict = branch_in.model_dump(exclude_unset=True)
    branch.sqlmodel_update(update_dict)
    session.add(branch)
    try:
        session.commit()
        session.refresh(branch)
    except IntegrityError:
        session.rollback()
        # name uniqueness conflict (or other integrity constraint)
        raise HTTPException(
            status_code=409,
            detail={"message": "Branch name already exists", "code": "branch_exists"},
        )
    return branch


@router.delete("/{id}")
def delete_branch(
    session: SessionDep, id: uuid.UUID
) -> Message:
    """
    Delete a branch.
    """
    branch = session.get(Branch, id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    session.delete(branch)
    session.commit()
    return Message(message="Branch deleted successfully")
