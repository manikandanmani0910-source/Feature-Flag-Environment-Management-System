import logging
import logging.config

from app.core.config import settings


def configure_logging() -> None:
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": (
                    "%(asctime)s | "
                    "%(levelname)s | "
                    "%(name)s | "
                    "%(message)s"
                ),
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": settings.log_level,
            },
        },
        "root": {
            "handlers": ["console"],
            "level": settings.log_level,
        },
    }

    logging.config.dictConfig(logging_config)