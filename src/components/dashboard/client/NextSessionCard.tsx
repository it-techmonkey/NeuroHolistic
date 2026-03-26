'use client';

import Link from 'next/link';
import { Video, CalendarPlus, CalendarClock, ChevronRight, User } from 'lucide-react';
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

/** * UI HELPERS 
 */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function NextSessionCard({ session, canScheduleNext, nextSessionNumber }: NextSessionCardProps) {
  
  /**
   * STATE: ELIGIBLE TO BOOK BUT NO SESSION
   */
  if (!session && canScheduleNext) {
    return (
      <Card className="relative overflow-hidden p-8 border-none bg-gradient-to-br from-[#2B2F55] to-[#1F2345] text-white shadow-xl shadow-[#2B2F55]/20">
        <div className="relative z-10 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Action Required
          </div>
          http://localhost:3000/booking/schedule-session
          <h3 className="text-2xl font-bold mb-2">
            Schedule Session {nextSessionNumber ?? ''}
          </h3>
          <p className="text-white/70 text-sm mb-8 max-w-[240px] leading-relaxed">
            Your next milestone is ready. Choose a time that fits your current rhythm.
          </p>
          
          <Link
            href="/book?mode=program"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-[#2B2F55] text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Schedule Now
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* Decorative background element */}
        <CalendarPlus className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
      </Card>
    );
  }

  /**
   * STATE: COMPLETELY EMPTY / INACTIVE
   */
  if (!session) {
    return (
      <Card className="p-10 border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-5">
          <CalendarClock className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Quiet for now</h3>
        <p className="text-sm text-slate-500 mt-2 mb-8 max-w-[200px]">
          Whenever you're ready to talk, we're here to support you.
        </p>
        <Link
          href="/book"
          className="text-sm font-bold text-[#2B2F55] hover:underline flex items-center gap-1"
        >
          Book a session <ChevronRight className="w-4 h-4" />
        </Link>
      </Card>
    );
  }

  /**
   * STATE: UPCOMING SESSION (MAIN VIEW)
   */
  return (
    <Card className="p-0 border-none bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Confirmed Session</span>
        </div>
        {session.sessionNumber && (
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            SESS. {session.sessionNumber}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* DateTime & Details */}
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              {fmtDate(session.date)}
            </h4>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-base font-medium">{fmtTime(session.time)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold text-slate-700">{session.therapistName || 'Practitioner'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {session.meetingLink && (
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#2B2F55] text-white text-sm font-bold shadow-lg shadow-[#2B2F55]/10 hover:opacity-90 transition-all active:scale-95"
              >
                <Video className="w-4 h-4" />
                Join Session
              </a>
            )}
            <Link
              href={`/book?reschedule=${session.id}`}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              <CalendarClock className="w-4 h-4" />
              Reschedule
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}