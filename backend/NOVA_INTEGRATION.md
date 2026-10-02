

# Nova API Integration Guide

## Overview

Nova API has been integrated as the AI intelligence layer for the HRM Performance Intelligence Platform. Nova provides:

- Feedback analysis with structured insights
- Performance narrative summaries
- Skill gap explanations and recommendations
- Career path and promotion readiness explanations
- Calibration alert explanations (with neutral statistical language)
- HR conversational Q&A
- Report summarization

**Architecture Principle**: Python calculates → Nova explains → HR decides

---

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Nova API (OpenAI-compatible)
NOVA_API_KEY=nova_sk_9zjPBe_DxdRAfNWoQqZxpSo_YkYIJjmMTpy1n62IhM4
NOVA_BASE_URL=https://nova-lite-beta.us-east-1.aws.ai.meta.com/v1
NOVA_MODEL=us.meta.llama3-2-90b-instruct-v1:0
NOVA_TIMEOUT=60
```

### Installation

```bash
pip install openai==1.55.3
```

---

## API Endpoints

All Nova endpoints are under `/api/ai/`:

### 1. Feedback Analysis
```
POST /api/ai/feedback/analyze
```

**Request**:
```json
{
  "feedback_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "feedback_id": "uuid",
    "analysis": {
      "summary": "Brief summary of the feedback",
      "skills": [
        {"name": "Collaboration", "confidence": 0.91}
      ],
      "themes": ["teamwork", "problem-solving"],
      "sentiment": "positive",
      "evidence_strength": 0.84
    }
  }
}
```

### 2. Performance Summary
```
POST /api/ai/employees/{employee_id}/performance-summary?review_cycle=2026-H1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "review_cycle": "2026-H1",
    "summary": {
      "summary": "Overall performance narrative",
      "strengths": ["goal achievement", "technical execution"],
      "development_areas": ["system design", "leadership"],
      "key_evidence": [
        {
          "category": "goals",
          "description": "Achieved 94% of goals",
          "evidence_id": "goal_123"
        }
      ],
      "trend_summary": "Consistent high performance"
    }
  }
}
```

### 3. Skill Insights
```
POST /api/ai/employees/{employee_id}/skill-insights?skill_id=uuid
```

**Response**:
```json
{
  "success": true,
  "data": {
    "insights": {
      "explanation": "Explanation of the skill gap",
      "supporting_evidence": ["evidence1", "evidence2"],
      "recommended_actions": [
        {
          "action": "Complete advanced system design training",
          "type": "TRAINING",
          "timeline": "3 months"
        }
      ]
    }
  }
}
```

### 4. Development Plan
```
POST /api/ai/employees/{employee_id}/development-plan?target_role_id=uuid
```

**Response**:
```json
{
  "success": true,
  "data": {
    "plan": {
      "development_goals": [
        {
          "skill": "System Design",
          "goal": "Improve architecture design capability",
          "recommended_actions": ["action1", "action2"],
          "action_type": "STRETCH_ASSIGNMENT",
          "timeline": "6 months",
          "priority": "HIGH"
        }
      ]
    }
  }
}
```

### 5. Promotion Readiness Explanation
```
POST /api/ai/employees/{employee_id}/promotion-explanation
```

**Response**:
```json
{
  "success": true,
  "data": {
    "explanation": {
      "summary": "Meets 7 of 9 criteria for promotion",
      "strengths_narrative": "Strong project delivery...",
      "gaps_narrative": "System design and leadership...",
      "recommendation": "Focus on system design skills"
    }
  }
}
```

### 6. ⭐ Calibration Alert Explanation
```
POST /api/ai/calibration/{alert_id}/explain
```

**Response**:
```json
{
  "success": true,
  "data": {
    "explanation": {
      "summary": "Rating differs significantly from evidence indicators",
      "evidence_alignment": "Evidence score 90% vs rating 3.1/5",
      "possible_explanations": [
        "Potential evaluation inconsistency detected",
        "Evidence suggests different performance level"
      ],
      "supporting_evidence": [
        {
          "category": "goals",
          "description": "94% goal achievement",
          "evidence_id": "goal_123"
        }
      ],
      "recommended_action": "Review during calibration session"
    }
  }
}
```

### 7. HR Question Answering
```
POST /api/ai/hr/query
```

**Request**:
```json
{
  "question": "Why was Rahul flagged for calibration?",
  "employee_id": "uuid",
  "alert_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "answer": {
      "answer": "Rahul was flagged because...",
      "supporting_data": [
        {"type": "evidence_score", "value": "90%", "source_id": "review_123"}
      ],
      "recommendations": ["Review during calibration"]
    }
  }
}
```

### 8. Report Summary
```
POST /api/ai/reports/summary
```

**Request**:
```json
{
  "report_type": "performance",
  "report_data": {
    "total_employees": 248,
    "average_score": 82.6,
    "calibration_alerts": 12
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "executive_summary": "High-level summary...",
      "key_findings": ["finding1", "finding2"],
      "themes": ["theme1", "theme2"],
      "recommended_actions": ["action1", "action2"]
    }
  }
}
```

### 9. AI Status Check
```
GET /api/ai/status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "available": true,
    "provider": "Nova API",
    "model": "us.meta.llama3-2-90b-instruct-v1:0"
  }
}
```

---

## Graceful Degradation

Nova integration includes automatic fallback:

1. **If API key is missing**: Returns `fallback: true` with deterministic analysis
2. **If API call fails**: Retries twice, then falls back
3. **If response is invalid**: Returns fallback with error context
4. **Deterministic analytics continue working** even when Nova is unavailable

Example fallback response:
```json
{
  "summary": "AI summary temporarily unavailable",
  "fallback": true,
  "error": "Nova API timeout"
}
```

---

## Testing Nova Integration

### 1. Check Status
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/ai/status
```

