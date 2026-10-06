from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import engine


def check_database_connection() -> bool:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError:
        return False