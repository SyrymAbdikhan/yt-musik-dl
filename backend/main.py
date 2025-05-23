import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import music

from dotenv import load_dotenv
load_dotenv(override=True)

logging.basicConfig(
    encoding='utf-8',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv('ALLOW_ORIGIN', 'http://localhost:5173'),
    ],
    allow_credentials=True,
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)

app.include_router(music.router, prefix='/api')
