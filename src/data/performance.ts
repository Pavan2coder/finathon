import { KPIMetrics, ActivityItem } from '../types';

export const mockKPIMetrics: KPIMetrics = {
  totalEmployees: 248,
  reviewsCompleted: 231,
  reviewsTotal: 248,
  averageEvidenceScore: 82.6,
  calibrationAlerts: 12,
  promotionReady: 37
};

export interface CycleTrendData {
  cycle: string;
  year: string;
  evidenceScore: number;
  managerRatingAvg: number;
  goalCompletionRate: number;
}

export const mockOrgPerformanceTrend: CycleTrendData[] = [
  { cycle: '2024 H1', year: '2024', evidenceScore: 71, managerRatingAvg: 3.82, goalCompletionRate: 74 },
  { cycle: '2024 H2', year: '2024', evidenceScore: 74, managerRatingAvg: 3.89, goalCompletionRate: 76 },
  { cycle: '2025 H1', year: '2025', evidenceScore: 77, managerRatingAvg: 3.95, goalCompletionRate: 80 },
  { cycle: '2025 H2', year: '2025', evidenceScore: 80, managerRatingAvg: 4.02, goalCompletionRate: 83 },
  { cycle: '2026 H1', year: '2026', evidenceScore: 83, managerRatingAvg: 4.08, goalCompletionRate: 86 }
];

export interface DepartmentAchievement {
  department: string;
  goalAchievement: number;
  evidenceAvg: number;
  headcount: number;
  reviewCompletionRate: number;
}

export const mockDepartmentAchievements: DepartmentAchievement[] = [
  { department: 'Engineering', goalAchievement: 88, evidenceAvg: 85.2, headcount: 104, reviewCompletionRate: 94 },
  { department: 'Sales', goalAchievement: 89, evidenceAvg: 83.8, headcount: 52, reviewCompletionRate: 96 },
  { department: 'Product', goalAchievement: 84, evidenceAvg: 80.1, headcount: 38, reviewCompletionRate: 92 },
  { department: 'Operations', goalAchievement: 86, evidenceAvg: 81.4, headcount: 32, reviewCompletionRate: 91 },
  { department: 'Marketing', goalAchievement: 81, evidenceAvg: 79.7, headcount: 22, reviewCompletionRate: 89 }
];

export const mockRecentActivities: ActivityItem[] = [
  {
    id: 'act-01',
    type: 'calibration_flag',
    title: 'Evaluation Consistency Alert Raised',
    description: 'Rahul Sharma flagged for review (Evidence: 90% vs Manager Rating: 3.1/5)',
    timestamp: '25 mins ago',
    employeeId: 'emp-01',
    employeeName: 'Rahul Sharma',
    badge: 'Review Required'
  },
  {
    id: 'act-02',
    type: 'review_completed',
    title: 'Review Cycle Finalized',
    description: 'Suresh Reddy submitted performance review for Sneha Patel',
    timestamp: '1 hour ago',
    employeeId: 'emp-04',
    employeeName: 'Sneha Patel',
    badge: 'Completed'
  },
  {
    id: 'act-03',
    type: 'development_plan',
    title: 'Development Plan Milestone Updated',
    description: 'Vikram Malhotra marked "Distributed Database Benchmark" 80% complete',
    timestamp: '3 hours ago',
    employeeId: 'emp-05',
    employeeName: 'Vikram Malhotra',
    badge: 'In Progress'
  },
  {
    id: 'act-04',
    type: 'skill_assessment',
    title: 'Peer Skill Assessment Completed',
    description: '8 peers validated Technical Execution & System Design skills for Rahul Sharma',
    timestamp: '5 hours ago',
    employeeId: 'emp-01',
    employeeName: 'Rahul Sharma',
    badge: 'Skills Verified'
  },
  {
    id: 'act-05',
    type: 'promotion_updated',
    title: 'Promotion Readiness Score Updated',
    description: 'Sneha Patel reached 91% readiness (9/9 criteria met)',
    timestamp: 'Yesterday',
    employeeId: 'emp-04',
    employeeName: 'Sneha Patel',
    badge: 'Ready for Review'
  },
  {
    id: 'act-06',
    type: 'calibration_flag',
    title: 'Leniency Divergence Detected',
    description: 'Priya Nair flagged for calibration review (Evidence: 74% vs Manager Rating: 4.9/5)',
    timestamp: 'Yesterday',
    employeeId: 'emp-02',
    employeeName: 'Priya Nair',
    badge: 'Review Required'
  }
];
