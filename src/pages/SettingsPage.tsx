import React, { useState } from 'react';
import { Shield, Sliders, CheckCircle2, Save, Database } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { useToast } from '../components/Common/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [varianceThreshold, setVarianceThreshold] = useState('0.6');
  const [minEvidenceRequirement, setMinEvidenceRequirement] = useState('75');

  const handleSave = () => {
    showToast({
      title: 'Configuration saved',
      message: 'Calibration variance thresholds and governance parameters updated.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Rules & Calibration Parameters
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure calibration anomaly thresholds, statistical deviation bands, and governance guardrails
        </p>
      </div>

      {/* Calibration Engine Tuning */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Calibration Anomaly Detection Engine</span>
            </div>
          }
          subtitle="Define statistical tolerance limits for qualitative rating variance against evidence"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Rating Variance Alert Sensitivity (Points)
              </label>
              <select
                value={varianceThreshold}
                onChange={e => setVarianceThreshold(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="0.4">Strict (Flag deviations &gt; ±0.4 rating pts)</option>
                <option value="0.6">Balanced - Recommended (Flag deviations &gt; ±0.6 rating pts)</option>
                <option value="0.8">Permissive (Flag deviations &gt; ±0.8 rating pts)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Current setting flags 12 cases in the H1-2026 cycle.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Promotion-Ready Evidence Threshold (%)
              </label>
              <select
                value={minEvidenceRequirement}
                onChange={e => setMinEvidenceRequirement(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="70">70% Minimum Evidence</option>
                <option value="75">75% Minimum Evidence (Recommended)</option>
                <option value="80">80% High Rigor Evidence</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Requires at least 7 of 9 criteria met.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance & Anti-Ranking Principles */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Ethical Governance & Anti-Ranking Policy</span>
            </div>
          }
          subtitle="Mandated platform behavioral constraints"
        />
        <CardContent className="space-y-3 text-xs leading-relaxed text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">No Stack Ranking or Leaderboards</span>
            </div>
            <p className="text-slate-600 pl-6">
              EvalSense enforces ethical performance evaluation by rejecting comparative stack rankings ("Top 10", "Best Employee"). All analytics focus exclusively on objective evidence, individual growth milestones, and rating consistency calibration.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Non-Prescriptive Calibration Alerts</span>
            </div>
            <p className="text-slate-600 pl-6">
              The system does not claim manager bias or automatically alter manager appraisals. Flagged divergences are submitted to HR calibration committees as points of discussion alongside telemetry evidence.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FastAPI Backend Connection Ready status */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>FastAPI Backend Service Layer Status</span>
            </div>
          }
          subtitle="API service contracts ready for full Python FastAPI integration"
        />
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mock Service Layer: Connected & Active (`src/services/api.ts`)</span>
            </div>
            <Badge variant="success">Ready for REST Endpoints</Badge>
          </div>

          <p className="text-xs text-slate-500">
            All data interactions in this frontend flow through standard asynchronous Promise interfaces (`getEmployees`, `getCalibrationData`, `updateCalibrationAlert`), making future connection to <code>http://localhost:8000/api</code> a simple one-file configuration change.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
