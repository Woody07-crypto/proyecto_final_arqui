import os
import secrets
from dotenv import load_dotenv

load_dotenv()


def _secret_from_env(name: str) -> str:
    """Usa variable de entorno si existe; si no, genera valor seguro (dev sin .env)."""
    value = os.getenv(name)
    if value:
        return value
    return secrets.token_hex(32)


class Config:
    SECRET_KEY = _secret_from_env("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:root@localhost:5432/eventos_db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = _secret_from_env("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = 86400
