from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import user_service
from app.core.security import oauth2_scheme, verify_token
from app.core.exceptions import UnauthorizedException
from app.db.models.user import User


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    token_data = await verify_token(token)
    if token_data is None:
        raise UnauthorizedException("User not authenticated.")

    user = user_service.get_user_by_username(db, username=token_data.username)
    if user:
        return user

    raise UnauthorizedException("User not authenticated.")
