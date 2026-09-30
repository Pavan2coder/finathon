export interface ReportDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  lastGenerated: string;
  recordCount: number;
  tags: string[];
  sampleData: Array<Record<string, string | number>>;
}

export const mockReports: ReportDefinition[] = [
  {
    id: 'rep-01',
    title: 'Executive Calibration Summary & Inconsistency Audit',
    category: 'Calibration',
    description: 'Comprehensive analysis of manager rating divergence against verifiable performance evidence, highlighting 12 flagged calibration cases across Engineering, Product, and Operations.',
    lastGenerated: 'Today, 09:30 AM',
    recordCount: 12,
    tags: ['Calibration', 'Governance', 'Fairness Audit'],
    sampleData: [
      { employee: 'Rahul Sharma', manager: 'Anil Kumar', evidence: '90%', rating: '3.1/5', deviation: '-1.1', status: 'Needs Review' },
      { employee: 'Priya Nair', manager: 'Kiran Rao', evidence: '74%', rating: '4.9/5', deviation: '+1.2', status: 'Needs Review' },
      { employee: 'Vikram Malhotra', manager: 'Anil Kumar', evidence: '88%', rating: '3.4/5', deviation: '-0.7', status: 'Needs Review' },
      { employee: 'Ananya Iyer', manager: 'Kiran Rao', evidence: '76%', rating: '4.6/5', deviation: '+0.8', status: 'Needs Review' }
    ]
  },
  {
    id: 'rep-02',
    title: 'Organizational Performance Evidence Report (H1 2026)',
    category: 'Performance',
    description: 'Department-level breakdown of objective goal completion, project deliverable verification, and peer feedback sentiment for 248 evaluated employees.',
    lastGenerated: 'Yesterday, 04:15 PM',
    recordCount: 248,
    tags: ['Cycle H1-2026', 'Department Aggregates', 'Goal Tracking'],
    sampleData: [
      { department: 'Engineering', totalEvaluated: 104, avgEvidence: '85.2%', goalCompletion: '88%', reviewCompletion: '94%' },
      { department: 'Sales', totalEvaluated: 52, avgEvidence: '83.8%', goalCompletion: '89%', reviewCompletion: '96%' },
      { department: 'Product', totalEvaluated: 38, avgEvidence: '80.1%', goalCompletion: '84%', reviewCompletion: '92%' },
      { department: 'Operations', totalEvaluated: 32, avgEvidence: '81.4%', goalCompletion: '86%', reviewCompletion: '91%' }
    ]
  },
  {
    id: 'rep-03',
    title: 'Cross-Department Skill Gap & Development Analysis',
    category: 'Skills & Development',
    description: 'Identifies critical competency gaps across technical architecture, system design, and people leadership, linked to active development plans and training initiatives.',
    lastGenerated: 'Sep 26, 2026',
    recordCount: 64,
    tags: ['Competency Model', 'L&D Curriculum', 'Talent Gaps'],
    sampleData: [
      { skill: 'System Design & Scalability', gapSeverity: 'High', avgGap: '-1.1', affectedEmployees: 28, recommendedTraining: 'Advanced Distributed System Architecture' },
      { skill: 'Technical Leadership', gapSeverity: 'Medium', avgGap: '-0.9', affectedEmployees: 19, recommendedTraining: 'Engineering Lead Apprenticeship' },
      { skill: 'Causal Inference & Experimentation', gapSeverity: 'Medium', avgGap: '-1.0', affectedEmployees: 11, recommendedTraining: 'Reforge Experimentation Mastery' }
    ]
  },
  {
    id: 'rep-04',
    title: 'Promotion Readiness & Career Ladder Matrix',
    category: 'Career & Succession',
    description: 'Evaluation of criteria fulfillment across 37 promotion-ready candidates, detailing objective milestones satisfied, pending growth areas, and manager signoffs.',
    lastGenerated: 'Sep 25, 2026',
    recordCount: 37,
    tags: ['Succession Planning', 'Readiness Criteria', 'Talent Council'],
    sampleData: [
      { employee: 'Sneha Patel', currentRole: 'Staff Frontend Engineer', targetRole: 'Principal Engineer', readiness: '91%', criteriaMet: '9/9', status: 'Ready for Review' },
      { employee: 'Rahul Sharma', currentRole: 'Software Engineer II', targetRole: 'Senior Software Engineer', readiness: '78%', criteriaMet: '7/9', status: 'In Development' },
      { employee: 'Vikram Malhotra', currentRole: 'Senior Backend Engineer', targetRole: 'Staff Backend Engineer', readiness: '81%', criteriaMet: '8/9', status: 'Ready for Review' }
    ]
  }
];
