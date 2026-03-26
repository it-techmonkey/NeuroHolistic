'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Clock,
  UserCheck,
  Loader2,
  Activity
} from 'lucide-react';

export default function TherapistCards() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTherapist, setExpandedTherapist] = useState<string | null>(null);

  useEffect(() => {
    async function loadTherapists() {
      try {
        const res = await fetch('/api/admin/therapists');
        if (res.ok) {
          const data = await res.json();
          setData(data);
        }
      } catch (err) {
        console.error('Failed to load therapists:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTherapists();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const therapists = data?.therapists || [];

  if (therapists.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-slate-900 font-medium">No therapists yet</h3>
        <p className="text-slate-500 text-sm mt-1">Add therapists to see their performance data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {therapists.map((therapist: any) => {
        const isExpanded = expandedTherapist === therapist.id;
        const stats = therapist.stats;

        return (
          <div key={therapist.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Therapist Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedTherapist(isExpanded ? null : therapist.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {therapist.full_name?.charAt(0) || therapist.email?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{therapist.full_name}</h3>
                    <p className="text-sm text-slate-500">{therapist.email}</p>
                    {therapist.phone && (
                      <p className="text-xs text-slate-400 mt-1">{therapist.phone} • {therapist.country}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium">Clients</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalClients}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Active Programs</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activePrograms}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.completedPrograms}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-600 font-medium">Consultations</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.freeConsultations}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-indigo-600 font-medium">Sessions</p>
                  <p className="text-2xl font-bold text-indigo-700">{stats.completedSessions}</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-3">
                  <p className="text-xs text-rose-600 font-medium">Avg Score</p>
                  <p className="text-2xl font-bold text-rose-700">{stats.avgGoalReadiness}/60</p>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-slate-200 bg-slate-50">
                <div className="p-6">
                  {/* Tabs */}
                  <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-slate-200 w-fit">
                    <button className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md">
                      Clients ({therapist.clients?.length || 0})
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                      Programs ({therapist.programs?.length || 0})
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                      Bookings ({therapist.bookings?.length || 0})
                    </button>
                  </div>

                  {/* Clients List */}
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Program Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sessions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bookings</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assessments</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {therapist.clients?.map((client: any) => (
                          <tr key={client.clientId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {client.clientId.substring(0, 8)}...
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                client.programStatus === 'active' ? 'bg-green-100 text-green-800' :
                                client.programStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {client.programStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {client.completedSessions}/{client.totalSessions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {client.bookingsCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {client.assessmentsCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {formatCurrency(client.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!therapist.clients || therapist.clients.length === 0) && (
                      <div className="text-center py-8 text-slate-500">
                        No clients assigned yet
                      </div>
                    )}
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Bookings Breakdown */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-medium text-slate-900 mb-3">Bookings Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Free Consultations</span>
                          <span className="font-medium">{stats.freeConsultations}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Paid Programs</span>
                          <span className="font-medium">{stats.paidPrograms}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Paid Sessions</span>
                          <span className="font-medium">{stats.paidSessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Upcoming</span>
                          <span className="font-medium">{stats.upcomingBookings}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Completed</span>
                          <span className="font-medium">{stats.completedBookings}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sessions & Assessments */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-medium text-slate-900 mb-3">Sessions & Assessments</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Total Sessions</span>
                          <span className="font-medium">{stats.totalSessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Completed Sessions</span>
                          <span className="font-medium">{stats.completedSessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Scheduled Sessions</span>
                          <span className="font-medium">{stats.scheduledSessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Diagnostic Assessments</span>
                          <span className="font-medium">{stats.assessments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Development Forms</span>
                          <span className="font-medium">{stats.devForms}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                      {therapist.bookings?.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              booking.status === 'completed' ? 'bg-green-500' :
                              booking.status === 'confirmed' ? 'bg-blue-500' :
                              'bg-slate-400'
                            }`} />
                            <span className="text-slate-700">
                              {booking.type === 'free_consultation' ? 'Free Consultation' :
                               booking.type === 'paid_program' ? 'Paid Program' : 'Session'}
                              {' with '}{booking.name || 'Client'}
                            </span>
                          </div>
                          <span className="text-slate-500">{formatDate(booking.date)}</span>
                        </div>
                      ))}
                      {(!therapist.bookings || therapist.bookings.length === 0) && (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
