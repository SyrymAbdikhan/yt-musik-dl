import os
import re
import logging

logger = logging.getLogger(__name__)


def cleanup(filepath: str) -> None:
    if not filepath or not os.path.exists(filepath):
        return

    try:
        os.remove(filepath)
    except Exception as e:
        logger.warning(f"Error cleaning up '{filepath}': {e}")


def rename_file(src: str, dst: str, overwrite: bool = True) -> None:
    if not src or not os.path.exists(src):
        return

    if not dst or os.path.exists(dst) and overwrite:
        return

    try:
        os.rename(src, dst)
    except Exception as e:
        logger.warning(f"Error renaming '{src}' to '{dst}': {e}")


def sanitize(string: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*]', "", string)
    return cleaned.strip()
