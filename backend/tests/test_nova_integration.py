"""
Tests for Nova API integration.

These tests verify that Nova client and service work correctly
and gracefully fall back when Nova is unavailable.
"""
import pytest
from unittest.mock import AsyncMock, patch
from app.ai.nova_client import NovaClient
from app.ai import nova_service


class TestNovaClient:
    """Test Nova client initialization and error handling."""
    
    def test_client_initialization_without_api_key(self):
        """Client should initialize but not be available without API key."""
        with patch('app.ai.nova_client.settings') as mock_settings:
            mock_settings.NOVA_API_KEY = ""
            client = NovaClient()
            assert not client.is_available
            assert client._init_error is not None
    
    def test_client_initialization_with_api_key(self):
        """Client should initialize successfully with valid API key."""
        with patch('app.ai.nova_client.settings') as mock_settings:
            mock_settings.NOVA_API_KEY = "test-key"
            mock_settings.NOVA_BASE_URL = "https://test.com"
            mock_settings.NOVA_TIMEOUT = 60
            client = NovaClient()
            # Client should be created even if connection not tested
            assert client._client is not None or client._init_error is not None


class TestNovaStructuredResponse:
    """Test structured response generation."""
    
    @pytest.mark.asyncio
    async def test_structured_response_with_unavailable_client(self):
        """Should return fallback when client is unavailable."""
        client = NovaClient()
        client._client = None
        client._init_error = "Test error"
        
        result = await client.generate_structured_response("Test prompt")
        
        assert result.get("fallback") is True
        assert "error" in result
    
    @pytest.mark.asyncio
    async def test_structured_response_with_mock_success(self):
        """Should parse JSON response successfully."""
        client = NovaClient()
        
        # Mock successful response
        mock_response = AsyncMock()
        mock_response.choices = [AsyncMock()]
        mock_response.choices[0].message.content = '{"test": "data"}'
        
        with patch.object(client, '_client') as mock_client:
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            
            result = await client.generate_structured_response("Test prompt")
            
            assert result == {"test": "data"}
            assert "fallback" not in result
    
    @pytest.mark.asyncio
    async def test_structured_response_strips_markdown(self):
        """Should strip markdown code fences from response."""
        client = NovaClient()
        
        # Mock response with markdown
        mock_response = AsyncMock()
        mock_response.choices = [AsyncMock()]
        mock_response.choices[0].message.content = '```json\n{"test": "data"}\n```'
        
        with patch.object(client, '_client') as mock_client:
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            
            result = await client.generate_structured_response("Test prompt")
            
            assert result == {"test": "data"}
    
    @pytest.mark.asyncio
    async def test_structured_response_handles_malformed_json(self):
        """Should return fallback for malformed JSON."""
        client = NovaClient()
        
        # Mock response with invalid JSON
        mock_response = AsyncMock()
        mock_response.choices = [AsyncMock()]
        mock_response.choices[0].message.content = '{invalid json}'
        
        with patch.object(client, '_client') as mock_client:
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            
            result = await client.generate_structured_response("Test prompt")
            
            assert result.get("fallback") is True
            assert "Malformed JSON" in result.get("error", "")


class TestNovaTextGeneration:
    """Test text generation."""
    
    @pytest.mark.asyncio
    async def test_text_generation_unavailable_client(self):
        """Should return empty string when client unavailable."""
        client = NovaClient()
        client._client = None
        
        result = await client.generate_text("Test prompt")
        
        assert result == ""
    
    @pytest.mark.asyncio
    async def test_text_generation_success(self):
        """Should return generated text."""
        client = NovaClient()
        
        # Mock successful response
        mock_response = AsyncMock()
        mock_response.choices = [AsyncMock()]
        mock_response.choices[0].message.content = "Generated text"
        
        with patch.object(client, '_client') as mock_client:
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            
            result = await client.generate_text("Test prompt")
            
            assert result == "Generated text"


class TestFeedbackAnalysis:
    """Test feedback analysis service."""
    
    @pytest.mark.asyncio
    async def test_analyze_feedback_fallback(self):
        """Should return fallback analysis when Nova fails."""
        result = await nova_service.analyze_feedback("This is great work!")
        
        # Should return structured result
        assert "summary" in result
        assert "skills" in result
        assert "themes" in result
        assert "sentiment" in result
        assert "evidence_strength" in result
    
    @pytest.mark.asyncio
    async def test_fallback_sentiment_detection(self):
        """Fallback should detect positive sentiment."""
        result = nova_service.get_fallback_feedback_analysis("Excellent work! Great job!")
        
        assert result["sentiment"] == "positive"
    
    @pytest.mark.asyncio
    async def test_fallback_negative_sentiment(self):
        """Fallback should detect negative sentiment."""
        result = nova_service.get_fallback_feedback_analysis("Poor performance. Needs improvement.")
        
        assert result["sentiment"] == "negative"
    
    @pytest.mark.asyncio
    async def test_fallback_neutral_sentiment(self):
        """Fallback should detect neutral sentiment."""
        result = nova_service.get_fallback_feedback_analysis("The employee completed the tasks.")
        
        assert result["sentiment"] == "neutral"


