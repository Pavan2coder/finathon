import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';
import { mockRecentActivities } from '../../data/performance';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { Badge } from '../Common/Badge';

export const ActivityFeed: React.FC = () => {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'calibration_flag':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'review_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'development_plan':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'skill_assessment':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'promotion_updated':
        return <TrendingUp className="w-4 h-4 text-violet-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card>
      <CardHeader
        title="Recent Intelligence Activity"
        subtitle="Live audit trail of reviews, evidence submissions, and calibration alerts"
      />
      <CardContent>
        <div className="space-y-4">
          {mockRecentActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => {
                if (act.employeeId) {
                  navigate(`/employees/${act.employeeId}`);
                }
              }}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-50 transition-colors">
                {getIcon(act.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {act.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  {act.description}
                </p>
                {act.badge && (
                  <div className="mt-1.5">
                    <Badge variant={act.type === 'calibration_flag' ? 'warning' : 'neutral'} size="sm">
                      {act.badge}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
