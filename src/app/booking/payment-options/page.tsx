import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';

export const metadata = {
  title: 'Choose Your Plan — NeuroHolistic',
};

export default async function PaymentOptionsPage() {
  // Redirect to the new paid program booking page
  redirect('/booking/paid-program-booking');
}
