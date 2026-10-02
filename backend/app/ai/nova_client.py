"""
Nova API client — OpenAI-compatible interface with graceful degradation.

Handles authentication, retries, timeouts, and error handling.
Falls back to safe deterministic responses when Nova is unavailable.
"""
import json
import logging
from typing import Any, Dict, Optional
from openai import AsyncOpenAI, OpenAIError, APITimeoutError, RateLimitError
from app.core.config import settings

logger = logging.getLogger(__name__)


class NovaClient:
    """Async client for Nova API with structured-JSON helpers."""

    def __init__(self):
        self._client: Optional[AsyncOpenAI] = None
        self._init_error: Optional[str] = None
        self._try_init()

    def _try_init(self):
        """Initialize the Nova client if API key is configured."""
        try:
            if not settings.NOVA_API_KEY or settings.NOVA_API_KEY == "":
                self._init_error = "NOVA_API_KEY not configured"
                logger.warning("Nova API key not configured - AI features will use fallback mode")
                return

            self._client = AsyncOpenAI(
                api_key=settings.NOVA_API_KEY,
                base_url=settings.NOVA_BASE_URL,
                timeout=settings.NOVA_TIMEOUT,
            )
            logger.info(f"Nova client initialized with model: {settings.NOVA_MODEL}")

        except Exception as exc:
            self._init_error = str(exc)
            logger.error(f"Failed to initialize Nova client: {exc}")

    @property
    def is_available(self) -> bool:
        """Check if Nova client is available."""
        return self._client is not None

    # ── Public API ────────────────────────────────────────────────────────────

    async def generate_structured_response(
        self,
        prompt: str,
        response_schema: Optional[Dict[str, Any]] = None,
        max_retries: int = 2,
    ) -> Dict[str, Any]:
        """
        Call Nova API and parse the JSON response.
        
        Args:
            prompt: The prompt to send to Nova
            response_schema: Optional schema to validate response
            max_retries: Number of retry attempts for transient failures
            
        Returns:
            Dictionary with AI response or fallback indicator
        """
        if self._client is None:
            return {
                "fallback": True,
                "error": self._init_error or "Nova client not initialized"
            }

        for attempt in range(max_retries + 1):
            try:
                # Add JSON instruction to prompt
                full_prompt = (
                    prompt
                    + "\n\nYou MUST respond with valid JSON only. "
                    + "Do not include any text before or after the JSON object."
                )

                response = await self._client.chat.completions.create(
                    model=settings.NOVA_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert HR performance intelligence assistant. Always respond with valid JSON."
                        },
                        {
                            "role": "user",
                            "content": full_prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=2000,
                )

                # Extract response text
                text = response.choices[0].message.content.strip()

                # Strip markdown code fences if present
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                    text = text.strip()

                # Parse JSON
                result = json.loads(text)

                # Validate against schema if provided
                if response_schema and not self._validate_schema(result, response_schema):
                    logger.warning(f"Response doesn't match expected schema: {response_schema}")

                logger.info(f"Nova API call successful (attempt {attempt + 1})")
                return result

            except json.JSONDecodeError as e:
                logger.error(f"Malformed JSON from Nova (attempt {attempt + 1}): {e}")
                if attempt < max_retries:
                    continue
                return {
                    "fallback": True,
                    "error": "Malformed JSON from Nova API"
                }

            except APITimeoutError:
                logger.warning(f"Nova API timeout (attempt {attempt + 1})")
                if attempt < max_retries:
                    continue
                return {
                    "fallback": True,
                    "error": "Nova API timeout"
                }

            except RateLimitError:
                logger.warning("Nova API rate limit exceeded")
                return {
                    "fallback": True,
                    "error": "Nova API rate limit exceeded"
                }

            except OpenAIError as e:
                logger.error(f"Nova API error (attempt {attempt + 1}): {e}")
                if attempt < max_retries:
                    continue
                return {
                    "fallback": True,
                    "error": f"Nova API error: {str(e)}"
                }

            except Exception as exc:
                logger.error(f"Unexpected error calling Nova (attempt {attempt + 1}): {exc}")
                if attempt < max_retries:
                    continue
                return {
                    "fallback": True,
                    "error": f"Unexpected error: {str(exc)}"
                }

        return {
            "fallback": True,
            "error": "Max retries exceeded"
        }

    async def generate_text(
        self,
        prompt: str,
        max_retries: int = 2,
    ) -> str:
        """
        Generate plain text response.
        
        Args:
            prompt: The prompt to send
            max_retries: Number of retry attempts
            
        Returns:
            Generated text or empty string on failure
        """
        if self._client is None:
            logger.warning("Nova client not available for text generation")
            return ""

        for attempt in range(max_retries + 1):
            try:
                response = await self._client.chat.completions.create(
                    model=settings.NOVA_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert HR performance intelligence assistant."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=1500,
                )

                text = response.choices[0].message.content.strip()
                logger.info(f"Nova text generation successful (attempt {attempt + 1})")
                return text

            except Exception as exc:
                logger.error(f"Error generating text (attempt {attempt + 1}): {exc}")
                if attempt < max_retries:
                    continue
                return ""

        return ""

    def _validate_schema(self, data: Dict, schema: Dict) -> bool:
        """
        Basic schema validation.
        
        Args:
            data: The data to validate
            schema: Expected schema (simple dict of field names to types)
            
        Returns:
            True if data matches schema
        """
        if not isinstance(data, dict):
            return False

        for field, expected_type in schema.items():
            if field not in data:
                return False
            if not isinstance(data[field], expected_type):
                return False

        return True


# Singleton instance
nova_client = NovaClient()
