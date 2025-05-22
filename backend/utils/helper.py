import os
import re
import uuid
import logging
import asyncio

from mutagen.mp3 import MP3
from mutagen.id3 import TPE1, TIT2

from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

file_infos = {}


async def process_request(
    url: str, artist: str, title: str, destination: str
) -> tuple[str | None, str | None]:
    global file_infos

    file_info = await download_youtube(url, destination)
    if "error" in file_info:
        return None, file_info["error"]

    error = update_metadata(file_info["filepath"], artist, title)
    if error:
        return None, error

    download_name = get_download_name(artist, title)
    file_info["download_name"] = download_name

    file_infos[file_info["file_id"]] = file_info.copy()
    return file_info["file_id"], None


async def download_youtube(url: str, destination: str) -> dict:
    file_id = uuid.uuid4().hex
    filepath = os.path.join(destination, f"{file_id}.mp3")

    command = [
        "poetry",
        "run",
        "yt-dlp",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "128K",
        "--no-playlist",
        "--no-warnings",
        "--quiet",
        "--ffmpeg-location",
        "./utils/",
        "-o",
        filepath,
        url,
    ]

    try:
        process = await asyncio.create_subprocess_exec(
            *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()
        if process.returncode != 0:
            error = "Download failed"
            logger.error(error + f" {url=}")
            cleanup(filepath)
            return {"error": error}

    except Exception as e:
        error = "An unexpected error during the download process"
        logger.error(error + f" {url=}: {e}")
        cleanup(filepath)
        return {"error": error}

    if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
        error = "Output file was not created or is empty"
        logger.error(error + f" {url=}")
        cleanup(filepath)
        return {"error": error}

    logger.info(f"Successfully downloaded from {url=}")
    return {"filepath": filepath, "file_id": file_id}


def update_metadata(filepath: str, artist: str, title: str) -> str | None:
    try:
        audio = MP3(filepath)
        if audio.tags:
            audio.tags.clear()

        if artist:
            audio.tags.add(TPE1(encoding=3, text=[artist]))
        if title:
            audio.tags.add(TIT2(encoding=3, text=[title]))

        audio.save(v2_version=3)

    except Exception as e:
        error = f"An unexpected error during metadata processing"
        logger.error(error + f": {e}")
        cleanup(filepath)
        return error

    logger.info(f"Successfully updated metadata for {filepath=}")
    return None


def get_download_name(artist: str, title: str) -> str:
    clean_title = sanitize(title)
    clean_artist = sanitize(artist)

    if clean_title and clean_artist:
        download_name = f"{clean_title}_by_{clean_artist}.mp3"
    elif clean_title:
        download_name = f"{clean_title}.mp3"
    elif clean_artist:
        download_name = f"music_by_{clean_artist}.mp3"
    else:
        download_name = f"music.mp3"

    return secure_filename(download_name)


def get_file_info(file_id: str) -> dict:
    global file_infos

    try:
        file_info = file_infos.pop(file_id, None)

        if not file_info:
            logger.warning(f"Download requested for {file_id=}, but no info found")
            return {"error": "Invalid file ID"}

        filepath = file_info["filepath"]
        if not os.path.exists(filepath):
            logger.error(f"File path {filepath} not found for {file_id=}")
            return {"error": "Processed file not found on server"}

        return file_info
    except Exception as e:
        logger.error(f"Unexpected error while getting info for {file_id=}: {e}")
        return {"error": "Unexpected error occured"}


def cleanup(filepath: str) -> None:
    if not filepath or not os.path.exists(filepath):
        return

    try:
        os.remove(filepath)
    except Exception as e:
        logger.warning(f"Error cleaning up {filepath}: {e}")


def sanitize(string: str) -> str:
    """Removes invalid characters from a string"""
    cleaned = re.sub(r'[<>:"/\\|?*]', "", string)
    return cleaned.strip()
