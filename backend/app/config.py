from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Intern Progress Management System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "netsol_ims_super_secret_jwt_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:admin123@localhost:5432/IMS"

    # AI Configuration
    OPENAI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )

settings = Settings()
