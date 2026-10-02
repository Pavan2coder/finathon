# 🚀 Nova Integration - Quick Start Guide

## ✅ Status: READY TO USE

Nova API is integrated and configured with your API key.

---

## 1. Verify Installation

```bash
cd backend

# Install new dependency
pip install openai==1.55.3

# Test Nova connection
python test_nova.py
```

**Expected output**:
```
✓ NOVA_API_KEY: nova_sk_9zjPBe_DxdR...
✓ Nova client initialized successfully
✓ Nova API call successful
✓ All Nova integration tests passed!
```

---

## 2. Start the Backend

```bash
# Make sure you're in the backend directory
cd backend

# Start the server
uvicorn app.main:app --reload
```

Server starts at: `http://localhost:8000`

---

## 3. Check Nova Status

Open your browser or use curl:

```bash
# Get auth token first
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@employee.com",
    "password": "password"
  }'

# Check AI status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/ai/status
```

**Expected response**:
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

## 4. Test AI Endpoints

### View All Endpoints
Open: `http://localhost:8000/docs`

Look for the **"AI Intelligence"** section with 9 new endpoints.

### Test Feedback Analysis

```bash
# Create a feedback first (get employee_id from database)
curl -X POST http://localhost:8000/api/ai/feedback/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_id": "YOUR_FEEDBACK_ID"
  }'
```

### Test Performance Summary

