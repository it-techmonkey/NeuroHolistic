'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function Progress({ assessments }: { assessments: any[] }) {
  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">No progress data available yet.</p>
      </div>
    );
  }

  // Transform data for chart
  const chartData = assessments.map((a, index) => ({
    date: new Date(a.date || a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: a.goalReadinessScore || a.goal_readiness_score || a.total_score || 0,
    session: index === 0 ? 'Start' : index === Math.floor(assessments.length / 2) ? 'Mid' : 'Final',
  }));

  // Calculate improvement
  const firstScore = assessments[0]?.goalReadinessScore || assessments[0]?.goal_readiness_score || assessments[0]?.total_score || 0;
  const lastScore = assessments[assessments.length - 1]?.goalReadinessScore || assessments[assessments.length - 1]?.goal_readiness_score || assessments[assessments.length - 1]?.total_score || 0;
  const improvement = firstScore - lastScore;
  const improvementPercent = Math.round((improvement / firstScore) * 100);

  // Simplified category labels for client view
  const categories = [
    { key: 'nervous_system', label: 'Stress & Anxiety', icon: '🧠' },
    { key: 'emotional_state', label: 'Emotional Balance', icon: '💚' },
    { key: 'cognitive_patterns', label: 'Thought Patterns', icon: '💭' },
    { key: 'body_symptoms', label: 'Physical Wellbeing', icon: '身体' },
    { key: 'behavioral_patterns', label: 'Habits & Behaviors', icon: '🔄' },
    { key: 'life_functioning', label: 'Daily Life', icon: '☀️' },
  ];

  const latest = assessments[assessments.length - 1];

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Overall Improvement</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{improvementPercent}% better</p>
            <p className="text-sm text-green-600 mt-1">
              From {firstScore} to {lastScore} points
            </p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <TrendingDown className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <p className="text-xs text-green-600 mt-4">
          Lower scores indicate less distress and better wellbeing
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-slate-900">Your Journey</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span>Improving</span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                stroke="#94A3B8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 60]}
                reversed={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value) => [`${value} points`, 'Distress Level']}
                labelStyle={{ color: '#1E293B', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#6366F1" 
                strokeWidth={3}
                fill="url(#colorScore)"
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#4F46E5' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-4 text-xs text-slate-500">
          <span>Start of program</span>
          <span>Current</span>
        </div>
      </div>

      {/* Category Breakdown - Simplified for clients */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-medium text-slate-900">Progress by Area</h3>
          <p className="text-sm text-slate-500 mt-1">How you've improved in different areas of your wellbeing</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const firstVal = assessments[0]?.scores?.[cat.key] || assessments[0]?.[cat.key] || 0;
              const lastVal = latest?.scores?.[cat.key] || latest?.[cat.key] || 0;
              const catImprovement = firstVal - lastVal;
              const percentChange = firstVal > 0 ? Math.round((catImprovement / firstVal) * 100) : 0;
              
              return (
                <div key={cat.key} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{lastVal}</p>
                      <p className="text-xs text-slate-500">out of 10</p>
                    </div>
                    {catImprovement > 0 && (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {percentChange}%
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${(lastVal / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assessment History Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-medium text-slate-900">Assessment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assessments.map((a, i) => {
                const score = a.goalReadinessScore ?? a.goal_readiness_score ?? a.total_score ?? 0;
                const prevScore = i > 0 ? (assessments[i-1]?.goalReadinessScore ?? assessments[i-1]?.goal_readiness_score ?? assessments[i-1]?.total_score ?? 0) : null;
                const change = prevScore !== null ? prevScore - score : null;
                
                return (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {i === 0 ? 'Initial Assessment' : i === assessments.length - 1 ? 'Final Assessment' : `Check-in ${i}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {score} points
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {change !== null && (
                        <span className={`flex items-center gap-1 ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {change > 0 ? <TrendingDown className="w-4 h-4" /> : change < 0 ? <TrendingUp className="w-4 h-4" /> : null}
                          {change > 0 ? `-${change}` : change < 0 ? `+${Math.abs(change)}` : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
