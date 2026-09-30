import { CalibrationAlert, ManagerRatingPattern } from '../types';

export const mockManagerPatterns: ManagerRatingPattern[] = [
  {
    managerId: 'mgr-01',
    managerName: 'Anil Kumar',
    department: 'Engineering',
    teamSize: 18,
    averageRating: 3.4,
    medianRating: 3.3,
    ratingVariance: 0.82,
    pctRatedFourPlus: 22,
    avgEvidenceScore: 84.5,
    divergenceScore: -0.85,
    tendency: 'Strict (Negative Divergence)'
  },
  {
    managerId: 'mgr-02',
    managerName: 'Kiran Rao',
    department: 'Product',
    teamSize: 14,
    averageRating: 4.6,
    medianRating: 4.7,
    ratingVariance: 0.38,
    pctRatedFourPlus: 85,
    avgEvidenceScore: 78.2,
    divergenceScore: +0.78,
    tendency: 'Lenient (Positive Divergence)'
  },
  {
    managerId: 'mgr-03',
    managerName: 'Suresh Reddy',
    department: 'Engineering',
    teamSize: 16,
    averageRating: 3.9,
    medianRating: 3.9,
    ratingVariance: 0.45,
    pctRatedFourPlus: 56,
    avgEvidenceScore: 82.0,
    divergenceScore: +0.02,
    tendency: 'Balanced Alignment'
  },
  {
    managerId: 'mgr-04',
    managerName: 'Meena Shah',
    department: 'Sales',
    teamSize: 22,
    averageRating: 4.1,
    medianRating: 4.2,
    ratingVariance: 0.61,
    pctRatedFourPlus: 68,
    avgEvidenceScore: 81.4,
    divergenceScore: +0.14,
    tendency: 'Balanced Alignment'
  },
  {
    managerId: 'mgr-05',
    managerName: 'David Chen',
    department: 'Operations',
    teamSize: 12,
    averageRating: 3.7,
    medianRating: 3.8,
    ratingVariance: 0.52,
    pctRatedFourPlus: 42,
    avgEvidenceScore: 79.5,
    divergenceScore: -0.18,
    tendency: 'Balanced Alignment'
  }
];

