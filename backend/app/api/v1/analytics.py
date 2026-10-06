from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.analytics_service import (
    AnalyticsService,
    AnalyticsServiceError,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


def get_analytics_service(
    db: Session = Depends(get_db),
) -> AnalyticsService:
    return AnalyticsService(db)


# ================================================================
# FEATURE STATISTICS
# ================================================================


@router.get(
    "/features/{feature_flag_id}",
    summary="Get feature analytics",
)
def get_feature_statistics(
    feature_flag_id: int,
    environment_id: int | None = Query(
        default=None,
        gt=0,
    ),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    service: AnalyticsService = Depends(
        get_analytics_service
    ),
) -> dict[str, Any]:

    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date must be greater than "
                "or equal to start_date."
            ),
        )

    try:
        return service.get_feature_statistics(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            start_date=start_date,
            end_date=end_date,
        )

    except AnalyticsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# ENVIRONMENT STATISTICS
# ================================================================


@router.get(
    "/environments/{environment_id}",
    summary="Get environment analytics",
)
def get_environment_statistics(
    environment_id: int,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    service: AnalyticsService = Depends(
        get_analytics_service
    ),
) -> dict[str, Any]:

    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date must be greater than "
                "or equal to start_date."
            ),
        )

    try:
        return service.get_environment_statistics(
            environment_id=environment_id,
            start_date=start_date,
            end_date=end_date,
        )

    except AnalyticsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# DAILY USAGE
# ================================================================


@router.get(
    "/daily-usage",
    summary="Get daily feature usage",
)
def get_daily_usage(
    feature_flag_id: int | None = Query(
        default=None,
        gt=0,
    ),
    environment_id: int | None = Query(
        default=None,
        gt=0,
    ),
    days: int = Query(
        default=30,
        ge=1,
        le=365,
    ),
    current_user: User = Depends(
        get_current_user
    ),
    service: AnalyticsService = Depends(
        get_analytics_service
    ),
) -> list[dict[str, Any]]:

    try:
        return service.get_daily_usage(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            days=days,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except AnalyticsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# TOP FEATURES
# ================================================================


@router.get(
    "/top-features",
    summary="Get most frequently evaluated features",
)
def get_top_features(
    environment_id: int | None = Query(
        default=None,
        gt=0,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    service: AnalyticsService = Depends(
        get_analytics_service
    ),
) -> list[dict[str, Any]]:

    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date must be greater than "
                "or equal to start_date."
            ),
        )

    try:
        return service.get_top_features(
            environment_id=environment_id,
            limit=limit,
            start_date=start_date,
            end_date=end_date,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except AnalyticsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# GLOBAL SUMMARY
# ================================================================


@router.get(
    "/summary",
    summary="Get global analytics summary",
)
def get_global_summary(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    service: AnalyticsService = Depends(
        get_analytics_service
    ),
) -> dict[str, Any]:

    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date must be greater than "
                "or equal to start_date."
            ),
        )

    try:
        return service.get_global_summary(
            start_date=start_date,
            end_date=end_date,
        )

    except AnalyticsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# ROLLOUT STATISTICS
# ================================================================


@router.get(
    "/rollouts/{feature_flag_id}",
    summary="Get rollout analytics",
)
def get_rollout_statistics(
    feature_flag_id: int,
    environment_id: int | None = Query(
        default=None,
        gt=0,
    ),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    service: AnalyticsService = Depends(
        get_analytics_service
    ),
) -> dict[str, Any]:

    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date must be greater than "
                "or equal to start_date."
            ),
        )

    try:
        return service.get_rollout_statistics(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            start_date=start_date,
            end_date=end_date,
        )

    except AnalyticsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# RECORD FEATURE EVALUATION
# ================================================================


@router.post(
    "/usage",
    summary="Record feature evaluation",
)
def record_usage(
    feature_flag_id: int = Query(..., gt=0),
    environment_id: int = Query(..., gt=0),
    user_id: int | None = Query(
        default=None,
        gt=0,
    ),
    enabled: bool = True,
    reason: str | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    service: AnalyticsService = Depends(
        get_analytics_service
    ),
) -> dict[str, Any]:

    try:
        usage = service.record_usage(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
            enabled=enabled,
            reason=reason,
        )

        return {
            "message": "Usage recorded successfully.",
            "usage_id": usage.id,
        }

    except AnalyticsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc