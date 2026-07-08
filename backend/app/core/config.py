from __future__ import annotations

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "AI HMS Backend"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = Field(..., alias="DATABASE_URL")
    SECRET_KEY: str = Field(..., alias="SECRET_KEY")

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 15
    ACCESS_TOKEN_COOKIE_NAME: str = "hms_access_token"
    ACCESS_TOKEN_COOKIE_SECURE: bool = False
    ACCESS_TOKEN_COOKIE_SAMESITE: str = "lax"
    ACCESS_TOKEN_COOKIE_DOMAIN: str | None = None

    GOOGLE_CLIENT_ID: str | None = None
    ALLOWED_EMAIL_DOMAIN: str = "joveo.com"

    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_USE_TLS: bool = True
    SMTP_FROM_EMAIL: str | None = None
    SMTP_FROM_NAME: str | None = None
    FRONTEND_URL: str = "http://localhost:3000"

    ADMIN_BOOTSTRAP_EMAIL: str | None = None
    ADMIN_BOOTSTRAP_PASSWORD: str | None = None
    ADMIN_BOOTSTRAP_NAME: str = "Admin"

    GEMINI_API_KEY: str | None = None

    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 7
    DB_POOL_RECYCLE: int = 300

    GEMINI_MODEL: str = "gemini-3.1-flash-lite"

    @field_validator("GEMINI_MODEL", "GEMINI_API_KEY", mode="before")
    @classmethod
    def _strip_whitespace(cls, v: str | None) -> str | None:
        return v.strip() if isinstance(v, str) else v

    @model_validator(mode="after")
    def _cookie_samesite_requires_secure(self) -> "Settings":
        if self.ACCESS_TOKEN_COOKIE_SAMESITE.lower() == "none" and not self.ACCESS_TOKEN_COOKIE_SECURE:
            raise ValueError(
                "ACCESS_TOKEN_COOKIE_SECURE must be True when ACCESS_TOKEN_COOKIE_SAMESITE is 'none'"
            )
        return self


settings = Settings()
