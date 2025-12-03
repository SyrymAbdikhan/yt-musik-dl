import logging

from app.core.config import config
from app.core.security import get_password_hash
from app.db.database import local_session
from app.services import user_service

logger = logging.getLogger(__name__)


def init_default_user() -> None:
    with local_session() as db:
        try:
            existing_user = user_service.get_user_by_username(
                db, config.app_default_username
            )
            if not existing_user:
                hashed_password = get_password_hash(config.app_default_password)
                user_service.create_user(
                    db, config.app_default_username, hashed_password
                )
                logger.info(f"Created default user: {config.app_default_username}")
            else:
                logger.debug(
                    f"Default user already exists: {config.app_default_username}"
                )
        except Exception as e:
            logger.error(f"Error creating default user: {e}")
        finally:
            db.close()
