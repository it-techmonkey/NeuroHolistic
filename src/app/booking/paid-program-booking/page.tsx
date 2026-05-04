import { Suspense } from 'react';
import { createClient } from '@/lib/auth/server';
import PaidProgramBookingForm from './PaidProgramBookingForm';

export const metadata = {
  title: 'Book Paid Program — NeuroHolistic',
  description: 'Choose your program type and complete your booking',
};

export default async function PaidProgramBookingPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const resolvedSearchParams = await searchParams;
  const academyMode = resolvedSearchParams?.mode === 'academy';

  // Extract user info if logged in (no redirect if not)
  const firstName = (user?.user_metadata?.first_name as string | undefined) || '';
  const lastName = (user?.user_metadata?.last_name as string | undefined) || '';
  const fullName = user
    ? (`${firstName} ${lastName}`.trim() || user.email || '')
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16 pt-24">
      <div className="max-w-3xl mx-auto">
        {/* Program Booking Form — Suspense needed for useSearchParams */}
        <Suspense fallback={
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Loading...</p>
          </div>
        }>
          <PaidProgramBookingForm
            userEmail={user?.email || ''}
            userName={fullName}
            isAuthenticated={!!user}
          />
        </Suspense>
      </div>
    </div>
  );
}
