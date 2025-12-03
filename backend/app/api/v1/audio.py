from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import config
from app.core.exceptions import (
    BadRequestException,
    NotFoundException,
    UnexpectedException,
)
from app.schemas.audio import ProcessRequest
from app.api.dependencies import get_current_user
from app.services import audio_service
from app.utils.helper import cleanup

router = APIRouter(prefix="/audio", dependencies=[Depends(get_current_user)])


@router.post("/process")
async def api_process(data: ProcessRequest):
    if not data.url.startswith("https"):
        raise BadRequestException(
            "Invalid YouTube link format. URL must start with https"
        )

    file_id, error = await audio_service.process_request(data, config.media_folder)
    if error:
        raise UnexpectedException(error)

    return JSONResponse(content={"file_id": file_id})


@router.get("/download/{file_id}", response_class=FileResponse)
async def api_download(file_id: str, background_tasks: BackgroundTasks):
    file_info = audio_service.get_file_info(file_id)
    if not "filepath" in file_info:
        raise NotFoundException(f"{file_id=} not found")

    filepath = file_info["filepath"]
    download_name = file_info["download_name"]

    # Schedule file cleanup after sending
    background_tasks.add_task(cleanup, filepath)

    return FileResponse(path=filepath, filename=download_name)
