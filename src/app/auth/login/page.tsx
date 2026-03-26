'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login, signInWithGoogle } from '@/app/auth/actions';

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

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    
    const result = await signInWithGoogle(targetAfterLogin);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.url) {
      window.location.href = result.url;
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-slate-400">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-4 rounded-full text-xs font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

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
