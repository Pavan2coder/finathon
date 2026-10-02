# HRM Performance Intelligence Platform - Backend

AI-powered performance intelligence and evaluation consistency platform for Human Resource Management.

## 🎯 Overview

This backend system processes employee performance data to generate evidence-based insights and identifies rating inconsistencies across managers through advanced calibration analysis. The platform assists HR and managers with data-driven insights while keeping final decisions with humans.

## 🏗️ Architecture

```
FastAPI REST API
       │
   ┌───┴───┬────────┬────────┐
   │       │        │        │
Performance Skills Career  Calibration
 Service   Service Service  Engine
   │       │        │        │
   └───────┴────────┴────────┘
           │
    Evidence Engine
           │
    ┌──────┴──────┐
    │             │
Deterministic   AI Services
 Analytics     (Gemini LLM)
    │             │
    └──────┬──────┘
           │
   Calibration Engine
           │
      PostgreSQL
           │
      Audit Log
```

## ✨ Core Features

### 1. Evidence-Based Performance Scoring
- **Deterministic calculations** using structured evidence
- Configurable weights for different performance components
- Components:
  - Goal Achievement (25%)
  - Project Outcomes (20%)
  - Deliverables (15%)
  - Business Impact (15%)
  - Skill Development (10%)
  - Feedback Analysis (10%)
  - Training (5%)

### 2. Evaluation Consistency Engine (🔥 Core Differentiator)
- **Identifies rating inconsistencies** across managers
- Detects unusual rating patterns and distributions
- Flags evidence-rating mismatches
- Provides statistical analysis (z-scores, distributions)
- Generates calibration alerts with severity levels

### 3. AI-Powered Insights
- Feedback analysis and theme extraction
- Skill identification from unstructured text
- Sentiment analysis
- Career path recommendations
- Development plan suggestions

### 4. Skill Assessment & Gap Analysis
- Current vs. required skill comparison
- Evidence-backed skill levels
- Development recommendations

### 5. Career Path & Promotion Readiness
- Role progression mapping
- Criteria-based readiness calculation
- Missing skills identification

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL (Supabase-compatible)
- **ORM**: SQLAlchemy 2.0 + Alembic
- **Authentication**: JWT (python-jose)
- **AI**: Google Gemini API
- **Analytics**: Pandas, NumPy, scikit-learn
- **Validation**: Pydantic v2

## 📋 Prerequisites

- Python 3.12+
- PostgreSQL 14+ (or Supabase account)
- Google Gemini API key

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hrm_performance
SECRET_KEY=your-secret-key-here-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### For Supabase PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 4. Initialize Database

```bash
# Run migrations
alembic upgrade head

# Seed with demo data (includes calibration scenarios)
python -m app.seed.seed_data
```

### 5. Start Server

```bash
uvicorn app.main:app --reload
```

Server will start at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## 🧪 Test Credentials

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| HR Admin | alice.hr@company.com | password123 |
| Manager | bob.manager@company.com | password123 |
| Employee | emma.engineer@company.com | password123 |

## 📊 Calibration Demo Scenarios

The seed data includes intentional calibration scenarios:

### Scenario 1: High Evidence + Low Rating (HIGH Alert)
- Employee with strong evidence (90%)
- Manager rating: 3.1/5.0
- **Expected**: HIGH severity calibration alert
- **Reason**: Rating significantly lower than evidence suggests

### Scenario 2: Moderate Evidence + High Rating (MEDIUM Alert)
- Employee with moderate evidence (72%)
- Manager rating: 4.9/5.0
- **Expected**: MEDIUM severity calibration alert
- **Reason**: Rating higher than evidence supports

### Scenario 3: Aligned Evidence and Rating (No Alert)
- Evidence and rating are aligned
- **Expected**: No calibration alert

### Scenario 4: Manager with Unusually High Ratings
- Manager consistently rates 4.5-5.0
- **Expected**: Statistical outlier detection

