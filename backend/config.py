"""
Application configuration for Acadza AI Question Quality Assurance System.
"""

import os
from dotenv import load_dotenv
from typing import Optional, List

# Load environment variables from .env file if present
load_dotenv()


class Settings:
    PROJECT_NAME: str = "Acadza AI – Question Quality Assurance System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Base paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "data"))
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", os.path.join(BASE_DIR, "output"))

    # Database
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "acadza.db"))

    # LLM Settings
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "30"))

    # Confidence Thresholds
    AUTO_APPLY_MIN_CONFIDENCE: float = float(os.getenv("AUTO_APPLY_MIN_CONFIDENCE", "0.88"))
    HIGH_RISK_REPAIRS: List[str] = ["answer_key", "unsound", "wrong_question"]


settings = Settings()
