from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings


class RedisManager:
    def __init__(self) -> None:
        self._client: Redis | None = None

    def connect(self) -> None:
        self._client = Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            health_check_interval=30,
        )

    @property
    def client(self) -> Redis:
        if self._client is None:
            raise RuntimeError("Redis has not been initialized")

        return self._client

    def ping(self) -> bool:
        try:
            return bool(self.client.ping())
        except RedisError:
            return False

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None


redis_manager = RedisManager()