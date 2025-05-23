from pydantic import BaseModel


class ProcessRequest(BaseModel):
    url: str
    artist: str
    title: str
