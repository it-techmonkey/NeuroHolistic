'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Loader2 } from 'lucide-react';

interface ReportsProps {
  therapistId: string;
}

export default function Reports({ therapistId }: ReportsProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/therapist/clients');
        if (res.ok) {
          const data = await res.json();
          console.log('[Reports] Clients loaded:', data.clients?.length, data.clients);
          setClients(data.clients || []);
        } else {
          console.error('[Reports] Failed to load clients:', res.status);
        }
      } catch (err) {
        console.error('Failed to load clients:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  const generateReport = async (clientId: string) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/therapist/progress-report/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Progress Reports</h2>
          <p className="text-sm text-slate-500">Generate and view client progress reports</p>
        </div>
      </div>

      {/* Client Selection */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Select Client</h3>
        <div className="flex gap-4">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Choose a client...</option>
            {clients.map(client => (
              <option key={client.userId} value={client.userId}>
                {client.fullName} ({client.email})
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedClient && generateReport(selectedClient)}
            disabled={!selectedClient || generating}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedClient && !generating
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 print:shadow-none">
          {/* Report Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Progress Report</h3>
              <p className="text-sm text-slate-500">NeuroHolistic Institute</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase">Client</p>
              <p className="font-medium text-slate-900">{report.client?.fullName}</p>
              <p className="text-sm text-slate-500">{report.client?.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Therapist</p>
              <p className="font-medium text-slate-900">{report.therapist?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Sessions Completed</p>
              <p className="font-medium text-slate-900">{report.sessionsCompleted || 0} / {report.program?.totalSessions || 10}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Report Generated</p>
              <p className="font-medium text-slate-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Baseline vs Latest Scores */}
          {(report.baselineScores || report.latestScores) && (
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Score Comparison (Baseline vs Latest)</h4>
              <div className="grid grid-cols-2 gap-6">
                {/* Baseline */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 uppercase mb-3">Baseline Scores</p>
                  {report.baselineScores ? (
                    <div className="space-y-2">
                      {Object.entries(report.baselineScores).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{value as number}/10</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No baseline assessment</p>
                  )}
                </div>

                {/* Latest */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-xs text-indigo-600 uppercase mb-3">Latest Scores</p>
                  {report.latestScores ? (
                    <div className="space-y-2">
                      {Object.entries(report.latestScores).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-indigo-700 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{value as number}/10</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-indigo-400">No assessments yet</p>
                  )}
                </div>
              </div>

              {/* Improvement */}
              {report.scoreImprovement && (
                <div className="mt-4 bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-700 uppercase mb-3">Score Changes</p>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(report.scoreImprovement).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-xs text-slate-600 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className={`text-lg font-bold ${
                          (value as number) > 0 ? 'text-green-600' :
                          (value as number) < 0 ? 'text-red-600' : 'text-slate-500'
                        }`}>
                          {(value as number) > 0 ? '+' : ''}{value as number}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Timeline Chart */}
          {report.progressTimeline && report.progressTimeline.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Goal Readiness Progress</h4>
              <div className="h-48 flex items-end gap-1">
                {report.progressTimeline.map((point: any, idx: number) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-indigo-500 rounded-t"
                      style={{ height: `${(point.goalReadinessScore / 60) * 100}%` }}
                    />
                    <p className="text-[10px] text-slate-400 mt-1 rotate-45 origin-left">
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0</span>
                <span>Goal Readiness Score (max 60)</span>
                <span>60</span>
              </div>
            </div>
          )}

          {/* Therapist Notes Summary */}
          {report.therapistNotesSummary && report.therapistNotesSummary.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Clinical Notes Summary</h4>
              <div className="space-y-3">
                {report.therapistNotesSummary.map((note: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3 border-l-4 border-indigo-500">
                    <p className="text-xs text-slate-500 mb-1">Session {note.sessionNumber} — {note.date}</p>
                    <p className="text-sm text-slate-700">{note.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!report && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-medium">No report generated</h3>
          <p className="text-slate-500 text-sm mt-1">Select a client and generate a progress report.</p>
        </div>
      )}
    </div>
  );
}
