from fastapi import APIRouter

from .auth import router as auth_router
from .audio import router as audio_router

router = APIRouter(prefix="/v1")
router.include_router(auth_router)
router.include_router(audio_router)
