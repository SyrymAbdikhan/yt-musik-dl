import os
import uuid
import logging
from typing import Any
from werkzeug.utils import secure_filename

from app.schemas.audio import ProcessRequest
from app.utils.helper import cleanup, sanitize

from yt_dlp import YoutubeDL

logger = logging.getLogger(__name__)

# TODO: replace this
file_infos: dict[str, dict[str, Any]] = {}


async def process_request(
    data: ProcessRequest, output_folder: str = "."
) -> tuple[str | None, str | None]:
    # ensure media folder exists
    os.makedirs(output_folder, exist_ok=True)

    file_info = await download_youtube(
        url=data.url,
        output_folder=output_folder,
        metadata=data.metadata.model_dump(),
        dl_opts=data.dl_opts.model_dump(),
    )
    error = file_info.get("error")
    if error:
        return None, error

    file_info["download_name"] = (
        get_download_name(data.metadata.artist, data.metadata.title)
        + os.path.splitext(file_info["filepath"])[-1]
    )
    file_infos[file_info["file_id"]] = file_info.copy()
    return file_info["file_id"], None


async def download_youtube(
    url: str,
    output_folder: str = ".",
    metadata: dict[str, str] | None = None,
    dl_opts: dict[str, str] | None = None,
) -> dict[str, Any]:
    file_id = uuid.uuid4().hex
    filepath_tmpl = os.path.join(output_folder, f"{file_id}.%(ext)s")
    filepath = None

    ydl_opts = get_options(filepath_tmpl, metadata=metadata, **(dl_opts or {}))
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filepath = info.get("requested_downloads", [{}])[0].get(
                "filepath"
            ) or info.get("_filename")
    except Exception as e:
        error = "An unexpected error during the download process"
        logger.error(f"{error} {url=}: {e}")
        cleanup(filepath)
        return {"error": error}

    if not filepath or not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
        error = "Output file was not created or is empty"
        logger.error(f"{error} {url=}")
        cleanup(filepath)
        return {"error": error}

    logger.info(f"Successfully downloaded {url=}")
    return {"filepath": filepath, "file_id": file_id}


def get_options(
    filepath: str,
    codec: str = "best",  # mp3, opus, flac, wav
    bitrate: int | str = "best",  # 64, 128, 160, 256, 320
    metadata: dict[str, str] | None = None,
    cookie_source: str | None = None,
    quiet: bool = True,
    **_,
) -> dict[str, Any]:
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": {"default": f"{filepath}"},
        "noplaylist": True,
        "no_warnings": True,
        "noprogress": True,
        "quiet": quiet,
        "restrictfilenames": True,
        "keepvideo": False,
        "postprocessors": [{"key": "FFmpegExtractAudio"}],
        "postprocessor_args": [],
        "retries": 3,
        "concurrent_fragment_downloads": 5,
    }

    extract_details = {"key": "FFmpegExtractAudio"}
    if codec != "best":  # TODO: validate codecs
        extract_details["preferredcodec"] = codec
    if bitrate != "best" and isinstance(bitrate, int):  # TODO: validate bitrate
        extract_details["preferredquality"] = bitrate
    ydl_opts["postprocessors"].append(extract_details)

    metadata_details = []
    if metadata:
        for key, value in metadata.items():
            metadata_details += ["-metadata", f"{key}={value}"]
    ydl_opts["postprocessor_args"] += metadata_details

    if cookie_source:
        ydl_opts["cookiefile"] = cookie_source

    return ydl_opts


def get_file_info(file_id: str) -> dict[str, Any]:
    try:
        file_info = file_infos.pop(file_id, None)

        if not file_info:
            logger.warning(f"No download info found for {file_id=}")
            return {"error": "Invalid file ID"}

        filepath = file_info.get("filepath", "")
        if not filepath or not os.path.exists(filepath):
            logger.error(f"Missing {filepath=} for {file_id=}")
            return {"error": "File not found"}

        return file_info
    except Exception as e:
        logger.error(f"Unexpected error while getting info for {file_id=}: {e}")
        return {"error": "Unexpected error occured"}


def get_download_name(artist: str | None, title: str | None) -> str:
    clean_title = sanitize(title)
    clean_artist = sanitize(artist)

    if clean_title and clean_artist:
        download_name = f"{clean_title}_by_{clean_artist}"
    elif clean_title:
        download_name = f"{clean_title}"
    elif clean_artist:
        download_name = f"music_by_{clean_artist}"
    else:
        download_name = f"music"

    return secure_filename(download_name)
