'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signUp } from '@/app/auth/actions';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
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
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass + ' pr-10'}
                    placeholder="At least 8 characters"
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="passwordConfirm" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 block pb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    className={inputClass + ' pr-10'}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? (
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B2F55] text-white py-4 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#1E2140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
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