```bash
curl -X POST "http://localhost:8000/api/ai/employees/EMPLOYEE_ID/performance-summary?review_cycle=2026-H1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Frontend Integration

### Check AI Availability

```typescript
const response = await fetch('/api/ai/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
const aiAvailable = data.data.available;

// Show AI features only if available
if (aiAvailable) {
  showAIButtons();
} else {
  hideAIButtons();
}
```

### Add "AI Explain" Button

```tsx
// In your calibration alert component
<Button
  onClick={async () => {
    const response = await fetch(
      `/api/ai/calibration/${alert.id}/explain`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.data.explanation.fallback) {
      showWarning('AI explanation temporarily unavailable');
    } else {
      showExplanation(data.data.explanation);
    }
  }}
>
  AI Explain
</Button>
```

### Display Explanation

```tsx
interface CalibrationExplanation {
  summary: string;
  evidence_alignment: string;
  possible_explanations: string[];
  supporting_evidence: Array<{
    category: string;
    description: string;
    evidence_id: string;
  }>;
  recommended_action: string;
}

function CalibrationExplanationModal({ explanation }: { explanation: CalibrationExplanation }) {
  return (
    <Modal>
      <h2>Calibration Alert Explanation</h2>
      
      <section>
        <h3>Summary</h3>
        <p>{explanation.summary}</p>
      </section>
      
      <section>
        <h3>Evidence Alignment</h3>
        <p>{explanation.evidence_alignment}</p>
      </section>
      
      <section>
        <h3>Possible Explanations</h3>
        <ul>
          {explanation.possible_explanations.map((exp, i) => (
            <li key={i}>{exp}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h3>Supporting Evidence</h3>
        <ul>
          {explanation.supporting_evidence.map((ev, i) => (
            <li key={i}>
              <strong>{ev.category}:</strong> {ev.description}
              <small> (ID: {ev.evidence_id})</small>
            </li>
          ))}
        </ul>
      </section>
      
      <section>
        <h3>Recommended Action</h3>
        <p>{explanation.recommended_action}</p>
      </section>
    </Modal>
  );
}
```

---

## 6. Demo Flow (Step-by-Step)

### Preparation
1. Start backend: `uvicorn app.main:app --reload`
2. Seed database: `python -m app.seed.seed_data`
3. Open frontend: Navigate to dashboard

### Demo Script

**Step 1: Show Dashboard**
- Point out total employees, reviews, calibration alerts
- "This data comes from our deterministic analytics engine"

**Step 2: Open an Employee Profile**
- Click "AI Performance Summary" button
- Show the AI-generated narrative
- Point out: "Strengths", "Development Areas", "Key Evidence"
- **Key Message**: "Nova explains the numbers, it doesn't calculate them"

**Step 3: Open Skills Tab**
- Show skill gap (e.g., System Design: 2.9 / 4.0)
- Click "AI Insights"
- Show AI explanation and recommendations
- **Key Message**: "The gap is calculated by our analytics. Nova suggests how to close it"

**Step 4: Open Career Tab**
- Show promotion readiness (e.g., "7 of 9 criteria met")
- Click "AI Explanation"
- Show narrative explanation
- **Key Message**: "Notice the AI says 'meets 7 of 9 criteria' — not 'should be promoted'. The final decision is human"

**Step 5: 🎯 SHOWSTOPPER - Calibration**
- Navigate to Calibration page
- Find a HIGH severity alert
- Show the data:
  - Evidence Score: 90%
  - Manager Rating: 3.1/5
  - Expected Range: 4.0–4.6
  - Deviation: -1.1
- Click "AI Explain"
- Read the explanation aloud:
  - "The rating differs significantly from evidence indicators"
  - Show supporting evidence
  - Show recommended action

**Key Message for Judges**:
> "This is the heart of our platform. Our analytics engine detected a statistical inconsistency between the evidence score and the manager rating. Nova AI explains what evidence supports a different rating, using neutral language. 
>
> Notice it NEVER says the manager is biased or wrong. It simply presents the pattern for HR review. The AI identifies, explains, but never decides.
>
> This is evidence-based, explainable, and keeps humans in control of critical decisions."

**Step 6: Show HR Query (Bonus)**
- Click "Ask HR Assistant"
- Type: "Why was Rahul flagged for calibration?"
- Show AI-generated answer with supporting data
- **Key Message**: "HR can ask questions in natural language and get evidence-backed answers"

---

## 7. Talking Points for Judges

### Problem We Solve
"Performance reviews often have hidden biases and inconsistencies. Managers may unintentionally rate employees differently for the same level of evidence."

### Our Solution
"We use deterministic analytics to calculate an evidence-based performance score, then use AI to detect inconsistencies and explain them — without making the final decision."

### Why It Matters
"Organizations lose top talent when performance evaluations feel unfair. Our system brings transparency to the process while keeping humans in control."

### The Innovation
"Most HR systems either rank employees algorithmically (no explainability) or rely entirely on manager judgment (subjective). We combine objective evidence scoring with AI explanation, giving HR the tools to facilitate calibration discussions — not replace them."

### The Technology
"We built this with FastAPI, PostgreSQL for data, Python for analytics, and Nova API for natural language explanation. Everything is evidence-grounded — the AI can't invent achievements or make promotion decisions."

---

## 8. Common Questions & Answers

**Q: What if Nova API is down?**
A: The system automatically falls back to deterministic analysis. All core functionality continues working. The AI explanations just show a "temporarily unavailable" message.

**Q: Does the AI decide promotions?**
A: Absolutely not. The AI explains the data. It says things like "meets 7 of 9 criteria" — never "should be promoted". HR makes the final decision.

**Q: Can managers game the system?**
A: That's what calibration catches! If a manager gives ratings that don't align with evidence, our system flags it statistically. The AI then explains the discrepancy for HR review.

**Q: What about privacy?**
A: The Nova API key is server-side only. Employee data is never exposed to the frontend. All AI calls go through our secure backend.

**Q: How accurate is the AI?**
A: The AI doesn't calculate scores — our deterministic engine does. The AI only provides natural language explanations. We validate all AI outputs with Pydantic schemas and fall back to deterministic analysis if responses are malformed.

---

## 9. Troubleshooting

### Nova Not Available

```bash
# Check .env file has the key
cat .env | grep NOVA_API_KEY

# Should show:
NOVA_API_KEY=nova_sk_9zjPBe_DxdRAfNWoQqZxpSo_YkYIJjmMTpy1n62IhM4

# Test connection
python test_nova.py
```

### API Timeout

```bash
# Increase timeout in .env
NOVA_TIMEOUT=120

# Restart backend
uvicorn app.main:app --reload
```

### Import Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt

# Verify openai is installed
pip list | grep openai
```

---

## 10. Files You May Need to Modify

### To Add More AI Features

1. **Add new prompt** in `app/ai/nova_prompts.py`
2. **Add service function** in `app/ai/nova_service.py`
3. **Add context builder** in `app/ai/context_builder.py`
4. **Add API endpoint** in `app/api/ai.py`
5. **Update frontend** to call new endpoint

### To Customize Prompts

Edit `app/ai/nova_prompts.py` and modify the prompt templates.

**Important**: Keep the evidence-grounded instructions!

### To Change Model

Edit `.env`:
```env
NOVA_MODEL=different-model-name
```

---

## 🎉 You're Ready!

The Nova integration is complete and tested. You can now:

✅ Generate AI-powered performance summaries  
✅ Explain skill gaps with recommendations  
✅ Provide career path guidance  
✅ Explain calibration alerts (with neutral language)  
✅ Answer HR questions conversationally  
✅ Generate report summaries  

All while keeping calculations deterministic and decisions with humans.

**Good luck with your hackathon! 🚀**

---

## Support

- **Full Docs**: `NOVA_INTEGRATION.md`
- **Test Script**: `python test_nova.py`
- **API Docs**: http://localhost:8000/docs
- **Summary**: `NOVA_INTEGRATION_SUMMARY.md`