export const mockCalibrationAlerts: CalibrationAlert[] = [
  {
    id: 'cal-01',
    employeeId: 'emp-01',
    employeeName: 'Rahul Sharma',
    employeeRole: 'Software Engineer II',
    department: 'Engineering',
    managerId: 'mgr-01',
    managerName: 'Anil Kumar',
    evidenceScore: 90,
    managerRating: 3.1,
    expectedRange: '4.0 – 4.6',
    deviation: -1.1,
    varianceLevel: 'High',
    status: 'Needs Review',
    flagReason: "Manager rating differs significantly from the employee's evidence indicators and the observed rating pattern.",
    evidenceIndicators: {
      goals: 94,
      projectOutcomes: 88,
      peerFeedback: 'Exceptionally Positive (92% satisfaction)',
      businessImpact: 'High ($420k latency reduction value)'
    },
    suggestedAction: 'Review during HR calibration committee. Compare objective benchmark metrics against manager qualitative feedback notes.',
    committeeFlag: true,
    calibrationNotes: 'Sprint velocity and benchmark report show top decile delivery. Manager Anil Kumar has a historical strict rating bias (avg 3.4 across team).',
    updatedAt: '2026-09-28T14:30:00Z'
  },
  {
    id: 'cal-02',
    employeeId: 'emp-02',
    employeeName: 'Priya Nair',
    employeeRole: 'Product Analyst',
    department: 'Product',
    managerId: 'mgr-02',
    managerName: 'Kiran Rao',
    evidenceScore: 74,
    managerRating: 4.9,
    expectedRange: '3.4 – 3.9',
    deviation: +1.2,
    varianceLevel: 'High',
    status: 'Needs Review',
    flagReason: 'Manager evaluation rating is significantly higher than verified goal outcomes and project delivery evidence.',
    evidenceIndicators: {
      goals: 71,
      projectOutcomes: 72,
      peerFeedback: 'Consistent (76% score)',
      businessImpact: 'Moderate (2 feature rollouts delivered)'
    },
    suggestedAction: 'Examine deliverables in detail during calibration session. Align expectations for 4.9 vs verifiable objective impact.',
    committeeFlag: true,
    calibrationNotes: 'Kiran Rao exhibits a high leniency tendency (85% rated 4+). Priya has steady contributions but 4.9 reflects outlier leniency.',
    updatedAt: '2026-09-29T11:15:00Z'
  },
  {
    id: 'cal-03',
    employeeId: 'emp-05',
    employeeName: 'Vikram Malhotra',
    employeeRole: 'Senior Backend Engineer',
    department: 'Engineering',
    managerId: 'mgr-01',
    managerName: 'Anil Kumar',
    evidenceScore: 88,
    managerRating: 3.4,
    expectedRange: '3.9 – 4.4',
    deviation: -0.7,
    varianceLevel: 'Medium',
    status: 'Needs Review',
    flagReason: 'Core infrastructure reliability evidence exceeds 99.98% SLA, diverging from qualitative rating score.',
    evidenceIndicators: {
      goals: 91,
      projectOutcomes: 89,
      peerFeedback: 'High technical praise across 4 squad leads',
      businessImpact: 'Critical (Zero downtime database migration)'
    },
    suggestedAction: 'Validate architecture audit trail against manager appraisal comments.',
    committeeFlag: false,
    updatedAt: '2026-09-27T09:40:00Z'
  },
  {
    id: 'cal-04',
    employeeId: 'emp-06',
    employeeName: 'Ananya Iyer',
    employeeRole: 'Associate Product Manager',
    department: 'Product',
    managerId: 'mgr-02',
    managerName: 'Kiran Rao',
    evidenceScore: 76,
    managerRating: 4.6,
    expectedRange: '3.5 – 4.0',
    deviation: +0.8,
    varianceLevel: 'Medium',
    status: 'Needs Review',
    flagReason: 'Rating distribution divergence observed relative to peer cohort with equivalent feature adoption metrics.',
    evidenceIndicators: {
      goals: 78,
      projectOutcomes: 75,
      peerFeedback: 'Supportive, learning phase noted',
      businessImpact: 'Moderate (User onboarding flow revamp)'
    },
    suggestedAction: 'Calibrate scoring benchmark across Product department cohort.',
    committeeFlag: false,
    updatedAt: '2026-09-26T16:20:00Z'
  },
  {
    id: 'cal-05',
    employeeId: 'emp-10',
    employeeName: 'Tanvi Joshi',
    employeeRole: 'Customer Operations Lead',
    department: 'Operations',
    managerId: 'mgr-05',
    managerName: 'David Chen',
    evidenceScore: 91,
    managerRating: 3.5,
    expectedRange: '4.1 – 4.6',
    deviation: -0.8,
    varianceLevel: 'Medium',
    status: 'Needs Review',
    flagReason: 'CSAT and response-time SLAs exceeded targets by 35%, yet rating remains in mid-band.',
    evidenceIndicators: {
      goals: 95,
      projectOutcomes: 92,
      peerFeedback: 'Top rated cross-departmental partner',
      businessImpact: 'High (34% ticket backlog reduction)'
    },
    suggestedAction: 'Review during Operations calibration table with David Chen.',
    committeeFlag: true,
    updatedAt: '2026-09-25T13:00:00Z'
  },
  {
    id: 'cal-06',
    employeeId: 'emp-03',
    employeeName: 'Arjun Reddy',
    employeeRole: 'Software Engineer II',
    department: 'Engineering',
    managerId: 'mgr-01',
    managerName: 'Anil Kumar',
    evidenceScore: 82,
    managerRating: 3.8,
    expectedRange: '3.7 – 4.1',
    deviation: -0.1,
    varianceLevel: 'Low',
    status: 'Normal',
    flagReason: 'Evaluation rating is consistent with objective evidence and department baseline.',
    evidenceIndicators: {
      goals: 84,
      projectOutcomes: 81,
      peerFeedback: 'Reliable execution',
      businessImpact: 'Consistent (Core API maintenance)'
    },
    suggestedAction: 'Standard cycle completion. No committee review required.',
    committeeFlag: false,
    updatedAt: '2026-09-24T10:10:00Z'
  }
];

export interface ScatterPoint {
  id: string;
  name: string;
  department: string;
  manager: string;
  evidenceScore: number;
  managerRating: number;
  isAlert: boolean;
  varianceType: 'under_rated' | 'over_rated' | 'aligned';
  role: string;
}

