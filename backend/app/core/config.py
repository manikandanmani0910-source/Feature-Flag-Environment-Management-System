from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    app_name: str = Field(
        default="Feature Flag Management System",
        alias="APP_NAME",
    )
    app_version: str = Field(
        default="1.0.0",
        alias="APP_VERSION",
    )
    environment: str = Field(
        default="development",
        alias="ENVIRONMENT",
    )
    debug: bool = Field(
        default=False,
        alias="DEBUG",
    )

    api_v1_prefix: str = Field(
        default="/api/v1",
        alias="API_V1_PREFIX",
    )

    mysql_host: str = Field(alias="MYSQL_HOST")
    mysql_port: int = Field(
        default=3306,
        alias="MYSQL_PORT",
    )
    mysql_database: str = Field(alias="MYSQL_DATABASE")
    mysql_user: str = Field(alias="MYSQL_USER")
    mysql_password: str = Field(alias="MYSQL_PASSWORD")

    database_pool_size: int = Field(
        default=20,
        alias="DATABASE_POOL_SIZE",
    )
    database_max_overflow: int = Field(
        default=10,
        alias="DATABASE_MAX_OVERFLOW",
    )
    database_pool_timeout: int = Field(
        default=30,
        alias="DATABASE_POOL_TIMEOUT",
    )
    database_pool_recycle: int = Field(
        default=1800,
        alias="DATABASE_POOL_RECYCLE",
    )

    redis_host: str = Field(
        default="localhost",
        alias="REDIS_HOST",
    )
    redis_port: int = Field(
        default=6379,
        alias="REDIS_PORT",
    )
    redis_db: int = Field(
        default=0,
        alias="REDIS_DB",
    )
    redis_password: str | None = Field(
        default=None,
        alias="REDIS_PASSWORD",
    )

    jwt_secret_key: str = Field(
        alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        alias="JWT_ALGORITHM",
    )
    jwt_access_token_expire_minutes: int = Field(
        default=30,
        alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
    )

    cors_origins: list[str] | str = Field(
        default=["http://localhost:5173"],
        alias="CORS_ORIGINS",
    )

    log_level: str = Field(
        default="INFO",
        alias="LOG_LEVEL",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(
        cls,
        value: str | list[str],
    ) -> list[str]:
        if isinstance(value, str):
            return [
                origin.strip()
                for origin in value.split(",")
                if origin.strip()
            ]

        return value

    @property
    def database_url(self) -> URL:
        return URL.create(
            drivername="mysql+pymysql",
            username=self.mysql_user,
            password=self.mysql_password,
            host=self.mysql_host,
            port=self.mysql_port,
            database=self.mysql_database,
            query={
                "charset": "utf8mb4",
            },
        )

    @property
    def redis_url(self) -> str:
        if self.redis_password:
            return (
                f"redis://:{self.redis_password}@"
                f"{self.redis_host}:{self.redis_port}/"
                f"{self.redis_db}"
            )

        return (
            f"redis://{self.redis_host}:"
            f"{self.redis_port}/{self.redis_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()