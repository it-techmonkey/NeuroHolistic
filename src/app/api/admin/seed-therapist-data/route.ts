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

// Session-specific times (consistent for each session number)
const SESSION_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
function getSessionTime(sessionNum: number): string {
  return SESSION_TIMES[(sessionNum - 1) % SESSION_TIMES.length];
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
      { email: 'demo.full-program@email.com', name: 'Sarah Ahmad', phone: '+971501234570', state: 'active_program' },
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
        // Delete existing data for this client to avoid duplicates
        await supabase.from('session_materials').delete().eq('client_id', clientId);
        await supabase.from('session_development_forms').delete().eq('client_id', clientId);
        await supabase.from('diagnostic_assessments').delete().eq('client_id', clientId);
        await supabase.from('sessions').delete().eq('client_id', clientId);
        await supabase.from('bookings').delete().eq('user_id', clientId);
        await supabase.from('programs').delete().eq('user_id', clientId);
        
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
          const sessionIds = [];
          for (let i = 1; i <= 10; i++) {
            const isCompleted = i <= completedSessions;
            const { data: sessionData } = await supabase.from('sessions').insert({
              program_id: program.id, client_id: clientId, therapist_id: therapistId,
              session_number: i, date: isCompleted ? getPastDate(30 - i * 3) : getFutureDate((i - completedSessions) * 7),
              time: getSessionTime(i), status: isCompleted ? 'completed' : 'scheduled',
              is_complete: isCompleted, development_form_submitted: isCompleted,
              meet_link: generateMeetLink(),
            }).select().single();
            
            if (sessionData) {
              sessionIds.push(sessionData.id);
            }
          }
          results.created.push({ type: 'sessions', count: 10, for: client.email });
          
          // Add session materials for completed sessions
          const sessionMaterials = [
            { session: 1, type: 'pdf', name: 'Welcome Guide', description: 'Introduction to NeuroHolistic therapy approach' },
            { session: 1, type: 'pdf', name: 'Breathing Exercises', description: '4-7-8 breathing technique with illustrations' },
            { session: 2, type: 'pdf', name: 'Nervous System Basics', description: 'Understanding fight/flight/freeze responses' },
            { session: 2, type: 'audio', name: 'Body Scan Meditation', description: '15-minute guided meditation' },
            { session: 3, type: 'pdf', name: 'Emotional Awareness Worksheet', description: 'Identifying and naming emotions' },
            { session: 3, type: 'video', name: 'Grounding Techniques', description: '5-4-3-2-1 sensory grounding method' },
            { session: 4, type: 'pdf', name: 'Boundary Setting Guide', description: 'How to establish healthy boundaries' },
          ];
          
          for (let i = 0; i < completedSessions && i < sessionMaterials.length; i++) {
            const material = sessionMaterials[i];
            const sessionId = sessionIds[material.session - 1];
            if (sessionId) {
              await supabase.from('session_materials').insert({
                session_id: sessionId,
                type: material.type,
                url: `https://neuroholistic-materials.example.com/${material.type}/${material.name.toLowerCase().replace(/\s+/g, '-')}.${material.type === 'pdf' ? 'pdf' : material.type === 'video' ? 'mp4' : 'mp3'}`,
                filename: `${material.name}.${material.type === 'pdf' ? 'pdf' : material.type === 'video' ? 'mp4' : 'mp3'}`,
                description: material.description,
                uploaded_by: therapistId,
              });
            }
          }
          results.created.push({ type: 'session_materials', count: Math.min(completedSessions, 7) });
          
          // Add session development forms for completed sessions
          const sessionDevForms = [
            { session: 1, notes: 'Initial assessment. Client presenting with anxiety and stress. Established therapeutic rapport.', readiness: 42, nervous: 7, emotional: 7, cognitive: 6, body: 5, behavioral: 6, functioning: 7, improvements: 'Initial session', challenges: 'High anxiety', interventions: 'Clinical interview, intake assessment' },
            { session: 2, notes: 'Explored anxiety triggers. Introduced breathing techniques. Client engaged well.', readiness: 38, nervous: 6, emotional: 6, cognitive: 6, body: 5, behavioral: 6, functioning: 6, improvements: 'Completed session 1', challenges: 'Ongoing anxiety', interventions: 'Breathing exercises, psychoeducation' },
            { session: 3, notes: 'Worked on nervous system regulation. Client beginning to notice patterns.', readiness: 35, nervous: 6, emotional: 5, cognitive: 5, body: 4, behavioral: 5, functioning: 6, improvements: 'Completed session 2', challenges: 'Pattern recognition', interventions: 'Nervous system mapping, somatic awareness' },
            { session: 4, notes: 'Explored family dynamics. Emotional breakthrough. Good progress.', readiness: 32, nervous: 5, emotional: 5, cognitive: 5, body: 4, behavioral: 5, functioning: 5, improvements: 'Completed session 3', challenges: 'Family patterns', interventions: 'Family systems exploration, emotional processing' },
          ];
          
          for (let i = 0; i < completedSessions && i < sessionDevForms.length; i++) {
            const devForm = sessionDevForms[i];
            await supabase.from('session_development_forms').insert({
              client_id: clientId,
              therapist_id: therapistId,
              session_number: devForm.session,
              session_date: getPastDate(30 - devForm.session * 3),
              integration_notes: devForm.notes,
              therapist_internal_notes: devForm.notes,
              nervous_system_score: devForm.nervous,
              emotional_state_score: devForm.emotional,
              cognitive_patterns_score: devForm.cognitive,
              body_symptoms_score: devForm.body,
              behavioral_patterns_score: devForm.behavioral,
              life_functioning_score: devForm.functioning,
              goal_readiness_score: devForm.readiness,
              status: 'submitted',
              submitted_at: getPastDate(30 - devForm.session * 3),
              previous_session_improvements: devForm.improvements,
              previous_session_challenges: devForm.challenges,
              key_interventions: devForm.interventions,
            });
          }
          results.created.push({ type: 'dev_forms', count: completedSessions });

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
