import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Scale,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { CalibrationAlert } from '../types';
import { ManagerDistributionChart } from '../components/Calibration/ManagerDistributionChart';
import { EvidenceVsRatingScatter } from '../components/Calibration/EvidenceVsRatingScatter';
import { CalibrationAlertTable } from '../components/Calibration/CalibrationAlertTable';
import { CalibrationDrawer } from '../components/Calibration/CalibrationDrawer';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { useToast } from '../components/Common/Toast';

export const CalibrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [alerts, setAlerts] = useState<CalibrationAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<CalibrationAlert | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalibration();
  }, []);

  // If URL has alertId or empId, open drawer automatically
  useEffect(() => {
    const alertId = searchParams.get('alertId');
    if (alertId && alerts.length > 0) {
      const match = alerts.find(a => a.id === alertId);
      if (match) {
        setSelectedAlert(match);
        setIsDrawerOpen(true);
      }
    }
  }, [searchParams, alerts]);

  const loadCalibration = async () => {
    setIsLoading(true);
    const data = await api.getCalibrationData();
    setAlerts(data.alerts);
    setIsLoading(false);
  };

  const handleSelectAlert = (alert: CalibrationAlert) => {
    setSelectedAlert(alert);
    setIsDrawerOpen(true);
  };

  const handleSelectEmployeeFromScatter = (empId: string) => {
    const match = alerts.find(a => a.employeeId === empId);
    if (match) {
      handleSelectAlert(match);
    } else {
      navigate(`/employees/${empId}`);
    }
  };

  const handleUpdateAlert = async (id: string, updates: Partial<CalibrationAlert>) => {
    await api.updateCalibrationAlert(id, updates);
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleExportCommitteeDossier = () => {
    showToast({
      title: 'Calibration Committee Pack Exported',
      message: 'Generated comprehensive HR calibration audit pack (12 flagged cases + manager distributions).',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Evaluation Calibration
            </h1>
            <Badge variant="warning" size="md">
              Core Intelligence
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Identify potential inconsistencies between performance evidence and manager evaluations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCommitteeDossier}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Committee Pack
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (alerts.length > 0) {
                handleSelectAlert(alerts[0]); // Opens Rahul Sharma
              }
            }}
            icon={<Scale className="w-3.5 h-3.5" />}
          >
            Start Calibration Review
          </Button>
        </div>
      </div>

      {/* Primary Principle Governance Callout */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Evidence-Based Calibration Guard active
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              EvalSense identifies statistical deviations between objective deliverable outputs and qualitative manager appraisals. The platform does <strong>not</strong> label individual managers as biased or automatically rewrite evaluations; it queues flagged cases for calibrated discussion in HR committee.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Flagged Inconsistencies</span>
            <span className="text-lg font-extrabold text-amber-400">12 Reviews</span>
          </div>
        </div>
      </div>

      {/* CORE INNOVATION ROW: Scatter Plot Matrix & Manager Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evidence vs Rating Scatter Plot (7 Cols) */}
        <div className="lg:col-span-7">
          <EvidenceVsRatingScatter
            onSelectEmployee={handleSelectEmployeeFromScatter}
          />
        </div>

        {/* Manager Rating Distribution & Tendency (5 Cols) */}
        <div className="lg:col-span-5">
          <ManagerDistributionChart />
        </div>
      </div>

      {/* DETAILED CALIBRATION ALERTS TABLE */}
      <div>
        <CalibrationAlertTable
          alerts={alerts}
          onSelectAlert={handleSelectAlert}
        />
      </div>

      {/* SLIDE-OVER CALIBRATION DETAIL DRAWER */}
      <CalibrationDrawer
        alert={selectedAlert}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateAlert={handleUpdateAlert}
      />
    </div>
  );
};
