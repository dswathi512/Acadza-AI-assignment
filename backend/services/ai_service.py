"""
AI Service interfacing with Google Gemini API for deep question investigation.
Includes structured output enforcement and safe offline/demo mode fallback.
"""

import os
import json
import re
from typing import Dict, Any, Optional
from backend.config import settings

# Attempt import of google.genai
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None

        if HAS_GENAI and self.api_key and not self.api_key.startswith("your_"):
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[AIService] Failed to initialize GenAI client: {e}")
                self.client = None

    def is_live(self) -> bool:
        """Returns True if a live Gemini client is configured with an API key."""
        return self.client is not None

    def query_gemini(self, prompt: str, system_instruction: str) -> Optional[str]:
        """
        Sends request to Gemini using configured model and system instruction.
        """
        if not self.is_live():
            return None

        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,  # Low temperature for deterministic academic reasoning
                response_mime_type="application/json"
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            print(f"[AIService] Gemini API invocation error: {e}")
            return None


ai_service = AIService()
