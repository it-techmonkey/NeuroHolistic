'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useLang } from '@/lib/translations/LanguageContext';

export default function ProgramConfirmedPage() {
  const router = useRouter();
  const { isArabic } = useLang();
  const [user, setUser] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

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

  if (loading) {
    return (
      <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-500">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className={`min-h-screen bg-white flex flex-col items-center justify-center p-6 ${isArabic ? 'text-right' : 'text-center'}`}>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-light text-slate-900 mb-4">{isArabic ? 'تم تأكيد برنامجك' : 'Your Program is Confirmed'}</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        {isArabic
          ? 'شكرًا لاختيارك برنامج NeuroHolistic. رحلتك المكونة من 10 جلسات تبدأ الآن.'
          : 'Thank you for choosing the NeuroHolistic program. Your 10-session journey begins now.'}
      </p>

      {program ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-sm">
            <p className="text-green-800 font-medium">{isArabic ? 'البرنامج نشط' : 'Program Active'}</p>
            <p className="text-green-600 text-sm mt-1">
              {isArabic ? '10 جلسات متاحة. قم بجدولة جلستك الأولى للبدء.' : '10 sessions available. Schedule your first session to begin.'}
            </p>
          </div>

          <Link
            href="/dashboard/client"
            className="inline-block px-8 py-3 bg-[#2B2F55] text-white rounded-lg font-medium hover:bg-[#1E2140] transition-colors"
          >
            {isArabic ? 'اذهب إلى لوحة التحكم' : 'Go to Dashboard'}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-sm">
            <p className="text-slate-600 text-sm">
              {isArabic
                ? 'سيتم تفعيل برنامجك بعد تأكيد الدفع.'
                : 'Your program will be activated once payment is confirmed by our team.'}
            </p>
          </div>

          <Link
            href="/dashboard/client"
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            {isArabic ? 'اذهب إلى لوحة التحكم' : 'Go to Dashboard'}
          </Link>
        </div>
      )}
    </div>
  );
}
