from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit_logs import router as audit_logs_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.evaluations import router as evaluations_router
from app.api.v1.environments import router as environments_router
from app.api.v1.feature_flags import router as feature_flags_router
from app.api.v1.feature_rollouts import router as feature_rollouts_router
from app.api.v1.feature_schedules import router as feature_schedules_router
from app.api.v1.feature_usage import router as feature_usage_router
from app.api.v1.assignments import router as assignments_router
from app.api.v1.roles import router as roles_router
from app.api.v1.users import router as users_router

from app.core.config import settings
from app.core.database_health import check_database_connection
from app.core.exception_handlers import register_exception_handlers
from app.core.logging import configure_logging
from app.core.redis import redis_manager


configure_logging()


# ================================================================
# APPLICATION LIFESPAN
# ================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle management.

    Startup:
        - Establish Redis connection

    Shutdown:
        - Close Redis connection
    """

    redis_manager.connect()

    yield

    redis_manager.close()


# ================================================================
# FASTAPI APPLICATION
# ================================================================


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Enterprise Feature Flag and Environment "
        "Management System API"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ================================================================
# MIDDLEWARE
# ================================================================


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================================================
# EXCEPTION HANDLERS
# ================================================================


register_exception_handlers(app)


# ================================================================
# API ROUTERS
# ================================================================


API_PREFIX = settings.api_v1_prefix


# ------------------------------------------------
# Authentication
# ------------------------------------------------

app.include_router(
    auth_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Users
# ------------------------------------------------

app.include_router(
    users_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Roles
# ------------------------------------------------

app.include_router(
    roles_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# User Assignments
# ------------------------------------------------

app.include_router(
    assignments_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Environments
# ------------------------------------------------

app.include_router(
    environments_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Feature Flags
# ------------------------------------------------

app.include_router(
    feature_flags_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Feature Rollouts
# ------------------------------------------------

app.include_router(
    feature_rollouts_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Feature Schedules
# ------------------------------------------------

app.include_router(
    feature_schedules_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Feature Usage
# ------------------------------------------------

app.include_router(
    feature_usage_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Audit Logs
# ------------------------------------------------

app.include_router(
    audit_logs_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Dashboard
# ------------------------------------------------

app.include_router(
    dashboard_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Analytics
# ------------------------------------------------

app.include_router(
    analytics_router,
    prefix=API_PREFIX,
)


# ------------------------------------------------
# Evaluations
# ------------------------------------------------

app.include_router(
    evaluations_router,
    prefix=API_PREFIX,
)


# ================================================================
# SYSTEM HEALTH
# ================================================================


@app.get(
    "/health",
    tags=["System"],
    summary="Application health check",
)
def health_check() -> dict:
    database_status = (
        check_database_connection()
    )

    redis_status = redis_manager.ping()

    overall_status = (
        "healthy"
        if database_status and redis_status
        else "unhealthy"
    )

    return {
        "status": overall_status,
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "dependencies": {
            "database": (
                "healthy"
                if database_status
                else "unhealthy"
            ),
            "redis": (
                "healthy"
                if redis_status
                else "unhealthy"
            ),
        },
    }


@app.get(
    "/health/database",
    tags=["System"],
    summary="Database health check",
)
def database_health_check() -> dict:
    is_healthy = (
        check_database_connection()
    )

    return {
        "status": (
            "healthy"
            if is_healthy
            else "unhealthy"
        ),
        "service": "mysql",
    }


@app.get(
    "/health/redis",
    tags=["System"],
    summary="Redis health check",
)
def redis_health_check() -> dict:
    is_healthy = (
        redis_manager.ping()
    )

    return {
        "status": (
            "healthy"
            if is_healthy
            else "unhealthy"
        ),
        "service": "redis",
    }