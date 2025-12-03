from dotenv import load_dotenv
from pydantic import SecretStr
from pydantic_settings import BaseSettings

load_dotenv()


class Config(BaseSettings):
    app_name: str = "Turtle Tools"
    allow_origin: str = "http://localhost:5173"

    db_username: str = ""
    db_password: str = ""
    db_name: str = "database.db"

    jwt_secret_key: SecretStr = SecretStr("development-secret-key-pls-change-this")
    jwt_expire_minutes: int = 60
    jwt_algorithm: str = "HS256"

    app_default_username: str = "admin"
    app_default_password: str = "admin"

    media_folder: str = "./media"
    cookies_path: str = ""

    @property
    def db_url(self) -> str:
        return f"sqlite:///./{self.db_name}"


config = Config()
