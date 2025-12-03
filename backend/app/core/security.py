from typing import Any, Literal
from datetime import UTC, datetime, timedelta

import jwt
import bcrypt
from jwt.exceptions import InvalidTokenError
from fastapi.security import OAuth2PasswordBearer

from pydantic import SecretStr
from sqlalchemy.orm import Session

from app.services import user_service
from app.core.config import config
from app.schemas.auth import TokenData
from app.db.models.user import User

SECRET_KEY: SecretStr = config.jwt_secret_key
ALGORITHM = config.jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = config.jwt_expire_minutes

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    correct_password: bool = bcrypt.checkpw(
        plain_password.encode(), hashed_password.encode()
    )
    return correct_password


def get_password_hash(password: str) -> str:
    hashed_password: str = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    return hashed_password


def authenticate_user(
    db: Session, username: str, password: str
) -> User | Literal[False]:
    db_user = user_service.get_user_by_username(db, username)

    if not db_user:
        return False

    if not verify_password(password, db_user.hashed_password):
        return False

    return db_user


async def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC).replace(tzinfo=None) + expires_delta
    else:
        expire = datetime.now(UTC).replace(tzinfo=None) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt: str = jwt.encode(
        to_encode, SECRET_KEY.get_secret_value(), algorithm=ALGORITHM
    )
    return encoded_jwt


async def verify_token(token: str) -> TokenData | None:
    try:
        payload = jwt.decode(
            token, SECRET_KEY.get_secret_value(), algorithms=[ALGORITHM]
        )
        username: str | None = payload.get("sub")

        if username is None:
            return None

        return TokenData(username=username)

    except InvalidTokenError:
        return None
