import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { getAuthenticatedUserProgram } from '@/lib/programs';
import Link from 'next/link';

export const metadata = {
  title: 'Program Confirmed — NeuroHolistic',
  description: 'Your NeuroHolistic program has been confirmed',
};

export default async function ProgramConfirmedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/booking/program-confirmed');
  }

  const userProgram = await getAuthenticatedUserProgram();
  const firstName = (user.user_metadata?.first_name as string | undefined) || user.email?.split('@')[0] || 'there';
  const totalSessions = userProgram?.program?.total_sessions ?? 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Success Animation */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 mb-6">
            <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] rounded-full bg-emerald-100 text-emerald-700 mb-4">
            Program Active
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
            Your Program Has Been<br />
            <span className="text-emerald-600">Successfully Confirmed</span>
          </h1>
          <p className="text-slate-500 text-[16px] leading-relaxed max-w-md mx-auto">
            Welcome, <strong className="text-slate-700">{firstName}</strong>!
            You can now schedule your sessions through the calendar.
          </p>
        </div>

        {/* Program Details Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Your Program</p>
                <h2 className="text-xl font-bold text-slate-900">NeuroHolistic Program</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500 mb-1">Sessions</p>
                <p className="text-3xl font-bold text-[#2B2F55]">{totalSessions}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-slate-700">{totalSessions} sessions included in your program</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-slate-700">Schedule sessions at your own pace</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-slate-700">Remaining sessions visible in your dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/booking/schedule-session"
            className="block w-full py-4 rounded-xl bg-[#2B2F55] text-white font-semibold text-center text-[16px] hover:bg-[#3d4270] transition-all shadow-lg shadow-[#2B2F55]/15 active:scale-[0.98]"
          >
            Schedule Your Session →
          </Link>
          <Link
            href="/dashboard"
            className="block w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-center text-[15px] hover:bg-slate-50 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
