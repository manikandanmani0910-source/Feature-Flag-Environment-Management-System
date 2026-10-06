from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.evaluation_service import (
    EnvironmentNotFoundError,
    EvaluationService,
    FeatureEvaluationError,
    FeatureNotFoundError,
)


router = APIRouter(
    prefix="/evaluations",
    tags=["Evaluations"],
)


# ================================================================
# SCHEMAS
# ================================================================


class EvaluationRequest(BaseModel):
    feature_key: str = Field(
        min_length=1,
        max_length=255,
    )
    environment: str = Field(
        min_length=1,
        max_length=100,
    )
    user_id: int | None = Field(
        default=None,
        gt=0,
    )


class BulkEvaluationRequest(BaseModel):
    feature_keys: list[str] = Field(
        min_length=1,
        max_length=100,
    )
    environment: str = Field(
        min_length=1,
        max_length=100,
    )
    user_id: int | None = Field(
        default=None,
        gt=0,
    )


class EvaluationResponse(BaseModel):
    enabled: bool
    feature_key: str
    environment: str
    user_id: int | None
    reason: str
    source: str
    rollout_percentage: float | None
    evaluated_at: str | None
    cached: bool


class BulkEvaluationResponse(BaseModel):
    results: dict[str, EvaluationResponse]


class InvalidateEvaluationResponse(BaseModel):
    message: str


# ================================================================
# SERVICE DEPENDENCY
# ================================================================


def get_evaluation_service(
    db=Depends(get_db),
) -> EvaluationService:
    return EvaluationService(db)


# ================================================================
# SINGLE FEATURE EVALUATION
# ================================================================


@router.post(
    "/evaluate",
    response_model=EvaluationResponse,
    summary="Evaluate a feature flag",
)
def evaluate_feature(
    payload: EvaluationRequest,
    current_user: User = Depends(
        get_current_user
    ),
    service: EvaluationService = Depends(
        get_evaluation_service
    ),
) -> EvaluationResponse:

    try:
        result = service.evaluate(
            feature_key=payload.feature_key,
            environment=payload.environment,
            user_id=payload.user_id,
        )

        return EvaluationResponse(
            **result.as_dict()
        )

    except FeatureNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except EnvironmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except FeatureEvaluationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# SIMPLE EVALUATION
# ================================================================


@router.get(
    "/evaluate",
    response_model=EvaluationResponse,
    summary="Evaluate a feature flag using query parameters",
)
def evaluate_feature_query(
    feature_key: str = Query(
        ...,
        min_length=1,
        max_length=255,
    ),
    environment: str = Query(
        ...,
        min_length=1,
        max_length=100,
    ),
    user_id: int | None = Query(
        default=None,
        gt=0,
    ),
    current_user: User = Depends(
        get_current_user
    ),
    service: EvaluationService = Depends(
        get_evaluation_service
    ),
) -> EvaluationResponse:

    try:
        result = service.evaluate(
            feature_key=feature_key,
            environment=environment,
            user_id=user_id,
        )

        return EvaluationResponse(
            **result.as_dict()
        )

    except FeatureNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except EnvironmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except FeatureEvaluationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# BULK EVALUATION
# ================================================================


@router.post(
    "/evaluate-many",
    response_model=BulkEvaluationResponse,
    summary="Evaluate multiple feature flags",
)
def evaluate_many(
    payload: BulkEvaluationRequest,
    current_user: User = Depends(
        get_current_user
    ),
    service: EvaluationService = Depends(
        get_evaluation_service
    ),
) -> BulkEvaluationResponse:

    try:
        results = service.evaluate_many(
            feature_keys=payload.feature_keys,
            environment=payload.environment,
            user_id=payload.user_id,
        )

        return BulkEvaluationResponse(
            results={
                key: result.as_dict()
                for key, result in results.items()
            }
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except FeatureEvaluationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# CACHE INVALIDATION
# ================================================================


@router.post(
    "/invalidate",
    response_model=InvalidateEvaluationResponse,
    summary="Invalidate evaluation cache",
)
def invalidate_evaluation_cache(
    feature_key: str = Query(
        ...,
        min_length=1,
        max_length=255,
    ),
    environment: str = Query(
        ...,
        min_length=1,
        max_length=100,
    ),
    current_user: User = Depends(
        get_current_user
    ),
    service: EvaluationService = Depends(
        get_evaluation_service
    ),
) -> InvalidateEvaluationResponse:

    try:
        service.invalidate(
            feature_key=feature_key,
            environment=environment,
        )

        return InvalidateEvaluationResponse(
            message=(
                "Evaluation cache invalidated "
                "successfully."
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except FeatureEvaluationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc