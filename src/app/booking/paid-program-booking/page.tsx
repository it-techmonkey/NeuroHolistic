import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import PaidProgramBookingForm from './PaidProgramBookingForm';

export const metadata = {
  title: 'Book Paid Program — NeuroHolistic',
  description: 'Choose your program type and complete your booking',
};

export default async function PaidProgramBookingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signup?intent=program&next=/booking/paid-program-booking');
  }

  const firstName = (user.user_metadata?.first_name as string | undefined) || '';
  const lastName = (user.user_metadata?.last_name as string | undefined) || '';
  const fullName = `${firstName} ${lastName}`.trim() || user.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-3">
            NeuroHolistic Program
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Book Your Paid Program
          </h1>
          <p className="text-slate-500 text-[16px] max-w-lg mx-auto leading-relaxed">
            Choose the program type that best suits your needs and begin your
            transformation journey.
          </p>
        </div>

        {/* Program Booking Form */}
        <PaidProgramBookingForm userEmail={user.email!} userName={fullName} />
      </div>
    </div>
  );
}
