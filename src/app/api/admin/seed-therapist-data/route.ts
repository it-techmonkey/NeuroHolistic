import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DEMO_PASSWORD = 'NeuroHolistic2024!';

function generateMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return `https://meet.google.com/${chars.slice(0,3)}-${chars.slice(3,6)}-${chars.slice(6,10)}`;
}

function getFutureDate(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
}

function getPastDate(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
}

function getRandomTime(): string {
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  return times[Math.floor(Math.random() * times.length)];
}

export async function POST() {
  const supabase = getServiceSupabase();
  const results: any = { created: [], errors: [] };

  try {
    // 1. Get or create therapist (Mariam)
    let therapistId: string;
    const { data: existingTherapist } = await supabase
      .from('users').select('id').eq('email', 'mariam-al-kaisi@neuroholistic.com').single();
    
    if (existingTherapist) {
      therapistId = existingTherapist.id;
    } else {
      const { data: auth } = await supabase.auth.admin.createUser({
        email: 'mariam-al-kaisi@neuroholistic.com',
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (auth.user) {
        await supabase.from('users').insert({
          id: auth.user.id, email: 'mariam-al-kaisi@neuroholistic.com',
          role: 'therapist', full_name: 'Mariam Al Kaisi', phone: '+961701234567', country: 'Lebanon',
        });
        therapistId = auth.user.id;
      } else {
        throw new Error('Failed to create therapist');
      }
    }

    // Set therapist availability
    for (let day = 1; day <= 5; day++) {
      await supabase.from('therapist_availability').upsert({
        therapist_id: therapistId, day_of_week: day,
        start_time: '09:00', end_time: '18:00', is_blocked: false,
      }, { onConflict: 'therapist_id,day_of_week' });
    }

    // 2. Create clients and their data
    const clients = [
      { email: 'demo.full-program@email.com', name: 'Sarah Ahmad', phone: '+971501234570', state: 'completed_program' },
      { email: 'demo.active-program@email.com', name: 'Mohammed Khalid', phone: '+971501234571', state: 'active_program' },
      { email: 'demo.mid-program@email.com', name: 'Layla Hussein', phone: '+961701234570', state: 'mid_program' },
      { email: 'demo.consultation-done@email.com', name: 'Omar Farouk', phone: '+201001234570', state: 'consultation_done' },
      { email: 'demo.single-session@email.com', name: 'Fatima Ali', phone: '+971501234572', state: 'single_session' },
      { email: 'demo.pending-consultation@email.com', name: 'Youssef Rashid', phone: '+97336000001', state: 'pending_consultation' },
      { email: 'demo.new-user@email.com', name: 'Noor Ibrahim', phone: '+201001234571', state: 'new_user' },
    ];

    for (const client of clients) {
      // Create or get client
      let clientId: string;
      const { data: existingClient } = await supabase
        .from('users').select('id').eq('email', client.email).single();
      
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: auth } = await supabase.auth.admin.createUser({
          email: client.email, password: DEMO_PASSWORD, email_confirm: true,
        });
        if (auth.user) {
          await supabase.from('users').insert({
            id: auth.user.id, email: client.email, role: 'client',
            full_name: client.name, phone: client.phone, country: 'UAE',
          });
          clientId = auth.user.id;
        } else {
          results.errors.push(`Failed to create client: ${client.email}`);
          continue;
        }
      }

      // Assign therapist
      await supabase.from('therapist_clients').upsert({
        therapist_id: therapistId, client_id: clientId, status: 'active',
      }, { onConflict: 'therapist_id,client_id' });

      const meetLink = generateMeetLink();

      // Create data based on state
      if (client.state === 'completed_program' || client.state === 'active_program' || client.state === 'mid_program') {
        const completedSessions = client.state === 'completed_program' ? 10 : client.state === 'active_program' ? 4 : 7;
        const status = client.state === 'completed_program' ? 'completed' : 'active';

        // Free consultation
        await supabase.from('bookings').insert({
          user_id: clientId, name: client.name, email: client.email, phone: client.phone,
          therapist_id: therapistId, therapist_user_id: therapistId, therapist_name: 'Mariam Al Kaisi',
          date: getPastDate(30), time: '10:00', type: 'free_consultation', status: 'completed',
          meeting_link: meetLink,
        });

        // Paid program
        const { data: program } = await supabase.from('programs').insert({
          user_id: clientId, therapist_user_id: therapistId, therapist_name: 'Mariam Al Kaisi',
          total_sessions: 10, used_sessions: completedSessions, sessions_completed: completedSessions,
          status: status, payment_id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          program_type: 'private', price_paid: 7700,
          client_name: client.name, client_email: client.email,
        }).select().single();

        if (program) {
          results.created.push({ type: 'program', client: client.email, status, revenue: 7700 });

          // Create sessions
          for (let i = 1; i <= 10; i++) {
            const isCompleted = i <= completedSessions;
            await supabase.from('sessions').insert({
              program_id: program.id, client_id: clientId, therapist_id: therapistId,
              session_number: i, date: isCompleted ? getPastDate(30 - i * 3) : getFutureDate((i - completedSessions) * 7),
              time: getRandomTime(), status: isCompleted ? 'completed' : 'scheduled',
              is_complete: isCompleted, development_form_submitted: isCompleted,
              meet_link: generateMeetLink(),
            });
          }
          results.created.push({ type: 'sessions', count: 10, for: client.email });

          // Assessment
          await supabase.from('diagnostic_assessments').insert({
            client_id: clientId, therapist_id: therapistId, is_baseline: true,
            main_complaint: 'Anxiety and stress', current_symptoms: ['anxiety', 'stress'],
            previous_therapy: false, nervous_system_pattern: 'hyper', nervous_system_score: 7,
            emotional_state_score: 7, cognitive_patterns_score: 6, body_symptoms_score: 5,
            behavioral_patterns_score: 6, life_functioning_score: 7,
            root_cause_pattern_timeline: 'Several years', root_cause_parental_influence: 'High expectations',
            root_cause_core_patterns: 'Perfectionism', root_cause_contributing_factors: 'Work stress',
            clinical_condition_brief: 'Generalized anxiety', therapist_focus: 'Nervous system regulation',
            therapy_goal: 'Reduce anxiety', status: 'submitted', assessed_at: getPastDate(30),
          });
          results.created.push({ type: 'assessment', client: client.email });
        }
      } else if (client.state === 'consultation_done') {
        await supabase.from('bookings').insert({
          user_id: clientId, name: client.name, email: client.email, phone: client.phone,
          therapist_id: therapistId, therapist_user_id: therapistId, therapist_name: 'Mariam Al Kaisi',
          date: getPastDate(3), time: '15:00', type: 'free_consultation', status: 'completed',
          meeting_link: meetLink,
        });
        results.created.push({ type: 'booking', client: client.email, status: 'consultation_done' });
      } else if (client.state === 'single_session') {
        await supabase.from('bookings').insert({
          user_id: clientId, name: client.name, email: client.email, phone: client.phone,
          therapist_id: therapistId, therapist_user_id: therapistId, therapist_name: 'Mariam Al Kaisi',
          date: getFutureDate(3), time: '10:00', type: 'paid_session', status: 'confirmed',
          meeting_link: meetLink, price: 800,
        });
        results.created.push({ type: 'booking', client: client.email, revenue: 800 });
      } else if (client.state === 'pending_consultation') {
        await supabase.from('bookings').insert({
          user_id: clientId, name: client.name, email: client.email, phone: client.phone,
          therapist_id: therapistId, therapist_user_id: therapistId, therapist_name: 'Mariam Al Kaisi',
          date: getFutureDate(1), time: '14:00', type: 'free_consultation', status: 'confirmed',
          meeting_link: meetLink,
        });
        results.created.push({ type: 'booking', client: client.email, status: 'pending' });
      }
      // new_user - no data
    }

    // Set all passwords
    const { data: allAuthUsers } = await supabase.auth.admin.listUsers();
    for (const user of allAuthUsers?.users || []) {
      await supabase.auth.admin.updateUserById(user.id, { password: DEMO_PASSWORD });
    }

    return NextResponse.json({
      success: true,
      password: DEMO_PASSWORD,
      therapist: { email: 'mariam-al-kaisi@neuroholistic.com', name: 'Mariam Al Kaisi' },
      created: results.created,
      errors: results.errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, errors: results.errors }, { status: 500 });
  }
}
