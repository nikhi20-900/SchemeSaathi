"""
Global Application Configuration.
Managed by: Core / Member 4
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SchemeSaathi"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./schemesaathi.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "schemesaathi-secret-key-phase1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
