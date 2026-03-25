'use client';

import Link from 'next/link';
import { Video, CalendarPlus, CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface NextSessionCardProps {
  session: {
    id: string;
    date: string;
    time: string;
    therapistName: string | null;
    meetingLink: string | null;
    sessionNumber: number | null;
  } | null;
  canScheduleNext: boolean;
  nextSessionNumber: number | null;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function NextSessionCard({ session, canScheduleNext, nextSessionNumber }: NextSessionCardProps) {
  if (!session && canScheduleNext) {
    return (
      <Card className="p-6" border>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[#2B2F55]/10 flex items-center justify-center mb-4">
            <CalendarPlus className="w-6 h-6 text-[#2B2F55]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Ready for Session {nextSessionNumber ?? 'Next'}
          </h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs">
            You&apos;re eligible to book your next session. Pick a time that works for you.
          </p>
          <Link
            href="/book?mode=program"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#2B2F55] text-white text-sm font-medium shadow-sm hover:bg-[#1F2345] transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Schedule Next Session
          </Link>
        </div>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="p-6" border>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <CalendarClock className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Upcoming Sessions</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-5">
            You don&apos;t have any sessions scheduled at the moment.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#2B2F55] text-white text-sm font-medium shadow-sm hover:bg-[#1F2345] transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Book a Session
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" border>
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Next Session
        </h3>
        {session.sessionNumber && (
          <span className="text-xs font-medium text-[#2B2F55] bg-[#2B2F55]/10 px-2 py-0.5 rounded-full">
            #{session.sessionNumber}
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-slate-900 mt-3">
        {fmtDate(session.date)}
      </p>
      <p className="text-base text-slate-600 mt-0.5">{fmtTime(session.time)}</p>

      {session.therapistName && (
        <p className="text-sm text-slate-500 mt-2">
          with <span className="font-medium text-slate-700">{session.therapistName}</span>
        </p>
      )}

      <div className="flex items-center gap-3 mt-5">
        {session.meetingLink && (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#2B2F55] text-white text-sm font-medium shadow-sm hover:bg-[#1F2345] transition-colors"
          >
            <Video className="w-4 h-4" />
            Join Call
          </a>
        )}
        <Link
          href={`/book?reschedule=${session.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <CalendarClock className="w-4 h-4" />
          Reschedule
        </Link>
      </div>
    </Card>
  );
}
