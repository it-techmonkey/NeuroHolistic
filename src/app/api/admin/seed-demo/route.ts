import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DEMO_PASSWORD = 'NeuroHolistic2024!';

// Therapist for demo (Mariam Al Kaisi)
const DEMO_THERAPIST = {
  email: 'mariam@neuroholistic.com',
  fullName: 'Mariam Al Kaisi',
  phone: '+961701234567',
  country: 'Lebanon',
};

// Admin (Dr. Fawzia - founder)
const ADMIN = {
  email: 'fawzia@neuroholistic.com',
  fullName: 'Dr. Fawzia Yassmina',
  phone: '+971501234567',
  country: 'UAE',
};

// Clients with different states for demo
const DEMO_CLIENTS = [
  {
    email: 'demo.full-program@email.com',
    firstName: 'Sarah',
    lastName: 'Ahmad',
    phone: '+971501234570',
    country: 'UAE',
    state: 'completed_program', // 10 sessions completed, 7700 AED paid
  },
  {
    email: 'demo.active-program@email.com',
    firstName: 'Mohammed',
    lastName: 'Khalid',
    phone: '+971501234571',
    country: 'UAE',
    state: 'active_program', // 4/10 sessions done, 7700 AED paid
  },
  {
    email: 'demo.session5@email.com',
    firstName: 'Layla',
    lastName: 'Hussein',
    phone: '+961701234570',
    country: 'Lebanon',
    state: 'mid_program', // 7/10 sessions done, 7700 AED paid
  },
  {
    email: 'demo.consultation-done@email.com',
    firstName: 'Omar',
    lastName: 'Farouk',
    phone: '+201001234570',
    country: 'Egypt',
    state: 'consultation_done', // Free consultation done, no program yet
  },
  {
    email: 'demo.single-session@email.com',
    firstName: 'Fatima',
    lastName: 'Ali',
    phone: '+971501234572',
    country: 'UAE',
    state: 'single_session', // 1 paid session at 800 AED
  },
  {
    email: 'demo.pending-consultation@email.com',
    firstName: 'Youssef',
    lastName: 'Rashid',
    phone: '+97336000001',
    country: 'Bahrain',
    state: 'pending_consultation', // Free consultation booked for tomorrow
  },
  {
    email: 'demo.new-user@email.com',
    firstName: 'Noor',
    lastName: 'Ibrahim',
    phone: '+201001234571',
    country: 'Egypt',
    state: 'new_user', // Just signed up, nothing booked
  },
];

function generateMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const code = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '-' +
               Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '-' +
               Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${code}`;
}

function getFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function getRandomTime(): string {
  const hours = [9, 10, 11, 14, 15, 16, 17];
  return `${String(hours[Math.floor(Math.random() * hours.length)]).padStart(2, '0')}:00`;
}

export async function POST() {
  const supabase = getServiceSupabase();
  const results: any = {
    therapist: null,
    admin: null,
    clients: [],
    bookings: [],
    programs: [],
    sessions: [],
    assessments: [],
    errors: [],
  };

  try {
    // 1. Create Admin (Dr. Fawzia)
    console.log('[Seed] Creating admin...');
    const { data: existingAdmins } = await supabase.auth.admin.listUsers();
    let adminUser = existingAdmins?.users?.find((u: any) => u.email === ADMIN.email);

    if (!adminUser) {
      const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
        email: ADMIN.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (!adminError && adminAuth.user) {
        await supabase.from('users').insert({
          id: adminAuth.user.id,
          email: ADMIN.email,
          role: 'admin',
          full_name: ADMIN.fullName,
          phone: ADMIN.phone,
          country: ADMIN.country,
        });
        adminUser = adminAuth.user;
      }
    } else {
      await supabase.auth.admin.updateUserById(adminUser.id, { password: DEMO_PASSWORD });
      await supabase.from('users').update({ role: 'admin' }).eq('id', adminUser.id);
    }
    results.admin = { email: ADMIN.email, status: 'ready', password: DEMO_PASSWORD };

    // 2. Create Demo Therapist (Mariam)
    console.log('[Seed] Creating therapist...');
    let therapistUser = existingAdmins?.users?.find((u: any) => u.email === DEMO_THERAPIST.email);

    if (!therapistUser) {
      const { data: therapistAuth, error: therapistError } = await supabase.auth.admin.createUser({
        email: DEMO_THERAPIST.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (!therapistError && therapistAuth.user) {
        await supabase.from('users').insert({
          id: therapistAuth.user.id,
          email: DEMO_THERAPIST.email,
          role: 'therapist',
          full_name: DEMO_THERAPIST.fullName,
          phone: DEMO_THERAPIST.phone,
          country: DEMO_THERAPIST.country,
        });
        therapistUser = therapistAuth.user;
      }
    } else {
      await supabase.auth.admin.updateUserById(therapistUser.id, { password: DEMO_PASSWORD });
      await supabase.from('users').update({ role: 'therapist' }).eq('id', therapistUser.id);
    }
    results.therapist = { email: DEMO_THERAPIST.email, status: 'ready', password: DEMO_PASSWORD };

    // Set therapist availability (Mon-Fri 9am-6pm)
    if (therapistUser) {
      for (let day = 1; day <= 5; day++) {
        await supabase.from('therapist_availability').upsert({
          therapist_id: therapistUser.id,
          day_of_week: day,
          start_time: '09:00',
          end_time: '18:00',
          is_blocked: false,
        }, { onConflict: 'therapist_id,day_of_week' });
      }
    }

    // 3. Create Clients and their data
    console.log('[Seed] Creating clients...');
    for (const clientData of DEMO_CLIENTS) {
      let clientUser = existingAdmins?.users?.find((u: any) => u.email === clientData.email);

      if (!clientUser) {
        const { data: clientAuth, error: clientError } = await supabase.auth.admin.createUser({
          email: clientData.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
        });
        if (!clientError && clientAuth.user) {
          await supabase.from('users').insert({
            id: clientAuth.user.id,
            email: clientData.email,
            role: 'client',
            full_name: `${clientData.firstName} ${clientData.lastName}`,
            phone: clientData.phone,
            country: clientData.country,
          });
          clientUser = clientAuth.user;
        }
      } else {
        await supabase.auth.admin.updateUserById(clientUser.id, { password: DEMO_PASSWORD });
      }

      if (!clientUser) {
        results.errors.push(`Failed to create client: ${clientData.email}`);
        continue;
      }

      const clientId = clientUser.id;
      results.clients.push({ email: clientData.email, state: clientData.state, status: 'ready' });

      // Assign therapist to client
      if (therapistUser) {
        await supabase.from('therapist_clients').upsert({
          therapist_id: therapistUser.id,
          client_id: clientId,
          status: 'active',
        }, { onConflict: 'therapist_id,client_id' });
      }

      const meetLink = generateMeetLink();

      // Create data based on client state
      switch (clientData.state) {
        case 'completed_program':
          // 1. Free consultation (completed)
          await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: therapistUser?.id,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            date: getPastDate(45),
            time: '10:00',
            type: 'free_consultation',
            status: 'completed',
            meeting_link: generateMeetLink(),
          });
          results.bookings.push({ type: 'free_consultation', status: 'completed' });

          // 2. Paid program (7700 AED)
          const { data: completedProgram } = await supabase.from('programs').insert({
            user_id: clientId,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            total_sessions: 10,
            used_sessions: 10,
            sessions_completed: 10,
            status: 'completed',
            payment_id: `PAY-${Date.now()}-FULL`,
            program_type: 'private',
            price_paid: 7700,
            client_name: `${clientData.firstName} ${clientData.lastName}`,
            client_email: clientData.email,
          }).select().single();

          if (completedProgram) {
            results.programs.push({ status: 'completed', revenue: 7700 });
            // Create 10 completed sessions
            for (let i = 1; i <= 10; i++) {
              await supabase.from('sessions').insert({
                program_id: completedProgram.id,
                client_id: clientId,
                therapist_id: therapistUser?.id,
                session_number: i,
                date: getPastDate(45 - i * 4),
                time: getRandomTime(),
                status: 'completed',
                is_complete: true,
                development_form_submitted: true,
                meet_link: generateMeetLink(),
              });
              results.sessions.push({ session: i, status: 'completed' });
            }
            // Create baseline assessment
            await supabase.from('diagnostic_assessments').insert({
              client_id: clientId,
              therapist_id: therapistUser?.id,
              is_baseline: true,
              main_complaint: 'Anxiety, overthinking, and difficulty sleeping',
              current_symptoms: ['anxiety', 'overthinking', 'sleep_issues'],
              previous_therapy: false,
              nervous_system_pattern: 'hyper',
              nervous_system_score: 7,
              emotional_state_score: 7,
              cognitive_patterns_score: 6,
              body_symptoms_score: 5,
              behavioral_patterns_score: 6,
              life_functioning_score: 7,
              root_cause_pattern_timeline: 'Since early adulthood',
              root_cause_parental_influence: 'High expectations from parents',
              root_cause_core_patterns: 'Perfectionism and people-pleasing',
              root_cause_contributing_factors: 'Work stress and relationship challenges',
              clinical_condition_brief: 'Generalized anxiety with work-related stress',
              therapist_focus: 'Nervous system regulation and cognitive restructuring',
              therapy_goal: 'Reduce anxiety from 7 to 3',
              status: 'submitted',
              assessed_at: getPastDate(45),
            });
            results.assessments.push({ type: 'baseline', status: 'completed' });
          }
          break;

        case 'active_program':
          // 1. Free consultation (completed)
          await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: therapistUser?.id,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            date: getPastDate(21),
            time: '14:00',
            type: 'free_consultation',
            status: 'completed',
            meeting_link: generateMeetLink(),
          });

          // 2. Active program (7700 AED, 4/10 sessions done)
          const { data: activeProgram } = await supabase.from('programs').insert({
            user_id: clientId,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            total_sessions: 10,
            used_sessions: 4,
            sessions_completed: 4,
            status: 'active',
            payment_id: `PAY-${Date.now()}-ACTIVE`,
            program_type: 'private',
            price_paid: 7700,
            client_name: `${clientData.firstName} ${clientData.lastName}`,
            client_email: clientData.email,
          }).select().single();

          if (activeProgram) {
            results.programs.push({ status: 'active', revenue: 7700 });
            // Create 4 completed + 6 upcoming sessions
            for (let i = 1; i <= 10; i++) {
              const isCompleted = i <= 4;
              await supabase.from('sessions').insert({
                program_id: activeProgram.id,
                client_id: clientId,
                therapist_id: therapistUser?.id,
                session_number: i,
                date: isCompleted ? getPastDate(21 - i * 4) : getFutureDate((i - 4) * 4),
                time: getRandomTime(),
                status: isCompleted ? 'completed' : 'scheduled',
                is_complete: isCompleted,
                development_form_submitted: isCompleted,
                meet_link: generateMeetLink(),
              });
              results.sessions.push({ session: i, status: isCompleted ? 'completed' : 'scheduled' });
            }
            // Assessments
            await supabase.from('diagnostic_assessments').insert({
              client_id: clientId,
              therapist_id: therapistUser?.id,
              is_baseline: true,
              main_complaint: 'Stress and relationship difficulties',
              current_symptoms: ['anxiety', 'stress', 'anger'],
              previous_therapy: true,
              nervous_system_pattern: 'hyper',
              nervous_system_score: 8,
              emotional_state_score: 7,
              cognitive_patterns_score: 7,
              body_symptoms_score: 6,
              behavioral_patterns_score: 5,
              life_functioning_score: 6,
              root_cause_pattern_timeline: 'For several years',
              root_cause_parental_influence: 'Limited emotional support',
              root_cause_core_patterns: 'Avoidance and emotional suppression',
              root_cause_contributing_factors: 'Recent divorce',
              clinical_condition_brief: 'Adjustment disorder with mixed anxiety',
              therapist_focus: 'Emotional processing and nervous system regulation',
              therapy_goal: 'Reduce overall distress from 8 to 4',
              status: 'submitted',
              assessed_at: getPastDate(21),
            });
            results.assessments.push({ type: 'baseline', status: 'completed' });
          }
          break;

        case 'mid_program':
          // Similar to active but with 7/10 sessions done
          await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: therapistUser?.id,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            date: getPastDate(35),
            time: '11:00',
            type: 'free_consultation',
            status: 'completed',
            meeting_link: generateMeetLink(),
          });

          const { data: midProgram } = await supabase.from('programs').insert({
            user_id: clientId,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            total_sessions: 10,
            used_sessions: 7,
            sessions_completed: 7,
            status: 'active',
            payment_id: `PAY-${Date.now()}-MID`,
            program_type: 'private',
            price_paid: 7700,
            client_name: `${clientData.firstName} ${clientData.lastName}`,
            client_email: clientData.email,
          }).select().single();

          if (midProgram) {
            results.programs.push({ status: 'active', revenue: 7700 });
            for (let i = 1; i <= 10; i++) {
              const isCompleted = i <= 7;
              await supabase.from('sessions').insert({
                program_id: midProgram.id,
                client_id: clientId,
                therapist_id: therapistUser?.id,
                session_number: i,
                date: isCompleted ? getPastDate(35 - i * 4) : getFutureDate((i - 7) * 7),
                time: getRandomTime(),
                status: isCompleted ? 'completed' : 'scheduled',
                is_complete: isCompleted,
                development_form_submitted: isCompleted,
                meet_link: generateMeetLink(),
              });
              results.sessions.push({ session: i, status: isCompleted ? 'completed' : 'scheduled' });
            }
            await supabase.from('diagnostic_assessments').insert({
              client_id: clientId,
              therapist_id: therapistUser?.id,
              is_baseline: true,
              main_complaint: 'Chronic fatigue and low motivation',
              current_symptoms: ['fatigue', 'low_mood', 'overthinking'],
              previous_therapy: false,
              nervous_system_pattern: 'hypo',
              nervous_system_score: 6,
              emotional_state_score: 7,
              cognitive_patterns_score: 6,
              body_symptoms_score: 8,
              behavioral_patterns_score: 6,
              life_functioning_score: 7,
              root_cause_pattern_timeline: 'Gradually worsened over past 2 years',
              root_cause_parental_influence: 'Emotional neglect',
              root_cause_core_patterns: 'Low self-worth and perfectionism',
              root_cause_contributing_factors: 'Burnout at work',
              clinical_condition_brief: 'Burnout with depressive features',
              therapist_focus: 'Energy restoration and self-worth rebuilding',
              therapy_goal: 'Improve energy levels and daily functioning',
              status: 'submitted',
              assessed_at: getPastDate(35),
            });
          }
          break;

        case 'consultation_done':
          // Just free consultation, no program
          await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: therapistUser?.id,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            date: getPastDate(3),
            time: '15:00',
            type: 'free_consultation',
            status: 'completed',
            meeting_link: generateMeetLink(),
          });
          results.bookings.push({ type: 'free_consultation', status: 'completed' });
          break;

        case 'single_session':
          // 1 paid session at 800 AED
          await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: therapistUser?.id,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            date: getFutureDate(3),
            time: '10:00',
            type: 'paid_session',
            status: 'confirmed',
            meeting_link: generateMeetLink(),
          });
          results.bookings.push({ type: 'paid_session', status: 'confirmed', revenue: 800 });
          break;

        case 'pending_consultation':
          // Free consultation booked for tomorrow
          await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: therapistUser?.id,
            therapist_user_id: therapistUser?.id,
            therapist_name: DEMO_THERAPIST.fullName,
            date: getFutureDate(1),
            time: '14:00',
            type: 'free_consultation',
            status: 'confirmed',
            meeting_link: generateMeetLink(),
          });
          results.bookings.push({ type: 'free_consultation', status: 'pending' });
          break;

        case 'new_user':
        default:
          // Just created, no bookings
          break;
      }
    }

    // 4. Set all passwords to known value
    console.log('[Seed] Setting passwords...');
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    for (const user of allUsers?.users || []) {
      await supabase.auth.admin.updateUserById(user.id, { password: DEMO_PASSWORD });
    }

    // 5. Add additional therapist for completeness
    console.log('[Seed] Adding additional therapists...');
    const otherTherapists = [
      { email: 'noura@neuroholistic.com', name: 'Noura Youssef', phone: '+963991234567', country: 'Syria' },
      { email: 'joud@neuroholistic.com', name: 'Joud Charafeddin', phone: '+961701234568', country: 'Lebanon' },
    ];

    for (const t of otherTherapists) {
      const existing = allUsers?.users?.find((u: any) => u.email === t.email);
      if (!existing) {
        const { data: auth } = await supabase.auth.admin.createUser({
          email: t.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
        });
        if (auth.user) {
          await supabase.from('users').insert({
            id: auth.user.id,
            email: t.email,
            role: 'therapist',
            full_name: t.name,
            phone: t.phone,
            country: t.country,
          });
        }
      } else {
        await supabase.auth.admin.updateUserById(existing.id, { password: DEMO_PASSWORD });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      demoPassword: DEMO_PASSWORD,
      summary: {
        admin: results.admin,
        therapist: results.therapist,
        clientsCreated: results.clients.length,
        bookingsCreated: results.bookings.length,
        programsCreated: results.programs.length,
        sessionsCreated: results.sessions.length,
        assessmentsCreated: results.assessments.length,
      },
      revenue: {
        fullPrograms: 3 * 7700, // 3 programs at 7700 each
        singleSessions: 1 * 800, // 1 single session at 800
        total: 3 * 7700 + 1 * 800,
      },
      demoClients: results.clients,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seed failed', ...results },
      { status: 500 }
    );
  }
}
