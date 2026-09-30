import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Employee } from '../types';
import { EmployeeTable } from '../components/Employees/EmployeeTable';
import { TableSkeleton } from '../components/Common/Skeleton';
import { Button } from '../components/Common/Button';
import { useToast } from '../components/Common/Toast';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    const data = await api.getEmployees();
    setEmployees(data);
    setIsLoading(false);
  };

  const handleExportCSV = () => {
    showToast({
      title: 'Export initiated',
      message: 'Generating employee performance evidence roster CSV for download.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employees Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage organization members, track evidence scores, and review promotion readiness
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Directory
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/calibration')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Calibration View
          </Button>
        </div>
      </div>

      {/* Directory Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <EmployeeTable employees={employees} />
      )}
    </div>
  );
};
