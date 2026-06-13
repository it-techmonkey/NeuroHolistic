'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Loader2, User, FileText, Activity, Home, Users, Shield } from 'lucide-react';

interface ReportsProps {
  therapistId: string;
}

const SYMPTOM_CATEGORIES = [
  { key: 'emotional_patterns', label: 'Emotional' },
  { key: 'nervous_system_symptoms', label: 'Nervous System' },
  { key: 'cognitive_patterns', label: 'Cognitive' },
  { key: 'behavioral_patterns', label: 'Behavioral' },
  { key: 'body_symptoms', label: 'Physical' },
  { key: 'sleep_symptoms', label: 'Sleep' },
];

const formatDate = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const cleanText = (value: unknown): string => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

const joinList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value) return [value];
  return [];
};

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
          setClients(data.clients || []);
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

  // Get baseline assessment for structured data
  const baseline = report?.allAssessments?.find((a: any) => a.is_baseline) || report?.allAssessments?.[0] || null;
  const a = baseline || {};

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

          {/* 1. Basic Information */}
          <Section title="Basic Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Client" value={report.client?.fullName} sub={report.client?.email} />
              <Field label="Therapist" value={report.therapist?.name || 'N/A'} />
              <Field label="Gender" value={cleanText(a.gender)} />
              <Field label="Nationality" value={cleanText(a.nationality)} />
              <Field label="Sessions Completed" value={`${report.sessionsCompleted || 0} / ${report.program?.totalSessions || 10}`} />
              <Field label="Report Generated" value={formatDate(new Date().toISOString())} />
            </div>
          </Section>

          {/* 2. Main Concerns & Desired Outcomes */}
          {(a.main_complaint || a.affected_life_areas || a.symptom_duration) && (
            <Section title="Main Concerns & Desired Outcomes" icon={FileText}>
              <div className="space-y-3">
                <Field label="Current Concern" value={cleanText(a.main_complaint)} />
                <div>
                  <p className="text-xs text-slate-500 uppercase">Areas of Life Affected</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {joinList(a.affected_life_areas).length > 0 ? joinList(a.affected_life_areas).map((area, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{area}</span>
                    )) : <span className="text-sm text-slate-400">Not recorded</span>}
                  </div>
                </div>
                <Field label="Experiencing Since" value={cleanText(a.symptom_duration)} />
                <Field label="Impact" value={cleanText(a.life_impact)} />
                <Field label="Goal or Desire" value={cleanText(a.biggest_goal)} />
              </div>
            </Section>
          )}

          {/* 3. Symptoms & Presenting Patterns */}
          {(a.emotional_patterns || a.nervous_system_symptoms || a.cognitive_patterns) && (
            <Section title="Symptoms & Presenting Patterns" icon={Activity}>
              <div className="space-y-4">
                {/* Symptoms Table matching Report Card.docx format */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">Symptoms</th>
                        {SYMPTOM_CATEGORIES.map((cat) => (
                          <th key={cat.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">{cat.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-3 align-top"></td>
                        {SYMPTOM_CATEGORIES.map((cat) => {
                          const symptoms = joinList(a[cat.key]);
                          const other = a[`${cat.key}_other`];
                          const all = other ? [...symptoms, other] : symptoms;
                          return (
                            <td key={cat.key} className="px-4 py-3 align-top">
                              {all.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {all.map((s, i) => (
                                    <span key={i} className="inline-block text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 leading-relaxed">{s}</span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Severity</td>
                        {SYMPTOM_CATEGORIES.map((cat) => {
                          const scoreKey = cat.key === 'nervous_system_symptoms' ? 'nervous_system_score'
                            : cat.key === 'emotional_patterns' ? 'emotional_state_score'
                            : cat.key === 'cognitive_patterns' ? 'cognitive_patterns_score'
                            : cat.key === 'behavioral_patterns' ? 'behavioral_patterns_score'
                            : cat.key === 'body_symptoms' ? 'body_symptoms_score'
                            : 'sleep_symptoms_score';
                          const score = Number(a[scoreKey]) || 0;
                          return (
                            <td key={cat.key} className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${i < score ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{score}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Previously Tried */}
                {joinList(a.tried_previously).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600">Previously Tried</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {joinList(a.tried_previously).map((t, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* 4. Life Status & Functional Assessment */}
          {(a.relationship_quality || a.employment_status || a.social_life || a.sleep_description) && (
            <Section title="Life Status & Functional Assessment" icon={Home}>
              <div className="space-y-4">
                {a.relationship_quality && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Relationship & Attachment</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Quality" value={cleanText(Array.isArray(a.relationship_quality) ? a.relationship_quality.join(', ') : a.relationship_quality)} />
                      <Field label="Emotional Safety" value={cleanText(a.relationship_emotional_safety)} />
                      {a.relationship_fulfillment_score && <Field label="Fulfillment" value={`${a.relationship_fulfillment_score}/10`} />}
                    </div>
                  </div>
                )}
                {a.employment_status && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Work & Fulfillment</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Employment" value={cleanText(a.employment_status)} />
                      <Field label="Work State" value={cleanText(Array.isArray(a.work_state) ? a.work_state.join(', ') : a.work_state)} />
                      {a.work_fulfillment_score && <Field label="Fulfillment" value={`${a.work_fulfillment_score}/10`} />}
                    </div>
                  </div>
                )}
                {a.social_life && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Social Life</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Status" value={cleanText(Array.isArray(a.social_life) ? a.social_life.join(', ') : a.social_life)} />
                      <Field label="Understood by Others" value={cleanText(a.feel_understood)} />
                    </div>
                  </div>
                )}
                {a.sleep_description && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Sleep</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Sleep Status" value={cleanText(Array.isArray(a.sleep_description) ? a.sleep_description.join(', ') : a.sleep_description)} />
                      <Field label="Average Hours" value={cleanText(a.average_sleep_hours)} />
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* 5. Root Cause & Family System Assessment */}
          {(a.mother_emotional_presence || a.father_emotional_presence || a.parents_relationship) && (
            <Section title="Root Cause & Family System Assessment" icon={Users}>
              <div className="space-y-4">
                {a.mother_emotional_presence && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Mother</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Emotional Presence" value={cleanText(a.mother_emotional_presence)} />
                      <Field label="Physical Presence" value={cleanText(a.mother_physical_presence)} />
                      <Field label="Relationship" value={cleanText(a.mother_relationship)} />
                      <Field label="Emotional Safety" value={cleanText(a.mother_emotional_safety)} />
                    </div>
                  </div>
                )}
                {a.father_emotional_presence && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Father</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Emotional Presence" value={cleanText(a.father_emotional_presence)} />
                      <Field label="Physical Presence" value={cleanText(a.father_physical_presence)} />
                      <Field label="Relationship" value={cleanText(a.father_relationship)} />
                      <Field label="Emotional Safety" value={cleanText(a.father_emotional_safety)} />
                    </div>
                  </div>
                )}
                {a.parents_relationship && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Parents Relationship</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Type" value={cleanText(a.parents_relationship)} />
                      <Field label="Impact" value={cleanText(a.parents_relationship_impact)} />
                    </div>
                  </div>
                )}
                {a.birth_order && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Siblinghood</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Field label="Birth Order" value={cleanText(a.birth_order)} />
                      <Field label="Siblings" value={cleanText(a.number_of_siblings)} />
                      <Field label="Relationship" value={cleanText(joinList(a.sibling_relationship).join(', '))} />
                      <Field label="Role as Child" value={cleanText(joinList(a.family_role).join(', '))} />
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* 6. Clinical Summary */}
          {(a.predominant_nervous_system_state || a.predominant_emotional_state || a.subconscious_patterns) && (
            <Section title="Clinical Summary / Therapist Observation" icon={Shield}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Predominant Nervous System" value={cleanText(a.predominant_nervous_system_state)} />
                  <Field label="Predominant Emotional State" value={cleanText(a.predominant_emotional_state)} />
                </div>
                {joinList(a.subconscious_patterns).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600">Subconscious Patterns</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {joinList(a.subconscious_patterns).map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {joinList(a.attachment_style_indicators).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600">Attachment Style</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {joinList(a.attachment_style_indicators).map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {joinList(a.key_themes).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600">Key Themes Emerging</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {joinList(a.key_themes).map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {joinList(a.therapeutic_priority).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600">Therapeutic Priority</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {joinList(a.therapeutic_priority).map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {a.recommended_session_frequency && (
                  <Field label="Recommended Frequency" value={cleanText(a.recommended_session_frequency)} />
                )}
              </div>
            </Section>
          )}

          {/* Score Comparison */}
          {(report.baselineScores || report.latestScores) && (
            <Section title="Score Comparison (Baseline vs Latest)" icon={BarChart3}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

              {report.scoreImprovement && (
                <div className="mt-4 bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-700 uppercase mb-3">Score Changes</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
            </Section>
          )}

          {/* Progress Timeline Chart */}
          {report.progressTimeline && report.progressTimeline.length > 0 && (
            <Section title="Wellbeing Progress" icon={BarChart3}>
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
                <span>Dysregulation Level (0-60)</span>
                <span>60</span>
              </div>
            </Section>
          )}

          {/* Therapist Notes Summary */}
          {report.therapistNotesSummary && report.therapistNotesSummary.length > 0 && (
            <Section title="Clinical Notes Summary" icon={FileText}>
              <div className="space-y-3">
                {report.therapistNotesSummary.map((note: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3 border-l-4 border-indigo-500">
                    <p className="text-xs text-slate-500 mb-1">Session {note.sessionNumber} - {note.date}</p>
                    <p className="text-sm text-slate-700">{note.notes}</p>
                  </div>
                ))}
              </div>
            </Section>
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

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-400" />
        <h4 className="font-medium text-slate-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, sub }: { label: string; value?: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="font-medium text-slate-900">{value || 'Not recorded'}</p>
      {sub && <p className="text-sm text-slate-500">{sub}</p>}
    </div>
  );
}
