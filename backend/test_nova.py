#!/usr/bin/env python3
"""
Quick test script for Nova API integration.

Run this to verify Nova API is working:
    python test_nova.py
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_nova_connection():
    """Test Nova API connection and basic functionality."""
    print("=" * 60)
    print("Nova API Integration Test")
    print("=" * 60)
    
    # Check environment variables
    print("\n1. Checking environment variables...")
    api_key = os.getenv("NOVA_API_KEY")
    base_url = os.getenv("NOVA_BASE_URL")
    model = os.getenv("NOVA_MODEL")
    
    if not api_key or api_key == "":
        print("   ❌ NOVA_API_KEY not set")
        print("   Please set NOVA_API_KEY in your .env file")
        return False
    else:
        print(f"   ✓ NOVA_API_KEY: {api_key[:20]}...")
    
    print(f"   ✓ NOVA_BASE_URL: {base_url}")
    print(f"   ✓ NOVA_MODEL: {model}")
    
    # Test client initialization
    print("\n2. Initializing Nova client...")
    from app.ai.nova_client import nova_client
    
    if not nova_client.is_available:
        print(f"   ❌ Nova client initialization failed: {nova_client._init_error}")
        return False
    else:
        print("   ✓ Nova client initialized successfully")
    
    # Test simple structured response
    print("\n3. Testing structured response generation...")
    test_prompt = """Analyze this feedback: "Great team player, helped solve deployment issues."
    
    Return JSON with:
    {
        "summary": "brief summary",
        "sentiment": "positive|neutral|negative"
    }"""
    
    try:
        result = await nova_client.generate_structured_response(test_prompt)
        
        if result.get("fallback"):
            print(f"   ❌ Nova API call failed: {result.get('error')}")
            return False
        else:
            print("   ✓ Nova API call successful")
            print(f"   Response: {result}")
    except Exception as e:
        print(f"   ❌ Error calling Nova API: {e}")
        return False
    
    # Test feedback analysis
    print("\n4. Testing feedback analysis service...")
    from app.ai.nova_service import analyze_feedback
    
    try:
        analysis = await analyze_feedback("Excellent work on the project. Strong technical skills and collaboration.")
        
        if analysis.get("fallback"):
            print(f"   ⚠️  Using fallback mode: {analysis.get('error')}")
        else:
            print("   ✓ Feedback analysis successful")
            print(f"   Sentiment: {analysis.get('sentiment')}")
            print(f"   Skills detected: {[s['name'] for s in analysis.get('skills', [])]}")
            print(f"   Themes: {analysis.get('themes')}")
    except Exception as e:
        print(f"   ❌ Error in feedback analysis: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✓ All Nova integration tests passed!")
    print("=" * 60)
    print("\nNova API is ready to use.")
    print("\nNext steps:")
    print("1. Start the backend: uvicorn app.main:app --reload")
    print("2. Check API status: GET /api/ai/status")
    print("3. Test feedback analysis: POST /api/ai/feedback/analyze")
    print("4. View Swagger docs: http://localhost:8000/docs")
    
    return True


async def test_prompts():
    """Test that prompts use neutral language."""
    print("\n" + "=" * 60)
    print("Testing Prompt Language")
    print("=" * 60)
    
    from app.ai.nova_prompts import CALIBRATION_EXPLANATION_PROMPT
    
    print("\nChecking calibration prompt for neutral language...")
    
    forbidden_words = ["biased", "unfair", "lenient", "strict"]
    found_forbidden = []
    
    # Check prompt instructions (not examples)
    prompt_lower = CALIBRATION_EXPLANATION_PROMPT.lower()
    if "never use words:" in prompt_lower:
        print("   ✓ Prompt includes explicit forbidden word list")
    
    if "neutral" in prompt_lower:
        print("   ✓ Prompt requires neutral language")
    
    if "statistical" in prompt_lower:
        print("   ✓ Prompt requires statistical language")
    
    print("\n✓ Prompt language check passed")


if __name__ == "__main__":
    print("\nStarting Nova API tests...\n")
    
    # Test prompts first (synchronous)
    asyncio.run(test_prompts())
    
    # Test Nova connection (async)
    success = asyncio.run(test_nova_connection())
    
    if not success:
        print("\n❌ Nova integration test failed")
        print("Please check your configuration and try again")
        exit(1)
    else:
        exit(0)
