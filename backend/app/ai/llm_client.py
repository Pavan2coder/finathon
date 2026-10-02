"""
LLM client — Google Gemini with graceful degradation.

If the API key is absent or the call fails, every method falls back
to a safe deterministic response so the rest of the API keeps working.
"""
import json
from typing import Any, Dict, Optional
from app.core.config import settings


class LLMClient:
    """Thin wrapper around Gemini with structured-JSON helpers."""

    def __init__(self):
        self._model = None
        self._init_error: Optional[str] = None
        self._try_init()

    def _try_init(self):
        try:
            import google.generativeai as genai
            if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in ("dummy-key", ""):
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._model = genai.GenerativeModel("gemini-1.5-flash")
            else:
                self._init_error = "GEMINI_API_KEY not configured"
        except Exception as exc:
            self._init_error = str(exc)

    # ── Public API ────────────────────────────────────────────────────────────

    def generate_structured_response(
        self,
        prompt: str,
        response_schema: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Call Gemini and parse the JSON response.
        Falls back to {"fallback": True} on any failure.
        """
        if self._model is None:
            return {"fallback": True, "error": self._init_error or "LLM not initialised"}

        try:
            full_prompt = (
                prompt
                + "\n\nYou MUST respond with valid JSON only. "
                + "Do not include any text before or after the JSON object."
            )
            response = self._model.generate_content(full_prompt)
            text = response.text.strip()

            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()

            return json.loads(text)

        except json.JSONDecodeError:
            return {"fallback": True, "error": "Malformed JSON from LLM"}
        except Exception as exc:
            return {"fallback": True, "error": str(exc)}

    def generate_text(self, prompt: str) -> str:
        """Generate plain text. Returns empty string on failure."""
        if self._model is None:
            return ""
        try:
            return self._model.generate_content(prompt).text
        except Exception:
            return ""


# Singleton
llm_client = LLMClient()
