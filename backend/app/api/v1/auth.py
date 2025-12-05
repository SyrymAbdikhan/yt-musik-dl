from typing import Annotated
from datetime import timedelta

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.user import User
from app.schemas.auth import Token, UserResponse
from app.core.security import (
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.core.exceptions import UnauthorizedException
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/auth")


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise UnauthorizedException("Incorrect username or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = await create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        is_active=current_user.is_active,
    )
