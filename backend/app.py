import os
import logging

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils.helper import process_request, get_file_info

logging.basicConfig(
    encoding='utf-8',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


app = FastAPI()

origins = [
    'http://localhost',
    'http://localhost:8000',
    'http://localhost:5173',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)

MEDIA_FOLDER = 'media'
os.makedirs(MEDIA_FOLDER, exist_ok=True)


class ProcessRequest(BaseModel):
    url: str
    artist: str
    title: str


@app.post('/api/process')
async def api_process(data: ProcessRequest):
    logger.info(f'Received process request: {data.url}')

    if not data.url.startswith('https'):
        logger.warning(f'Invalid URL format received: {data.url}')
        raise HTTPException(
            status_code=400,
            detail='Invalid YouTube link format. URL must start with https',
        )

    file_id, error = await process_request(
        data.url, data.artist, data.title, MEDIA_FOLDER
    )

    if error:
        logger.error(f'Processing failed for {data.url}: {error}')
        raise HTTPException(status_code=500, detail=error)

    return JSONResponse(
        content={'file_id': file_id},
        status_code=200,
    )


@app.get('/api/download/{file_id}')
async def api_download(file_id: str, background_tasks: BackgroundTasks):
    file_info = get_file_info(file_id)
    if not 'filepath' in file_info:
        raise HTTPException(status_code=404, detail=f'{file_id=} not found')

    filepath = file_info['filepath']
    download_name = file_info['download_name']
    logger.info(f'Serving file for {file_id=}: filepath="{filepath}"')

    # Schedule file cleanup after sending
    background_tasks.add_task(os.remove, filepath)

    return FileResponse(
        path=filepath, filename=download_name, media_type='audio/mpeg'
    )
