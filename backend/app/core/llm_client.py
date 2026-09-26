"""
RainGuard AI – LLM Client Configuration
=========================================
Centralized OpenAI-compatible client configured for
GPT-6 Astra via the Experiential Labs gateway.

The API key is read from the EXPLABS_API_KEY environment variable.
It is NEVER hardcoded.
"""

import os
from openai import OpenAI

EXPLABS_BASE_URL = "https://api.experientiallabs.ai/v1"
EXPLABS_MODEL = "gpt-6-astra"


def _get_api_key() -> str:
    key = os.environ.get("EXPLABS_API_KEY", "").strip()
    if not key or key == "your_explabs_api_key_here":
        raise RuntimeError(
            "EXPLABS_API_KEY is not set. "
            "Please set it in your .env file or as an environment variable."
        )
    return key


def get_llm_client() -> OpenAI:
    """Return an OpenAI client pointed at the Experiential Labs gateway."""
    return OpenAI(
        api_key=_get_api_key(),
        base_url=EXPLABS_BASE_URL,
    )
