import json
import logging
from typing import Any

import redis
from redis.exceptions import RedisError

from app.core.config import settings


logger = logging.getLogger(__name__)


class CacheServiceError(Exception):
    """Base exception for cache operations."""


class CacheService:
    """
    Centralized Redis cache service.

    Responsibilities:
    - Feature configuration caching
    - Feature evaluation caching
    - Cache invalidation
    - Environment-specific cache isolation
    - Safe Redis failure handling

    Redis is treated as a performance layer.
    MySQL remains the source of truth.
    """

    FEATURE_PREFIX = "feature-flag"
    EVALUATION_PREFIX = "feature-evaluation"
    ENVIRONMENT_PREFIX = "environment"
    DASHBOARD_PREFIX = "dashboard"

    FEATURE_TTL = 300
    EVALUATION_TTL = 60
    ENVIRONMENT_TTL = 600
    DASHBOARD_TTL = 60

    def __init__(self) -> None:
        self.client = redis.Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
            retry_on_timeout=True,
            health_check_interval=30,
        )

    # ------------------------------------------------------------------
    # CONNECTION
    # ------------------------------------------------------------------

    def ping(self) -> bool:
        try:
            return bool(self.client.ping())
        except RedisError:
            logger.exception("Redis health check failed.")
            return False

    # ------------------------------------------------------------------
    # GENERIC OPERATIONS
    # ------------------------------------------------------------------

    def get(
        self,
        key: str,
    ) -> Any | None:
        try:
            value = self.client.get(key)

            if value is None:
                return None

            return json.loads(value)

        except (RedisError, json.JSONDecodeError):
            logger.exception(
                "Redis GET failed for key '%s'.",
                key,
            )
            return None

    def set(
        self,
        key: str,
        value: Any,
        *,
        ttl: int,
    ) -> bool:
        try:
            serialized = json.dumps(
                value,
                default=str,
                separators=(",", ":"),
            )

            return bool(
                self.client.set(
                    key,
                    serialized,
                    ex=ttl,
                )
            )

        except (RedisError, TypeError, ValueError):
            logger.exception(
                "Redis SET failed for key '%s'.",
                key,
            )
            return False

    def delete(
        self,
        *keys: str,
    ) -> int:
        if not keys:
            return 0

        try:
            return int(
                self.client.delete(*keys)
            )

        except RedisError:
            logger.exception(
                "Redis DELETE failed."
            )
            return 0

    def exists(
        self,
        key: str,
    ) -> bool:
        try:
            return bool(
                self.client.exists(key)
            )

        except RedisError:
            logger.exception(
                "Redis EXISTS failed for key '%s'.",
                key,
            )
            return False

    # ------------------------------------------------------------------
    # FEATURE CONFIGURATION CACHE
    # ------------------------------------------------------------------

    @classmethod
    def feature_key(
        cls,
        feature_key: str,
        environment: str,
    ) -> str:
        return (
            f"{cls.FEATURE_PREFIX}:"
            f"{environment.lower()}:"
            f"{feature_key.lower()}"
        )

    def get_feature_config(
        self,
        *,
        feature_key: str,
        environment: str,
    ) -> dict[str, Any] | None:
        key = self.feature_key(
            feature_key,
            environment,
        )

        value = self.get(key)

        if value is None:
            return None

        if not isinstance(value, dict):
            logger.warning(
                "Invalid feature configuration cached "
                "for key '%s'.",
                key,
            )
            self.delete(key)
            return None

        return value

    def set_feature_config(
        self,
        *,
        feature_key: str,
        environment: str,
        configuration: dict[str, Any],
        ttl: int | None = None,
    ) -> bool:
        key = self.feature_key(
            feature_key,
            environment,
        )

        return self.set(
            key,
            configuration,
            ttl=ttl or self.FEATURE_TTL,
        )

    def invalidate_feature(
        self,
        *,
        feature_key: str,
        environment: str,
    ) -> bool:
        key = self.feature_key(
            feature_key,
            environment,
        )

        self.delete(key)

        return True

    # ------------------------------------------------------------------
    # FEATURE EVALUATION CACHE
    # ------------------------------------------------------------------

    @classmethod
    def evaluation_key(
        cls,
        feature_key: str,
        environment: str,
        user_id: int | None = None,
    ) -> str:
        user_segment = (
            f"user:{user_id}"
            if user_id is not None
            else "anonymous"
        )

        return (
            f"{cls.EVALUATION_PREFIX}:"
            f"{environment.lower()}:"
            f"{feature_key.lower()}:"
            f"{user_segment}"
        )

    def get_evaluation(
        self,
        *,
        feature_key: str,
        environment: str,
        user_id: int | None = None,
    ) -> dict[str, Any] | None:
        key = self.evaluation_key(
            feature_key=feature_key,
            environment=environment,
            user_id=user_id,
        )

        value = self.get(key)

        if value is None:
            return None

        if not isinstance(value, dict):
            self.delete(key)
            return None

        return value

    def set_evaluation(
        self,
        *,
        feature_key: str,
        environment: str,
        result: dict[str, Any],
        user_id: int | None = None,
        ttl: int | None = None,
    ) -> bool:
        key = self.evaluation_key(
            feature_key=feature_key,
            environment=environment,
            user_id=user_id,
        )

        return self.set(
            key,
            result,
            ttl=ttl or self.EVALUATION_TTL,
        )

    def invalidate_evaluation(
        self,
        *,
        feature_key: str,
        environment: str,
        user_id: int | None = None,
    ) -> bool:
        key = self.evaluation_key(
            feature_key=feature_key,
            environment=environment,
            user_id=user_id,
        )

        self.delete(key)

        return True

    def invalidate_feature_evaluations(
        self,
        *,
        feature_key: str,
        environment: str,
    ) -> int:
        """
        Invalidates all user evaluations for one feature/environment.

        SCAN is used instead of KEYS to avoid blocking Redis.
        """

        pattern = (
            f"{self.EVALUATION_PREFIX}:"
            f"{environment.lower()}:"
            f"{feature_key.lower()}:*"
        )

        deleted = 0

        try:
            keys = []

            for key in self.client.scan_iter(
                match=pattern,
                count=100,
            ):
                keys.append(key)

                if len(keys) >= 100:
                    deleted += self.delete(*keys)
                    keys.clear()

            if keys:
                deleted += self.delete(*keys)

        except RedisError:
            logger.exception(
                "Failed to invalidate feature evaluations."
            )

        return deleted

    # ------------------------------------------------------------------
    # ENVIRONMENT CACHE
    # ------------------------------------------------------------------

    @classmethod
    def environment_key(
        cls,
        environment: str,
    ) -> str:
        return (
            f"{cls.ENVIRONMENT_PREFIX}:"
            f"{environment.lower()}"
        )

    def get_environment(
        self,
        environment: str,
    ) -> dict[str, Any] | None:
        return self.get(
            self.environment_key(environment)
        )

    def set_environment(
        self,
        *,
        environment: str,
        configuration: dict[str, Any],
        ttl: int | None = None,
    ) -> bool:
        return self.set(
            self.environment_key(environment),
            configuration,
            ttl=ttl or self.ENVIRONMENT_TTL,
        )

    def invalidate_environment(
        self,
        environment: str,
    ) -> bool:
        self.delete(
            self.environment_key(environment)
        )

        return True

    # ------------------------------------------------------------------
    # DASHBOARD CACHE
    # ------------------------------------------------------------------

    @classmethod
    def dashboard_key(
        cls,
        environment: str | None = None,
    ) -> str:
        if environment:
            return (
                f"{cls.DASHBOARD_PREFIX}:"
                f"{environment.lower()}"
            )

        return f"{cls.DASHBOARD_PREFIX}:global"

    def get_dashboard(
        self,
        environment: str | None = None,
    ) -> dict[str, Any] | None:
        value = self.get(
            self.dashboard_key(environment)
        )

        if value is None:
            return None

        if not isinstance(value, dict):
            return None

        return value

    def set_dashboard(
        self,
        data: dict[str, Any],
        *,
        environment: str | None = None,
        ttl: int | None = None,
    ) -> bool:
        return self.set(
            self.dashboard_key(environment),
            data,
            ttl=ttl or self.DASHBOARD_TTL,
        )

    def invalidate_dashboard(
        self,
        environment: str | None = None,
    ) -> bool:
        self.delete(
            self.dashboard_key(environment)
        )

        return True

    # ------------------------------------------------------------------
    # FEATURE-LEVEL INVALIDATION
    # ------------------------------------------------------------------

    def invalidate_feature_everywhere(
        self,
        *,
        feature_key: str,
        environment: str,
    ) -> None:
        """
        Invalidates every cache affected by a feature change.
        """

        self.invalidate_feature(
            feature_key=feature_key,
            environment=environment,
        )

        self.invalidate_feature_evaluations(
            feature_key=feature_key,
            environment=environment,
        )

        self.invalidate_dashboard(
            environment,
        )

    # ------------------------------------------------------------------
    # GLOBAL INVALIDATION
    # ------------------------------------------------------------------

    def flush_feature_namespace(self) -> int:
        """
        Removes only feature-flag related cache entries.

        Never uses FLUSHDB/FLUSHALL because Redis may be shared
        with other application components.
        """

        patterns = (
            f"{self.FEATURE_PREFIX}:*",
            f"{self.EVALUATION_PREFIX}:*",
            f"{self.ENVIRONMENT_PREFIX}:*",
            f"{self.DASHBOARD_PREFIX}:*",
        )

        deleted = 0

        try:
            for pattern in patterns:
                keys = []

                for key in self.client.scan_iter(
                    match=pattern,
                    count=100,
                ):
                    keys.append(key)

                    if len(keys) >= 100:
                        deleted += self.delete(*keys)
                        keys.clear()

                if keys:
                    deleted += self.delete(*keys)

        except RedisError:
            logger.exception(
                "Failed to flush feature cache namespace."
            )

        return deleted

    # ------------------------------------------------------------------
    # CLOSE
    # ------------------------------------------------------------------

    def close(self) -> None:
        try:
            self.client.close()
        except RedisError:
            logger.exception(
                "Failed to close Redis connection."
            )