### 2. Test Feedback Analysis
```bash
curl -X POST http://localhost:8000/api/ai/feedback/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feedback_id": "your-feedback-id"}'
```

### 3. Test Calibration Explanation
```bash
curl -X POST http://localhost:8000/api/ai/calibration/ALERT_ID/explain \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration

### Check AI Availability

```typescript
const checkAI = async () => {
  const response = await fetch('/api/ai/status', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.available;
};
```

### Get Performance Summary

```typescript
const getPerformanceSummary = async (employeeId: string, cycle: string) => {
  const response = await fetch(
    `/api/ai/employees/${employeeId}/performance-summary?review_cycle=${cycle}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.data.summary.fallback) {
    // Show fallback UI
    showWarning('AI insights temporarily unavailable');
  } else {
    // Display AI summary
    displaySummary(data.data.summary);
  }
};
```

### Explain Calibration Alert

```typescript
const explainCalibration = async (alertId: string) => {
  const response = await fetch(
    `/api/ai/calibration/${alertId}/explain`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data.data.explanation;
};
```

---

## Hackathon Demo Flow

### Step 1: Show Dashboard
Standard metrics (deterministic)

### Step 2: Open Employee → Click "AI Performance Summary"
**Backend**: Collects evidence → Nova → Returns narrative

**Frontend**: Display AI-generated summary with strengths/gaps

### Step 3: Open Skills → Click "AI Insights"
**Backend**: Sends skill gap data → Nova → Returns recommendations

**Frontend**: Show skill explanation with action items

### Step 4: Open Career → Click "Promotion Explanation"
**Backend**: Sends readiness data → Nova → Returns human-readable explanation

**Frontend**: Display readiness narrative (NOT a promotion decision)

### Step 5: ⭐ SHOWSTOPPER — Calibration Alert → Click "AI Explain"
**Backend**: Sends alert data → Nova → Returns **neutral statistical explanation**

**Frontend**: Display:
- Evidence score: 90%
- Manager rating: 3.1/5
- AI explanation: "Rating differs significantly from evidence indicators"
- Supporting evidence with IDs
- Recommended action: "Review during calibration"

**Key Message**: 
> "Our AI doesn't decide who is right. The analytics engine detects the inconsistency, and Nova explains the evidence so HR can make the final decision."

---

## Security

✅ **Correct**:
```
React → FastAPI (with Nova API key) → Nova API
```

❌ **NEVER**:
```
React → Nova API (API key exposed)
```

The Nova API key is server-side only and never exposed to the frontend.

---

## Logging

Nova calls are logged with:
- Request type
- Latency
- Success/failure
- Error details

API keys are **NEVER** logged.

---

## Rate Limiting

Basic per-user rate limiting is in place for AI endpoints to prevent abuse.

For production, implement:
- Redis-based rate limiting
- Request queueing
- Caching of AI results

---

## Monitoring

Monitor these metrics:
- Nova API availability
- Average response time
- Fallback rate
- Token usage
- Error rate by endpoint

---

## Troubleshooting

### Issue: "Nova client not available"
**Solution**: Check `NOVA_API_KEY` in `.env`

### Issue: "Nova API timeout"
**Solution**: Increase `NOVA_TIMEOUT` or check network connectivity

### Issue: "Malformed JSON from Nova"
**Solution**: Check prompt format. Nova will retry once, then fall back.

### Issue: Fallback mode always active
**Solution**: Verify `NOVA_BASE_URL` and `NOVA_MODEL` are correct

---

## Differences from Gemini

Previous implementation used Google Gemini. Nova integration:

✅ **Improvements**:
- OpenAI-compatible API (more standard)
- Async client with proper timeout handling
- Better retry logic
- Structured logging
- Rate limit handling
- More comprehensive fallback

🔄 **Migration**:
- Old `GEMINI_API_KEY` still supported as fallback
- All existing endpoints continue to work
- New `/api/ai/*` endpoints added
- No breaking changes to existing APIs

---

## Production Considerations

For production deployment:

1. **Caching**: Cache AI results for identical inputs
2. **Rate Limiting**: Implement Redis-based rate limiting
3. **Monitoring**: Add Prometheus metrics for Nova calls
4. **Alerting**: Alert on high fallback rates
5. **Cost Control**: Monitor token usage and implement budgets
6. **Load Balancing**: Distribute requests if volume is high

---

## Support

For Nova API issues:
- Check Nova API documentation
- Verify API key is active
- Check base URL matches your Nova endpoint
- Ensure model name is correct for your Nova account

For integration issues:
- Check logs in `app/ai/nova_client.py`
- Verify environment variables are loaded
- Test with `/api/ai/status` endpoint
- Check FastAPI logs for detailed error messages

