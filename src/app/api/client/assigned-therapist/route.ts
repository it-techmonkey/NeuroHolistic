import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';

const FOUNDER_SLUG = 'fawzia-yassmina';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(dr|doctor)\s+/i, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function isFounderTherapist(fullName: string | null, email: string | null): boolean {
  const e = email?.toLowerCase().trim();
  if (e === 'fawzia@neuroholistic.com' || e === 'dr.fawzia@neuroholistic.com') return true;
  const key = normalizeName(fullName || '');
  return key.includes('fawzia') && (key.includes('yassmina') || key.includes('yasmina'));
}

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // First, check therapist_clients table
    const { data: therapistClient } = await supabase
      .from('therapist_clients')
      .select('therapist_id')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let therapistId = therapistClient?.therapist_id;

    // If not found, check completed free consultation bookings
    if (!therapistId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('therapist_user_id')
        .eq('user_id', user.id)
        .eq('type', 'free_consultation')
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      therapistId = booking?.therapist_user_id;
    }

    if (!therapistId) {
      return NextResponse.json({ therapist: null });
    }

    // Get therapist details
    const { data: therapist } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', therapistId)
      .eq('role', 'therapist')
      .maybeSingle();

    if (!therapist) {
      return NextResponse.json({ therapist: null });
    }

    // Canonical founder slug matches team profiles + pricing.ts (not derived name slug)
    const slug = isFounderTherapist(therapist.full_name, therapist.email)
      ? FOUNDER_SLUG
      : therapist.full_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

    return NextResponse.json({
      therapist: {
        id: therapist.id,
        name: therapist.full_name,
        email: therapist.email,
        slug,
      },
    });
  } catch (error) {
    console.error('[Assigned Therapist] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
