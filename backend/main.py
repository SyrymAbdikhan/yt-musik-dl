import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv(override=True)

from routes import api, auth

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
    expose_headers=['Content-Disposition']
)

app.include_router(api.router, prefix='/api')
app.include_router(auth.router, prefix='/api/auth')
