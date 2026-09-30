import { Employee } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: 'emp-01',
    name: 'Rahul Sharma',
    avatar: 'RS',
    email: 'rahul.sharma@evalsense.internal',
    role: 'Software Engineer II',
    department: 'Engineering',
    manager: 'Anil Kumar',
    managerId: 'mgr-01',
    evidenceScore: 90,
    performanceTier: 'Strong',
    promotionReadiness: 78,
    calibrationStatus: 'Needs Review',
    tenure: '2.8 yrs',
    location: 'Bangalore, IND',
    summary: {
      goals: 94,
      projectImpact: 88,
      skillGrowth: 84,
      businessImpact: 91,
      evidenceSummaryText: 'Rahul demonstrated strong goal achievement and project delivery during this review cycle. His strongest verified evidence is in technical execution, zero-defect delivery, and peer collaboration.',
      supportingEvidence: [
        { id: 'ev-1', title: 'Campus Payment Gateway Latency Reduction', category: 'Project', impact: '-32% P99 latency verified in APM', verifiedDate: 'Sep 2026' },
        { id: 'ev-2', title: 'API Response Time Optimization Objective', category: 'Goal', impact: 'Exceeded target: 35% vs 20% target', verifiedDate: 'Aug 2026' },
        { id: 'ev-3', title: 'High-Volume Peer Collaboration Ratings', category: 'Feedback', impact: '92% positive sentiment across 8 peer reviews', verifiedDate: 'Sep 2026' },
        { id: 'ev-4', title: 'Core Billing Service Microservice Decoupling', category: 'Metric', impact: 'Zero downtime during migration', verifiedDate: 'Jul 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2024 H1', evidenceScore: 78, managerRating: 3.5, peerScore: 79, departmentAverage: 76 },
      { cycle: '2024 H2', evidenceScore: 82, managerRating: 3.6, peerScore: 84, departmentAverage: 78 },
      { cycle: '2025 H1', evidenceScore: 85, managerRating: 3.3, peerScore: 87, departmentAverage: 80 },
      { cycle: '2025 H2', evidenceScore: 88, managerRating: 3.2, peerScore: 90, departmentAverage: 81 },
      { cycle: '2026 H1', evidenceScore: 90, managerRating: 3.1, peerScore: 93, departmentAverage: 82 }
    ],
    goals: [
      {
        id: 'g-101',
        title: 'Improve API response time across Core Tier-1 endpoints',
        target: '20% reduction',
        actual: '35% reduction',
        status: 'Exceeded',
        progress: 100,
        evidence: 'Project benchmark report & APM latency trace (P99 down from 240ms to 156ms)',
        category: 'Performance Engineering'
      },
      {
        id: 'g-102',
        title: 'Zero-Downtime Microservice Data Migration',
        target: '99.9% uptime SLA',
        actual: '99.98% uptime',
        status: 'Exceeded',
        progress: 100,
        evidence: 'Datadog production SLA metrics and zero customer incident tickets',
        category: 'Infrastructure'
      },
      {
        id: 'g-103',
        title: 'Unit & Integration Test Coverage Elevation',
        target: '80% code coverage',
        actual: '84% code coverage',
        status: 'Achieved',
        progress: 100,
        evidence: 'SonarQube automated pipeline reports across all PRs',
        category: 'Quality'
      },
      {
        id: 'g-104',
        title: 'Junior Engineer Onboarding & Documentation Refresh',
        target: 'Guide 2 new hires to first PR in 10 days',
        actual: '2 onboarded, avg 7.5 days to first PR',
        status: 'Achieved',
        progress: 100,
        evidence: 'Internal engineering wiki log and mentor sign-offs',
        category: 'Mentorship'
      },
      {
        id: 'g-105',
        title: 'Distributed Tracing Integration across 6 services',
        target: '100% trace propagation',
        actual: '92% completed',
        status: 'In Progress',
        progress: 92,
        evidence: 'OpenTelemetry agent dashboard telemetry',
        category: 'Observability'
      }
    ],
    projects: [
      {
        id: 'p-1',
        name: 'Campus Payment Platform',
        role: 'Tech Lead / Core Contributor',
        outcome: 'Reduced transaction processing latency by 32% and lowered failure rates by 4.2%',
        businessImpact: 'High',
        completion: 100,
        evidence: 'Production benchmarking report & Payment Gateway telemetry',
        duration: 'Mar 2026 – Aug 2026'
      },
      {
        id: 'p-2',
        name: 'High-Throughput Order Ingestion Engine',
        role: 'Backend Architect & Implementer',
        outcome: 'Processed 4.2M events/day with 0 drop rate under 3x synthetic surge load',
        businessImpact: 'Critical',
        completion: 100,
        evidence: 'Kafka cluster throughput metrics and Grafana load testing dashboards',
        duration: 'Jan 2026 – Apr 2026'
      },
      {
        id: 'p-3',
        name: 'Developer Experience & CI/CD Fast Feedback Loop',
        role: 'Squad Contributor',
        outcome: 'Cut GitHub Action test execution runtimes from 18m to 6.5m',
        businessImpact: 'Medium',
        completion: 100,
        evidence: 'GitHub Workflow Analytics baseline comparison',
        duration: 'May 2026 – Jun 2026'
      }
    ],
    feedback: [
      {
        id: 'f-1',
        reviewerType: 'Peer',
        reviewerName: 'Sneha Patel (Staff Frontend)',
        date: 'Sep 18, 2026',
        feedback: 'Rahul consistently helped our squad resolve cross-service deployment bottlenecks. His communication on contract schemas is crystal clear and saved us weeks of rework.',
        relatedSkills: ['Collaboration', 'Problem Solving', 'Communication'],
        sentiment: 'Positive'
      },
      {
        id: 'f-2',
        reviewerType: 'Peer',
        reviewerName: 'Vikram Malhotra (Senior Backend)',
        date: 'Sep 12, 2026',
        feedback: 'Exceptional ownership of the payment pipeline. When our staging cluster had memory leakage during load tests, Rahul stepped in during off-hours to trace the root cause.',
        relatedSkills: ['Technical Execution', 'Reliability', 'Problem Solving'],
        sentiment: 'Positive'
      },
      {
        id: 'f-3',
        reviewerType: 'Cross-Functional',
        reviewerName: 'Priya Nair (Product Analyst)',
        date: 'Sep 05, 2026',
        feedback: 'Partnering with Rahul on telemetry definitions was seamless. He translated fuzzy business requirements into concrete metrics and delivered ahead of sprint timeline.',
        relatedSkills: ['Communication', 'Execution'],
        sentiment: 'Positive'
      },
      {
        id: 'f-4',
        reviewerType: 'Manager',
        reviewerName: 'Anil Kumar (Engineering Manager)',
        date: 'Sep 22, 2026',
        feedback: 'Solid delivery on assigned tasks. However, needs to demonstrate broader architectural leadership and independent vision for next-generation distributed systems.',
        relatedSkills: ['System Design', 'Leadership'],
        sentiment: 'Constructive'
      }
    ],
    skills: [
      { name: 'Technical Execution', category: 'Technical', current: 4.6, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Maintain lead in complex backend modules' },
      { name: 'Python / Distributed Systems', category: 'Technical', current: 4.4, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Contribute to core library patterns' },
      { name: 'System Design', category: 'Technical', current: 2.9, required: 4.0, gap: 1.1, status: 'Gap', recommendedAction: 'Advanced Distributed System Design Workshop & RFC ownership' },
      { name: 'Leadership & Mentorship', category: 'Leadership', current: 3.1, required: 4.0, gap: 0.9, status: 'Developing', recommendedAction: 'Lead a cross-squad technical initiative as Tech Lead' },
      { name: 'Communication', category: 'Collaboration', current: 3.7, required: 4.0, gap: 0.3, status: 'Developing', recommendedAction: 'Quarterly architecture review presentations' },
      { name: 'Problem Solving', category: 'Execution', current: 4.7, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Lead root cause incident post-mortems' },
      { name: 'Collaboration', category: 'Collaboration', current: 4.8, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Peer mentoring ambassador' }
    ],
    developmentPlan: [
      {
        id: 'dp-1',
        goal: 'Improve System Design Competency',
        recommendedAction: 'Complete Advanced Distributed System Design Masterclass and author 2 RFCs',
        type: 'Training',
        progress: 45,
        deadline: 'Dec 15, 2026',
        mentor: 'Sneha Patel',
        milestones: ['Complete Course Modules 1-4', 'Submit RFC for Event Cache', 'Defend RFC in Architecture Forum']
      },
      {
        id: 'dp-2',
        goal: 'Lead Technical Architecture Initiative',
        recommendedAction: 'Take Tech Lead role on the upcoming Real-Time Settlement Pilot',
        type: 'Project Stretch',
        progress: 60,
        deadline: 'Nov 30, 2026',
        mentor: 'Suresh Reddy',
        milestones: ['Scope requirements', 'Draft system architecture diagram', 'Deliver MVP milestone']
      },
      {
        id: 'dp-3',
        goal: 'Cross-functional Communication Polish',
        recommendedAction: 'Host internal tech talk on Observability best practices',
        type: 'Workshop',
        progress: 80,
        deadline: 'Oct 20, 2026',
        milestones: ['Prepare slide deck', 'Dry run with mentor', 'Deliver tech talk to department']
      }
    ],
    careerProgression: {
      currentRole: 'Software Engineer II',
      potentialNextRole: 'Senior Software Engineer',
      readinessScore: 78,
      criteriaMetCount: 7,
      totalCriteriaCount: 9,
      criteria: [
        { id: 'c-1', name: 'Technical Competency & Code Quality', status: 'satisfied', evidenceNote: 'Exceeded code quality benchmarks with 84% test coverage and 0 P0 defects.' },
        { id: 'c-2', name: 'Project Delivery & Timeliness', status: 'satisfied', evidenceNote: 'Delivered 3 consecutive major projects on or before committed sprint milestones.' },
        { id: 'c-3', name: 'Code Quality & Peer Reviews', status: 'satisfied', evidenceNote: 'Over 140 PR reviews authored; praised for constructive feedback.' },
        { id: 'c-4', name: 'Collaboration & Team Support', status: 'satisfied', evidenceNote: 'Peer feedback sentiment score at 92% across multidisciplinary colleagues.' },
        { id: 'c-5', name: 'Measurable Business Impact', status: 'satisfied', evidenceNote: 'Directly drove $420k annualized savings via 32% latency reduction.' },
        { id: 'c-6', name: 'Mentoring & Knowledge Sharing', status: 'satisfied', evidenceNote: 'Successfully guided 2 junior hires through onboarding curriculum.' },
        { id: 'c-7', name: 'Communication & Stakeholder Sync', status: 'satisfied', evidenceNote: 'Clear technical specs acknowledged across Product and QA.' },
        { id: 'c-8', name: 'System Design & Scalability Breadth', status: 'developing', evidenceNote: 'Currently at 2.9 / 4.0; needs independent end-to-end distributed system RFC completion.' },
        { id: 'c-9', name: 'Technical Leadership & Initiative Scoping', status: 'developing', evidenceNote: 'Currently at 3.1 / 4.0; actively undertaking Real-Time Settlement pilot leadership.' }
      ],
      ladder: [
        { role: 'Software Engineer I', level: 'L3', status: 'completed', description: 'Foundational programming, individual task delivery, learning codebase.', timeframe: '2023 – 2024' },
        { role: 'Software Engineer II', level: 'L4', status: 'current', description: 'Autonomous feature delivery, microservice ownership, peer collaboration.', timeframe: '2024 – Present' },
        { role: 'Senior Software Engineer', level: 'L5', status: 'next', description: 'End-to-end technical leadership, cross-squad architecture, mentoring juniors.', timeframe: 'Target: Q1 2027' },
        { role: 'Staff Software Engineer', level: 'L6', status: 'future', description: 'Multi-system strategy, domain-wide architecture, organizational technology driver.', timeframe: 'Future Career Path' },
        { role: 'Principal Engineer', level: 'L7', status: 'future', description: 'Company-wide technical direction, novel tech adoption, executive advisory.', timeframe: 'Long-term Horizon' }
      ]
    }
  },
  {
    id: 'emp-02',
    name: 'Priya Nair',
    avatar: 'PN',
    email: 'priya.nair@evalsense.internal',
    role: 'Product Analyst',
    department: 'Product',
    manager: 'Kiran Rao',
    managerId: 'mgr-02',
    evidenceScore: 74,
    performanceTier: 'Consistent',
    promotionReadiness: 62,
    calibrationStatus: 'Needs Review',
    tenure: '1.5 yrs',
    location: 'Mumbai, IND',
    summary: {
      goals: 71,
      projectImpact: 72,
      skillGrowth: 78,
      businessImpact: 75,
      evidenceSummaryText: 'Priya demonstrates consistent day-to-day analytics delivery and responsive dashboard maintenance. Noticeable variance between manager rating (4.9) and objective product delivery volume (74%).',
      supportingEvidence: [
        { id: 'ev-21', title: 'Monthly Executive Dashboard Maintenance', category: 'Metric', impact: 'Maintained 99% data freshness SLA', verifiedDate: 'Sep 2026' },
        { id: 'ev-22', title: 'Self-Serve Experimentation Framework Training', category: 'Goal', impact: 'Achieved 71% of rollout adoption goal', verifiedDate: 'Aug 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H1', evidenceScore: 68, managerRating: 4.8, peerScore: 70, departmentAverage: 76 },
      { cycle: '2025 H2', evidenceScore: 71, managerRating: 4.9, peerScore: 73, departmentAverage: 78 },
      { cycle: '2026 H1', evidenceScore: 74, managerRating: 4.9, peerScore: 75, departmentAverage: 78 }
    ],
    goals: [
      { id: 'g-201', title: 'Self-Serve Experimentation Framework Adoption', target: '80% PM adoption', actual: '57% PM adoption', status: 'In Progress', progress: 71, evidence: 'Mixpanel product telemetry', category: 'Product Analytics' },
      { id: 'g-202', title: 'User Funnel Drop-off Diagnostic Report', target: 'Identify 3 high-impact leaks', actual: 'Identified 2 leaks', status: 'Achieved', progress: 100, evidence: 'Published Confluence diagnostic brief', category: 'Research' }
    ],
    projects: [
      { id: 'p-201', name: 'Checkout Conversion Funnel Audit', role: 'Lead Analyst', outcome: 'Isolated drop-off in OTP verification stage', businessImpact: 'Medium', completion: 100, evidence: 'Amplitude dashboard analytics', duration: 'Apr 2026 – Jul 2026' }
    ],
    feedback: [
      { id: 'f-201', reviewerType: 'Manager', reviewerName: 'Kiran Rao (VP Product)', date: 'Sep 19, 2026', feedback: 'Exceptional team player, always delightful to work with and very enthusiastic.', relatedSkills: ['Enthusiasm', 'Communication'], sentiment: 'Positive' },
      { id: 'f-202', reviewerType: 'Peer', reviewerName: 'Deepa Verma (Designer)', date: 'Sep 10, 2026', feedback: 'Helpful with pulling query numbers when requested.', relatedSkills: ['Collaboration'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'SQL & Data Extraction', category: 'Technical', current: 4.1, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Continue supporting self-serve data models' },
      { name: 'Causal Inference & A/B Testing', category: 'Technical', current: 2.8, required: 4.0, gap: 1.2, status: 'Gap', recommendedAction: 'Enroll in advanced hypothesis testing' },
      { name: 'Strategic Product Thinking', category: 'Execution', current: 3.0, required: 4.0, gap: 1.0, status: 'Gap', recommendedAction: 'Shadow principal PM on roadmap planning' }
    ],
    developmentPlan: [
      { id: 'dp-201', goal: 'Master Advanced A/B Experimentation', recommendedAction: 'Complete Reforge Experimentation Deep-Dive', type: 'Training', progress: 30, deadline: 'Jan 15, 2027', milestones: ['Complete 5 modules', 'Redesign sample size calculator'] }
    ],
    careerProgression: {
      currentRole: 'Product Analyst',
      potentialNextRole: 'Senior Product Analyst',
      readinessScore: 62,
      criteriaMetCount: 5,
      totalCriteriaCount: 8,
      criteria: [
        { id: 'cp-21', name: 'Core SQL & Query Competence', status: 'satisfied', evidenceNote: 'High query speed and accuracy.' },
        { id: 'cp-22', name: 'Team Collaboration', status: 'satisfied', evidenceNote: 'High rapport with cross-functional peers.' },
        { id: 'cp-23', name: 'Statistical Rigor in Testing', status: 'developing', evidenceNote: 'Requires more depth in quasi-experimental analysis.' },
        { id: 'cp-24', name: 'Executive Strategy Synthesizing', status: 'not_met', evidenceNote: 'Currently focuses primarily on reactive ad-hoc reporting.' }
      ],
      ladder: [
        { role: 'Junior Analyst', level: 'L2', status: 'completed', description: 'Reporting support, query execution.', timeframe: '2024 – 2025' },
        { role: 'Product Analyst', level: 'L3', status: 'current', description: 'Metric tracking, funnel diagnostics.', timeframe: '2025 – Present' },
        { role: 'Senior Product Analyst', level: 'L4', status: 'next', description: 'Complex experimentation, causal inference.', timeframe: 'Target: 2027' }
      ]
    }
  },
  {
    id: 'emp-03',
    name: 'Arjun Reddy',
    avatar: 'AR',
    email: 'arjun.reddy@evalsense.internal',
    role: 'Software Engineer II',
    department: 'Engineering',
    manager: 'Anil Kumar',
    managerId: 'mgr-01',
    evidenceScore: 82,
    performanceTier: 'Consistent',
    promotionReadiness: 68,
    calibrationStatus: 'Normal',
    tenure: '2.1 yrs',
    location: 'Hyderabad, IND',
    summary: {
      goals: 84,
      projectImpact: 81,
      skillGrowth: 80,
      businessImpact: 83,
      evidenceSummaryText: 'Arjun maintains solid code output and reliable maintenance of the core messaging service. Evaluation rating (3.8) is closely aligned with objective evidence (82%).',
      supportingEvidence: [
        { id: 'ev-31', title: 'Notification Microservice Maintenance', category: 'Metric', impact: 'Maintained 99.95% delivery rate', verifiedDate: 'Sep 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H1', evidenceScore: 77, managerRating: 3.6, peerScore: 78, departmentAverage: 79 },
      { cycle: '2026 H1', evidenceScore: 82, managerRating: 3.8, peerScore: 81, departmentAverage: 82 }
    ],
    goals: [
      { id: 'g-301', title: 'Push Notification Throughput', target: '50k/min', actual: '54k/min', status: 'Achieved', progress: 100, evidence: 'Redis queue monitor', category: 'Engineering' }
    ],
    projects: [
      { id: 'p-301', name: 'Notification Service Upgrade', role: 'Software Engineer', outcome: 'Migrated FCM connectors to v1 API', businessImpact: 'Medium', completion: 100, evidence: 'Deployment release notes', duration: 'Feb 2026 – May 2026' }
    ],
    feedback: [
      { id: 'f-301', reviewerType: 'Manager', reviewerName: 'Anil Kumar', date: 'Sep 21, 2026', feedback: 'Dependable contributor on messaging components.', relatedSkills: ['Reliability'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'Go / Microservices', category: 'Technical', current: 3.9, required: 4.0, gap: 0.1, status: 'Developing', recommendedAction: 'Refine memory profiling techniques' },
      { name: 'System Design', category: 'Technical', current: 3.2, required: 4.0, gap: 0.8, status: 'Developing', recommendedAction: 'Participate in architectural reviews' }
    ],
    developmentPlan: [
      { id: 'dp-301', goal: 'Cloud Native Profiling', recommendedAction: 'Complete Go pprof deep dive', type: 'Training', progress: 50, deadline: 'Nov 15, 2026', milestones: ['Benchmark run', 'Optimize memory usage'] }
    ],
    careerProgression: {
      currentRole: 'Software Engineer II',
      potentialNextRole: 'Senior Software Engineer',
      readinessScore: 68,
      criteriaMetCount: 6,
      totalCriteriaCount: 9,
      criteria: [
        { id: 'cr-31', name: 'Technical Competency', status: 'satisfied', evidenceNote: 'Reliable service maintainer.' },
        { id: 'cr-32', name: 'Independent Ownership', status: 'developing', evidenceNote: 'Needs to take sole lead on major subsystem.' }
      ],
      ladder: [
        { role: 'Software Engineer I', level: 'L3', status: 'completed', description: 'Core programming tasks.', timeframe: '2023 – 2024' },
        { role: 'Software Engineer II', level: 'L4', status: 'current', description: 'Service ownership.', timeframe: '2024 – Present' },
        { role: 'Senior Software Engineer', level: 'L5', status: 'next', description: 'System architecture & mentoring.', timeframe: 'Target: 2027' }
      ]
    }
  },
  {
    id: 'emp-04',
    name: 'Sneha Patel',
    avatar: 'SP',
    email: 'sneha.patel@evalsense.internal',
    role: 'Staff Frontend Engineer',
    department: 'Engineering',
    manager: 'Suresh Reddy',
    managerId: 'mgr-03',
    evidenceScore: 93,
    performanceTier: 'Exceeding',
    promotionReadiness: 91,
    calibrationStatus: 'Calibrated',
    tenure: '4.2 yrs',
    location: 'Bangalore, IND',
    summary: {
      goals: 96,
      projectImpact: 94,
      skillGrowth: 90,
      businessImpact: 95,
      evidenceSummaryText: 'Sneha continues to set the standard for frontend architecture and design systems across all product squads. Evidence is well-aligned with manager evaluation (4.7).',
      supportingEvidence: [
        { id: 'ev-41', title: 'Global Design System 3.0 Rollout', category: 'Project', impact: 'Accelerated UI velocity by 40% across 14 squads', verifiedDate: 'Aug 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H1', evidenceScore: 89, managerRating: 4.5, peerScore: 91, departmentAverage: 80 },
      { cycle: '2025 H2', evidenceScore: 91, managerRating: 4.6, peerScore: 93, departmentAverage: 81 },
      { cycle: '2026 H1', evidenceScore: 93, managerRating: 4.7, peerScore: 95, departmentAverage: 82 }
    ],
    goals: [
      { id: 'g-401', title: 'Design System Component Tokenization', target: '100% adoption', actual: '100% completed', status: 'Achieved', progress: 100, evidence: 'Figma to React tokens automated pipeline', category: 'Design Systems' }
    ],
    projects: [
      { id: 'p-401', name: 'Design System 3.0 Core Engine', role: 'Principal Architect', outcome: 'Unified 12 separate component repositories into single NPM monorepo', businessImpact: 'Critical', completion: 100, evidence: 'Lerna monorepo build artifacts', duration: 'Jan 2026 – Jul 2026' }
    ],
    feedback: [
      { id: 'f-401', reviewerType: 'Manager', reviewerName: 'Suresh Reddy', date: 'Sep 23, 2026', feedback: 'Exemplary leadership. Guided multiple frontend engineers and drove platform quality.', relatedSkills: ['Architecture', 'Mentorship'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'Frontend Architecture', category: 'Technical', current: 4.9, required: 4.5, gap: 0, status: 'Strong', recommendedAction: 'Lead international conference presentation' },
      { name: 'Design Systems', category: 'Technical', current: 4.8, required: 4.5, gap: 0, status: 'Strong', recommendedAction: 'Author enterprise case study' }
    ],
    developmentPlan: [
      { id: 'dp-401', goal: 'Company-wide Web Performance Strategy', recommendedAction: 'Establish Web Vitals council', type: 'Project Stretch', progress: 75, deadline: 'Dec 01, 2026', milestones: ['Draft charter', 'Audit all products'] }
    ],
    careerProgression: {
      currentRole: 'Staff Frontend Engineer',
      potentialNextRole: 'Principal Frontend Engineer',
      readinessScore: 91,
      criteriaMetCount: 9,
      totalCriteriaCount: 9,
      criteria: [
        { id: 'cr-41', name: 'Company-Wide Technical Strategy', status: 'satisfied', evidenceNote: 'Architected Design System 3.0 across all products.' },
        { id: 'cr-42', name: 'Industry-Standard Quality & Accessibility', status: 'satisfied', evidenceNote: 'WCAG AAA compliance achieved across core UI.' }
      ],
      ladder: [
        { role: 'Senior Frontend', level: 'L5', status: 'completed', description: 'Squad UI lead.', timeframe: '2022 – 2024' },
        { role: 'Staff Frontend', level: 'L6', status: 'current', description: 'Platform architecture lead.', timeframe: '2024 – Present' },
        { role: 'Principal Engineer', level: 'L7', status: 'next', description: 'Enterprise frontend direction.', timeframe: 'Target: Q4 2026' }
      ]
    }
  },
  {
    id: 'emp-05',
    name: 'Vikram Malhotra',
    avatar: 'VM',
    email: 'vikram.malhotra@evalsense.internal',
    role: 'Senior Backend Engineer',
    department: 'Engineering',
    manager: 'Anil Kumar',
    managerId: 'mgr-01',
    evidenceScore: 88,
    performanceTier: 'Strong',
    promotionReadiness: 81,
    calibrationStatus: 'Needs Review',
    tenure: '3.5 yrs',
    location: 'Bangalore, IND',
    summary: {
      goals: 91,
      projectImpact: 89,
      skillGrowth: 83,
      businessImpact: 90,
      evidenceSummaryText: 'Vikram executed zero-downtime database upgrades and distributed sharding with high operational rigor. Manager evaluation (3.4) shows downward variance against evidence (88%).',
      supportingEvidence: [
        { id: 'ev-51', title: 'PostgreSQL Multi-Region Sharding', category: 'Project', impact: 'Maintained 99.99% availability during live failover test', verifiedDate: 'Sep 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H1', evidenceScore: 84, managerRating: 3.5, peerScore: 87, departmentAverage: 80 },
      { cycle: '2026 H1', evidenceScore: 88, managerRating: 3.4, peerScore: 89, departmentAverage: 82 }
    ],
    goals: [
      { id: 'g-501', title: 'Zero Downtime Cluster Sharding', target: '0 customer outages', actual: '0 outages', status: 'Achieved', progress: 100, evidence: 'Terraform audit logs', category: 'Database Systems' }
    ],
    projects: [
      { id: 'p-501', name: 'Database Scalability Overhaul', role: 'Lead DBA / Architect', outcome: 'Expanded database capacity to handle 10x peak season traffic', businessImpact: 'Critical', completion: 100, evidence: 'Datadog metrics', duration: 'Feb 2026 – Aug 2026' }
    ],
    feedback: [
      { id: 'f-501', reviewerType: 'Peer', reviewerName: 'Rahul Sharma', date: 'Sep 15, 2026', feedback: 'Vikram is the backbone of our data tier. Invaluable technical mentor.', relatedSkills: ['Reliability', 'Mentorship'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'Distributed Databases', category: 'Technical', current: 4.7, required: 4.5, gap: 0, status: 'Strong', recommendedAction: 'Publish engineering blog post' }
    ],
    developmentPlan: [
      { id: 'dp-501', goal: 'Cross-functional Executive Presentations', recommendedAction: 'Lead quarterly technology review', type: 'Workshop', progress: 50, deadline: 'Nov 30, 2026', milestones: ['Draft deck'] }
    ],
    careerProgression: {
      currentRole: 'Senior Backend Engineer',
      potentialNextRole: 'Staff Backend Engineer',
      readinessScore: 81,
      criteriaMetCount: 8,
      totalCriteriaCount: 9,
      criteria: [
        { id: 'cr-51', name: 'System Stability & Scalability', status: 'satisfied', evidenceNote: 'Maintained 99.99% availability.' }
      ],
      ladder: [
        { role: 'Backend Engineer II', level: 'L4', status: 'completed', description: 'Service engineer.', timeframe: '2022 – 2024' },
        { role: 'Senior Backend', level: 'L5', status: 'current', description: 'Core data lead.', timeframe: '2024 – Present' },
        { role: 'Staff Backend', level: 'L6', status: 'next', description: 'Enterprise data architecture.', timeframe: 'Target: Q2 2027' }
      ]
    }
  },
  {
    id: 'emp-06',
    name: 'Ananya Iyer',
    avatar: 'AI',
    email: 'ananya.iyer@evalsense.internal',
    role: 'Associate Product Manager',
    department: 'Product',
    manager: 'Kiran Rao',
    managerId: 'mgr-02',
    evidenceScore: 76,
    performanceTier: 'Consistent',
    promotionReadiness: 64,
    calibrationStatus: 'Needs Review',
    tenure: '1.2 yrs',
    location: 'Delhi, IND',
    summary: {
      goals: 78,
      projectImpact: 75,
      skillGrowth: 74,
      businessImpact: 77,
      evidenceSummaryText: 'Ananya coordinated onboarding usability testing smoothly. Manager rating (4.6) indicates leniency bias relative to objective delivery deliverables.',
      supportingEvidence: [
        { id: 'ev-61', title: 'Onboarding User Usability Pilot', category: 'Project', impact: 'Completed 18 user interviews', verifiedDate: 'Aug 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H2', evidenceScore: 72, managerRating: 4.5, peerScore: 73, departmentAverage: 78 },
      { cycle: '2026 H1', evidenceScore: 76, managerRating: 4.6, peerScore: 76, departmentAverage: 79 }
    ],
    goals: [
      { id: 'g-601', title: 'User Onboarding Flow Revamp', target: '+15% activation', actual: '+11% activation', status: 'In Progress', progress: 73, evidence: 'Mixpanel analytics', category: 'Growth' }
    ],
    projects: [
      { id: 'p-601', name: 'Mobile App Welcome Tour', role: 'Product Lead', outcome: 'Shipped interactive tooltip tour for iOS & Android', businessImpact: 'Medium', completion: 100, evidence: 'App Store release v3.4', duration: 'May 2026 – Aug 2026' }
    ],
    feedback: [
      { id: 'f-601', reviewerType: 'Manager', reviewerName: 'Kiran Rao', date: 'Sep 20, 2026', feedback: 'Phenomenal communicator, wonderful presence and very cooperative.', relatedSkills: ['Communication'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'User Research', category: 'Execution', current: 3.5, required: 4.0, gap: 0.5, status: 'Developing', recommendedAction: 'Formalize qualitative synthesis frameworks' }
    ],
    developmentPlan: [
      { id: 'dp-601', goal: 'Data-driven Product Strategy', recommendedAction: 'Complete Advanced Product Metrics course', type: 'Training', progress: 40, deadline: 'Dec 10, 2026', milestones: ['Complete case study'] }
    ],
    careerProgression: {
      currentRole: 'Associate Product Manager',
      potentialNextRole: 'Product Manager',
      readinessScore: 64,
      criteriaMetCount: 5,
      totalCriteriaCount: 8,
      criteria: [
        { id: 'cr-61', name: 'Product Execution', status: 'satisfied', evidenceNote: 'Delivered mobile onboarding tour.' }
      ],
      ladder: [
        { role: 'Associate PM', level: 'L3', status: 'current', description: 'Feature execution.', timeframe: '2025 – Present' },
        { role: 'Product Manager', level: 'L4', status: 'next', description: 'Squad roadmap ownership.', timeframe: 'Target: 2027' }
      ]
    }
  },
  {
    id: 'emp-07',
    name: 'Rajesh Gupta',
    avatar: 'RG',
    email: 'rajesh.gupta@evalsense.internal',
    role: 'Senior Enterprise AE',
    department: 'Sales',
    manager: 'Meena Shah',
    managerId: 'mgr-04',
    evidenceScore: 85,
    performanceTier: 'Strong',
    promotionReadiness: 79,
    calibrationStatus: 'Normal',
    tenure: '3.0 yrs',
    location: 'Delhi, IND',
    summary: {
      goals: 89,
      projectImpact: 84,
      skillGrowth: 81,
      businessImpact: 86,
      evidenceSummaryText: 'Rajesh hit 118% of annualized quota and expanded enterprise relationships across 6 key accounts. Evaluation rating (4.2) matches evidence well.',
      supportingEvidence: [
        { id: 'ev-71', title: 'Enterprise Quota Achievement', category: 'Metric', impact: '$1.42M ARR closed (118% of target)', verifiedDate: 'Sep 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H1', evidenceScore: 81, managerRating: 4.0, peerScore: 82, departmentAverage: 81 },
      { cycle: '2026 H1', evidenceScore: 85, managerRating: 4.2, peerScore: 84, departmentAverage: 82 }
    ],
    goals: [
      { id: 'g-701', title: 'Q3 Enterprise Quota', target: '$1.2M ARR', actual: '$1.42M ARR', status: 'Exceeded', progress: 100, evidence: 'Salesforce closed-won pipeline audit', category: 'Revenue' }
    ],
    projects: [
      { id: 'p-701', name: 'Strategic Banking Sector Expansion', role: 'Lead AE', outcome: 'Signed 2 top-tier regional private banks', businessImpact: 'High', completion: 100, evidence: 'Salesforce contracts', duration: 'Jan 2026 – Aug 2026' }
    ],
    feedback: [
      { id: 'f-701', reviewerType: 'Manager', reviewerName: 'Meena Shah', date: 'Sep 24, 2026', feedback: 'Consistent closer with great relationship management.', relatedSkills: ['Negotiation', 'Closing'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'Enterprise Deal Structuring', category: 'Execution', current: 4.5, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Mentor mid-market reps on complex deal stages' }
    ],
    developmentPlan: [
      { id: 'dp-701', goal: 'Sales Enablement & Mentorship', recommendedAction: 'Lead weekly deal review clinic', type: 'Mentorship', progress: 70, deadline: 'Nov 01, 2026', milestones: ['Host 6 clinics'] }
    ],
    careerProgression: {
      currentRole: 'Senior Enterprise AE',
      potentialNextRole: 'Strategic Accounts Director',
      readinessScore: 79,
      criteriaMetCount: 7,
      totalCriteriaCount: 9,
      criteria: [
        { id: 'cr-71', name: 'Quota Delivery', status: 'satisfied', evidenceNote: 'Exceeded quota for 4 consecutive quarters.' }
      ],
      ladder: [
        { role: 'Account Executive', level: 'L4', status: 'completed', description: 'Mid-market quota.', timeframe: '2023 – 2024' },
        { role: 'Senior Enterprise AE', level: 'L5', status: 'current', description: 'Enterprise deal ownership.', timeframe: '2024 – Present' },
        { role: 'Strategic Accounts Director', level: 'L6', status: 'next', description: 'Global accounts portfolio.', timeframe: 'Target: Q2 2027' }
      ]
    }
  },
  {
    id: 'emp-08',
    name: 'Deepa Verma',
    avatar: 'DV',
    email: 'deepa.verma@evalsense.internal',
    role: 'Senior Product Designer',
    department: 'Product',
    manager: 'Kiran Rao',
    managerId: 'mgr-02',
    evidenceScore: 79,
    performanceTier: 'Strong',
    promotionReadiness: 72,
    calibrationStatus: 'Needs Review',
    tenure: '2.5 yrs',
    location: 'Bangalore, IND',
    summary: {
      goals: 82,
      projectImpact: 78,
      skillGrowth: 77,
      businessImpact: 80,
      evidenceSummaryText: 'Deepa produces clean visual designs and design system assets. Manager rating (4.7) is on the high side given 79% overall evidence indicators.',
      supportingEvidence: [
        { id: 'ev-81', title: 'Design System Figma Library Upgrade', category: 'Project', impact: 'Maintained 140+ components with 100% token parity', verifiedDate: 'Sep 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H2', evidenceScore: 75, managerRating: 4.6, peerScore: 77, departmentAverage: 78 },
      { cycle: '2026 H1', evidenceScore: 79, managerRating: 4.7, peerScore: 79, departmentAverage: 79 }
    ],
    goals: [
      { id: 'g-801', title: 'Accessibility Design Guidelines', target: '100% AAA components', actual: '92% AAA', status: 'Achieved', progress: 92, evidence: 'Stark accessibility audit', category: 'Accessibility' }
    ],
    projects: [
      { id: 'p-801', name: 'Fintech Mobile Experience Redesign', role: 'Lead Designer', outcome: 'Modernized core interaction paradigm', businessImpact: 'High', completion: 100, evidence: 'User testing results', duration: 'Feb 2026 – Jul 2026' }
    ],
    feedback: [
      { id: 'f-801', reviewerType: 'Manager', reviewerName: 'Kiran Rao', date: 'Sep 21, 2026', feedback: 'Deepa is an artistic marvel, always goes above and beyond with delightful mockups.', relatedSkills: ['Visual Craft'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'Visual & Interaction Design', category: 'Technical', current: 4.4, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Standardize motion tokens' }
    ],
    developmentPlan: [
      { id: 'dp-801', goal: 'Data-driven User Testing', recommendedAction: 'Learn Maze quantitative unmoderated testing', type: 'Training', progress: 55, deadline: 'Dec 15, 2026', milestones: ['Run 3 Maze studies'] }
    ],
    careerProgression: {
      currentRole: 'Senior Product Designer',
      potentialNextRole: 'Lead Product Designer',
      readinessScore: 72,
      criteriaMetCount: 6,
      totalCriteriaCount: 9,
      criteria: [
        { id: 'cr-81', name: 'Design Craftsmanship', status: 'satisfied', evidenceNote: 'Recognized internally for top UI quality.' }
      ],
      ladder: [
        { role: 'Product Designer II', level: 'L4', status: 'completed', description: 'Feature UI design.', timeframe: '2023 – 2024' },
        { role: 'Senior Product Designer', level: 'L5', status: 'current', description: 'Squad design lead.', timeframe: '2024 – Present' },
        { role: 'Lead Product Designer', level: 'L6', status: 'next', description: 'Product domain design director.', timeframe: 'Target: 2027' }
      ]
    }
  },
  {
    id: 'emp-09',
    name: 'Rohit Sen',
    avatar: 'RS',
    email: 'rohit.sen@evalsense.internal',
    role: 'DevOps Engineer',
    department: 'Engineering',
    manager: 'Suresh Reddy',
    managerId: 'mgr-03',
    evidenceScore: 78,
    performanceTier: 'Consistent',
    promotionReadiness: 66,
    calibrationStatus: 'Normal',
    tenure: '1.9 yrs',
    location: 'Pune, IND',
    summary: {
      goals: 80,
      projectImpact: 77,
      skillGrowth: 76,
      businessImpact: 79,
      evidenceSummaryText: 'Rohit efficiently manages Kubernetes clusters and deployment runners. Manager rating (3.7) is balanced with 78% evidence.',
      supportingEvidence: [
        { id: 'ev-91', title: 'EKS Cluster Upgrade to v1.30', category: 'Metric', impact: 'Zero downtime during rolling node group upgrade', verifiedDate: 'Aug 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H2', evidenceScore: 74, managerRating: 3.5, peerScore: 75, departmentAverage: 79 },
      { cycle: '2026 H1', evidenceScore: 78, managerRating: 3.7, peerScore: 77, departmentAverage: 81 }
    ],
    goals: [
      { id: 'g-901', title: 'AWS Cloud Cost Optimization', target: '$15k/mo reduction', actual: '$18.2k/mo reduction', status: 'Exceeded', progress: 100, evidence: 'AWS Cost Explorer invoice audit', category: 'FinOps' }
    ],
    projects: [
      { id: 'p-901', name: 'Automated Spot Instance Fleet Migration', role: 'DevOps Implementer', outcome: 'Cut non-production compute bills by 48%', businessImpact: 'High', completion: 100, evidence: 'Terraform & Karpenter logs', duration: 'Mar 2026 – Jun 2026' }
    ],
    feedback: [
      { id: 'f-901', reviewerType: 'Manager', reviewerName: 'Suresh Reddy', date: 'Sep 18, 2026', feedback: 'Solid operational reliability and cost discipline.', relatedSkills: ['Infrastructure', 'FinOps'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'Kubernetes & IaC', category: 'Technical', current: 4.1, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Attain CKS certification' }
    ],
    developmentPlan: [
      { id: 'dp-901', goal: 'Certified Kubernetes Security Specialist (CKS)', recommendedAction: 'Complete security prep lab', type: 'Training', progress: 65, deadline: 'Nov 20, 2026', milestones: ['Practice exam 1 & 2'] }
    ],
    careerProgression: {
      currentRole: 'DevOps Engineer',
      potentialNextRole: 'Senior Site Reliability Engineer',
      readinessScore: 66,
      criteriaMetCount: 5,
      totalCriteriaCount: 8,
      criteria: [
        { id: 'cr-91', name: 'Cluster Uptime & Incident Response', status: 'satisfied', evidenceNote: 'Zero P0 outages attributed to infra.' }
      ],
      ladder: [
        { role: 'Associate Cloud Engineer', level: 'L3', status: 'completed', description: 'Scripting & runner maintenance.', timeframe: '2023 – 2024' },
        { role: 'DevOps Engineer', level: 'L4', status: 'current', description: 'Cluster & IaC management.', timeframe: '2024 – Present' },
        { role: 'Senior SRE', level: 'L5', status: 'next', description: 'Chaos engineering & enterprise reliability.', timeframe: 'Target: 2027' }
      ]
    }
  },
  {
    id: 'emp-10',
    name: 'Tanvi Joshi',
    avatar: 'TJ',
    email: 'tanvi.joshi@evalsense.internal',
    role: 'Operations Lead',
    department: 'Operations',
    manager: 'David Chen',
    managerId: 'mgr-05',
    evidenceScore: 91,
    performanceTier: 'Exceeding',
    promotionReadiness: 84,
    calibrationStatus: 'Needs Review',
    tenure: '3.1 yrs',
    location: 'Bangalore, IND',
    summary: {
      goals: 95,
      projectImpact: 92,
      skillGrowth: 86,
      businessImpact: 91,
      evidenceSummaryText: 'Tanvi overhauled CSAT workflows and eliminated 34% of support ticket backlogs. Manager rating (3.5) shows downward divergence against 91% evidence score.',
      supportingEvidence: [
        { id: 'ev-101', title: 'Support SLA Turnaround Optimization', category: 'Goal', impact: 'CSAT elevated from 4.1 to 4.75; 34% backlog reduction', verifiedDate: 'Sep 2026' }
      ]
    },
    performanceTrend: [
      { cycle: '2025 H1', evidenceScore: 85, managerRating: 3.4, peerScore: 88, departmentAverage: 78 },
      { cycle: '2026 H1', evidenceScore: 91, managerRating: 3.5, peerScore: 93, departmentAverage: 79 }
    ],
    goals: [
      { id: 'g-1001', title: 'Support Ticket Backlog Reduction', target: '25% reduction', actual: '34% reduction', status: 'Exceeded', progress: 100, evidence: 'Zendesk SLA analytics', category: 'Customer Ops' }
    ],
    projects: [
      { id: 'p-1001', name: 'Automated Tier-1 Triage Bot Integration', role: 'Project Lead', outcome: 'Deflected 28% of routine inbound queries automatically', businessImpact: 'High', completion: 100, evidence: 'Zendesk AI routing logs', duration: 'Apr 2026 – Aug 2026' }
    ],
    feedback: [
      { id: 'f-1001', reviewerType: 'Cross-Functional', reviewerName: 'Rajesh Gupta (Sales)', date: 'Sep 16, 2026', feedback: 'Tanvi is the most responsive ops partner I have worked with. High-value client escalations are resolved in minutes.', relatedSkills: ['Collaboration', 'Problem Solving'], sentiment: 'Positive' }
    ],
    skills: [
      { name: 'Process Optimization', category: 'Execution', current: 4.8, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Scale triage framework to regional hubs' }
    ],
    developmentPlan: [
      { id: 'dp-1001', goal: 'Strategic Operations Leadership', recommendedAction: 'Lead Global Support Ops Quarterly Business Review', type: 'Project Stretch', progress: 70, deadline: 'Dec 05, 2026', milestones: ['Synthesize regional SLA data'] }
    ],
    careerProgression: {
      currentRole: 'Operations Lead',
      potentialNextRole: 'Head of Customer Operations',
      readinessScore: 84,
      criteriaMetCount: 8,
      totalCriteriaCount: 9,
      criteria: [
        { id: 'cr-101', name: 'SLA Excellence & Process Automation', status: 'satisfied', evidenceNote: 'Exceeded CSAT benchmarks across all enterprise tiers.' }
      ],
      ladder: [
        { role: 'Operations Specialist', level: 'L3', status: 'completed', description: 'Ticket handling & escalation triage.', timeframe: '2023 – 2024' },
        { role: 'Operations Lead', level: 'L4', status: 'current', description: 'Team process owner.', timeframe: '2024 – Present' },
        { role: 'Head of Customer Operations', level: 'L5', status: 'next', description: 'Global operations department executive.', timeframe: 'Target: Q1 2027' }
      ]
    }
  },
  {
    id: 'emp-11',
    name: 'Karthik Nair',
    avatar: 'KN',
    email: 'karthik.nair@evalsense.internal',
    role: 'Account Executive',
    department: 'Sales',
    manager: 'Meena Shah',
    managerId: 'mgr-04',
    evidenceScore: 80,
    performanceTier: 'Consistent',
    promotionReadiness: 69,
    calibrationStatus: 'Normal',
    tenure: '1.8 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 82, projectImpact: 78, skillGrowth: 79, businessImpact: 81, evidenceSummaryText: 'Karthik maintained healthy pipeline coverage and met 102% of sales target.', supportingEvidence: [{ id: 'ev-111', title: 'Mid-Market Sales Quota', category: 'Metric', impact: '102% attained', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 76, managerRating: 3.9, peerScore: 77, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 80, managerRating: 4.0, peerScore: 80, departmentAverage: 82 }],
    goals: [{ id: 'g-1101', title: 'Quarterly Sales Target', target: '$600k', actual: '$612k', status: 'Achieved', progress: 100, evidence: 'Salesforce logs', category: 'Sales' }],
    projects: [{ id: 'p-1101', name: 'SaaS Renewal Campaign', role: 'AE', outcome: 'Maintained 94% retention rate', businessImpact: 'Medium', completion: 100, evidence: 'Gainsight dashboard', duration: 'Jan 2026 – Jun 2026' }],
    feedback: [{ id: 'f-1101', reviewerType: 'Manager', reviewerName: 'Meena Shah', date: 'Sep 22, 2026', feedback: 'Consistent closer with reliable forecasting accuracy.', relatedSkills: ['Forecasting'], sentiment: 'Positive' }],
    skills: [{ name: 'Pipeline Management', category: 'Execution', current: 4.0, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Transition into enterprise tier accounts' }],
    developmentPlan: [{ id: 'dp-1101', goal: 'Enterprise Sales Methodology (MEDDICC)', recommendedAction: 'Complete MEDDICC academy certification', type: 'Training', progress: 40, deadline: 'Dec 15, 2026', milestones: ['Complete 4 modules'] }],
    careerProgression: { currentRole: 'Account Executive', potentialNextRole: 'Senior AE', readinessScore: 69, criteriaMetCount: 6, totalCriteriaCount: 9, criteria: [{ id: 'cr-111', name: 'Quota Consistency', status: 'satisfied', evidenceNote: 'Target met consistently.' }], ladder: [{ role: 'BDR', level: 'L3', status: 'completed', description: 'Outbound prospecting.', timeframe: '2023 – 2024' }, { role: 'AE', level: 'L4', status: 'current', description: 'Quota carrying.', timeframe: '2024 – Present' }, { role: 'Senior AE', level: 'L5', status: 'next', description: 'Enterprise deal ownership.', timeframe: 'Target: 2027' }] }
  },
  {
    id: 'emp-12',
    name: 'Neha Kapoor',
    avatar: 'NK',
    email: 'neha.kapoor@evalsense.internal',
    role: 'Growth Marketing Lead',
    department: 'Marketing',
    manager: 'Meena Shah',
    managerId: 'mgr-04',
    evidenceScore: 86,
    performanceTier: 'Strong',
    promotionReadiness: 77,
    calibrationStatus: 'Normal',
    tenure: '2.4 yrs',
    location: 'Mumbai, IND',
    summary: { goals: 88, projectImpact: 85, skillGrowth: 83, businessImpact: 88, evidenceSummaryText: 'Neha led inbound organic growth and reduced blended CAC by 22% across multi-channel campaigns.', supportingEvidence: [{ id: 'ev-121', title: 'Inbound Growth Campaign CAC Reduction', category: 'Goal', impact: '-22% CAC reduction with +38% MQLs', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 82, managerRating: 4.1, peerScore: 83, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 86, managerRating: 4.3, peerScore: 86, departmentAverage: 81 }],
    goals: [{ id: 'g-1201', title: 'Blended CAC Reduction', target: '15% reduction', actual: '22% reduction', status: 'Exceeded', progress: 100, evidence: 'Google Analytics 4 & HubSpot attribution', category: 'Marketing' }],
    projects: [{ id: 'p-1201', name: 'SEO & Product-Led Growth Engine', role: 'Campaign Lead', outcome: 'Boosted organic search signups by 44%', businessImpact: 'High', completion: 100, evidence: 'Ahrefs organic traffic reports', duration: 'Feb 2026 – Aug 2026' }],
    feedback: [{ id: 'f-1201', reviewerType: 'Manager', reviewerName: 'Meena Shah', date: 'Sep 23, 2026', feedback: 'Exceptional analytical marketer with strong ROI focus.', relatedSkills: ['Analytics', 'Growth Strategy'], sentiment: 'Positive' }],
    skills: [{ name: 'Growth Marketing & CAC Optimization', category: 'Technical', current: 4.5, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Establish attribution modeling standard' }],
    developmentPlan: [{ id: 'dp-1201', goal: 'Multi-Touch Attribution Infrastructure', recommendedAction: 'Implement data warehouse marketing attribution pipeline', type: 'Project Stretch', progress: 60, deadline: 'Nov 30, 2026', milestones: ['Complete model validation'] }],
    careerProgression: { currentRole: 'Growth Marketing Lead', potentialNextRole: 'Head of Growth', readinessScore: 77, criteriaMetCount: 7, totalCriteriaCount: 9, criteria: [{ id: 'cr-121', name: 'Demonstrated CAC Efficiency', status: 'satisfied', evidenceNote: 'Exceeded CAC targets by 7%.' }], ladder: [{ role: 'Marketing Specialist', level: 'L3', status: 'completed', description: 'Content & paid search.', timeframe: '2023 – 2024' }, { role: 'Growth Lead', level: 'L4', status: 'current', description: 'Multi-channel acquisition.', timeframe: '2024 – Present' }, { role: 'Head of Growth', level: 'L5', status: 'next', description: 'Global marketing demand engine.', timeframe: 'Target: 2027' }] }
  },
  {
    id: 'emp-13',
    name: 'Sanjay Rao',
    avatar: 'SR',
    email: 'sanjay.rao@evalsense.internal',
    role: 'QA Automation Lead',
    department: 'Engineering',
    manager: 'Anil Kumar',
    managerId: 'mgr-01',
    evidenceScore: 87,
    performanceTier: 'Strong',
    promotionReadiness: 75,
    calibrationStatus: 'Needs Review',
    tenure: '3.2 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 90, projectImpact: 86, skillGrowth: 82, businessImpact: 89, evidenceSummaryText: 'Sanjay architected Playwright end-to-end testing pipelines, preventing 12 regression leaks. Manager rating (3.3) shows downward divergence against 87% evidence.', supportingEvidence: [{ id: 'ev-131', title: 'Automated Regression Suite Playwright Rollout', category: 'Project', impact: 'Reduced release cycle testing time from 3 days to 4 hours', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 83, managerRating: 3.4, peerScore: 85, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 87, managerRating: 3.3, peerScore: 88, departmentAverage: 82 }],
    goals: [{ id: 'g-1301', title: 'E2E Automated Pipeline Coverage', target: '70% critical flows', actual: '82% critical flows', status: 'Exceeded', progress: 100, evidence: 'Playwright test report artifacts', category: 'QA Engineering' }],
    projects: [{ id: 'p-1301', name: 'Continuous Release Quality Gate', role: 'Lead Architect', outcome: 'Integrated automated smoke suites into PR merge checks', businessImpact: 'High', completion: 100, evidence: 'GitHub Actions logs', duration: 'Jan 2026 – Jun 2026' }],
    feedback: [{ id: 'f-1301', reviewerType: 'Peer', reviewerName: 'Rahul Sharma', date: 'Sep 17, 2026', feedback: 'Sanjay’s test automation saved our squad countless hours during the payment launch.', relatedSkills: ['Automation', 'Collaboration'], sentiment: 'Positive' }],
    skills: [{ name: 'Test Architecture & Automation', category: 'Technical', current: 4.6, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Lead performance load testing initiative' }],
    developmentPlan: [{ id: 'dp-1301', goal: 'Distributed Load & Chaos Testing', recommendedAction: 'Integrate k6 performance tests into staging clusters', type: 'Training', progress: 50, deadline: 'Dec 01, 2026', milestones: ['Benchmark 5k RPS'] }],
    careerProgression: { currentRole: 'QA Automation Lead', potentialNextRole: 'Staff Quality Engineer', readinessScore: 75, criteriaMetCount: 7, totalCriteriaCount: 9, criteria: [{ id: 'cr-131', name: 'Quality Architecture Leadership', status: 'satisfied', evidenceNote: 'Reduced regression leakages to 0.' }], ladder: [{ role: 'QA Engineer', level: 'L3', status: 'completed', description: 'Manual & automated testing.', timeframe: '2022 – 2024' }, { role: 'QA Automation Lead', level: 'L4', status: 'current', description: 'Test framework architect.', timeframe: '2024 – Present' }, { role: 'Staff Quality Engineer', level: 'L5', status: 'next', description: 'Enterprise engineering reliability.', timeframe: 'Target: 2027' } ] }
  },
  {
    id: 'emp-14',
    name: 'Pooja Bhatt',
    avatar: 'PB',
    email: 'pooja.bhatt@evalsense.internal',
    role: 'UX Researcher',
    department: 'Product',
    manager: 'Kiran Rao',
    managerId: 'mgr-02',
    evidenceScore: 72,
    performanceTier: 'Consistent',
    promotionReadiness: 58,
    calibrationStatus: 'Needs Review',
    tenure: '1.4 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 73, projectImpact: 70, skillGrowth: 74, businessImpact: 71, evidenceSummaryText: 'Pooja conducts user interviews and usability tests. Manager rating (4.5) indicates positive leniency divergence against 72% verified evidence.', supportingEvidence: [{ id: 'ev-141', title: 'Enterprise Usability Studies', category: 'Project', impact: 'Published 4 persona research summaries', verifiedDate: 'Aug 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 69, managerRating: 4.4, peerScore: 71, departmentAverage: 78 }, { cycle: '2026 H1', evidenceScore: 72, managerRating: 4.5, peerScore: 72, departmentAverage: 79 }],
    goals: [{ id: 'g-1401', title: 'Customer Discovery Sessions', target: '20 sessions', actual: '18 sessions', status: 'In Progress', progress: 90, evidence: 'Dovetail repository tags', category: 'UX Research' }],
    projects: [{ id: 'p-1401', name: 'Mobile App IA Research', role: 'Lead Researcher', outcome: 'Delivered tree testing and card sorting insights', businessImpact: 'Medium', completion: 100, evidence: 'Optimal Workshop study results', duration: 'Apr 2026 – Jul 2026' }],
    feedback: [{ id: 'f-1401', reviewerType: 'Manager', reviewerName: 'Kiran Rao', date: 'Sep 19, 2026', feedback: 'Always delightful, energetic, and brings great vibes to the product team.', relatedSkills: ['Vibe', 'Communication'], sentiment: 'Positive' }],
    skills: [{ name: 'Qualitative User Research', category: 'Execution', current: 3.8, required: 4.0, gap: 0.2, status: 'Developing', recommendedAction: 'Incorporate quantitative behavioral validation' }],
    developmentPlan: [{ id: 'dp-1401', goal: 'Mixed-Methods Research Rigor', recommendedAction: 'Integrate quantitative SQL telemetry into research synthesis', type: 'Training', progress: 35, deadline: 'Jan 20, 2027', milestones: ['Complete SQL 101'] }],
    careerProgression: { currentRole: 'UX Researcher', potentialNextRole: 'Senior UX Researcher', readinessScore: 58, criteriaMetCount: 4, totalCriteriaCount: 8, criteria: [{ id: 'cr-141', name: 'Research Synthesis', status: 'satisfied', evidenceNote: 'Consistent qualitative reports.' }], ladder: [{ role: 'Associate Researcher', level: 'L3', status: 'completed', description: 'Interview note-taking.', timeframe: '2024 – 2025' }, { role: 'UX Researcher', level: 'L4', status: 'current', description: 'End-to-end study ownership.', timeframe: '2025 – Present' }, { role: 'Senior UX Researcher', level: 'L5', status: 'next', description: 'Strategic product discovery.', timeframe: 'Target: 2028' }] }
  },
  {
    id: 'emp-15',
    name: 'Amit Deshmukh',
    avatar: 'AD',
    email: 'amit.deshmukh@evalsense.internal',
    role: 'Data Platform Engineer',
    department: 'Engineering',
    manager: 'Suresh Reddy',
    managerId: 'mgr-03',
    evidenceScore: 89,
    performanceTier: 'Strong',
    promotionReadiness: 83,
    calibrationStatus: 'Normal',
    tenure: '2.9 yrs',
    location: 'Hyderabad, IND',
    summary: { goals: 92, projectImpact: 88, skillGrowth: 85, businessImpact: 90, evidenceSummaryText: 'Amit built scalable dbt and Snowflake pipelines powering analytics for the entire organization. Evidence (89%) and manager rating (4.4) are well-aligned.', supportingEvidence: [{ id: 'ev-151', title: 'Snowflake Warehouse Optimization', category: 'Metric', impact: 'Cut query runtimes by 42% and saved $60k annualized compute', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 85, managerRating: 4.2, peerScore: 86, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 89, managerRating: 4.4, peerScore: 90, departmentAverage: 82 }],
    goals: [{ id: 'g-1501', title: 'Data Freshness SLA', target: '< 15 mins latency', actual: '9.2 mins latency', status: 'Exceeded', progress: 100, evidence: 'dbt cloud run logs', category: 'Data Engineering' }],
    projects: [{ id: 'p-1501', name: 'Real-Time Financial Telemetry Pipeline', role: 'Data Architect', outcome: 'Streaming ingestion pipeline for ledger reconciliations', businessImpact: 'Critical', completion: 100, evidence: 'Kafka & Snowflake streaming metrics', duration: 'Jan 2026 – Jul 2026' }],
    feedback: [{ id: 'f-1501', reviewerType: 'Manager', reviewerName: 'Suresh Reddy', date: 'Sep 22, 2026', feedback: 'Deep technical mastery of data infrastructure with exceptional delivery discipline.', relatedSkills: ['Data Modeling', 'Architecture'], sentiment: 'Positive' }],
    skills: [{ name: 'Distributed Data Pipelines', category: 'Technical', current: 4.7, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Drive enterprise data governance standard' }],
    developmentPlan: [{ id: 'dp-1501', goal: 'Streaming Lakehouse Architecture', recommendedAction: 'Architect Apache Iceberg catalog migration', type: 'Project Stretch', progress: 55, deadline: 'Dec 15, 2026', milestones: ['Benchmark Iceberg queries'] }],
    careerProgression: { currentRole: 'Data Platform Engineer', potentialNextRole: 'Senior Data Platform Engineer', readinessScore: 83, criteriaMetCount: 8, totalCriteriaCount: 9, criteria: [{ id: 'cr-151', name: 'Data Pipeline Reliability', status: 'satisfied', evidenceNote: 'Maintained 99.98% pipeline uptime.' }], ladder: [{ role: 'Junior Data Engineer', level: 'L3', status: 'completed', description: 'ETL script maintenance.', timeframe: '2023 – 2024' }, { role: 'Data Platform Engineer', level: 'L4', status: 'current', description: 'Warehouse & stream architecture.', timeframe: '2024 – Present' }, { role: 'Senior Data Engineer', level: 'L5', status: 'next', description: 'Enterprise data mesh architecture.', timeframe: 'Target: Q1 2027' }] }
  },
  {
    id: 'emp-16',
    name: 'Kavita Rao',
    avatar: 'KR',
    email: 'kavita.rao@evalsense.internal',
    role: 'Customer Success Director',
    department: 'Sales',
    manager: 'Meena Shah',
    managerId: 'mgr-04',
    evidenceScore: 88,
    performanceTier: 'Strong',
    promotionReadiness: 85,
    calibrationStatus: 'Normal',
    tenure: '3.8 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 91, projectImpact: 87, skillGrowth: 84, businessImpact: 90, evidenceSummaryText: 'Kavita drove 114% net revenue retention across enterprise accounts and trained 5 CS managers. Ratings and evidence are in close calibration.', supportingEvidence: [{ id: 'ev-161', title: 'Net Revenue Retention (NRR)', category: 'Metric', impact: '114% NRR achieved across top 40 enterprise logos', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 84, managerRating: 4.3, peerScore: 85, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 88, managerRating: 4.5, peerScore: 88, departmentAverage: 82 }],
    goals: [{ id: 'g-1601', title: 'Enterprise NRR Retention Target', target: '110% NRR', actual: '114% NRR', status: 'Exceeded', progress: 100, evidence: 'Gainsight renewal reports', category: 'Customer Success' }],
    projects: [{ id: 'p-1601', name: 'Customer Health Scoring Algorithm', role: 'Executive Sponsor', outcome: 'Decreased preventable logo churn by 30%', businessImpact: 'High', completion: 100, evidence: 'Salesforce analytics', duration: 'Feb 2026 – Jun 2026' }],
    feedback: [{ id: 'f-1601', reviewerType: 'Manager', reviewerName: 'Meena Shah', date: 'Sep 20, 2026', feedback: 'Trusted leader with unmatched empathy and operational rigor.', relatedSkills: ['Leadership', 'Retention'], sentiment: 'Positive' }],
    skills: [{ name: 'Enterprise Account Strategy', category: 'Leadership', current: 4.7, required: 4.5, gap: 0, status: 'Strong', recommendedAction: 'Lead international expansion onboarding' }],
    developmentPlan: [{ id: 'dp-1601', goal: 'Global Executive Customer Advisory Board', recommendedAction: 'Convene advisory board summit', type: 'Project Stretch', progress: 80, deadline: 'Nov 15, 2026', milestones: ['Host inaugural session'] }],
    careerProgression: { currentRole: 'Customer Success Director', potentialNextRole: 'VP of Customer Success', readinessScore: 85, criteriaMetCount: 8, totalCriteriaCount: 9, criteria: [{ id: 'cr-161', name: 'Revenue Retention Leadership', status: 'satisfied', evidenceNote: 'Exceeded NRR target for 3 consecutive halves.' }], ladder: [{ role: 'Senior CS Manager', level: 'L5', status: 'completed', description: 'Enterprise accounts.', timeframe: '2022 – 2024' }, { role: 'CS Director', level: 'L6', status: 'current', description: 'Department leadership.', timeframe: '2024 – Present' }, { role: 'VP Customer Success', level: 'L7', status: 'next', description: 'Executive customer officer.', timeframe: 'Target: 2027' }] }
  },
  {
    id: 'emp-17',
    name: 'Nikhil Mehta',
    avatar: 'NM',
    email: 'nikhil.mehta@evalsense.internal',
    role: 'Procurement Specialist',
    department: 'Operations',
    manager: 'David Chen',
    managerId: 'mgr-05',
    evidenceScore: 75,
    performanceTier: 'Consistent',
    promotionReadiness: 61,
    calibrationStatus: 'Normal',
    tenure: '1.6 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 77, projectImpact: 74, skillGrowth: 73, businessImpact: 76, evidenceSummaryText: 'Nikhil audited vendor renewals and secured standard enterprise discounts. Rating (3.6) and evidence (75%) are consistent.', supportingEvidence: [{ id: 'ev-171', title: 'Vendor Contract Renegotiation', category: 'Metric', impact: 'Saved $85k across IT SaaS renewals', verifiedDate: 'Aug 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 72, managerRating: 3.5, peerScore: 73, departmentAverage: 78 }, { cycle: '2026 H1', evidenceScore: 75, managerRating: 3.6, peerScore: 75, departmentAverage: 79 }],
    goals: [{ id: 'g-1701', title: 'SaaS Vendor Contract Consolidation', target: '$75k savings', actual: '$85k savings', status: 'Exceeded', progress: 100, evidence: 'Finance ledger audit', category: 'Procurement' }],
    projects: [{ id: 'p-1701', name: 'Contract Lifecycle Management Rollout', role: 'Lead Specialist', outcome: 'Digitized 180 vendor NDAs and agreements in Ironclad', businessImpact: 'Medium', completion: 100, evidence: 'Ironclad repository audit', duration: 'Mar 2026 – Jul 2026' }],
    feedback: [{ id: 'f-1701', reviewerType: 'Manager', reviewerName: 'David Chen', date: 'Sep 19, 2026', feedback: 'Dependable and detail-oriented contract negotiator.', relatedSkills: ['Negotiation'], sentiment: 'Positive' }],
    skills: [{ name: 'Vendor Contract Negotiation', category: 'Execution', current: 3.9, required: 4.0, gap: 0.1, status: 'Developing', recommendedAction: 'Formalize RFP evaluation scorecard' }],
    developmentPlan: [{ id: 'dp-1701', goal: 'Strategic Sourcing Certification', recommendedAction: 'Complete CPSM exam preparation', type: 'Training', progress: 45, deadline: 'Dec 15, 2026', milestones: ['Module 1 & 2 completed'] }],
    careerProgression: { currentRole: 'Procurement Specialist', potentialNextRole: 'Senior Sourcing Manager', readinessScore: 61, criteriaMetCount: 5, totalCriteriaCount: 8, criteria: [{ id: 'cr-171', name: 'Vendor Cost Discipline', status: 'satisfied', evidenceNote: 'Delivered verified cost savings.' }], ladder: [{ role: 'Junior Buyer', level: 'L3', status: 'completed', description: 'PO issuance.', timeframe: '2024 – 2025' }, { role: 'Procurement Specialist', level: 'L4', status: 'current', description: 'Contract negotiation.', timeframe: '2025 – Present' }, { role: 'Senior Sourcing Manager', level: 'L5', status: 'next', description: 'Global procurement lead.', timeframe: 'Target: 2028' }] }
  },
  {
    id: 'emp-18',
    name: 'Divya Nair',
    avatar: 'DN',
    email: 'divya.nair@evalsense.internal',
    role: 'Content Strategist',
    department: 'Marketing',
    manager: 'Meena Shah',
    managerId: 'mgr-04',
    evidenceScore: 83,
    performanceTier: 'Consistent',
    promotionReadiness: 71,
    calibrationStatus: 'Normal',
    tenure: '2.0 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 85, projectImpact: 81, skillGrowth: 80, businessImpact: 84, evidenceSummaryText: 'Divya produced 12 high-converting case studies and managed technical thought-leadership content. Evidence (83%) matches rating (4.1).', supportingEvidence: [{ id: 'ev-181', title: 'Enterprise Customer Case Study Series', category: 'Project', impact: 'Generated 420 direct sales demo downloads', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 79, managerRating: 4.0, peerScore: 80, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 83, managerRating: 4.1, peerScore: 82, departmentAverage: 81 }],
    goals: [{ id: 'g-1801', title: 'Thought Leadership Editorial Calendar', target: '100% on-time publishing', actual: '100% on-time', status: 'Achieved', progress: 100, evidence: 'Asana editorial tracker', category: 'Content' }],
    projects: [{ id: 'p-1801', name: 'Annual State of FinOps Industry Report', role: 'Lead Author', outcome: 'Over 8,000 PDF downloads and featured in TechCrunch', businessImpact: 'High', completion: 100, evidence: 'Download analytics & PR press clippings', duration: 'Feb 2026 – Jun 2026' }],
    feedback: [{ id: 'f-1801', reviewerType: 'Manager', reviewerName: 'Meena Shah', date: 'Sep 21, 2026', feedback: 'Talented storyteller with deep grasp of our engineering product domain.', relatedSkills: ['Writing', 'Storytelling'], sentiment: 'Positive' }],
    skills: [{ name: 'Technical Editorial Craft', category: 'Execution', current: 4.4, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Lead content syndication partnerships' }],
    developmentPlan: [{ id: 'dp-1801', goal: 'SEO-Driven Content Modeling', recommendedAction: 'Advance technical keyword clustering workflows', type: 'Training', progress: 50, deadline: 'Nov 30, 2026', milestones: ['Complete topic clusters'] }],
    careerProgression: { currentRole: 'Content Strategist', potentialNextRole: 'Senior Content Marketing Lead', readinessScore: 71, criteriaMetCount: 6, totalCriteriaCount: 9, criteria: [{ id: 'cr-181', name: 'Content Production Velocity & Reach', status: 'satisfied', evidenceNote: 'Industry report surpassed all benchmarks.' }], ladder: [{ role: 'Content Writer', level: 'L3', status: 'completed', description: 'Blog drafting.', timeframe: '2023 – 2024' }, { role: 'Content Strategist', level: 'L4', status: 'current', description: 'Editorial strategy.', timeframe: '2024 – Present' }, { role: 'Lead Content Strategist', level: 'L5', status: 'next', description: 'Global brand narrative.', timeframe: 'Target: 2027' }] }
  },
  {
    id: 'emp-19',
    name: 'Manisha Prasad',
    avatar: 'MP',
    email: 'manisha.prasad@evalsense.internal',
    role: 'Full Stack Engineer',
    department: 'Engineering',
    manager: 'Anil Kumar',
    managerId: 'mgr-01',
    evidenceScore: 84,
    performanceTier: 'Consistent',
    promotionReadiness: 73,
    calibrationStatus: 'Needs Review',
    tenure: '2.3 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 87, projectImpact: 83, skillGrowth: 80, businessImpact: 85, evidenceSummaryText: 'Manisha delivered the administrative settings redesign and OAuth federation module. Manager rating (3.2) shows strict bias divergence against 84% evidence.', supportingEvidence: [{ id: 'ev-191', title: 'Enterprise SSO & SCIM Directory Sync', category: 'Project', impact: 'Zero authentication vulnerabilities discovered in third-party penetration test', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 80, managerRating: 3.3, peerScore: 82, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 84, managerRating: 3.2, peerScore: 85, departmentAverage: 82 }],
    goals: [{ id: 'g-1901', title: 'SAML / SCIM 2.0 Identity Protocol Support', target: 'Support Okta & Azure AD', actual: '100% compliant', status: 'Achieved', progress: 100, evidence: 'Okta integration verification certificate', category: 'Security' }],
    projects: [{ id: 'p-1901', name: 'Enterprise Identity Federation Overhaul', role: 'Lead Full Stack', outcome: 'Enabled single-click enterprise tenant onboarding', businessImpact: 'High', completion: 100, evidence: 'Security pentest signoff', duration: 'Mar 2026 – Aug 2026' }],
    feedback: [{ id: 'f-1901', reviewerType: 'Peer', reviewerName: 'Vikram Malhotra', date: 'Sep 18, 2026', feedback: 'Manisha wrote rock-solid OAuth code that passed strict security review on first pass.', relatedSkills: ['Security', 'Full Stack'], sentiment: 'Positive' }],
    skills: [{ name: 'Authentication & Security Protocols', category: 'Technical', current: 4.5, required: 4.0, gap: 0, status: 'Strong', recommendedAction: 'Lead security champion program' }],
    developmentPlan: [{ id: 'dp-1901', goal: 'Application Security Architecture', recommendedAction: 'Attain Certified AppSec Practitioner (CAP)', type: 'Training', progress: 40, deadline: 'Dec 15, 2026', milestones: ['Finish lab modules'] }],
    careerProgression: { currentRole: 'Full Stack Engineer', potentialNextRole: 'Senior Full Stack Engineer', readinessScore: 73, criteriaMetCount: 6, totalCriteriaCount: 9, criteria: [{ id: 'cr-191', name: 'Security & Code Rigor', status: 'satisfied', evidenceNote: 'Passed enterprise pentest.' }], ladder: [{ role: 'Junior Engineer', level: 'L3', status: 'completed', description: 'Bug fixing & UI tweaks.', timeframe: '2023 – 2024' }, { role: 'Full Stack Engineer', level: 'L4', status: 'current', description: 'Feature module ownership.', timeframe: '2024 – Present' }, { role: 'Senior Full Stack', level: 'L5', status: 'next', description: 'Full stack system lead.', timeframe: 'Target: 2027' }] }
  },
  {
    id: 'emp-20',
    name: 'Siddharth Roy',
    avatar: 'SR',
    email: 'siddharth.roy@evalsense.internal',
    role: 'Principal Product Manager',
    department: 'Product',
    manager: 'Kiran Rao',
    managerId: 'mgr-02',
    evidenceScore: 88,
    performanceTier: 'Strong',
    promotionReadiness: 86,
    calibrationStatus: 'Normal',
    tenure: '4.5 yrs',
    location: 'Bangalore, IND',
    summary: { goals: 90, projectImpact: 87, skillGrowth: 85, businessImpact: 89, evidenceSummaryText: 'Siddharth drives multi-year product roadmap strategy and initiated the core platform intelligence initiative. Ratings and evidence reflect high performance alignment.', supportingEvidence: [{ id: 'ev-201', title: 'Platform Intelligence Initiative V1 Launch', category: 'Project', impact: 'Shipped to 45 beta enterprise customers with 91% satisfaction', verifiedDate: 'Sep 2026' }] },
    performanceTrend: [{ cycle: '2025 H2', evidenceScore: 85, managerRating: 4.7, peerScore: 87, departmentAverage: 80 }, { cycle: '2026 H1', evidenceScore: 88, managerRating: 4.8, peerScore: 89, departmentAverage: 82 }],
    goals: [{ id: 'g-2001', title: 'Enterprise Beta Pilot Rollout', target: '30 customers', actual: '45 customers', status: 'Exceeded', progress: 100, evidence: 'Customer contract telemetry', category: 'Strategy' }],
    projects: [{ id: 'p-2001', name: 'Next-Gen Platform Roadmap', role: 'Principal PM', outcome: 'Secured executive and board alignment on 3-year vision', businessImpact: 'Critical', completion: 100, evidence: 'Board deck strategy approval memo', duration: 'Jan 2026 – Aug 2026' }],
    feedback: [{ id: 'f-2001', reviewerType: 'Manager', reviewerName: 'Kiran Rao', date: 'Sep 22, 2026', feedback: 'Exceptional strategic thinker who elevates everyone around him.', relatedSkills: ['Strategy', 'Leadership'], sentiment: 'Positive' }],
    skills: [{ name: 'Enterprise Product Vision', category: 'Leadership', current: 4.8, required: 4.5, gap: 0, status: 'Strong', recommendedAction: 'Executive mentor for incoming APMs' }],
    developmentPlan: [{ id: 'dp-2001', goal: 'Organizational Product Culture Scaling', recommendedAction: 'Lead quarterly product management guild summits', type: 'Workshop', progress: 75, deadline: 'Nov 30, 2026', milestones: ['Publish guild charter'] }],
    careerProgression: { currentRole: 'Principal Product Manager', potentialNextRole: 'Group Product Manager / Director', readinessScore: 86, criteriaMetCount: 8, totalCriteriaCount: 9, criteria: [{ id: 'cr-201', name: 'Strategic Vision & Execution', status: 'satisfied', evidenceNote: 'Successfully guided multi-year company initiatives.' }], ladder: [{ role: 'Senior PM', level: 'L5', status: 'completed', description: 'Product domain lead.', timeframe: '2021 – 2023' }, { role: 'Principal PM', level: 'L6', status: 'current', description: 'Strategic platform initiatives.', timeframe: '2023 – Present' }, { role: 'Director of Product', level: 'L7', status: 'next', description: 'Portfolio leadership.', timeframe: 'Target: Q1 2027' }] }
  }
];
