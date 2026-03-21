'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-white px-0 py-3 border-b border-slate-200 focus:border-slate-900 focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400 font-light rounded-none';

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-[#2B2F55] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#2B2F55]" />
        <div className="relative z-10 max-w-md text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold mb-6">
            NeuroHolistic Institute
          </p>
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight leading-[1.1] mb-8">
            Reset Your
            <br />
            Password.
          </h1>
          <p className="text-white/60 font-light leading-relaxed">
            We'll send you a link to reset your password and regain access to your account.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-sm space-y-10">
          <Link href="/auth/login" className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-8 hover:text-slate-900 transition-colors">
            <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>

          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-slate-900">Password Recovery</h2>
            <p className="text-sm text-slate-500 font-light">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 space-y-4">
              <p className="text-sm text-emerald-900 font-medium">
                ✓ Password reset link sent
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Check your email for a link to reset your password. If you don't see it, check your spam folder.
              </p>
              <Link
                href="/auth/login"
                className="block text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1">
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-4 border-l-2 border-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B2F55] text-white py-4 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#1E2140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="text-slate-900 font-medium underline underline-offset-4 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
