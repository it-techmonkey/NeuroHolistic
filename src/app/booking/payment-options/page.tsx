import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import PaymentButtons from './PaymentButtons';

export const metadata = {
  title: 'Choose Your Plan — NeuroHolistic',
};

export default async function PaymentOptionsPage() {
  // Server-side auth check — always reliable on production (reads cookies directly)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/booking/payment-options');
  }

  const firstName = (user.user_metadata?.first_name as string | undefined) || '';
  const lastName = (user.user_metadata?.last_name as string | undefined) || '';
  const fullName = `${firstName} ${lastName}`.trim() || user.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-3">
            NeuroHolistic Program
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Payment Option
          </h1>
          <p className="text-slate-500 text-[16px] max-w-md mx-auto leading-relaxed">
            The NeuroHolistic program consists of{' '}
            <strong className="text-slate-700">10 sessions</strong>. Choose the option
            that suits you best.
          </p>
        </div>

        {/* Payment buttons — client component for interactivity only */}
        <PaymentButtons userEmail={user.email!} userName={fullName} />
      </div>
    </div>
  );
}
