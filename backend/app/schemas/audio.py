from pydantic import BaseModel


class DownloadOptions(BaseModel):
    codec: str = "best"
    bitrate: str = "best"


class Metadata(BaseModel):
    artist: str
    title: str


class ProcessRequest(BaseModel):
    url: str
    metadata: Metadata
    dl_opts: DownloadOptions
