'use client';

import { useState, useMemo, useEffect } from 'react';
import { CalendarCheck, Search, Video, XCircle } from 'lucide-react';
import { MOCK_EVENTS } from '@/components/events/events-data';

type PaymentStatus = 'free' | 'pending' | 'paid' | 'failed';
type StatusFilter = 'all' | PaymentStatus;

interface EventRegistration {
  id: string;
  event_id: string;
  event_title: string;
  name: string;
  email: string;
  phone: string | null;
  payment_status: PaymentStatus;
  amount_paid: number | null;
  currency: string | null;
  selected_date: string | null;
  created_at: string;
  status: 'active' | 'cancelled';
  cancellation_reason: string | null;
}

interface EventMeeting {
  id: string;
  session_key: string;
  title: string;
  starts_at: string;
  ends_at: string;
  meet_link: string | null;
}

const statusColors: Record<PaymentStatus, string> = {
  free: 'bg-slate-50 text-slate-600 border border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed: 'bg-red-50 text-red-700 border border-red-200',
};

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'free', label: 'Free' },
  { key: 'failed', label: 'Failed' },
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// Known events (title lookup), newest first, so the dropdown shows real titles
// even for events with zero registrations yet.
const EVENT_OPTIONS = MOCK_EVENTS.map((e) => ({
  id: e.slug ?? e.id,
  title: e.locales.en.title,
}));

