'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signUp, signInWithGoogle } from '@/app/auth/actions';

const COUNTRIES = [
  'UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman',
  'Egypt', 'Jordan', 'Lebanon', 'Iraq', 'Morocco', 'Tunisia',
  'Turkey', 'India', 'Pakistan', 'United Kingdom', 'United States', 'Canada', 'Other'
];

function SignUpForm() {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent'); // 'program' for paid flow
  const next = searchParams.get('next') || undefined;
  const emailPrefill = searchParams.get('email') || '';
  const firstNamePrefill = searchParams.get('firstName') || '';
  const lastNamePrefill = searchParams.get('lastName') || '';
  const phonePrefill = searchParams.get('phone') || '';

  const [firstName, setFirstName] = useState(firstNamePrefill);
  const [lastName, setLastName] = useState(lastNamePrefill);
  const [phone, setPhone] = useState(phonePrefill);
  const [email, setEmail] = useState(emailPrefill);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await signUp({
      firstName,
      lastName,
      phone,
      email,
      password,
      passwordConfirm,
      country,
      redirectTo: intent === 'program'
        ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${next || '/booking/payment-options'}`
        : undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if ((result as { redirectTo?: string }).redirectTo) {
      window.location.href = (result as { redirectTo: string }).redirectTo;
    } else if (result.success) {
      // Create lead record for free consultation signup
      if (intent === 'consultation' || !intent) {
        try {
          await fetch('/api/consultation/create-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: `${firstName} ${lastName}`.trim(), mobile: phone, email, country }),
          });
        } catch {
          // Non-critical, continue to booking
        }
        window.location.href = '/consultation/book';
        return;
      }
      setSuccess(result.message || 'Account created successfully. Check your email to verify your account.');
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
    }
  }

  const inputClass =
    'w-full bg-white px-0 py-3 border-b border-slate-200 focus:border-slate-900 focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400 font-light rounded-none';

  async function handleGoogleSignIn() {
    setError('');
    setSuccess('');
    setLoading(true);
    
    const result = await signInWithGoogle(next);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-[#F8FAFC] items-center justify-center p-12 relative overflow-hidden">
        <div className="max-w-md z-10 relative">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-6">
            Membership
          </p>
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-slate-900 leading-[1.1] mb-8">
            Begin the<br />
            journey inward.
          </h1>
          <p className="text-slate-500 font-light leading-relaxed">
            Create your account to access the NeuroHolistic method, schedule your sessions, and track your transformation.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-sm space-y-10 my-auto">

          {/* Program intent banner */}
          {intent === 'program' && (
            <div className="p-5 bg-indigo-50/50 border border-indigo-100/50">
              <p className="text-[10px] uppercase tracking-widest text-indigo-900 font-semibold mb-2">Program Access</p>
              <p className="text-xs text-indigo-700 leading-relaxed font-light">
                You are registering for the 10-session NeuroHolistic program. Please create your account to proceed to payment.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-slate-900">Create Account</h2>
            <p className="text-sm text-slate-500 font-light">
              {intent === 'program' ? 'For program registration' : 'Enter your details below'}
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 space-y-4">
              <p className="text-sm text-emerald-900 font-medium">{success}</p>
              <p className="text-xs text-emerald-700">
                After verifying your email,{' '}
                <Link
                  href={intent === 'program' ? `/auth/login?next=${encodeURIComponent(next || '/booking/payment-options')}` : '/auth/login'}
                  className="underline font-semibold hover:text-emerald-900"
                >
                  log in here
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Sara"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Ahmed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="phone" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="+971 50 000 0000"
                />
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label htmlFor="country" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className={inputClass + ' bg-white'}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  Email
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

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
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
                  placeholder="Confirm matches"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-4 border-l-2 border-red-500 backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B2F55] text-white py-4 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#1E2140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-slate-400">or continue with</span>
              </div>
            </div>

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
              Sign up with Google
            </button>
            </>
          )}

          {/* Login Link */}
          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              href={intent === 'program' ? `/auth/login?next=${encodeURIComponent(next || '/booking/payment-options')}` : '/auth/login'}
              className="text-slate-900 font-medium underline underline-offset-4 hover:text-indigo-600 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignUpForm />
    </Suspense>
  );
}
