'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  UserCheck,
  DollarSign,
  Target,
  Activity,
  Clock,
  FileText,
  X,
  Eye,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

interface Therapist {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  created_at: string;
  stats: {
    totalClients: number;
    activePrograms: number;
    completedPrograms: number;
    totalRevenue: number;
    upcomingBookings: number;
    completedBookings: number;
    freeConsultations: number;
    paidPrograms: number;
    paidSessions: number;
    totalSessions: number;
    completedSessions: number;
    scheduledSessions: number;
    assessments: number;
    devForms: number;
    avgGoalReadiness: number;
  };
  clients: any[];
  programs: any[];
  bookings: any[];
  assessments: any[];
  sessions: any[];
}

export default function AdminTherapists() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTherapist, setExpandedTherapist] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'programs' | 'bookings' | 'sessions'>('overview');

  useEffect(() => {
    async function loadTherapists() {
      try {
        const res = await fetch('/api/admin/therapists');
        if (res.ok) {
          const data = await res.json();
          setTherapists(data.therapists || []);
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

  const filteredTherapists = therapists.filter(therapist =>
    therapist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = therapists.reduce((sum, t) => sum + t.stats.totalRevenue, 0);
  const totalClients = therapists.reduce((sum, t) => sum + t.stats.totalClients, 0);
  const totalSessions = therapists.reduce((sum, t) => sum + t.stats.completedSessions, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Therapists</h2>
          <p className="text-slate-500 mt-1">Team performance and client management</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/70" />
          </div>
          <p className="text-indigo-100 text-sm">Total Therapists</p>
          <p className="text-3xl font-bold mt-1">{therapists.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/70" />
          </div>
          <p className="text-emerald-100 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/70" />
          </div>
          <p className="text-blue-100 text-sm">Total Clients</p>
          <p className="text-3xl font-bold mt-1">{totalClients}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/70" />
          </div>
          <p className="text-amber-100 text-sm">Sessions Completed</p>
          <p className="text-3xl font-bold mt-1">{totalSessions}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search therapists by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Therapist Cards */}
      <div className="space-y-4">
        {filteredTherapists.map((therapist) => {
          const isExpanded = expandedTherapist === therapist.id;

          return (
            <div key={therapist.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpandedTherapist(isExpanded ? null : therapist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <span className="text-white text-xl font-bold">
                        {therapist.full_name?.charAt(0) || therapist.email?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{therapist.full_name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-slate-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {therapist.email}
                        </span>
                        {therapist.phone && (
                          <span className="text-sm text-slate-500 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {therapist.phone}
                          </span>
                        )}
                        <span className="text-sm text-slate-500 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {therapist.country || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(therapist.stats.totalRevenue)}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-700">{therapist.stats.totalClients}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">Total Clients</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-700">{therapist.stats.activePrograms}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-2 font-medium">Active Programs</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-700">{therapist.stats.completedPrograms}</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-2 font-medium">Completed</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      <span className="text-2xl font-bold text-amber-700">{therapist.stats.upcomingBookings}</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 font-medium">Upcoming</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span className="text-2xl font-bold text-indigo-700">{therapist.stats.completedSessions}</span>
                    </div>
                    <p className="text-xs text-indigo-600 mt-2 font-medium">Sessions</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <FileText className="w-5 h-5 text-rose-600" />
                      <span className="text-2xl font-bold text-rose-700">{therapist.stats.assessments}</span>
                    </div>
                    <p className="text-xs text-rose-600 mt-2 font-medium">Assessments</p>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50">
                  {/* Tabs */}
                  <div className="px-6 py-4 border-b border-slate-200 bg-white">
                    <div className="flex space-x-1">
                      {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'clients', label: 'Clients', icon: Users, count: therapist.clients?.length },
                        { id: 'programs', label: 'Programs', icon: Target, count: therapist.programs?.length },
                        { id: 'bookings', label: 'Bookings', icon: Calendar, count: therapist.bookings?.length },
                        { id: 'sessions', label: 'Sessions', icon: Clock, count: therapist.sessions?.length },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab(tab.id as any);
                              setSelectedTherapist(therapist);
                            }}
                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              activeTab === tab.id && selectedTherapist?.id === therapist.id
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                activeTab === tab.id && selectedTherapist?.id === therapist.id
                                  ? 'bg-indigo-200 text-indigo-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {tab.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {selectedTherapist?.id === therapist.id && (
                      <>
                        {activeTab === 'overview' && <OverviewTab therapist={therapist} />}
                        {activeTab === 'clients' && <ClientsTab therapist={therapist} />}
                        {activeTab === 'programs' && <ProgramsTab therapist={therapist} />}
                        {activeTab === 'bookings' && <BookingsTab therapist={therapist} />}
                        {activeTab === 'sessions' && <SessionsTab therapist={therapist} />}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTherapists.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900">No therapists found</h3>
            <p className="text-slate-500 mt-2">
              {searchTerm ? 'Try a different search term' : 'No therapists have been added yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ therapist }: { therapist: Therapist }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bookings Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Bookings Breakdown</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Free Consultations</span>
            <span className="font-semibold text-slate-900">{therapist.stats.freeConsultations}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Paid Programs</span>
            <span className="font-semibold text-slate-900">{therapist.stats.paidPrograms}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Paid Sessions</span>
            <span className="font-semibold text-slate-900">{therapist.stats.paidSessions}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-700">Upcoming</span>
            <span className="font-semibold text-green-700">{therapist.stats.upcomingBookings}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700">Completed</span>
            <span className="font-semibold text-blue-700">{therapist.stats.completedBookings}</span>
          </div>
        </div>
      </div>

      {/* Sessions & Assessments */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Sessions & Assessments</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Total Sessions</span>
            <span className="font-semibold text-slate-900">{therapist.stats.totalSessions}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-700">Completed Sessions</span>
            <span className="font-semibold text-green-700">{therapist.stats.completedSessions}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700">Scheduled Sessions</span>
            <span className="font-semibold text-blue-700">{therapist.stats.scheduledSessions}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-purple-700">Diagnostic Assessments</span>
            <span className="font-semibold text-purple-700">{therapist.stats.assessments}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
            <span className="text-indigo-700">Development Forms</span>
            <span className="font-semibold text-indigo-700">{therapist.stats.devForms}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
            <span className="text-rose-700">Avg Goal Distance</span>
            <span className="font-semibold text-rose-700">{therapist.stats.avgGoalReadiness}/60</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Clients Tab
function ClientsTab({ therapist }: { therapist: Therapist }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (!therapist.clients || therapist.clients.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No clients assigned to this therapist yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Client ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Program Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sessions</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bookings</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assessments</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Revenue</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {therapist.clients.map((client, idx) => (
            <tr key={client.clientId || idx} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-slate-900">
                  {client.clientId?.substring(0, 8)}...
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  client.programStatus === 'active' ? 'bg-green-100 text-green-800' :
                  client.programStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {client.programStatus}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {client.completedSessions}/{client.totalSessions}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{client.bookingsCount}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{client.assessmentsCount}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {formatCurrency(client.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Programs Tab
function ProgramsTab({ therapist }: { therapist: Therapist }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (!therapist.programs || therapist.programs.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No programs found for this therapist</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {therapist.programs.map((program, idx) => (
        <div key={program.id || idx} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-900">{program.client_name || 'Client'}</p>
              <p className="text-sm text-slate-500">{program.client_email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              program.status === 'active' ? 'bg-green-100 text-green-800' :
              program.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              {program.status}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Sessions</p>
              <p className="font-semibold text-slate-900">{program.sessions_completed}/{program.total_sessions}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="font-semibold text-slate-900">{formatCurrency(program.price_paid)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Type</p>
              <p className="font-semibold text-slate-900 capitalize">{program.program_type}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="font-semibold text-slate-900">{new Date(program.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Bookings Tab
function BookingsTab({ therapist }: { therapist: Therapist }) {
  if (!therapist.bookings || therapist.bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No bookings found for this therapist</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Client</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {therapist.bookings.slice(0, 20).map((booking, idx) => (
            <tr key={booking.id || idx} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{booking.name || 'Client'}</p>
                <p className="text-sm text-slate-500">{booking.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-600 capitalize">
                  {booking.type?.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-900">{new Date(booking.date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-500">{booking.time}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Sessions Tab
function SessionsTab({ therapist }: { therapist: Therapist }) {
  if (!therapist.sessions || therapist.sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No sessions found for this therapist</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Session #</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Form</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {therapist.sessions.slice(0, 20).map((session, idx) => (
            <tr key={session.id || idx} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <span className="font-medium text-slate-900">Session #{session.session_number}</span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-900">{session.date ? new Date(session.date).toLocaleDateString() : 'Not scheduled'}</p>
                <p className="text-sm text-slate-500">{session.time || '-'}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  session.status === 'completed' ? 'bg-green-100 text-green-800' :
                  session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {session.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {session.development_form_submitted ? (
                  <span className="inline-flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Submitted
                  </span>
                ) : (
                  <span className="text-slate-400 text-sm">Not submitted</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
