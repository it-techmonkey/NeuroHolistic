'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useLang } from '@/lib/translations/LanguageContext';

export default function ConsultationConfirmedPage() {
  const { isArabic } = useLang();
  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className={`max-w-md w-full space-y-6 ${isArabic ? 'text-right' : 'text-center'}`}>
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-light text-slate-900">{isArabic ? 'تم تأكيد الاستشارة' : 'Consultation Confirmed'}</h1>
        
        <p className="text-slate-600 leading-relaxed">
          {isArabic
            ? 'تم إنشاء حجزك بنجاح. أرسلنا رسالة تأكيد إلى بريدك الإلكتروني تتضمن رابط Google Meet.'
            : 'Your booking has been successfully created. We have sent a confirmation email with the Google Meet link to your inbox.'}
        </p>
        
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mt-8">
          <p className="text-sm text-slate-500 mb-4">{isArabic ? 'جاهز لرحلتك الشمولية؟' : 'Ready for your holistic journey?'}</p>
          <div className="space-y-3">
            <Link 
              href="/dashboard/client" 
              className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              {isArabic ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
