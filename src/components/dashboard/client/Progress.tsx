'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Progress({ assessments }: { assessments: any[] }) {
  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">No assessment data available yet.</p>
      </div>
    );
  }

  // Transform data for chart
  const chartData = assessments.map(a => ({
    date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: a.goal_readiness_score || a.total_score || 0
  }));

  // Categories table columns
  // Assuming category_scores is a JSON object { nervous_system: 5, ... }
  // I need to ensure the keys match. In Step 5 form, I stored scores in separate columns in DB?
  // Schema check: `nervous_system_score`, etc. exist as columns. `category_scores` was my assumption in `api/client/dashboard` route.
  // Wait, `api/client/dashboard` selects `category_scores`.
  // But `diagnostic_assessments` table structure has individual columns `nervous_system_score`, etc.
  // I should update `api/client/dashboard` to select specifically or `*`. It selects `created_at, total_score, category_scores`.
  // Wait, looking at my API implementation for dashboard:
  /*
    const { data: assessments, error: assessmentsError } = await supabase
      .from('diagnostic_assessments')
      .select('created_at, total_score, category_scores')
  */
  // But looking at schema: `nervous_system_score`, etc are separate columns. `category_scores` column DOES NOT EXIST in the schema I read earlier!
  // I made a mistake in `api/client/dashboard` implementation assuming a `category_scores` JSON column.
  // I must fix `api/client/dashboard` to select all score columns.

  // I'll proceed creating the component assuming correct data, and fix the API route next. 
  // Component will use separate columns if available.

  const latest = assessments[assessments.length - 1];
  const categories = [
    { key: 'nervous_system_score', label: 'Nervous System' },
    { key: 'emotional_state_score', label: 'Emotional State' },
    { key: 'cognitive_patterns_score', label: 'Cognitive Patterns' },
    { key: 'body_symptoms_score', label: 'Somatic Symptoms' },
    { key: 'behavioral_patterns_score', label: 'Behavioral Patterns' },
    { key: 'life_functioning_score', label: 'Life Functioning' },
  ];

  return (
    <div className="space-y-8">
      {/* Chart */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-6">Goal Readiness Over Time</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 60]} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#6366F1', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366F1" 
                strokeWidth={3}
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
           <h3 className="text-lg font-medium text-slate-900">Assessment Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                {categories.map(cat => (
                  <th key={cat.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {cat.label}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assessments.map((a, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  {categories.map(cat => (
                    <td key={cat.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {a[cat.key] ?? '-'}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {a.goal_readiness_score ?? a.total_score ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
