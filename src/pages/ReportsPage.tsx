import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { ReportDefinition, mockReports } from '../data/reports';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Modal } from '../components/Common/Modal';
import { useToast } from '../components/Common/Toast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const data = await api.getReports();
    setReports(data);
  };

  const handleExport = (report: ReportDefinition) => {
    showToast({
      title: 'Export in progress',
      message: `Report generation for "${report.title}" will be connected to the FastAPI backend.`,
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Intelligence Reports & Governance Packs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Export structured audits, calibration committee packages, and organizational competency analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(reports[0] || mockReports[0])}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export All Records
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="flex flex-col justify-between hover:border-indigo-300 transition-all hover:shadow-2xs p-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="purple" size="sm">
                  {report.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Generated: {report.lastGenerated}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {report.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Contains <strong>{report.recordCount} verified records</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Preview
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExport(report)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Export
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>{selectedReport.title}</span>
            </div>
          }
          subtitle={`Previewing sample dataset · ${selectedReport.recordCount} records`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">Last updated: {selectedReport.lastGenerated}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleExport(selectedReport);
                    setSelectedReport(null);
                  }}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Export Complete File
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedReport.description}
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    {Object.keys(selectedReport.sampleData[0] || {}).map(key => (
                      <th key={key} className="py-2.5 px-3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReport.sampleData.map((row: Record<string, string | number>, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).map((val, colIdx) => (
                        <td key={colIdx} className="py-2.5 px-3 text-slate-800 font-medium">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
