import os

from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker

from models import Base

engine = create_engine(os.getenv("DATABASE_URL", "sqlite:///./database.db"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)
