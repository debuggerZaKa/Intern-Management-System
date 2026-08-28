from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):

    PROJECT_NAME: str = "AI-Powered Intern Progress Management System"
    API_V1_STR: str = "/api/v1"

    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Default internship duration — configurable, never hard-coded elsewhere
    INTERNSHIP_DURATION_WEEKS: int = 6

    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 1800
    DB_POOL_TIMEOUT: int = 30

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str

    GROQ_API_KEY: str
    AI_MODEL: str = "llama-3.3-70b-versatile"
    AI_ENABLED: bool = True

    # Comma-separated list of allowed CORS origins
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173"

    MAX_UPLOAD_SIZE_MB: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()