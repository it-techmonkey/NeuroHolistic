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
    const normalizedProgramType = programType || (planType.includes('group') ? 'group' : 'private');

    // Auth check
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Check if user already has an active/completed/pending program
    const { data: existingProgram } = await supabase
      .from('programs')
      .select('id, status, payment_status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'active', 'completed'])
      .maybeSingle();

    if (existingProgram) {
      const statusMsg = existingProgram.status === 'pending'
        ? 'You have a program pending payment verification.'
        : 'You already have an active or completed program.';
      return NextResponse.json({
        error: statusMsg,
        programId: existingProgram.id,
        status: existingProgram.status,
        paymentStatus: existingProgram.payment_status,
      }, { status: 409 });
    }

    // Require completed free consultation before purchasing a paid program
    const { data: completedConsultation } = await supabase
      .from('bookings')
      .select('id, therapist_user_id, therapist_name')
      .eq('user_id', user.id)
      .eq('type', 'free_consultation')
      .eq('status', 'completed')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!completedConsultation) {
      return NextResponse.json({
        error: 'You must complete a free consultation before purchasing a paid program. Please book a free consultation first.',
        requiresConsultation: true,
      }, { status: 403 });
    }

    const therapistId = completedConsultation.therapist_user_id;
    const resolvedTherapistName = completedConsultation.therapist_name || 'Assigned Therapist';

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Create the program (user confirmed they paid — pending admin verification)
    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: user.id,
        therapist_user_id: therapistId,
        therapist_name: resolvedTherapistName,
        total_sessions: 10,
        used_sessions: 0,
        sessions_completed: 0,
        status: 'pending',
        payment_id: `MANUAL-${Date.now()}`,
        program_type: normalizedProgramType,
        price_paid: Math.round(amount / 100), // Convert fils back to AED
        client_name: userData?.full_name || 'Client',
        client_email: userData?.email || user.email,
        payment_status: 'pending_verification',
        payment_submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (programError) {
      console.error('[Purchase Program]', programError);
      return NextResponse.json({ error: programError.message }, { status: 500 });
    }

    // Create 10 pending session records — sessions remain pending until admin verifies payment
    const sessions = [];
    for (let i = 1; i <= 10; i++) {
      sessions.push({
        program_id: program.id,
        client_id: user.id,
        therapist_id: therapistId,
        session_number: i,
        date: null,
        time: null,
        status: 'pending',
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
        paymentStatus: program.payment_status,
        totalSessions: 10,
      },
      message: 'Payment submitted for verification. Our team will verify and confirm your booking shortly.',
    });
  } catch (error) {
    console.error('[Purchase Program]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
