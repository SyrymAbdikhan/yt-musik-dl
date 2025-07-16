from pydantic import BaseModel


class ProcessRequest(BaseModel):
    url: str
    artist: str
    title: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None
