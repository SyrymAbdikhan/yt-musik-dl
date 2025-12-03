from fastapi import HTTPException


class UnauthorizedException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(
            status_code=401, detail=message, headers={"WWW-Authenticate": "Bearer"}
        )


class NotFoundException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(status_code=404, detail=message)


class BadRequestException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(status_code=400, detail=message)


class UnexpectedException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(status_code=500, detail=message)
