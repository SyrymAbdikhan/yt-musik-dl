import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router as api_router
from app.core.config import config
from app.core.logging import setup_logging
from app.db.database import Base, engine
from app.db import init_default_user

setup_logging()
Base.metadata.create_all(bind=engine)
init_default_user()

app = FastAPI(title=config.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.allow_origin,],
    allow_credentials=True,
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
    expose_headers=['Content-Disposition']
)

app.include_router(api_router)
