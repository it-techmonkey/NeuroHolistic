import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, programType, amount } = body;

    if (!planType || !amount) {
      return NextResponse.json({ error: 'Missing planType or amount' }, { status: 400 });
    }

    // Normalize program type for storage
    // planType values: 'private', 'session_by_session', 'group_full', 'group_session'
    // programType values: 'private' | 'group' (from the selection step)
    const normalizedProgramType = programType || (planType.includes('group') ? 'group' : 'private');

    // Auth check
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Check if user already has an active/completed program
    const { data: existingProgram } = await supabase
      .from('programs')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'completed'])
      .maybeSingle();

    if (existingProgram) {
      return NextResponse.json({ 
        error: 'You already have an active or completed program.',
        programId: existingProgram.id 
      }, { status: 409 });
    }

    // Get user's assigned therapist from their bookings
    const { data: booking } = await supabase
      .from('bookings')
      .select('therapist_user_id, therapist_name')
      .eq('user_id', user.id)
      .eq('type', 'free_consultation')
      .eq('status', 'completed')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const therapistId = booking?.therapist_user_id;
    const therapistName = booking?.therapist_name;

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Create the program
    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: user.id,
        therapist_user_id: therapistId,
        therapist_name: therapistName || 'Assigned Therapist',
        total_sessions: 10,
        used_sessions: 0,
        sessions_completed: 0,
        status: 'active',
        payment_id: `DEMO-${Date.now()}`,
        program_type: normalizedProgramType,
        price_paid: amount,
        client_name: userData?.full_name || 'Client',
        client_email: userData?.email || user.email,
      })
      .select()
      .single();

    if (programError) {
      console.error('[Purchase Program]', programError);
      return NextResponse.json({ error: programError.message }, { status: 500 });
    }

    // Create 10 pending session records - all sessions start as pending until scheduled
    const sessions = [];
    for (let i = 1; i <= 10; i++) {
      sessions.push({
        program_id: program.id,
        client_id: user.id,
        therapist_id: therapistId,
        session_number: i,
        date: null, // Not scheduled yet
        time: null,
        status: 'pending', // All sessions start as pending until user schedules them
        is_complete: false,
        development_form_submitted: false,
        meet_link: null,
      });
    }

    const { error: sessionsError } = await supabase
      .from('sessions')
      .insert(sessions);

    if (sessionsError) {
      console.error('[Purchase Program] Sessions error:', sessionsError);
      // Don't fail the whole request - program was created
    }

    // Assign therapist-client relationship
    if (therapistId) {
      await supabase.from('therapist_clients').upsert({
        therapist_id: therapistId,
        client_id: user.id,
        status: 'active',
      }, { onConflict: 'therapist_id,client_id' });
    }

    return NextResponse.json({
      success: true,
      program: {
        id: program.id,
        status: program.status,
        totalSessions: 10,
      },
      message: 'Program activated successfully!',
    });
  } catch (error) {
    console.error('[Purchase Program]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