export const mockScatterData: ScatterPoint[] = [
  { id: 'emp-01', name: 'Rahul Sharma', department: 'Engineering', manager: 'Anil Kumar', evidenceScore: 90, managerRating: 3.1, isAlert: true, varianceType: 'under_rated', role: 'Software Engineer II' },
  { id: 'emp-02', name: 'Priya Nair', department: 'Product', manager: 'Kiran Rao', evidenceScore: 74, managerRating: 4.9, isAlert: true, varianceType: 'over_rated', role: 'Product Analyst' },
  { id: 'emp-03', name: 'Arjun Reddy', department: 'Engineering', manager: 'Anil Kumar', evidenceScore: 82, managerRating: 3.8, isAlert: false, varianceType: 'aligned', role: 'Software Engineer II' },
  { id: 'emp-04', name: 'Sneha Patel', department: 'Engineering', manager: 'Suresh Reddy', evidenceScore: 93, managerRating: 4.7, isAlert: false, varianceType: 'aligned', role: 'Staff Frontend Engineer' },
  { id: 'emp-05', name: 'Vikram Malhotra', department: 'Engineering', manager: 'Anil Kumar', evidenceScore: 88, managerRating: 3.4, isAlert: true, varianceType: 'under_rated', role: 'Senior Backend Engineer' },
  { id: 'emp-06', name: 'Ananya Iyer', department: 'Product', manager: 'Kiran Rao', evidenceScore: 76, managerRating: 4.6, isAlert: true, varianceType: 'over_rated', role: 'Associate PM' },
  { id: 'emp-07', name: 'Rajesh Gupta', department: 'Sales', manager: 'Meena Shah', evidenceScore: 85, managerRating: 4.2, isAlert: false, varianceType: 'aligned', role: 'Senior Enterprise AE' },
  { id: 'emp-08', name: 'Deepa Verma', department: 'Product', manager: 'Kiran Rao', evidenceScore: 79, managerRating: 4.7, isAlert: true, varianceType: 'over_rated', role: 'Senior Product Designer' },
  { id: 'emp-09', name: 'Rohit Sen', department: 'Engineering', manager: 'Suresh Reddy', evidenceScore: 78, managerRating: 3.7, isAlert: false, varianceType: 'aligned', role: 'DevOps Engineer' },
  { id: 'emp-10', name: 'Tanvi Joshi', department: 'Operations', manager: 'David Chen', evidenceScore: 91, managerRating: 3.5, isAlert: true, varianceType: 'under_rated', role: 'Operations Lead' },
  { id: 'emp-11', name: 'Karthik Nair', department: 'Sales', manager: 'Meena Shah', evidenceScore: 80, managerRating: 4.0, isAlert: false, varianceType: 'aligned', role: 'Account Executive' },
  { id: 'emp-12', name: 'Neha Kapoor', department: 'Marketing', manager: 'Meena Shah', evidenceScore: 86, managerRating: 4.3, isAlert: false, varianceType: 'aligned', role: 'Growth Marketing Lead' },
  { id: 'emp-13', name: 'Sanjay Rao', department: 'Engineering', manager: 'Anil Kumar', evidenceScore: 87, managerRating: 3.3, isAlert: true, varianceType: 'under_rated', role: 'QA Automation Lead' },
  { id: 'emp-14', name: 'Pooja Bhatt', department: 'Product', manager: 'Kiran Rao', evidenceScore: 72, managerRating: 4.5, isAlert: true, varianceType: 'over_rated', role: 'UX Researcher' },
  { id: 'emp-15', name: 'Amit Deshmukh', department: 'Engineering', manager: 'Suresh Reddy', evidenceScore: 89, managerRating: 4.4, isAlert: false, varianceType: 'aligned', role: 'Data Platform Engineer' },
  { id: 'emp-16', name: 'Kavita Rao', department: 'Sales', manager: 'Meena Shah', evidenceScore: 88, managerRating: 4.5, isAlert: false, varianceType: 'aligned', role: 'Customer Success Director' },
  { id: 'emp-17', name: 'Nikhil Mehta', department: 'Operations', manager: 'David Chen', evidenceScore: 75, managerRating: 3.6, isAlert: false, varianceType: 'aligned', role: 'Procurement Specialist' },
  { id: 'emp-18', name: 'Divya Nair', department: 'Marketing', manager: 'Meena Shah', evidenceScore: 83, managerRating: 4.1, isAlert: false, varianceType: 'aligned', role: 'Content Strategist' },
  { id: 'emp-19', name: 'Manisha Prasad', department: 'Engineering', manager: 'Anil Kumar', evidenceScore: 84, managerRating: 3.2, isAlert: true, varianceType: 'under_rated', role: 'Full Stack Engineer' },
  { id: 'emp-20', name: 'Siddharth Roy', department: 'Product', manager: 'Kiran Rao', evidenceScore: 88, managerRating: 4.8, isAlert: false, varianceType: 'aligned', role: 'Principal Product Manager' }
];
