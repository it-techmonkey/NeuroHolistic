'use client';

import { useState, useEffect } from 'react';
import { Loader2, User, Mail, Calendar, TrendingUp, X, FileText, Clock, ChevronRight } from 'lucide-react';

export default function Clients({ therapistId }: { therapistId: string }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'consultation' | 'program'>('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientDetail, setClientDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetchClients() {
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
    fetchClients();
  }, [therapistId]);

  const fetchClientDetail = async (client: any) => {
    setSelectedClient(client);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/therapist/client-detail?clientId=${client.userId}`);
      if (res.ok) {
        const data = await res.json();
        setClientDetail(data);
      }
    } catch (err) {
      console.error('Failed to load client detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'consultation') return !c.program?.status || c.program.status === 'none';
    if (filter === 'program') return c.program?.status === 'active' || c.program?.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // If a client is selected, show their detail view
  if (selectedClient) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => { setSelectedClient(null); setClientDetail(null); }}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to all clients
        </button>

        {/* Client Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-50 p-4 rounded-full">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{selectedClient.fullName}</h2>
              <p className="text-slate-500">{selectedClient.email}</p>
              <div className="mt-2">
                {selectedClient.program?.status === 'active' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active Program ({selectedClient.program.completedSessions}/{selectedClient.program.totalSessions} sessions)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                    Free Consultation
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Content */}
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : clientDetail ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Sessions
              </h3>
              {clientDetail.sessions?.length > 0 ? (
                <div className="space-y-3">
                  {clientDetail.sessions.map((s: any) => (
                    <div key={s.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {s.session_number ? `Session #${s.session_number}` : 'Free Consultation'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {s.date ? new Date(s.date).toLocaleDateString() : 'Not scheduled'} {s.time && `at ${s.time}`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        s.status === 'completed' ? 'bg-green-100 text-green-800' :
                        s.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No sessions yet</p>
              )}
            </div>

            {/* Assessments */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Assessments
              </h3>
              {clientDetail.assessments?.length > 0 ? (
                <div className="space-y-3">
                  {clientDetail.assessments.map((a: any) => (
                    <div key={a.id} className="py-2 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {a.is_baseline ? 'Baseline Assessment' : 'Assessment'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(a.assessed_at || a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-xs text-indigo-600 mt-1">
                        Wellbeing Score: {a.goal_readiness_score || 0}/60
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No assessments yet</p>
              )}
            </div>

            {/* Development Forms */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Session Development Forms
              </h3>
              {clientDetail.devForms?.length > 0 ? (
                <div className="space-y-3">
                  {clientDetail.devForms.map((f: any) => (
                    <div key={f.id} className="py-2 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-slate-900">Session #{f.session_number}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(f.session_date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-xs text-indigo-600 mt-1">
                        Wellbeing Score: {f.goal_readiness_score || 0}/60
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No development forms yet</p>
              )}
            </div>

            {/* Progress Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Progress Summary
              </h3>
              {clientDetail.assessments?.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Baseline</p>
                      <p className="text-xl font-bold text-slate-700">
                        {clientDetail.assessments.find((a: any) => a.is_baseline)?.goal_readiness_score || 0}/60
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-600">Latest</p>
                      <p className="text-xl font-bold text-green-700">
                        {clientDetail.assessments[clientDetail.assessments.length - 1]?.goal_readiness_score || 0}/60
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No progress data yet</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Could not load client details</p>
        )}
      </div>
    );
  }

  // Client list view
  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'All Clients' },
          { id: 'consultation', label: 'Free Consultation' },
          { id: 'program', label: 'Paid Program' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              filter === tab.id
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-medium">No clients found</h3>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'consultation' ? 'No consultation clients yet.' :
             filter === 'program' ? 'No program clients yet.' :
             'No clients assigned yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <button
              key={client.userId}
              onClick={() => fetchClientDetail(client)}
              className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left w-full"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-3 rounded-full">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{client.fullName}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{client.email}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* Client Details */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {client.nextSession && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-slate-600">
                      Next: {new Date(client.nextSession.date).toLocaleDateString()} at {client.nextSession.time}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                {client.program?.status === 'active' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active Program ({client.program.completedSessions}/{client.program.totalSessions} sessions)
                  </span>
                ) : client.program?.status === 'completed' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Program Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    Free Consultation
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
