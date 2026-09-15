import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "PizzaHub API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    DATABASE_URL: str = "sqlite:///./pizza_delivery.db"

    JWT_SECRET_KEY: str = "pizzahub_super_secret_jwt_key_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    RAZORPAY_KEY_ID: str = "rzp_test_pizzahub12345"
    RAZORPAY_KEY_SECRET: str = "pizzahub_razorpay_secret_key_mock"

    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@pizzahub.com"
    ADMIN_EMAIL: str = "admin@pizzahub.com"
    ADMIN_PASSWORD: str = "admin123"

    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()