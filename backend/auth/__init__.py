import os

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from auth.auth_handler import get_user, get_password_hash
from models import User


def create_default_user():
    USERNAME = os.getenv("USERNAME", "admin")
    PASSWORD = os.getenv("PASSWORD", "admin")
    
    db_gen = get_db()
    db = next(db_gen)

    db_user = get_user(db, USERNAME)
    if db_user:
        return

    hashed_password = get_password_hash(PASSWORD)
    db_user = User(username=USERNAME, hashed_password=hashed_password)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)


create_default_user()