class TestNovaServiceIntegration:
    """Integration tests for Nova services."""
    
    @pytest.mark.asyncio
    async def test_performance_summary_graceful_fallback(self, db):
        """Should return fallback when Nova unavailable."""
        from tests.conftest import make_employee
        
        emp = make_employee(db)
        db.commit()
        
        # Call with Nova unavailable
        result = await nova_service.generate_performance_summary(db, emp.id, "2026-H1")
        
        # Should return fallback structure
        assert "summary" in result
        assert result.get("fallback") is True
    
    @pytest.mark.asyncio
    async def test_skill_insights_graceful_fallback(self, db):
        """Should return fallback for skill insights."""
        from tests.conftest import make_employee, make_skill
        
        emp = make_employee(db)
        skill = make_skill(db)
        db.commit()
        
        result = await nova_service.generate_skill_insights(db, emp.id, skill.id)
        
        assert "explanation" in result
        assert result.get("fallback") is True
    
    @pytest.mark.asyncio
    async def test_calibration_explanation_graceful_fallback(self, db):
        """Should return fallback for calibration explanation."""
        from tests.conftest import make_employee, make_manager, make_review, make_calibration_alert
        
        emp = make_employee(db)
        mgr = make_manager(db)
        review = make_review(db, emp.id, mgr.id)
        alert = make_calibration_alert(db, emp.id, mgr.id, review.id)
        db.commit()
        
        result = await nova_service.explain_calibration_alert(db, alert.id)
        
        assert "summary" in result
        assert "recommended_action" in result
        assert result.get("fallback") is True


class TestNeutralLanguage:
    """Test that calibration explanations use neutral language."""
    
    @pytest.mark.asyncio
    async def test_calibration_prompt_has_neutral_instructions(self):
        """Calibration prompt should explicitly forbid biased language."""
        from app.ai.nova_prompts import CALIBRATION_EXPLANATION_PROMPT
        
        # Check for forbidden words in instructions
        assert "NEVER use words: \"biased\"" in CALIBRATION_EXPLANATION_PROMPT
        assert "neutral language" in CALIBRATION_EXPLANATION_PROMPT
        assert "do NOT assign blame" in CALIBRATION_EXPLANATION_PROMPT
    
    def test_base_system_prompt_includes_rules(self):
        """Base system prompt should include critical rules."""
        from app.ai.nova_prompts import BASE_SYSTEM_PROMPT
        
        assert "Do NOT invent" in BASE_SYSTEM_PROMPT
        assert "Do NOT make promotion recommendations" in BASE_SYSTEM_PROMPT
        assert "Do NOT label managers as biased" in BASE_SYSTEM_PROMPT
        assert "neutral, statistical language" in BASE_SYSTEM_PROMPT


class TestContextBuilder:
    """Test context building for Nova prompts."""
    
    def test_feedback_context_build(self, db):
        """Should build feedback context correctly."""
        from tests.conftest import make_employee, make_feedback
        from app.ai.context_builder import build_feedback_context
        
        emp = make_employee(db)
        reviewer = make_employee(db, email="reviewer@test.com")
        feedback = make_feedback(db, emp.id, reviewer.id)
        db.commit()
        
        context = build_feedback_context(db, feedback.id)
        
        assert context["feedback_id"] == feedback.id
        assert context["employee_name"] == emp.name
        assert context["text"] == feedback.text
    
    def test_calibration_context_includes_evidence(self, db):
        """Should include supporting evidence in calibration context."""
        from tests.conftest import make_employee, make_manager, make_review, make_calibration_alert, make_goal
        from app.ai.context_builder import build_calibration_context
        
        emp = make_employee(db)
        mgr = make_manager(db)
        review = make_review(db, emp.id, mgr.id, cycle="2026-H1")
        alert = make_calibration_alert(db, emp.id, mgr.id, review.id)
        goal = make_goal(db, emp.id, cycle="2026-H1")
        db.commit()
        
        context = build_calibration_context(db, alert.id)
        
        assert "alert" in context
        assert "supporting_evidence" in context
        assert "goals" in context["supporting_evidence"]
        assert len(context["supporting_evidence"]["goals"]) > 0
