'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function ProgramConfirmedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      // Check if user has an active program
      const res = await fetch('/api/users/check-program');
      if (res.ok) {
        const data = await res.json();
        if (data.program) {
          setProgram(data.program);
        }
      }
      setLoading(false);
    }
    init();
  }, [router]);

  const handleDevBypass = async () => {
    if (!user) return;
    setActivating(true);
    setError('');

    try {
      const res = await fetch('/api/admin/programs/activate-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: 'full' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Activation failed');
      }

      const data = await res.json();
      setProgram({ id: data.programId, status: 'active' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-light text-slate-900 mb-4">Your Program is Confirmed</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        Thank you for choosing the NeuroHolistic program. Your 10-session journey begins now.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 max-w-md">
          {error}
        </div>
      )}

      {/* Program Status */}
      {program ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-sm">
            <p className="text-green-800 font-medium">Program Active</p>
            <p className="text-green-600 text-sm mt-1">
              10 sessions available. Schedule your first session to begin.
            </p>
          </div>

          <Link
            href="/dashboard/client"
            className="inline-block px-8 py-3 bg-[#2B2F55] text-white rounded-lg font-medium hover:bg-[#1E2140] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-sm">
            <p className="text-slate-600 text-sm mb-4">
              Your program will be activated once payment is confirmed. In test mode, you can activate it manually.
            </p>
            
            {/* Dev Bypass Button */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
                Development Mode
              </p>
              <button
                onClick={handleDevBypass}
                disabled={activating}
                className="w-full py-2 px-4 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {activating ? 'Activating...' : 'Activate Program & Create 10 Sessions'}
              </button>
            </div>
          </div>

          <Link
            href="/dashboard/client"
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