### Scenario 5: Manager with Unusually Low Ratings
- Manager consistently rates 2.8-3.5
- **Expected**: Statistical outlier detection

## 🔑 Key API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login and get token
GET    /api/auth/me          - Get current user
```

### Calibration (🔥 Most Important)
```
GET    /api/calibration              - Get calibration overview
GET    /api/calibration/{alert_id}   - Get alert details
PUT    /api/calibration/{alert_id}   - Update alert status
POST   /api/calibration/generate     - Generate alerts
```

### Performance
```
POST   /api/performance/employees/{id}/calculate  - Calculate evidence score
GET    /api/employees/{id}/performance           - Get performance profile
```

### Feedback
```
POST   /api/feedback/{id}/analyze    - AI analysis of feedback
```

## 🔒 Authorization

### Roles
- **HR_ADMIN**: Full access to all endpoints
- **MANAGER**: Access to their team's data
- **EMPLOYEE**: Access to their own data

### Authentication Flow
1. POST `/api/auth/login` with credentials
2. Receive JWT token
3. Include token in requests:
   ```
   Authorization: Bearer <token>
   ```

## 📈 Calibration Algorithm

### Evidence vs. Rating Analysis

1. **Calculate Evidence Score** (0-100 scale)
   - Deterministic calculation from structured data
   - Weighted sum of performance components

2. **Normalize Manager Rating** (1-5 to 0-100 scale)
   ```python
   normalized_rating = ((rating - 1.0) / 4.0) * 100
   ```

3. **Calculate Deviation**
   ```python
   deviation = evidence_score - normalized_rating
   ```

4. **Determine Alert Severity**
   - `|deviation| >= 25`: HIGH
   - `|deviation| >= 15`: MEDIUM
   - `|deviation| < 15`: No alert

5. **Calculate Expected Rating Range**
   ```python
   base_rating = 1.0 + (evidence_score / 100.0) * 4.0
   expected_range = (base_rating - 0.5, base_rating + 0.5)
   ```

### Manager Pattern Detection

1. **Calculate Manager Statistics**
   - Average rating, median, standard deviation
   - Rating distribution
   - High/low rating percentages

2. **Calculate Z-Score**
   ```python
   z_score = (manager_avg - org_avg) / org_std_dev
   ```

3. **Detect Outliers**
   - Flag managers with `|z_score| > 2.0`

### Important Notes

❗ **The system does NOT**:
- Label managers as "biased" or "bad"
- Automatically change ratings
- Make promotion decisions

✅ **The system DOES**:
- Identify unusual patterns for human review
- Provide evidence for calibration discussions
- Flag inconsistencies for investigation
- Support transparent decision-making

## 🗄️ Database Schema

### Core Tables

- `employees` - Employee records with roles and hierarchy
- `roles` - Job role definitions
- `skills` - Skill catalog
- `employee_skills` - Current skill levels
- `goals` - Employee objectives
- `projects` - Project participation
- `deliverables` - Work outputs
- `feedback` - Multi-source feedback
- `training` - Training completion
- `attendance` - Attendance records (contextual)
- `business_impacts` - Measurable outcomes
- `performance_reviews` - Formal evaluations
- `calibration_alerts` - Rating inconsistency flags
- `development_plans` - Skill development initiatives
- `promotion_readiness` - Promotion criteria tracking
- `audit_logs` - Change history

### Relationships

```
Employee
  ├─ Role (job level)
  ├─ Manager (hierarchy)
  ├─ Goals
  ├─ Projects
  │   └─ Deliverables
  ├─ Skills
  ├─ Feedback (received & given)
  ├─ Training
  ├─ Performance Reviews
  │   └─ Calibration Alerts
  └─ Development Plans
