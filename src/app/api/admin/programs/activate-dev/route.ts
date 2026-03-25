import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Check if user already has an active program to avoid duplicates?
    // For test, we just create a new one.

    // 1. Create Program
    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: userId,
        total_sessions: 10,
        status: 'active',
        payment_id: `dev_bypass_${Date.now()}`,
        program_type: 'private', // default
        sessions_completed: 0,
        used_sessions: 0
      })
      .select()
      .single();

    if (programError) {
      return NextResponse.json({ error: programError.message }, { status: 500 });
    }

    // 2. Create 10 Session Records
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      program_id: program.id,
      session_number: i + 1,
      status: 'pending',
      client_id: userId
    }));

    const { error: sessionsError } = await supabase
      .from('sessions')
      .insert(sessions);

    if (sessionsError) {
      console.error('Session creation failed', sessionsError);
      return NextResponse.json({ error: 'Program created but sessions failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, programId: program.id });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
