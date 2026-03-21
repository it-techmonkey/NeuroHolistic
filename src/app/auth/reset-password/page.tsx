'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ChevronLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid session (they should from the email link)
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setSessionError(true);



        
      }
    };

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-white px-0 py-3 border-b border-slate-200 focus:border-slate-900 focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400 font-light rounded-none';

  if (sessionError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-light tracking-tight text-slate-900">Invalid or Expired Link</h1>
          <p className="text-sm text-slate-500">
            The password reset link has expired. Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block px-8 py-3 bg-[#2B2F55] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#1E2140] transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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
            Create a New
            <br />
            Password.
          </h1>
          <p className="text-white/60 font-light leading-relaxed">
            Enter a new password to secure your account.
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
            <h2 className="text-2xl font-light tracking-tight text-slate-900">Set New Password</h2>
            <p className="text-sm text-slate-500 font-light">
              Create a strong password to protect your account.
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 space-y-4 text-center">
              <p className="text-sm text-emerald-900 font-medium">
                ✓ Password updated successfully
              </p>
              <p className="text-xs text-emerald-700">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1">
                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="passwordConfirm" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  Confirm Password
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="••••••••"
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
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
