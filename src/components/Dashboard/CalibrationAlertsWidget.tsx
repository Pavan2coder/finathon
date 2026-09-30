import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowRight, AlertTriangle, Eye } from 'lucide-react';
import { mockCalibrationAlerts } from '../../data/calibration';
import { CalibrationAlert } from '../../types';
import { Badge } from '../Common/Badge';
import { Card, CardHeader } from '../Common/Card';

interface CalibrationAlertsWidgetProps {
  onSelectAlert: (alert: CalibrationAlert) => void;
}

export const CalibrationAlertsWidget: React.FC<CalibrationAlertsWidgetProps> = ({
  onSelectAlert
}) => {
  const navigate = useNavigate();

  // Show top 4 key alerts
  const displayAlerts = mockCalibrationAlerts.slice(0, 4);

  return (
    <Card className="border-amber-200/80 shadow-2xs">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Scale className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Evaluation Consistency Alerts</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                12 Requires Calibration
              </span>
            </div>
          </div>
        }
        subtitle="Identifies cases where qualitative manager ratings diverge significantly from objective performance evidence"
        action={
          <button
            onClick={() => navigate('/calibration')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <span>View Full Calibration Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/70 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Evaluating Manager</th>
              <th className="py-3 px-4">Verified Evidence</th>
              <th className="py-3 px-4">Manager Rating</th>
              <th className="py-3 px-4">Deviation</th>
              <th className="py-3 px-4">Variance</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayAlerts.map(alert => {
              const isUnder = alert.deviation < 0;
              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {alert.employeeName}
                    </div>
                    <div className="text-xs text-slate-500">{alert.employeeRole}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{alert.managerName}</div>
                    <div className="text-xs text-slate-400">{alert.department}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{alert.evidenceScore}%</span>
                      <div className="w-12 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${alert.evidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{alert.managerRating}</span>
                    <span className="text-xs text-slate-400"> / 5.0</span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-xs ${
                        isUnder
                          ? 'bg-amber-100 text-amber-900'
                          : alert.deviation > 0.3
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {alert.deviation > 0 ? `+${alert.deviation}` : alert.deviation}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        alert.varianceLevel === 'High'
                          ? 'danger'
                          : alert.varianceLevel === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                      dot
                    >
                      {alert.varianceLevel}
                    </Badge>
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        alert.status === 'Needs Review'
                          ? 'warning'
                          : alert.status === 'Calibrated'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {alert.status === 'Needs Review' ? 'Review' : alert.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAlert(alert);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1.5 rounded hover:bg-indigo-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
