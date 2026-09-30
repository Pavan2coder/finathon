import React, { useState } from 'react';
import { CalibrationAlert } from '../../types';
import { Badge } from '../Common/Badge';
import { Button } from '../Common/Button';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { ArrowUpDown, ChevronRight, Eye, Filter, Scale } from 'lucide-react';

interface CalibrationAlertTableProps {
  alerts: CalibrationAlert[];
  onSelectAlert: (alert: CalibrationAlert) => void;
}

export const CalibrationAlertTable: React.FC<CalibrationAlertTableProps> = ({
  alerts,
  onSelectAlert
}) => {
  const [filterVariance, setFilterVariance] = useState<string>('All');
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [sortField, setSortField] = useState<'deviation' | 'evidenceScore'>('deviation');
  const [sortAsc, setSortAsc] = useState<boolean>(true); // default shows largest negative divergence first

  const filteredAlerts = alerts
    .filter(a => {
      if (filterVariance !== 'All' && a.varianceLevel !== filterVariance) return false;
      if (filterDepartment !== 'All' && a.department !== filterDepartment) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'deviation') {
        return sortAsc ? a.deviation - b.deviation : b.deviation - a.deviation;
      }
      return sortAsc ? a.evidenceScore - b.evidenceScore : b.evidenceScore - a.evidenceScore;
    });

  const toggleSort = (field: 'deviation' | 'evidenceScore') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>Evaluation Consistency Alerts</span>
            <Badge variant="warning" size="sm">
              {filteredAlerts.length} Flagged Cases
            </Badge>
          </div>
        }
        subtitle="Cases with significant divergence between manager evaluations and objective evidence"
        action={
          <div className="flex items-center gap-2">
            <select
              value={filterVariance}
              onChange={e => setFilterVariance(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Variance Levels</option>
              <option value="High">High Variance Only</option>
              <option value="Medium">Medium Variance</option>
              <option value="Low">Low / Aligned</option>
            </select>

            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Evaluating Manager</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => toggleSort('evidenceScore')}
              >
                <div className="flex items-center gap-1">
                  <span>Evidence Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Manager Rating</th>
              <th className="py-3.5 px-4">Expected Range</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => toggleSort('deviation')}
              >
                <div className="flex items-center gap-1">
                  <span>Deviation</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Variance</th>
              <th className="py-3.5 px-4">Calibration Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAlerts.map(alert => {
              const isUnder = alert.deviation < 0;
              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {alert.employeeName}
                    </div>
                    <div className="text-xs text-slate-500">{alert.employeeRole}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 font-medium">{alert.managerName}</div>
                    <div className="text-xs text-slate-400">{alert.department}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{alert.evidenceScore}%</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${alert.evidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{alert.managerRating}</span>
                    <span className="text-xs text-slate-400"> / 5.0</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {alert.expectedRange}
                  </td>

                  <td className="py-3.5 px-4">
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

                  <td className="py-3.5 px-4">
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

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        alert.status === 'Needs Review'
                          ? 'warning'
                          : alert.status === 'Calibrated'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {alert.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAlert(alert);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
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
