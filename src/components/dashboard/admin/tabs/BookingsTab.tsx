import { useState, useMemo } from 'react';
import { CalendarDays, Search, Filter, Clock, Video, ExternalLink } from 'lucide-react';
import type { AdminData } from './types';

interface BookingsTabProps {
  data: AdminData;
}

type StatusFilter = 'all' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'scheduled' | 'pending';
type TypeFilter = 'all' | 'free_consultation' | 'program';

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  no_show: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  scheduled: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const typeColors: Record<string, string> = {
  free_consultation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  program: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  scheduled: 'Scheduled',
  pending: 'Pending',
};

const typeLabels: Record<string, string> = {
  free_consultation: 'Free Consultation',
  program: 'Program',
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatCreatedAt(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

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
  { key: 'free_consultation', label: 'Free Consultation' },
  { key: 'program', label: 'Program' },
];

export default function BookingsTab({ data }: BookingsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const bookings = data.bookings ?? [];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const booking of bookings) {
      const s = booking.status ?? 'unknown';
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        (booking.clientName ?? '').toLowerCase().includes(query) ||
        (booking.therapistName ?? '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || booking.status === statusFilter;

      const matchesType =
        typeFilter === 'all' || booking.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchQuery, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <CalendarDays className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Bookings</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statusFilters
          .filter((f) => f.key !== 'all')
          .map((f) => (
            <div
              key={f.key}
              className="bg-[#111827] border border-white/5 rounded-lg p-3"
            >
              <p className="text-xs text-slate-400 mb-1">{f.label}</p>
              <p className="text-lg font-semibold text-white">
                {statusCounts[f.key] ?? 0}
              </p>
            </div>
          ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client or therapist name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-white/5 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="bg-[#111827] border border-white/5 rounded-lg text-white px-3 py-2.5 focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            {typeFilters.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-[#111827] border border-white/5 text-slate-400 hover:text-white hover:border-white/10'
            }`}
          >
            {f.label}
            {f.key !== 'all' && statusCounts[f.key] !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">
                {statusCounts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-12 text-center">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No bookings found
          </h3>
          <p className="text-sm text-slate-400">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'There are no bookings yet'}
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Therapist
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {booking.clientName ?? 'Unknown'}
                        </p>
                        {booking.clientEmail && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {booking.clientEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-300">
                        {booking.therapistName ?? 'Unassigned'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-mono text-slate-300">
                        {formatDate(booking.date)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-sm font-mono text-slate-300">
                          {booking.time ?? '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          typeColors[booking.type] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {typeLabels[booking.type] ?? booking.type ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[booking.status] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {statusLabels[booking.status] ?? booking.status ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-mono text-slate-400">
                        {formatCreatedAt(booking.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>
    </div>
  );
}
