import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: completedConsultation } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('type', 'free_consultation')
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      hasCompletedConsultation: !!completedConsultation,
    });
  } catch (error) {
    console.error('[Check Consultation]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
