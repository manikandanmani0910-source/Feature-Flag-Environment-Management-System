from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.dashboard_service import DashboardService


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_dashboard_service(
    db: Session = Depends(get_db),
) -> DashboardService:
    return DashboardService(db)


# ================================================================
# COMPLETE DASHBOARD
# ================================================================


@router.get(
    "",
    summary="Get complete dashboard",
)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return service.get_dashboard()


# ================================================================
# DASHBOARD SUMMARY
# ================================================================


@router.get(
    "/summary",
    summary="Get dashboard summary",
)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return service.get_summary()


# ================================================================
# FEATURE OVERVIEW
# ================================================================


@router.get(
    "/features",
    summary="Get feature overview",
)
def get_feature_overview(
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> list[dict]:
    return service.get_feature_overview(
        limit=limit
    )


# ================================================================
# ENVIRONMENT OVERVIEW
# ================================================================


@router.get(
    "/environments",
    summary="Get environment overview",
)
def get_environment_overview(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> list[dict]:
    return service.get_environment_overview(
        limit=limit
    )


# ================================================================
# ROLLOUT OVERVIEW
# ================================================================


@router.get(
    "/rollouts",
    summary="Get rollout overview",
)
def get_rollout_overview(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> list[dict]:
    return service.get_rollout_overview(
        limit=limit
    )


# ================================================================
# SCHEDULE OVERVIEW
# ================================================================


@router.get(
    "/schedules",
    summary="Get schedule overview",
)
def get_schedule_overview(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> list[dict]:
    return service.get_schedule_overview(
        limit=limit
    )


# ================================================================
# RECENT ACTIVITY
# ================================================================


@router.get(
    "/recent-activity",
    summary="Get recent audit activity",
)
def get_recent_activity(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> list[dict]:
    return service.get_recent_activity(
        limit=limit
    )


# ================================================================
# COUNTERS
# ================================================================


@router.get(
    "/counts/features",
    summary="Get feature count",
)
def get_feature_count(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return {
        "count": service.get_feature_count()
    }


@router.get(
    "/counts/environments",
    summary="Get environment count",
)
def get_environment_count(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return {
        "count": service.get_environment_count()
    }


@router.get(
    "/counts/rollouts",
    summary="Get rollout count",
)
def get_rollout_count(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return {
        "count": service.get_rollout_count()
    }


@router.get(
    "/counts/schedules",
    summary="Get schedule count",
)
def get_schedule_count(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return {
        "count": service.get_schedule_count()
    }


@router.get(
    "/counts/usage",
    summary="Get usage count",
)
def get_usage_count(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return {
        "count": service.get_usage_count()
    }


@router.get(
    "/counts/users",
    summary="Get user count",
)
def get_user_count(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return {
        "count": service.get_user_count()
    }


@router.get(
    "/counts/audit-logs",
    summary="Get audit log count",
)
def get_audit_log_count(
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(
        get_dashboard_service
    ),
) -> dict:
    return {
        "count": service.get_audit_log_count()
    }