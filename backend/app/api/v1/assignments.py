from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.feature_rollout import FeatureRollout
from app.models.user import User
from app.models.user_assignment import UserAssignment


router = APIRouter(
    prefix="/assignments",
    tags=["User Assignments"],
)


# ================================================================
# SCHEMAS
# ================================================================


class AssignmentCreateRequest(BaseModel):
    feature_rollout_id: int
    user_id: int
    is_enabled: bool = True


class AssignmentUpdateRequest(BaseModel):
    is_enabled: bool


class AssignmentResponse(BaseModel):
    id: int
    feature_rollout_id: int
    user_id: int
    is_enabled: bool

    class Config:
        from_attributes = True


class AssignmentListResponse(BaseModel):
    items: list[AssignmentResponse]
    total: int


class MessageResponse(BaseModel):
    message: str


# ================================================================
# LIST ASSIGNMENTS
# ================================================================


@router.get(
    "",
    response_model=AssignmentListResponse,
    summary="List user assignments",
)
def list_assignments(
    feature_rollout_id: int | None = None,
    user_id: int | None = None,
    is_enabled: bool | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AssignmentListResponse:

    statement = select(
        UserAssignment
    ).order_by(
        UserAssignment.id.desc()
    )

    if feature_rollout_id is not None:
        statement = statement.where(
            UserAssignment.feature_rollout_id
            == feature_rollout_id
        )

    if user_id is not None:
        statement = statement.where(
            UserAssignment.user_id
            == user_id
        )

    if is_enabled is not None:
        statement = statement.where(
            UserAssignment.is_enabled
            == is_enabled
        )

    assignments = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return AssignmentListResponse(
        items=assignments,
        total=len(assignments),
    )


# ================================================================
# GET ASSIGNMENT
# ================================================================


@router.get(
    "/{assignment_id}",
    response_model=AssignmentResponse,
    summary="Get assignment by ID",
)
def get_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserAssignment:

    assignment = db.get(
        UserAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Assignment {assignment_id} "
                "was not found."
            ),
        )

    return assignment


# ================================================================
# CREATE ASSIGNMENT
# ================================================================


@router.post(
    "",
    response_model=AssignmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user assignment",
)
def create_assignment(
    payload: AssignmentCreateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserAssignment:

    # Validate rollout
    rollout = db.get(
        FeatureRollout,
        payload.feature_rollout_id,
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature rollout "
                f"{payload.feature_rollout_id} "
                "was not found."
            ),
        )

    # Validate user
    user = db.get(
        User,
        payload.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"User {payload.user_id} "
                "was not found."
            ),
        )

    # Check duplicate assignment
    existing = db.execute(
        select(UserAssignment)
        .where(
            UserAssignment.feature_rollout_id
            == payload.feature_rollout_id,
            UserAssignment.user_id
            == payload.user_id,
        )
        .limit(1)
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This user is already assigned "
                "to this feature rollout."
            ),
        )

    assignment = UserAssignment(
        feature_rollout_id=(
            payload.feature_rollout_id
        ),
        user_id=payload.user_id,
        is_enabled=payload.is_enabled,
    )

    db.add(assignment)

    try:
        db.commit()
        db.refresh(assignment)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Assignment already exists or "
                "violates a database constraint."
            ),
        ) from exc

    return assignment


# ================================================================
# UPDATE ASSIGNMENT
# ================================================================


@router.put(
    "/{assignment_id}",
    response_model=AssignmentResponse,
    summary="Update user assignment",
)
def update_assignment(
    assignment_id: int,
    payload: AssignmentUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserAssignment:

    assignment = db.get(
        UserAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Assignment {assignment_id} "
                "was not found."
            ),
        )

    assignment.is_enabled = payload.is_enabled

    db.commit()
    db.refresh(assignment)

    return assignment


# ================================================================
# ENABLE ASSIGNMENT
# ================================================================


@router.post(
    "/{assignment_id}/enable",
    response_model=AssignmentResponse,
    summary="Enable user assignment",
)
def enable_assignment(
    assignment_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserAssignment:

    assignment = db.get(
        UserAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Assignment {assignment_id} "
                "was not found."
            ),
        )

    assignment.is_enabled = True

    db.commit()
    db.refresh(assignment)

    return assignment


# ================================================================
# DISABLE ASSIGNMENT
# ================================================================


@router.post(
    "/{assignment_id}/disable",
    response_model=AssignmentResponse,
    summary="Disable user assignment",
)
def disable_assignment(
    assignment_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserAssignment:

    assignment = db.get(
        UserAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Assignment {assignment_id} "
                "was not found."
            ),
        )

    assignment.is_enabled = False

    db.commit()
    db.refresh(assignment)

    return assignment


# ================================================================
# DELETE ASSIGNMENT
# ================================================================


@router.delete(
    "/{assignment_id}",
    response_model=MessageResponse,
    summary="Delete user assignment",
)
def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict[str, str]:

    assignment = db.get(
        UserAssignment,
        assignment_id,
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Assignment {assignment_id} "
                "was not found."
            ),
        )

    db.delete(assignment)
    db.commit()

    return {
        "message": (
            f"Assignment {assignment_id} "
            "deleted successfully."
        )
    }