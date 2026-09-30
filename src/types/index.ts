export type Department = 'Engineering' | 'Product' | 'Sales' | 'Marketing' | 'Operations';

export type PerformanceTier = 'Exceeding' | 'Strong' | 'Consistent' | 'Developing' | 'Needs Alignment';

export type CalibrationStatus = 'Needs Review' | 'In Review' | 'Calibrated' | 'Normal';

export type VarianceLevel = 'High' | 'Medium' | 'Low';

export interface GoalItem {
  id: string;
  title: string;
  target: string;
  actual: string;
  status: 'Exceeded' | 'Achieved' | 'In Progress' | 'Needs Attention';
  progress: number;
  evidence: string;
  category: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  outcome: string;
  businessImpact: 'Critical' | 'High' | 'Medium' | 'Low';
  completion: number;
  evidence: string;
  duration: string;
}

export interface FeedbackItem {
  id: string;
  reviewerType: 'Peer' | 'Direct Report' | 'Cross-Functional' | 'Skip-Level' | 'Manager';
  reviewerName: string;
  date: string;
  feedback: string;
  relatedSkills: string[];
  sentiment: 'Positive' | 'Constructive';
}

export interface SkillItem {
  name: string;
  category: 'Technical' | 'Leadership' | 'Execution' | 'Collaboration';
  current: number;
  required: number;
  gap: number;
  status: 'Strong' | 'Developing' | 'Gap';
  recommendedAction: string;
}

export interface DevelopmentPlanItem {
  id: string;
  goal: string;
  recommendedAction: string;
  type: 'Training' | 'Project Stretch' | 'Mentorship' | 'Workshop';
  progress: number;
  deadline: string;
  mentor?: string;
  milestones: string[];
}

export interface PromotionCriterion {
  id: string;
  name: string;
  status: 'satisfied' | 'developing' | 'not_met';
  evidenceNote: string;
}

export interface CareerLadderStep {
  role: string;
  level: string;
  status: 'completed' | 'current' | 'next' | 'future';
  description: string;
  timeframe: string;
}

export interface CareerProgressionData {
  currentRole: string;
  potentialNextRole: string;
  readinessScore: number;
  criteriaMetCount: number;
  totalCriteriaCount: number;
  criteria: PromotionCriterion[];
  ladder: CareerLadderStep[];
}

export interface PerformanceTrendPoint {
  cycle: string;
  evidenceScore: number;
  managerRating: number;
  peerScore?: number;
  departmentAverage?: number;
}

export interface SupportingEvidence {
  id: string;
  title: string;
  category: 'Goal' | 'Project' | 'Feedback' | 'Metric';
  impact: string;
  verifiedDate: string;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  department: Department;
  manager: string;
  managerId: string;
  evidenceScore: number;
  performanceTier: PerformanceTier;
  promotionReadiness: number;
  calibrationStatus: CalibrationStatus;
  tenure: string;
  location: string;
  summary: {
    goals: number;
    projectImpact: number;
    skillGrowth: number;
    businessImpact: number;
    evidenceSummaryText: string;
    supportingEvidence: SupportingEvidence[];
  };
  performanceTrend: PerformanceTrendPoint[];
  goals: GoalItem[];
  projects: ProjectItem[];
  feedback: FeedbackItem[];
  skills: SkillItem[];
  developmentPlan: DevelopmentPlanItem[];
  careerProgression: CareerProgressionData;
}

export interface CalibrationAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: Department;
  managerId: string;
  managerName: string;
  evidenceScore: number;
  managerRating: number;
  expectedRange: string;
  deviation: number;
  varianceLevel: VarianceLevel;
  status: CalibrationStatus;
  flagReason: string;
  evidenceIndicators: {
    goals: number;
    projectOutcomes: number;
    peerFeedback: string;
    businessImpact: string;
  };
  suggestedAction: string;
  committeeFlag?: boolean;
  calibrationNotes?: string;
  updatedAt: string;
}

export interface ManagerRatingPattern {
  managerId: string;
  managerName: string;
  department: Department;
  teamSize: number;
  averageRating: number;
  medianRating: number;
  ratingVariance: number;
  pctRatedFourPlus: number;
  avgEvidenceScore: number;
  divergenceScore: number;
  tendency: 'Strict (Negative Divergence)' | 'Lenient (Positive Divergence)' | 'Balanced Alignment';
}

export interface KPIMetrics {
  totalEmployees: number;
  reviewsCompleted: number;
  reviewsTotal: number;
  averageEvidenceScore: number;
  calibrationAlerts: number;
  promotionReady: number;
}

export interface ActivityItem {
  id: string;
  type: 'review_completed' | 'development_plan' | 'calibration_flag' | 'skill_assessment' | 'promotion_updated';
  title: string;
  description: string;
  timestamp: string;
  employeeId?: string;
  employeeName?: string;
  badge?: string;
}
