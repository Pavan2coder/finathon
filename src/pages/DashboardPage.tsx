import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Scale,
  Award,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { KPIMetrics, CalibrationAlert } from '../types';
import { KPICard } from '../components/Dashboard/KPICard';
import { PerformanceTrendChart } from '../components/Dashboard/PerformanceTrendChart';
import { GoalAchievementChart } from '../components/Dashboard/GoalAchievementChart';
import { CalibrationAlertsWidget } from '../components/Dashboard/CalibrationAlertsWidget';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { CalibrationDrawer } from '../components/Calibration/CalibrationDrawer';
import { useToast } from '../components/Common/Toast';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<CalibrationAlert | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const m = await api.getKPIMetrics();
    setMetrics(m);
    setIsLoading(false);
  };

  const handleOpenAlert = (alert: CalibrationAlert) => {
    setSelectedAlert(alert);
    setIsDrawerOpen(true);
  };

  const handleRefresh = () => {
    loadDashboardData();
    showToast({
      title: 'Metrics synchronized',
      message: 'Pulled latest objective evidence and review cycle updates.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Performance Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evidence-based insights and evaluation consistency across your organization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

          <button
            onClick={() => navigate('/calibration')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Launch Calibration Session</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Employees"
          value={metrics ? metrics.totalEmployees : '248'}
          subvalue="across 5 depts"
          trend={{ value: '+14', isPositive: true, label: 'vs last cycle' }}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => navigate('/employees')}
        />

        <KPICard
          title="Reviews Completed"
          value={metrics ? `${metrics.reviewsCompleted}` : '231'}
          subvalue="/ 248 total"
          trend={{ value: '93.1%', isPositive: true, label: 'completion rate' }}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/performance')}
        />

        <KPICard
          title="Avg Evidence Score"
          value={metrics ? `${metrics.averageEvidenceScore}%` : '82.6%'}
          trend={{ value: '+5.6%', isPositive: true, label: 'since 2025' }}
          icon={TrendingUp}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          onClick={() => navigate('/performance')}
        />

        <KPICard
          title="Calibration Alerts"
          value={metrics ? metrics.calibrationAlerts : '12'}
          subvalue="cases flagged"
          trend={{ value: 'Review', isPositive: false, label: 'prior to signoff' }}
          icon={Scale}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          onClick={() => navigate('/calibration')}
        />

        <KPICard
          title="Promotion-Ready"
          value={metrics ? metrics.promotionReady : '37'}
          subvalue="candidates"
          trend={{ value: '75%+', isPositive: true, label: 'criteria met' }}
          icon={Award}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          onClick={() => navigate('/career')}
        />
      </div>

      {/* Main Charts Row: Performance Trend & Goal Achievement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PerformanceTrendChart />
        </div>
        <div className="lg:col-span-5">
          <GoalAchievementChart />
        </div>
      </div>

      {/* Prominent Calibration Inconsistency Alerts Section */}
      <div>
        <CalibrationAlertsWidget onSelectAlert={handleOpenAlert} />
      </div>

      {/* Activity Feed Section */}
      <div>
        <ActivityFeed />
      </div>

      {/* Slide-over Calibration Detail Drawer */}
      <CalibrationDrawer
        alert={selectedAlert}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