```

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI application
│   ├── core/
│   │   ├── config.py           # Configuration
│   │   ├── security.py         # Auth utilities
│   │   └── dependencies.py     # FastAPI dependencies
│   ├── database/
│   │   └── database.py         # Database setup
│   ├── models/                  # SQLAlchemy models
│   │   ├── employee.py
│   │   ├── performance.py
│   │   ├── calibration.py
│   │   └── ...
│   ├── schemas/                 # Pydantic schemas
│   │   ├── auth.py
│   │   ├── performance.py
│   │   ├── calibration.py
│   │   └── ...
│   ├── api/                     # API endpoints
│   │   ├── auth.py
│   │   ├── calibration.py
│   │   ├── performance.py
│   │   └── ...
│   ├── services/                # Business logic
│   ├── analytics/               # Performance & calibration engines
│   │   ├── performance_scoring.py
│   │   └── calibration_analysis.py
│   ├── ai/                      # AI services
│   │   ├── llm_client.py
│   │   └── feedback_analyzer.py
│   └── seed/
│       └── seed_data.py        # Demo data with scenarios
├── alembic/                     # Database migrations
├── tests/                       # Test suite
├── requirements.txt
├── .env.example
└── README.md
```

## 🔧 Configuration

### Performance Scoring Weights

Configure in `.env`:

```env
WEIGHT_GOAL_ACHIEVEMENT=0.25
WEIGHT_PROJECT_OUTCOMES=0.20
WEIGHT_DELIVERABLES=0.15
WEIGHT_BUSINESS_IMPACT=0.15
WEIGHT_SKILL_DEVELOPMENT=0.10
WEIGHT_FEEDBACK=0.10
WEIGHT_TRAINING=0.05
```

### Calibration Thresholds

```env
CALIBRATION_THRESHOLD_HIGH=25.0
CALIBRATION_THRESHOLD_MEDIUM=15.0
MANAGER_RATING_OUTLIER_SIGMA=2.0
```

## 🔄 Common Operations

### Re-seed Database

```bash
python -m app.seed.seed_data
```

### Create New Migration

```bash
alembic revision --autogenerate -m "description"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

## 🐛 Troubleshooting

### Database Connection Issues

1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Ensure database exists
4. Check firewall/network settings

### Gemini API Errors

1. Verify GEMINI_API_KEY is set
2. Check API quota/limits
3. Fallback analysis will activate automatically

### Import Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## 📚 API Documentation

Once the server is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Frontend Integration

### CORS Configuration

Already configured for:
- `http://localhost:5173` (Vite/React)
- `http://localhost:3000` (Next.js/CRA)

### API Response Format

Success:
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

Error:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Authentication

1. Call `/api/auth/login` to get token
2. Store token in localStorage/cookies
3. Include in all requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

## 🎓 Key Concepts

### Evidence Score vs. Manager Rating

- **Evidence Score**: Objective, data-driven (0-100)
- **Manager Rating**: Subjective assessment (1-5)
- **Calibration**: Identifying significant mismatches

### Attendance Handling

Attendance is **contextual information**, not a direct performance reducer. It's surfaced separately for informed decision-making.

### AI Reliability

- AI provides insights, not decisions
- Structured validation with Pydantic
- Graceful fallbacks for AI failures
- Numerical calculations are deterministic

## 📊 Metrics & Monitoring

### Key Metrics

- Total employees
- Reviews completed
- Average evidence score
- Calibration alerts (by severity)
- Promotion-ready employees

### Audit Trail

All important actions are logged in `audit_logs`:
- Rating changes
- Alert status updates
- Development plan modifications

## 🚀 Production Deployment

### Environment Variables

Update for production:
```env
DEBUG=false
SECRET_KEY=<strong-random-secret-min-32-chars>
DATABASE_URL=<production-database-url>
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Security Checklist

- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS
- [ ] Restrict CORS origins
- [ ] Use database connection pooling
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging
- [ ] Regular security audits

## 📝 License

This is a hackathon project for demonstration purposes.

## 🤝 Support

For issues or questions:
- Check API documentation at `/docs`
- Review seed data scenarios
- Verify environment configuration

---

**Built with ❤️ for the Performance Intelligence Hackathon**
