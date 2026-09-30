import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ChevronRight, UserCheck, AlertTriangle } from 'lucide-react';
import { Employee, Department } from '../../types';
import { Badge } from '../Common/Badge';
import { Card } from '../Common/Card';

interface EmployeeTableProps {
  employees: Employee[];
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string>('All');
  const [manager, setManager] = useState<string>('All');
  const [performanceTier, setPerformanceTier] = useState<string>('All');
  const [promotionFilter, setPromotionFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'evidenceScore' | 'promotionReadiness'>('evidenceScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Unique lists for dropdowns
  const managers = ['All', ...Array.from(new Set(employees.map(e => e.manager)))];
  const departments = ['All', 'Engineering', 'Product', 'Sales', 'Marketing', 'Operations'];

  const filteredEmployees = employees
    .filter(emp => {
      const q = search.toLowerCase();
      const matchesSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (department !== 'All' && emp.department !== department) return false;
      if (manager !== 'All' && emp.manager !== manager) return false;
      if (performanceTier !== 'All' && emp.performanceTier !== performanceTier) return false;
      if (promotionFilter === 'High' && emp.promotionReadiness < 75) return false;
      if (promotionFilter === 'Mid' && (emp.promotionReadiness < 60 || emp.promotionReadiness >= 75)) return false;
      if (promotionFilter === 'Review' && emp.calibrationStatus !== 'Needs Review') return false;

      return true;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'evidenceScore') {
        return sortAsc ? a.evidenceScore - b.evidenceScore : b.evidenceScore - a.evidenceScore;
      }
      return sortAsc ? a.promotionReadiness - b.promotionReadiness : b.promotionReadiness - a.promotionReadiness;
    });

  const toggleSort = (field: 'name' | 'evidenceScore' | 'promotionReadiness') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for scores
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Search and Filters Toolbar */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/60 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees by name, role, email..."
              className="w-full bg-white text-sm text-slate-900 rounded-lg pl-9 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto font-medium">
            Showing <strong className="text-slate-800">{filteredEmployees.length}</strong> of {employees.length} employees
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Departments</option>
            {departments.filter(d => d !== 'All').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={manager}
            onChange={e => setManager(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Managers</option>
            {managers.filter(m => m !== 'All').map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={performanceTier}
            onChange={e => setPerformanceTier(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Performance Levels</option>
            <option value="Exceeding">Exceeding</option>
            <option value="Strong">Strong</option>
            <option value="Consistent">Consistent</option>
            <option value="Developing">Developing</option>
          </select>

          <select
            value={promotionFilter}
            onChange={e => setPromotionFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="All">Promotion Readiness: All</option>
            <option value="High">High Readiness (75%+)</option>
            <option value="Mid">Developing Readiness (60-74%)</option>
            <option value="Review">Calibration Review Required</option>
          </select>

          {(search || department !== 'All' || manager !== 'All' || performanceTier !== 'All' || promotionFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setDepartment('All');
                setManager('All');
                setPerformanceTier('All');
                setPromotionFilter('All');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Employee</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Evaluating Manager</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => toggleSort('evidenceScore')}
              >
                <div className="flex items-center gap-1">
                  <span>Evidence Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Performance</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => toggleSort('promotionReadiness')}
              >
                <div className="flex items-center gap-1">
                  <span>Promotion Readiness</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map(emp => (
              <tr
                key={emp.id}
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {emp.avatar}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {emp.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-44">{emp.email}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-700 font-medium text-xs">
                  {emp.role}
                </td>

                <td className="py-3 px-4 text-slate-600 text-xs">
                  <Badge variant="neutral">{emp.department}</Badge>
                </td>

                <td className="py-3 px-4 text-slate-800 font-medium text-xs">
                  {emp.manager}
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{emp.evidenceScore}%</span>
                    <div className="w-14 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${emp.evidenceScore}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <Badge
                    variant={
                      emp.performanceTier === 'Exceeding'
                        ? 'purple'
                        : emp.performanceTier === 'Strong'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {emp.performanceTier}
                  </Badge>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{emp.promotionReadiness}%</span>
                    <span className="text-[11px] text-slate-400">
                      {emp.promotionReadiness >= 75 ? 'Ready' : 'Developing'}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4">
                  {emp.calibrationStatus === 'Needs Review' ? (
                    <Badge variant="warning" dot>
                      Review
                    </Badge>
                  ) : emp.calibrationStatus === 'Calibrated' ? (
                    <Badge variant="success">
                      Calibrated
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      Normal
                    </Badge>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
