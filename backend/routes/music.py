import os
import logging

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

from schemas import ProcessRequest
from utils.helper import process_request, get_file_info

router = APIRouter()
logger = logging.getLogger(__name__)

MEDIA_FOLDER = os.getenv("MEDIA_FOLDER", "./media")
os.makedirs(MEDIA_FOLDER, exist_ok=True)


@router.post("/process")
async def api_process(data: ProcessRequest):
    logger.info(f"Received process request: {data.url}")

    if not data.url.startswith("https"):
        logger.warning(f"Invalid URL format received: {data.url}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube link format. URL must start with https",
        )

    file_id, error = await process_request(
        data.url, data.artist, data.title, MEDIA_FOLDER
    )

    if error:
        logger.error(f"Processing failed for {data.url}: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error
        )

    return JSONResponse(
        content={"file_id": file_id},
        status_code=status.HTTP_200_OK,
    )


@router.get("/download/{file_id}")
async def api_download(file_id: str, background_tasks: BackgroundTasks):
    file_info = get_file_info(file_id)
    if not "filepath" in file_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"{file_id=} not found"
        )

    filepath = file_info["filepath"]
    download_name = file_info["download_name"]
    logger.info(f'Serving file for {file_id=}: filepath="{filepath}"')

    # Schedule file cleanup after sending
    background_tasks.add_task(os.remove, filepath)

    return FileResponse(path=filepath, filename=download_name, media_type="audio/mpeg")
