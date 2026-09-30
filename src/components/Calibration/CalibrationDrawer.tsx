import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  Scale,
  Target,
  Briefcase,
  Users,
  TrendingUp,
  FileCheck,
  Save,
  MessageSquare
} from 'lucide-react';
import { CalibrationAlert } from '../../types';
import { Drawer } from '../Common/Drawer';
import { Badge } from '../Common/Badge';
import { Button } from '../Common/Button';
import { useToast } from '../Common/Toast';

interface CalibrationDrawerProps {
  alert: CalibrationAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAlert?: (id: string, updates: Partial<CalibrationAlert>) => void;
}

export const CalibrationDrawer: React.FC<CalibrationDrawerProps> = ({
  alert,
  isOpen,
  onClose,
  onUpdateAlert
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [calibrationNotes, setCalibrationNotes] = useState(alert?.calibrationNotes || '');
  const [committeeFlag, setCommitteeFlag] = useState(alert?.committeeFlag ?? true);
  const [status, setStatus] = useState<CalibrationAlert['status']>(alert?.status || 'Needs Review');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when alert changes
  React.useEffect(() => {
    if (alert) {
      setCalibrationNotes(alert.calibrationNotes || '');
      setCommitteeFlag(alert.committeeFlag ?? true);
      setStatus(alert.status);
    }
  }, [alert]);

  if (!alert) return null;

  const handleSaveNotes = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateAlert?.(alert.id, {
        calibrationNotes,
        committeeFlag,
        status
      });
      setIsSaving(false);
      showToast({
        title: 'Calibration record updated',
        message: `Saved calibration notes for ${alert.employeeName}. Ready for committee session.`,
        type: 'success'
      });
    }, 400);
  };

  const isUnderRated = alert.deviation < 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-600" />
          <span>Evaluation Consistency Audit</span>
        </div>
      }
      subtitle={`Flagged evaluation review · Cycle H1-2026`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate(`/employees/${alert.employeeId}`);
              onClose();
            }}
            icon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Open Full Performance Profile
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveNotes}
            isLoading={isSaving}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Calibration Decisions
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Alert Indicator */}
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          isUnderRated
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-rose-50/80 border-rose-200 text-rose-900'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isUnderRated ? 'text-amber-600' : 'text-rose-600'}`} />
          <div className="flex-1 text-xs leading-relaxed">
            <p className="font-bold text-sm">
              {isUnderRated ? 'Downward Rating Inconsistency Detected' : 'Upward Leniency Inconsistency Detected'}
            </p>
            <p className="mt-1 opacity-90">
              The assigned rating differs noticeably from objective performance indicators and peer baseline benchmarks.
            </p>
          </div>
        </div>

        {/* Employee & Manager Meta Card */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Employee</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{alert.employeeName}</p>
            <p className="text-xs text-slate-500">{alert.employeeRole} · {alert.department}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Evaluating Manager</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{alert.managerName}</p>
            <p className="text-xs text-slate-500">Engineering Manager</p>
          </div>
        </div>

        {/* The Core Variance Comparison */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evaluation Variance Metrics</span>
            <Badge variant={alert.varianceLevel === 'High' ? 'danger' : 'warning'}>
              {alert.varianceLevel} Variance ({alert.deviation > 0 ? `+${alert.deviation}` : alert.deviation})
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <span className="text-[11px] font-medium text-indigo-700 block">Verified Evidence Score</span>
              <p className="text-2xl font-extrabold text-indigo-950 mt-1">{alert.evidenceScore}%</p>
              <span className="text-[10px] text-indigo-600 font-medium">Objective outputs</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-600 block">Manager Rating</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{alert.managerRating} <span className="text-sm font-normal text-slate-500">/ 5.0</span></p>
              <span className="text-[10px] text-slate-500 font-medium">Qualitative appraisal</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-medium text-emerald-800 block">Expected Model Range</span>
              <p className="text-lg font-bold text-emerald-950 mt-1.5">{alert.expectedRange}</p>
              <span className="text-[10px] text-emerald-700 font-medium">Based on cohort evidence</span>
            </div>
          </div>
        </div>

        {/* Evidence Indicators Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
            Underlying Evidence Indicators
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Goal Achievement</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-1">{alert.evidenceIndicators.goals}%</p>
              <span className="text-[11px] text-slate-500">8 of 9 deliverables exceeded</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                <span>Project Outcomes</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-1">{alert.evidenceIndicators.projectOutcomes}%</p>
              <span className="text-[11px] text-slate-500">100% completion rate</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Peer Feedback</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-1 truncate">{alert.evidenceIndicators.peerFeedback}</p>
              <span className="text-[11px] text-slate-500">Cross-functional validation</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                <span>Business Impact</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-1 truncate">{alert.evidenceIndicators.businessImpact}</p>
              <span className="text-[11px] text-slate-500">Financial & reliability impact</span>
            </div>
          </div>
        </div>

        {/* Why was this flagged? (Strict adherence to problem statement principles) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Why was this flagged?</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {alert.flagReason}
          </p>
          <div className="pt-2 border-t border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Suggested Action</span>
            <p className="text-xs text-slate-800 mt-0.5 leading-relaxed font-medium">
              {alert.suggestedAction}
            </p>
          </div>
        </div>

        {/* HR Calibration Protocol Notice */}
        <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            <strong>HR Calibration Protocol:</strong> EvalSense does NOT declare individual manager bias or automatically alter submitted ratings. The system identifies statistically significant divergences so HR committees can ensure fair, evidence-based review.
          </p>
        </div>

        {/* Committee Review Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
            HR Calibration Committee Notes & Action
          </h4>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Calibration Working Notes
            </label>
            <textarea
              rows={3}
              value={calibrationNotes}
              onChange={e => setCalibrationNotes(e.target.value)}
              placeholder="Add notes from calibration discussion (e.g. 'Committee reviewed benchmark reports. Agreed to follow up with Anil regarding system design scope expectations.')..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={committeeFlag}
                onChange={e => setCommitteeFlag(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Add to upcoming calibration committee agenda</span>
            </label>

            <select
              value={status}
              onChange={e => setStatus(e.target.value as CalibrationAlert['status'])}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="Needs Review">Status: Needs Review</option>
              <option value="In Review">Status: In Review</option>
              <option value="Calibrated">Status: Calibrated</option>
            </select>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