export default function EventRegistrationsTab() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<EventMeeting[]>([]);
  const [meetState, setMeetState] = useState<{ hostConnected: boolean; hostEmail: string | null; sessionCount: number } | null>(null);
  const [meetBusy, setMeetBusy] = useState(false);
  const [meetError, setMeetError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/event-registrations');
        if (!res.ok) throw new Error('Failed to load event registrations');
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setRegistrations(result);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Meet links are per event, so only load them once a specific event is picked.
  useEffect(() => {
    if (selectedEventId === 'all') {
      setMeetings([]);
      setMeetState(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/event-meetings?eventId=${encodeURIComponent(selectedEventId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setMeetings(data.meetings ?? []);
        setMeetState({
          hostConnected: !!data.hostConnected,
          hostEmail: data.hostTherapistEmail ?? null,
          sessionCount: (data.sessions ?? []).length,
        });
      } catch {
        /* non-fatal: the panel simply stays empty */
      }
    })();
    return () => { cancelled = true; };
  }, [selectedEventId]);

  async function generateMeetLinks() {
    setMeetBusy(true);
    setMeetError('');
    try {
      const res = await fetch('/api/admin/event-meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Meet links');
      setMeetings(data.meetings ?? []);
      if (data.failed?.length) {
        setMeetError(data.failed.map((f: any) => `${f.sessionKey}: ${f.error}`).join(' · '));
      }
    } catch (err: any) {
      setMeetError(err.message || 'Something went wrong');
    } finally {
      setMeetBusy(false);
    }
  }

  async function cancelRegistration(registration: EventRegistration) {
    const reason = window.prompt(`Cancel ${registration.name}'s registration for "${registration.event_title}"?

Optional reason (shown to the registrant):`);
    if (reason === null) return;

    setCancellingId(registration.id);
    try {
      const res = await fetch(`/api/admin/event-registrations/${registration.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel registration');

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id
            ? { ...r, status: 'cancelled' as const, cancellation_reason: reason.trim() || null }
            : r
        )
      );
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setCancellingId(null);
    }
  }

  // Build the event dropdown from known events + any event_id present in the
  // data that isn't in the known list (keeps old/removed events visible too).
  const eventOptions = useMemo(() => {
    const known = new Set(EVENT_OPTIONS.map((e) => e.id));
    const extra = Array.from(new Set(registrations.map((r) => r.event_id)))
      .filter((id) => !known.has(id))
      .map((id) => ({
        id,
        title: registrations.find((r) => r.event_id === id)?.event_title ?? id,
      }));
    return [...EVENT_OPTIONS, ...extra];
  }, [registrations]);

  const eventFiltered = useMemo(() => {
    if (selectedEventId === 'all') return registrations;
    return registrations.filter((r) => r.event_id === selectedEventId);
  }, [registrations, selectedEventId]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of eventFiltered) counts[r.payment_status] = (counts[r.payment_status] ?? 0) + 1;
    return counts;
  }, [eventFiltered]);

  const filteredRegistrations = useMemo(() => {
    return eventFiltered.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.payment_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [eventFiltered, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <p className="text-sm text-slate-500">Loading event registrations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Event Registrations</h2>
        <p className="text-sm text-slate-500">See who registered for each event</p>
      </div>

      {/* Event picker */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-500">Event</label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full sm:w-auto border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="all">All events</option>
          {eventOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* Google Meet links — created on the host therapist's connected calendar */}
      {selectedEventId !== 'all' && meetState && meetState.sessionCount > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Live session links</p>
                <p className="text-xs text-slate-500">
                  {meetState.hostEmail
                    ? `Hosted on ${meetState.hostEmail}${meetState.hostConnected ? '' : ' — Google account not connected'}`
                    : 'No host therapist configured for this event'}
                </p>
              </div>
            </div>
            <button
              onClick={generateMeetLinks}
              disabled={meetBusy || !meetState.hostConnected}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-[#2B2F55] text-white disabled:opacity-50"
            >
              {meetBusy ? 'Creating…' : meetings.some((m) => m.meet_link) ? 'Create missing links' : 'Create Meet links'}
            </button>
          </div>

          {!meetState.hostConnected && (
            <p className="text-xs text-amber-600">
              The host therapist must connect their Google Calendar (therapist dashboard → Google Calendar)
              before links can be created.
            </p>
          )}

          {meetError && <p className="text-xs text-red-600">{meetError}</p>}

          {meetings.length > 0 && (
            <ul className="divide-y divide-slate-100 border-t border-slate-100 pt-1">
              {meetings.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div>
                    <p className="text-sm text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(m.starts_at).toLocaleString('en-US', { timeZone: 'Asia/Dubai', dateStyle: 'medium', timeStyle: 'short' })} (Dubai)
                    </p>
                  </div>
                  {m.meet_link ? (
                    <a href={m.meet_link} target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-600 hover:underline">
                      {m.meet_link}
                    </a>
                  ) : (
                    <span className="text-xs text-amber-600">No link yet</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusFilters.filter((f) => f.key !== 'all').map((f) => (
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
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.key ? 'bg-[#2B2F55] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
            {f.key !== 'all' && statusCounts[f.key] !== undefined && (
              <span className="ml-1.5 text-[10px] opacity-60">{statusCounts[f.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No registrations found</h3>
          <p className="text-sm text-slate-500">
            {searchQuery || statusFilter !== 'all' || selectedEventId !== 'all'
              ? 'Try adjusting your filters'
              : 'No one has registered for an event yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Registrant</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Session Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Registered</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((r) => (
                  <tr key={r.id} className={`transition-colors ${r.status === 'cancelled' ? 'bg-slate-50/60 text-slate-400' : 'hover:bg-slate-50'}`}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.email}</p>
                      {r.phone && <p className="text-xs text-slate-400">{r.phone}</p>}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{r.event_title}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{r.selected_date || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {r.amount_paid ? `${r.currency ?? ''} ${r.amount_paid}`.trim() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[r.payment_status] || 'bg-slate-100 text-slate-600'}`}>
                        {r.payment_status}
                      </span>
                      {r.status === 'cancelled' && (
                        <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                          cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      {r.status === 'cancelled' ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <button
                          onClick={() => cancelRegistration(r)}
                          disabled={cancellingId === r.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {cancellingId === r.id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Showing {filteredRegistrations.length} of {eventFiltered.length} registrations
      </p>
    </div>
  );
}
