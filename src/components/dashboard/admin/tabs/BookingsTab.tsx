'use client';

import { useState, useMemo } from 'react';
import { CalendarDays, Search, Filter, Clock } from 'lucide-react';
import type { AdminData } from './types';

type StatusFilter = 'all' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'scheduled' | 'pending';
type TypeFilter = 'all' | 'free_consultation' | 'program';

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  no_show: 'bg-orange-50 text-orange-700 border border-orange-200',
  scheduled: 'bg-amber-50 text-amber-700 border border-amber-200',
  pending: 'bg-slate-50 text-slate-600 border border-slate-200',
};

const typeColors: Record<string, string> = {
  free_consultation: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  program: 'bg-violet-50 text-violet-700 border border-violet-200',
};

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'no_show', label: 'No Show' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'pending', label: 'Pending' },
];

const typeFilters: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free_consultation', label: 'Consultation' },
  { key: 'program', label: 'Program' },
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

export default function BookingsTab({ data }: { data: AdminData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const bookings = data.bookings ?? [];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const booking of bookings) { const s = booking.status ?? 'unknown'; counts[s] = (counts[s] ?? 0) + 1; }
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (booking.clientName ?? '').toLowerCase().includes(q) || (booking.therapistName ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesType = typeFilter === 'all' || booking.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchQuery, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Bookings</h2>
        <p className="text-sm text-slate-500">Review all booking activity</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statusFilters.filter(f => f.key !== 'all').map((f) => (
          <div key={f.key} className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{f.label}</p>
            <p className="text-lg font-bold text-slate-900">{statusCounts[f.key] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by client or therapist..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
          {typeFilters.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.key ? 'bg-[#2B2F55] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {f.label}
            {f.key !== 'all' && statusCounts[f.key] !== undefined && (
              <span className="ml-1.5 text-[10px] opacity-60">{statusCounts[f.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings found</h3>
          <p className="text-sm text-slate-500">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your filters' : 'No bookings yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Therapist</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{booking.clientName ?? 'Unknown'}</p>
                      {booking.clientEmail && <p className="text-xs text-slate-400">{booking.clientEmail}</p>}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{booking.therapistName ?? 'Unassigned'}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{formatDate(booking.date)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600">{booking.time ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${typeColors[booking.type] || 'bg-slate-100 text-slate-600'}`}>
                        {booking.type === 'free_consultation' ? 'Consultation' : booking.type === 'program' ? 'Program' : booking.type ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                        {booking.status ?? 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>
    </div>
  );
}
