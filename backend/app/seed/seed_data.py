"""
Seed database with realistic demo data including all 5 calibration scenarios.

Run with:
    python -m app.seed.seed_data
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import (
    Employee, EmployeeRole, EmployeeStatus,
    Role, RoleSkill,
    Skill, EmployeeSkill,
    Goal, GoalStatus,
    Project, Deliverable, ImpactLevel, DeliverableStatus,
    Feedback, ReviewerType,
    Training, TrainingStatus,
    Attendance,
    BusinessImpact,
    PerformanceReview, ReviewStatus,
    CareerPath, PromotionReadiness,
    DevelopmentPlan, ActionType, DevelopmentStatus,
    CalibrationAlert, AlertSeverity, AlertStatus,
    AuditLog,
)
from app.analytics.performance_scoring import calculate_evidence_score
from app.analytics.calibration_analysis import (
    analyze_evidence_vs_rating,
    determine_alert_severity,
    calculate_expected_rating_range,
)

REVIEW_CYCLE = "2026-H1"
random.seed(42)  # Reproducible data


# ── Helpers ──────────────────────────────────────────────────────────────────

def _dt(year: int, month: int, day: int = 1) -> datetime:
    return datetime(year, month, day)


def _days_ago(n: int) -> datetime:
    return datetime.utcnow() - timedelta(days=n)


# ── Roles ─────────────────────────────────────────────────────────────────────

def seed_roles(db: Session) -> dict[str, Role]:
    print("  Creating roles…")
    roles_data = [
        ("Software Engineer I",        "Entry-level software engineer",                    1),
        ("Software Engineer II",       "Mid-level software engineer",                      2),
        ("Senior Software Engineer",   "Senior engineer with cross-team impact",            3),
        ("Staff Engineer",             "Technical leader, org-wide influence",              4),
        ("Engineering Manager",        "People manager responsible for team outcomes",      3),
    ]
    roles: dict[str, Role] = {}
    for name, desc, level in roles_data:
        r = Role(name=name, description=desc, level=level)
        db.add(r)
        roles[name] = r
    db.flush()
    return roles


# ── Skills ────────────────────────────────────────────────────────────────────

def seed_skills(db: Session) -> dict[str, Skill]:
    print("  Creating skills…")
    skills_data = [
        ("Python",             "TECHNICAL"),
        ("JavaScript",         "TECHNICAL"),
        ("System Design",      "TECHNICAL"),
        ("Database Design",    "TECHNICAL"),
        ("API Development",    "TECHNICAL"),
        ("Code Quality",       "TECHNICAL"),
        ("Problem Solving",    "TECHNICAL"),
        ("Cloud (AWS/GCP)",    "TECHNICAL"),
        ("Leadership",         "LEADERSHIP"),
        ("Mentoring",          "LEADERSHIP"),
        ("Project Management", "LEADERSHIP"),
        ("Communication",      "COMMUNICATION"),
        ("Collaboration",      "COMMUNICATION"),
        ("Documentation",      "COMMUNICATION"),
    ]
    skills: dict[str, Skill] = {}
    for name, category in skills_data:
        s = Skill(name=name, category=category)
        db.add(s)
        skills[name] = s
    db.flush()
    return skills


# ── Role → Skill requirements ─────────────────────────────────────────────────

def seed_role_skills(db: Session, roles: dict, skills: dict):
    print("  Attaching role skill requirements…")
    requirements = {
        "Software Engineer I": [
            ("Python", 2.0, "HIGH"), ("Code Quality", 2.0, "MEDIUM"),
            ("Problem Solving", 2.0, "HIGH"), ("Communication", 2.0, "MEDIUM"),
            ("Collaboration", 2.0, "MEDIUM"),
        ],
        "Software Engineer II": [
            ("Python", 3.0, "HIGH"), ("System Design", 2.5, "HIGH"),
            ("API Development", 3.0, "HIGH"), ("Code Quality", 3.0, "HIGH"),
            ("Problem Solving", 3.0, "HIGH"), ("Communication", 3.0, "MEDIUM"),
            ("Collaboration", 3.0, "MEDIUM"), ("Database Design", 2.5, "MEDIUM"),
        ],
        "Senior Software Engineer": [
            ("Python", 4.0, "CRITICAL"), ("System Design", 4.0, "CRITICAL"),
            ("API Development", 4.0, "HIGH"), ("Code Quality", 4.0, "HIGH"),
            ("Problem Solving", 4.0, "HIGH"), ("Leadership", 3.0, "HIGH"),
            ("Mentoring", 3.0, "MEDIUM"), ("Communication", 4.0, "HIGH"),
            ("Cloud (AWS/GCP)", 3.0, "MEDIUM"),
        ],
        "Staff Engineer": [
            ("System Design", 5.0, "CRITICAL"), ("Leadership", 4.5, "CRITICAL"),
            ("Python", 4.5, "HIGH"), ("Project Management", 4.0, "HIGH"),
            ("Mentoring", 4.0, "HIGH"), ("Communication", 4.5, "CRITICAL"),
            ("Cloud (AWS/GCP)", 4.0, "HIGH"), ("Problem Solving", 4.5, "CRITICAL"),
        ],
        "Engineering Manager": [
            ("Leadership", 4.5, "CRITICAL"), ("Communication", 4.5, "CRITICAL"),
            ("Project Management", 4.0, "HIGH"), ("Mentoring", 4.0, "HIGH"),
            ("Collaboration", 4.0, "HIGH"), ("Problem Solving", 3.5, "MEDIUM"),
        ],
    }
    for role_name, skill_reqs in requirements.items():
        role = roles.get(role_name)
        if not role:
            continue
        for skill_name, req_level, importance in skill_reqs:
            skill = skills.get(skill_name)
            if not skill:
                continue
            db.add(RoleSkill(
                role_id=role.id, skill_id=skill.id,
                required_level=req_level, importance=importance,
            ))
    db.flush()


# ── Career paths ──────────────────────────────────────────────────────────────

def seed_career_paths(db: Session, roles: dict):
    print("  Creating career paths…")
    paths = [
        ("Software Engineer I",   "Software Engineer II",     "Natural progression after 1–2 years"),
        ("Software Engineer II",  "Senior Software Engineer", "Requires strong technical and leadership indicators"),
        ("Senior Software Engineer", "Staff Engineer",        "Requires org-wide technical influence"),
        ("Senior Software Engineer", "Engineering Manager",   "People leadership track"),
    ]
    for from_name, to_name, desc in paths:
        f = roles.get(from_name)
        t = roles.get(to_name)
        if f and t:
            db.add(CareerPath(from_role_id=f.id, to_role_id=t.id, description=desc))
    db.flush()


# ── People ────────────────────────────────────────────────────────────────────

def seed_people(db: Session, roles: dict) -> dict:
    print("  Creating HR admin, managers, and employees…")

    # HR Admin
    hr = Employee(
        employee_code="HR001", name="Alice Chen", email="alice.chen@company.com",
        password_hash=get_password_hash("password123"),
        role=EmployeeRole.HR_ADMIN, department="Human Resources",
        joining_date=_dt(2019, 6), status=EmployeeStatus.ACTIVE,
    )
    db.add(hr)
    db.flush()

    # Managers — three with intentionally different rating styles
    managers_data = [
        # (code, name, email, dept)  — rating style applied later in reviews
        ("MGR001", "Bob Martinez",   "bob.martinez@company.com",   "Engineering"),   # Lenient rater (high avg)
        ("MGR002", "Carol Singh",    "carol.singh@company.com",    "Engineering"),   # Strict rater (low avg)
        ("MGR003", "David Kim",      "david.kim@company.com",      "Engineering"),   # Calibrated rater (normal)
        ("MGR004", "Eva Patel",      "eva.patel@company.com",      "Product"),
        ("MGR005", "Frank Torres",   "frank.torres@company.com",   "Data Science"),
    ]
    mgr_role = roles["Engineering Manager"]
    managers: list[Employee] = []
    for code, name, email, dept in managers_data:
        m = Employee(
            employee_code=code, name=name, email=email,
            password_hash=get_password_hash("password123"),
            role=EmployeeRole.MANAGER, role_id=mgr_role.id,
            department=dept, joining_date=_dt(2020, 3),
            status=EmployeeStatus.ACTIVE,
        )
        db.add(m)
        managers.append(m)
    db.flush()

    # Employees — 35 across departments
    employees_data = [
        # name,                dept,            role_name,                   manager_idx
        ("Emma Watson",        "Engineering",   "Senior Software Engineer",  0),  # Scenario 1: high evidence, low rating
        ("Liam Johnson",       "Engineering",   "Software Engineer II",      0),  # Scenario 2: moderate evidence, inflated rating
        ("Olivia Brown",       "Engineering",   "Senior Software Engineer",  2),  # Scenario 3: aligned
        ("Noah Williams",      "Engineering",   "Software Engineer II",      1),  # Scenario 4: under lenient mgr
        ("Ava Jones",          "Engineering",   "Software Engineer II",      1),  # Scenario 4: under lenient mgr
        ("Ethan Davis",        "Engineering",   "Software Engineer I",       1),  # Scenario 4: under lenient mgr
        ("Sophia Miller",      "Product",       "Software Engineer II",      3),  # Scenario 5: under strict mgr
        ("Mason Wilson",       "Product",       "Software Engineer II",      3),  # Scenario 5: under strict mgr
        ("Isabella Moore",     "Product",       "Software Engineer I",       3),  # Scenario 5: under strict mgr
        ("William Taylor",     "Data Science",  "Software Engineer II",      4),
        ("Mia Anderson",       "Data Science",  "Senior Software Engineer",  4),
        ("James Thomas",       "Data Science",  "Software Engineer I",       4),
        ("Charlotte Jackson",  "Engineering",   "Software Engineer II",      2),
        ("Benjamin White",     "Engineering",   "Senior Software Engineer",  2),
        ("Amelia Harris",      "Engineering",   "Software Engineer II",      0),
        ("Lucas Martin",       "Product",       "Software Engineer II",      3),
        ("Harper Garcia",      "Product",       "Software Engineer I",       3),
        ("Henry Martinez",     "Engineering",   "Software Engineer II",      2),
        ("Evelyn Robinson",    "Engineering",   "Senior Software Engineer",  0),
        ("Alexander Clark",    "Data Science",  "Software Engineer II",      4),
        ("Abigail Rodriguez",  "Engineering",   "Software Engineer I",       1),
        ("Michael Lewis",      "Engineering",   "Software Engineer II",      2),
        ("Emily Lee",          "Product",       "Software Engineer II",      3),
        ("Daniel Walker",      "Engineering",   "Senior Software Engineer",  2),
        ("Elizabeth Hall",     "Data Science",  "Software Engineer II",      4),
        ("Matthew Allen",      "Engineering",   "Software Engineer I",       0),
        ("Sofia Young",        "Engineering",   "Software Engineer II",      1),
        ("Jackson Hernandez",  "Product",       "Software Engineer II",      3),
        ("Avery King",         "Data Science",  "Senior Software Engineer",  4),
        ("Sebastian Wright",   "Engineering",   "Software Engineer II",      2),
        ("Chloe Lopez",        "Engineering",   "Software Engineer I",       0),
        ("Owen Scott",         "Product",       "Software Engineer II",      3),
        ("Penelope Green",     "Engineering",   "Software Engineer II",      2),
        ("Carter Adams",       "Data Science",  "Software Engineer I",       4),
        ("Lily Nelson",        "Engineering",   "Senior Software Engineer",  2),
    ]

    employees: list[Employee] = []
    for i, (name, dept, role_name, mgr_idx) in enumerate(employees_data):
        first = name.split()[0].lower()
        last = name.split()[1].lower()
        emp = Employee(
            employee_code=f"EMP{str(i + 1).zfill(3)}",
            name=name,
            email=f"{first}.{last}@company.com",
            password_hash=get_password_hash("password123"),
            role=EmployeeRole.EMPLOYEE,
            role_id=roles[role_name].id,
            department=dept,
            manager_id=managers[mgr_idx].id,
            joining_date=_dt(2022, random.randint(1, 12)),
            status=EmployeeStatus.ACTIVE,
        )
        db.add(emp)
        employees.append(emp)
    db.flush()

    return {"hr": hr, "managers": managers, "employees": employees}


# ── Goals ─────────────────────────────────────────────────────────────────────

def seed_goals(db: Session, employees: list[Employee]):
    print("  Creating goals…")
    titles = [
        "Deliver feature X on schedule",
        "Reduce API error rate by 20%",
        "Complete 3 code reviews per sprint",
        "Improve test coverage to 85%",
        "Mentor 1 junior engineer",
        "Reduce ticket resolution time by 15%",
        "Migrate legacy service to microservices",
        "Document 5 internal APIs",
        "Achieve cloud certification",
        "Lead cross-team design review",
    ]

    for emp in employees:
        n_goals = random.randint(3, 5)
        for j in range(n_goals):
            # Employees 0 and 1 get specific achievement values for calibration scenarios
            if emp == employees[0]:     # High achiever → evidence score will be ~88–92
                target, actual = 100, random.randint(95, 120)
            elif emp == employees[1]:   # Average achiever → evidence ~68–74
                target, actual = 100, random.randint(65, 78)
            elif emp == employees[2]:   # Well-aligned → evidence ~80–86
                target, actual = 100, random.randint(82, 90)
            else:
                target = random.randint(50, 100)
                actual = random.randint(int(target * 0.6), int(target * 1.3))

            db.add(Goal(
                employee_id=emp.id,
                title=titles[(j + hash(emp.id)) % len(titles)],
                target_value=float(target),
                actual_value=float(actual),
                unit=random.choice(["tasks", "percentage", "reviews", "tickets"]),
                weight=random.choice([1.0, 1.0, 1.5, 2.0]),
                status=GoalStatus.COMPLETED,
                review_cycle=REVIEW_CYCLE,
            ))
    db.flush()


# ── Projects & Deliverables ───────────────────────────────────────────────────

def seed_projects(db: Session, employees: list[Employee]):
    print("  Creating projects and deliverables…")
    project_names = [
        "Payment Gateway Redesign", "User Dashboard Overhaul",
        "API Performance Optimisation", "Mobile App Backend",
        "Data Pipeline Migration", "Authentication Service",
        "Reporting Engine", "Real-time Notification System",
        "Database Sharding Initiative", "CI/CD Modernisation",
    ]
    outcomes = [
        "Delivered on schedule with no critical bugs.",
        "Reduced latency by 40% post-launch.",
        "Improved system reliability from 99.5% to 99.9%.",
        "Enabled 3x throughput for downstream services.",
        "Reduced deployment time from 45 min to 8 min.",
    ]

    for emp in employees:
        n = random.randint(2, 4)
        for k in range(n):
            if emp == employees[0]:
                completion, impact = 100.0, ImpactLevel.HIGH
            elif emp == employees[1]:
                completion, impact = random.uniform(70, 85), ImpactLevel.MEDIUM
            elif emp == employees[2]:
                completion, impact = random.uniform(88, 98), ImpactLevel.HIGH
            else:
                completion = random.uniform(65, 100)
                impact = random.choice([ImpactLevel.LOW, ImpactLevel.MEDIUM,
                                        ImpactLevel.MEDIUM, ImpactLevel.HIGH])

            proj = Project(
                employee_id=emp.id,
                name=project_names[(k + hash(emp.id)) % len(project_names)],
                role=random.choice(["Lead Developer", "Developer", "Contributor"]),
                start_date=_dt(2025, random.randint(1, 6)),
                end_date=_dt(2026, random.randint(1, 6)),
                completion_percentage=round(completion, 1),
                outcome=outcomes[hash(emp.id) % len(outcomes)],
                impact_level=impact,
                business_impact="Improved business metrics and team productivity.",
            )
            db.add(proj)
            db.flush()

            # Deliverables per project
            for _ in range(random.randint(2, 4)):
                if emp == employees[0]:
                    quality = random.uniform(4.2, 5.0)
                elif emp == employees[1]:
                    quality = random.uniform(3.0, 3.8)
                elif emp == employees[2]:
                    quality = random.uniform(3.8, 4.5)
                else:
                    quality = random.uniform(2.5, 5.0)

                db.add(Deliverable(
                    employee_id=emp.id,
                    project_id=proj.id,
                    title=f"Deliverable for {proj.name[:20]}",
                    status=DeliverableStatus.COMPLETED,
                    quality_score=round(quality, 1),
                    completed_at=_dt(2026, random.randint(1, 6)),
                ))
    db.flush()


# ── Feedback ──────────────────────────────────────────────────────────────────

def seed_feedback(db: Session, employees: list[Employee], managers: list[Employee]):
    print("  Creating feedback…")

    positive_texts = [
        "Consistently delivers high-quality work ahead of schedule. Strong technical ownership and excellent collaboration with cross-functional teams.",
        "Outstanding problem-solving skills demonstrated in the migration project. Proactively identified blockers and resolved them independently.",
        "Exceptional communication — keeps stakeholders informed and writes clear, well-documented code that the whole team benefits from.",
        "Great mentor to junior engineers. Has a real talent for breaking down complex problems and explaining them accessibly.",
        "Strong technical skills and a reliable teammate. Raises the bar for code quality in every sprint.",
        "Delivered a critical feature with zero post-launch incidents. Showed real technical maturity and ownership.",
    ]
    moderate_texts = [
        "Solid contributor who completes assigned work reliably. Could take more initiative in proposing solutions.",
        "Good technical foundation. Would benefit from improving documentation and communication with stakeholders.",
        "Meets expectations consistently. Next step is to proactively identify risks before they become issues.",
        "Dependable team member. Encouraged to take ownership of larger features in the coming cycle.",
    ]
    below_texts = [
        "Needs to improve time management — several deliverables were submitted late this cycle.",
        "Technical work meets minimum bar but requires additional review cycles. Encouraged to focus on code quality.",
    ]

    for emp in employees:
        # Manager feedback
        mgr = next((m for m in managers if m.id == emp.manager_id), managers[0])

        if emp == employees[0]:       # High performer — very positive
            texts = positive_texts
        elif emp == employees[1]:     # Moderate performer
            texts = moderate_texts
        elif emp == employees[2]:     # Aligned — positive
            texts = positive_texts[:3]
        else:
            texts = random.choice([positive_texts, positive_texts, moderate_texts, below_texts])

        db.add(Feedback(
            employee_id=emp.id,
            reviewer_id=mgr.id,
            reviewer_type=ReviewerType.MANAGER,
            review_cycle=REVIEW_CYCLE,
            text=random.choice(texts),
            ai_sentiment="positive" if texts in [positive_texts, positive_texts[:3]] else "neutral",
            ai_evidence_strength=random.uniform(0.70, 0.95) if texts == positive_texts else random.uniform(0.45, 0.70),
            ai_themes='["collaboration", "problem-solving", "technical-excellence"]' if texts == positive_texts else '["reliability", "communication"]',
            ai_skills='[]',
            ai_summary="AI analysis pending",
        ))

        # Peer feedback (1–2 per employee)
        for _ in range(random.randint(1, 2)):
            peer = random.choice([e for e in employees if e.id != emp.id])
            db.add(Feedback(
                employee_id=emp.id,
                reviewer_id=peer.id,
                reviewer_type=ReviewerType.PEER,
                review_cycle=REVIEW_CYCLE,
                text=random.choice(positive_texts + moderate_texts),
                ai_sentiment=random.choice(["positive", "positive", "neutral"]),
                ai_evidence_strength=random.uniform(0.50, 0.90),
                ai_themes='["collaboration", "communication"]',
                ai_skills='[]',
                ai_summary="Peer feedback",
            ))
    db.flush()


# ── Skills ─────────────────────────────────────────────────────────────────────

def seed_employee_skills(db: Session, employees: list[Employee], skills: dict[str, Skill]):
    print("  Creating employee skills…")
    core = ["Python", "System Design", "API Development", "Code Quality",
            "Problem Solving", "Communication", "Collaboration"]

    for emp in employees:
        assigned = random.sample(list(skills.keys()), k=random.randint(5, 9))
        if not set(core[:3]).issubset(assigned):
            assigned = list(set(assigned) | set(core[:3]))

        for sname in assigned:
            skill = skills[sname]
            if emp == employees[0]:
                level = random.uniform(3.8, 4.8)
            elif emp == employees[1]:
                level = random.uniform(2.8, 3.6)
            elif emp == employees[2]:
                level = random.uniform(3.5, 4.3)
            else:
                level = random.uniform(2.0, 4.5)

            db.add(EmployeeSkill(
                employee_id=emp.id,
                skill_id=skill.id,
                current_level=round(level, 1),
                evidence_count=random.randint(3, 12),
            ))
    db.flush()


# ── Training ──────────────────────────────────────────────────────────────────

def seed_training(db: Session, employees: list[Employee]):
    print("  Creating training records…")
    courses = [
        ("Advanced Python Engineering",    "TECHNICAL",    92.0),
        ("System Design Fundamentals",     "TECHNICAL",    88.0),
        ("AWS Solutions Architect",        "TECHNICAL",    85.0),
        ("Leadership Essentials",          "LEADERSHIP",   90.0),
        ("Agile & Scrum Practitioner",     "LEADERSHIP",   87.0),
        ("Technical Communication",       "COMMUNICATION", 82.0),
        ("Database Performance Tuning",    "TECHNICAL",    78.0),
        ("Kubernetes Fundamentals",        "TECHNICAL",    83.0),
    ]

    for emp in employees:
        n = random.randint(1, 4)
        for name, cat, score in random.sample(courses, k=min(n, len(courses))):
            if emp == employees[0]:
                status = TrainingStatus.COMPLETED
                final_score = random.uniform(88, 98)
            elif emp == employees[1]:
                status = random.choice([TrainingStatus.COMPLETED, TrainingStatus.IN_PROGRESS])
                final_score = random.uniform(70, 82) if status == TrainingStatus.COMPLETED else None
            else:
                status = random.choice([TrainingStatus.COMPLETED, TrainingStatus.COMPLETED,
                                        TrainingStatus.IN_PROGRESS])
                final_score = score + random.uniform(-10, 8) if status == TrainingStatus.COMPLETED else None

            db.add(Training(
                employee_id=emp.id,
                name=name, provider="Learning Platform",
                category=cat,
                completion_date=_dt(2026, random.randint(1, 6)) if status == TrainingStatus.COMPLETED else None,
                score=round(final_score, 1) if final_score else None,
                status=status,
            ))
    db.flush()


# ── Attendance ────────────────────────────────────────────────────────────────

def seed_attendance(db: Session, employees: list[Employee]):
    print("  Creating attendance records…")
    for emp in employees:
        for month in range(1, 7):
            working_days = 22
            absent = random.randint(0, 2)
            leave = random.randint(0, 1)
            present = working_days - absent - leave
            db.add(Attendance(
                employee_id=emp.id,
                period=f"2026-{month:02d}",
                working_days=working_days,
                days_present=max(present, 0),
                days_absent=absent,
                leave_days=leave,
            ))
    db.flush()


# ── Business Impact ───────────────────────────────────────────────────────────

def seed_business_impacts(db: Session, employees: list[Employee]):
    print("  Creating business impact records…")
    metrics = [
        ("API Response Time",           200.0, 110.0, ImpactLevel.HIGH),
        ("Deployment Frequency",         4.0,  12.0,  ImpactLevel.HIGH),
        ("Bug Escape Rate",             15.0,   4.0,  ImpactLevel.HIGH),
        ("Test Coverage",               60.0,  87.0,  ImpactLevel.MEDIUM),
        ("Mean Time to Recovery (mins)", 45.0,  18.0, ImpactLevel.HIGH),
        ("Customer Satisfaction Score",  78.0,  91.0, ImpactLevel.CRITICAL),
    ]

    for emp in employees[:28]:
        metric_name, baseline, actual, level = random.choice(metrics)
        if emp == employees[0]:
            improvement = 45.0 + random.uniform(0, 15)
            level = ImpactLevel.CRITICAL
        elif emp == employees[1]:
            improvement = 18.0 + random.uniform(0, 8)
            level = ImpactLevel.MEDIUM
        elif emp == employees[2]:
            improvement = 32.0 + random.uniform(0, 10)
            level = ImpactLevel.HIGH
        else:
            improvement = (actual - baseline) / baseline * 100 if baseline > 0 else 20.0

        db.add(BusinessImpact(
            employee_id=emp.id,
            metric_name=metric_name,
            baseline_value=baseline,
            actual_value=actual,
            improvement_percentage=round(abs(improvement), 1),
            impact_level=level,
            description=f"Contributed to measurable improvement in {metric_name}.",
        ))
    db.flush()


# ── Performance Reviews with Calibration Scenarios ────────────────────────────

def seed_reviews(db: Session, employees: list[Employee], managers: list[Employee]):
    """
    Create performance reviews with five intentional calibration scenarios.

    Scenario 1 → employees[0]  HIGH evidence (~90), rating 3.1  → HIGH alert
    Scenario 2 → employees[1]  MOD  evidence (~70), rating 4.9  → HIGH alert
    Scenario 3 → employees[2]  HIGH evidence (~83), rating 4.1  → No alert (aligned)
    Scenario 4 → employees[3–5] under MGR001 (Bob) — consistently very high ratings
    Scenario 5 → employees[6–8] under MGR002 (Carol) — consistently very low ratings
    """
    print("  Creating performance reviews with calibration scenarios…")

    reviews = []

    for i, emp in enumerate(employees):
        scores = calculate_evidence_score(db, emp.id, REVIEW_CYCLE)
        ev_score = scores["total_score"]
        manager = next((m for m in managers if m.id == emp.manager_id), managers[0])

        # ── Scenario 1: High evidence, artificially suppressed rating ─────
        if i == 0:
            rating = 3.1
            print(f"    [SCENARIO 1] {emp.name}: evidence={ev_score:.1f}, rating={rating} → expect HIGH alert")

        # ── Scenario 2: Moderate evidence, inflated rating ────────────────
        elif i == 1:
            rating = 4.9
            print(f"    [SCENARIO 2] {emp.name}: evidence={ev_score:.1f}, rating={rating} → expect HIGH alert")

        # ── Scenario 3: Aligned evidence and rating ───────────────────────
        elif i == 2:
            base = 1.0 + (ev_score / 100.0) * 4.0
            rating = round(min(5.0, max(1.0, base + random.uniform(-0.15, 0.15))), 1)
            print(f"    [SCENARIO 3] {emp.name}: evidence={ev_score:.1f}, rating={rating} → expect NO alert")

        # ── Scenario 4: Under Bob (lenient rater, manager index 0) ────────
        elif manager == managers[0] and i not in (0, 1, 14, 18, 25, 30):
            rating = round(random.uniform(4.4, 5.0), 1)

        # ── Scenario 5: Under Carol (strict rater, manager index 1) ──────
        elif manager == managers[1] and i not in (3, 4, 5, 20, 26):
            rating = round(random.uniform(2.6, 3.4), 1)

        # ── Normal variation: roughly aligned with evidence ────────────────
        else:
            base = 1.0 + (ev_score / 100.0) * 4.0
            noise = random.uniform(-0.4, 0.4)
            rating = round(min(5.0, max(1.0, base + noise)), 1)

        review = PerformanceReview(
            employee_id=emp.id,
            manager_id=manager.id,
            review_cycle=REVIEW_CYCLE,
            manager_rating=rating,
            manager_comments=f"Performance review for {REVIEW_CYCLE}.",
            evidence_score=ev_score,
            evidence_components={k: v for k, v in scores.items() if k != "total_score"},
            status=ReviewStatus.SUBMITTED,
            calculated_at=datetime.utcnow(),
        )
        db.add(review)
        reviews.append(review)

    db.flush()
    return reviews


# ── Calibration Alerts ────────────────────────────────────────────────────────

def seed_calibration_alerts(db: Session, reviews: list[PerformanceReview]):
    print("  Generating calibration alerts…")
    created = 0
    for review in reviews:
        if review.evidence_score is None:
            continue

        result = analyze_evidence_vs_rating(
            db,
            review.employee_id,
            review.id,
            review.evidence_score,
            review.manager_rating,
        )
        if result:
            db.add(CalibrationAlert(**result))
            created += 1

    db.flush()
    print(f"    → {created} calibration alerts generated.")


# ── Development Plans ─────────────────────────────────────────────────────────

def seed_development_plans(db: Session, employees: list[Employee], skills: dict[str, Skill]):
    print("  Creating development plans…")
    gap_skills = ["System Design", "Leadership", "Cloud (AWS/GCP)", "Project Management"]
    actions = [ActionType.TRAINING, ActionType.STRETCH_ASSIGNMENT, ActionType.MENTORING]

    for emp in employees[:20]:
        n = random.randint(1, 3)
        chosen = random.sample(gap_skills, k=min(n, len(gap_skills)))
        for sname in chosen:
            skill = skills.get(sname)
            if not skill:
                continue
            db.add(DevelopmentPlan(
                employee_id=emp.id,
                skill_id=skill.id,
                goal=f"Improve {sname} to required level for next role.",
                recommended_action=f"Complete structured development activity for {sname}.",
                action_type=random.choice(actions),
                progress=random.uniform(0, 60),
                target_date=_dt(2026, 12),
                status=DevelopmentStatus.IN_PROGRESS,
            ))
    db.flush()


# ── Previous-cycle reviews for trend data ─────────────────────────────────────

def seed_previous_cycle(db: Session, employees: list[Employee], managers: list[Employee]):
    print("  Creating 2025-H2 reviews for trend data…")
    for emp in employees[:25]:
        from app.analytics.performance_scoring import calculate_evidence_score as ce
        scores = ce(db, emp.id, "2025-H2")
        # No goals/projects for 2025-H2, so evidence will be partial — realistic
        base_ev = scores["total_score"] * random.uniform(0.85, 0.97)
        base_rating = 1.0 + (base_ev / 100.0) * 4.0 + random.uniform(-0.3, 0.3)
        manager = next((m for m in managers if m.id == emp.manager_id), managers[0])
        db.add(PerformanceReview(
            employee_id=emp.id,
            manager_id=manager.id,
            review_cycle="2025-H2",
            manager_rating=round(min(5.0, max(1.0, base_rating)), 1),
            evidence_score=round(base_ev, 1),
            evidence_components={},
            status=ReviewStatus.FINALIZED,
            calculated_at=_days_ago(180),
        ))
    db.flush()


# ── Audit log seed entries ─────────────────────────────────────────────────────

def seed_audit_log(db: Session, hr: Employee):
    print("  Creating audit log entries…")
    db.add(AuditLog(
        user_id=hr.id,
        action="SEED_DATABASE",
        entity_type="SYSTEM",
        entity_id="seed_data",
        old_value=None,
        new_value={"seed_version": "2.0", "cycle": REVIEW_CYCLE},
    ))
    db.flush()


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  HRM Performance Intelligence — Database Seed v2.0")
    print("=" * 60)

    # Fresh schema
    print("\nDropping and recreating schema…")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        print("\nSeeding reference data…")
        roles  = seed_roles(db)
        skills = seed_skills(db)
        seed_role_skills(db, roles, skills)
        seed_career_paths(db, roles)

        print("\nSeeding people…")
        people    = seed_people(db, roles)
        hr        = people["hr"]
        managers  = people["managers"]
        employees = people["employees"]

        print("\nSeeding performance data…")
        seed_goals(db, employees)
        seed_projects(db, employees)
        seed_feedback(db, employees, managers)
        seed_employee_skills(db, employees, skills)
        seed_training(db, employees)
        seed_attendance(db, employees)
        seed_business_impacts(db, employees)

        print("\nSeeding previous cycle (trend data)…")
        seed_previous_cycle(db, employees, managers)

        print("\nSeeding current cycle reviews with calibration scenarios…")
        reviews = seed_reviews(db, employees, managers)
        db.commit()

        print("\nGenerating calibration alerts…")
        seed_calibration_alerts(db, reviews)
        db.commit()

        print("\nSeeding development plans…")
        seed_development_plans(db, employees, skills)
        seed_audit_log(db, hr)
        db.commit()

        # ── Summary ──────────────────────────────────────────────────────
        from app.models import CalibrationAlert as CA
        n_alerts = db.query(CA).count()
        n_high   = db.query(CA).filter(CA.severity == AlertSeverity.HIGH).count()
        n_med    = db.query(CA).filter(CA.severity == AlertSeverity.MEDIUM).count()

        print("\n" + "=" * 60)
        print("  Seed complete!")
        print("=" * 60)
        print(f"  Employees  : {len(employees)}")
        print(f"  Managers   : {len(managers)}")
        print(f"  Reviews    : {len(reviews)}")
        print(f"  Alerts     : {n_alerts} total  ({n_high} HIGH, {n_med} MEDIUM)")
        print()
        print("  Credentials (all passwords: password123)")
        print(f"  HR Admin  : {hr.email}")
        print(f"  Manager   : {managers[0].email}  (lenient rater — Scenario 4)")
        print(f"  Manager   : {managers[1].email}  (strict rater — Scenario 5)")
        print(f"  Manager   : {managers[2].email}  (calibrated rater)")
        print(f"  Employee  : {employees[0].email}  (Scenario 1: high evidence, low rating)")
        print(f"  Employee  : {employees[1].email}  (Scenario 2: moderate evidence, high rating)")
        print(f"  Employee  : {employees[2].email}  (Scenario 3: aligned)")
        print()
        print("  Start server : uvicorn app.main:app --reload")
        print("  API docs     : http://localhost:8000/docs")
        print("=" * 60)

    except Exception as exc:
        db.rollback()
        import traceback
        traceback.print_exc()
        print(f"\nSeed failed: {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
