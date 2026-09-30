import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Plus,
  Scale,
  Calendar,
  Building,
  User,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Employee } from '../types';
import { Badge } from '../components/Common/Badge';
import { Button } from '../components/Common/Button';
import { Modal } from '../components/Common/Modal';
import { PerformanceEvidenceSummary } from '../components/Performance/PerformanceEvidenceSummary';
import { EvidenceSection } from '../components/Performance/EvidenceSection';
import { EmployeePerformanceChart } from '../components/Performance/EmployeePerformanceChart';
import { useToast } from '../components/Common/Toast';
import { mockEmployees } from '../data/employees';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  useEffect(() => {
    loadProfile(id || 'emp-01');
  }, [id]);

  const loadProfile = async (empId: string) => {
    setIsLoading(true);
    const data = await api.getEmployee(empId);
    if (data) {
      setEmployee(data);
    } else {
      const fallback = await api.getEmployee('emp-01');
      setEmployee(fallback || null);
    }
    setIsLoading(false);
  };

  const handleExport = () => {
    setIsExportModalOpen(false);
    showToast({
      title: 'Report generated successfully',
      message: `Complete Performance & Evidence dossier generated for ${employee?.name}.`,
      type: 'success'
    });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle) return;
    setIsGoalModalOpen(false);
    showToast({
      title: 'Development goal registered',
      message: `"${newGoalTitle}" added to active review objectives.`,
      type: 'success'
    });
    setNewGoalTitle('');
    setNewGoalTarget('');
  };

  if (isLoading || !employee) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <p className="text-sm">Loading employee performance profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employees')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            aria-label="Back to employees"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Employees</span>
              <span className="text-xs text-slate-300">/</span>
              <span className="text-xs font-semibold text-indigo-600">{employee.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {employee.name}
            </h1>
          </div>
        </div>

        {/* Quick Employee Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={employee.id}
            onChange={e => navigate(`/employees/${e.target.value}`)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-500 shadow-2xs"
          >
            {mockEmployees.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.role})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/calibration')}
            icon={<Scale className="w-3.5 h-3.5" />}
          >
            Calibration
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGoalModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Development Goal
          </Button>
        </div>
      </div>

      {/* Profile Meta Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {employee.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
                <Badge variant="purple">{employee.role}</Badge>
                {employee.calibrationStatus === 'Needs Review' && (
                  <Badge variant="warning" dot>
                    Calibration Alert
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {employee.department}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Manager: <strong className="text-slate-700 ml-0.5">{employee.manager}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Tenure: {employee.tenure}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {employee.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
            <div className="text-left md:text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Promotion Readiness</span>
              <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900">{employee.promotionReadiness}%</span>
                <Badge variant={employee.promotionReadiness >= 75 ? 'success' : 'warning'}>
                  {employee.promotionReadiness >= 75 ? 'Ready' : 'Developing'}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/career')}
              className="text-xs"
            >
              Career Path →
            </Button>
          </div>
        </div>
      </div>

      {/* EMPLOYEE SUMMARY SCORE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
            Evidence Score
          </span>
          <p className="text-2xl font-extrabold text-indigo-950 mt-1">
            {employee.evidenceScore}%
          </p>
          <span className="text-[10px] text-indigo-600 font-medium">Aggregated outputs</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Goals Attainment
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {employee.summary.goals}%
          </p>
          <span className="text-[10px] text-slate-400">8 of 9 deliverables</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Project Impact
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {employee.summary.projectImpact}%
          </p>
          <span className="text-[10px] text-slate-400">3 major initiatives</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Skill Growth
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {employee.summary.skillGrowth}%
          </p>
          <span className="text-[10px] text-slate-400">Multi-cycle trajectory</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Business Impact
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {employee.summary.businessImpact}%
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">$420k verified value</span>
        </div>
      </div>

      {/* AI-Style Performance Evidence Summary Card */}
      <PerformanceEvidenceSummary
        summaryText={employee.summary.evidenceSummaryText}
        supportingEvidence={employee.summary.supportingEvidence}
        employeeName={employee.name}
      />

      {/* Multi-cycle Performance Trajectory Line Chart */}
      <EmployeePerformanceChart
        trend={employee.performanceTrend}
        employeeName={employee.name}
      />

      {/* EVIDENCE SECTION: Goals, Projects, Feedback */}
      <EvidenceSection
        goals={employee.goals}
        projects={employee.projects}
        feedback={employee.feedback}
      />

      {/* Quick links to Skills and Career */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/skills')}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">Competency & Skill Development</h4>
            <p className="text-xs text-slate-500 mt-0.5">Explore radar analysis, level gaps, and active training plans</p>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-600" />
        </div>

        <div
          onClick={() => navigate('/career')}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">Career Progression & Promotion Readiness</h4>
            <p className="text-xs text-slate-500 mt-0.5">Review 9-criteria checklist and engineering ladder steps</p>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      {/* Export Report Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Performance Evidence Dossier"
        subtitle={`Generate verified PDF/JSON report for ${employee.name}`}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExport}>
              Generate & Download
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-slate-600 text-xs leading-relaxed">
            The exported report includes telemetry-verified evidence scores, goal outcomes, project audits, 360 feedback transcripts, and competency radar metrics.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <p>• <strong>Format:</strong> Executive HR Calibration Dossier (PDF)</p>
            <p>• <strong>Review Cycle:</strong> H1-2026</p>
            <p>• <strong>Candidate:</strong> {employee.name} ({employee.role})</p>
            <p>• <strong>Integrity Hash:</strong> SHA-256 Verified</p>
          </div>
        </div>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Add Strategic Development Objective"
        subtitle={`Register key deliverable for ${employee.name}`}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddGoal}>
              Save Objective
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={newGoalTitle}
              onChange={e => setNewGoalTitle(e.target.value)}
              placeholder="e.g. Author Distributed Cache RFC"
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Metric / Milestone</label>
            <input
              type="text"
              required
              value={newGoalTarget}
              onChange={e => setNewGoalTarget(e.target.value)}
              placeholder="e.g. 99.99% cache hit ratio"
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 outline-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
