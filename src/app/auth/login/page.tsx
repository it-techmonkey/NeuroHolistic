'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/auth/actions';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const redirectTo = searchParams.get('redirectTo');
  const targetAfterLogin = next || redirectTo || undefined;
  const signupHref = next
    ? `/auth/signup?next=${encodeURIComponent(next)}`
    : '/auth/signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if we just verified email
  useEffect(() => {
    // Only check hash on client side
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
       // This implies supabase handled the collection, we just need to redirect
       // or let the session context update.
       // For now, let's just clear the hash so it looks cleaner
       window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[Login Form] Submitting with:', { email, targetAfterLogin });
    const result = await login({ email, password, next: targetAfterLogin });
    console.log('[Login Form] Result:', result);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Hard navigation resets the React tree, picking up fresh server-side session cookies.
      // This is required to avoid the AuthContext stale-state issue where the dashboard
      // would show a loading spinner indefinitely or redirect incorrectly.
      const redirectUrl = result.redirectTo || targetAfterLogin || '/dashboard';
      console.log('[Login Form] Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    }
  }

  const inputClass =
    'w-full bg-white px-0 py-3 border-b border-slate-200 focus:border-slate-900 focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400 font-light rounded-none';

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-[#2B2F55] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#2B2F55]" />
        {/* Abstract pattern could go here */}
        <div className="relative z-10 max-w-md text-white">
           <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold mb-6">
              NeuroHolistic Institute
           </p>
           <h1 className="text-4xl lg:text-5xl font-light tracking-tight leading-[1.1] mb-8">
              Return to your<br />
              center of gravity.
           </h1>
           <p className="text-white/60 font-light leading-relaxed">
              Access your personalized dashboard, session history, and assessment results.
           </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-sm space-y-10">
          
          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-slate-900">Sign In</h2>
            <p className="text-sm text-slate-500 font-light">
               Enter your credentials to access the platform.
            </p>
          </div>

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

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                 <label htmlFor="password" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                   Password
                 </label>
                 <Link
                   href="/auth/forgot-password"
                   className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 hover:text-slate-900 transition-colors"
                 >
                   Forgot?
                 </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass + ' pr-10'}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-4 border-l-2 border-red-500 backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B2F55] text-white py-4 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#1E2140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              href={signupHref}
              className="text-slate-900 font-medium underline underline-offset-4 hover:text-indigo-600 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
