import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

function getServiceSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface SeedData {
  therapistEmail: string;
  fullName: string;
  role: 'admin' | 'therapist';
  phone?: string;
  country?: string;
}

const THERAPIST_SEED_DATA: SeedData[] = [
  { therapistEmail: 'fawzia@neuroholistic.com', fullName: 'Dr. Fawzia Yassmina', role: 'admin', phone: '+971501234567', country: 'UAE' },
  { therapistEmail: 'mariam@neuroholistic.com', fullName: 'Mariam Al Kaisi', role: 'therapist', phone: '+961701234567', country: 'Lebanon' },
  { therapistEmail: 'noura@neuroholistic.com', fullName: 'Noura Youssef', role: 'therapist', phone: '+963991234567', country: 'Syria' },
  { therapistEmail: 'zekra@neuroholistic.com', fullName: 'Zekra Khayata', role: 'therapist', phone: '+963981234567', country: 'Syria' },
  { therapistEmail: 'reem@neuroholistic.com', fullName: 'Reem Mobayed', role: 'therapist', phone: '+14151234567', country: 'Canada' },
  { therapistEmail: 'fawares@neuroholistic.com', fullName: 'Fawares Azaar', role: 'therapist', phone: '+971501234568', country: 'UAE' },
  { therapistEmail: 'joud@neuroholistic.com', fullName: 'Joud Charafeddin', role: 'therapist', phone: '+961701234568', country: 'Lebanon' },
];

const CLIENT_SEED_DATA = [
  { email: 'sarah.ahmad@email.com', firstName: 'Sarah', lastName: 'Ahmad', phone: '+971501234570', country: 'UAE', status: 'completed_program' },
  { email: 'mohammed.khalid@email.com', firstName: 'Mohammed', lastName: 'Khalid', phone: '+971501234571', country: 'UAE', status: 'active_program' },
  { email: 'layla.hussein@email.com', firstName: 'Layla', lastName: 'Hussein', phone: '+961701234570', country: 'Lebanon', status: 'free_consultation_done' },
  { email: 'omar.farouk@email.com', firstName: 'Omar', lastName: 'Farouk', phone: '+201001234570', country: 'Egypt', status: 'free_consultation_booked' },
  { email: 'fatima.ali@email.com', firstName: 'Fatima', lastName: 'Ali', phone: '+971501234572', country: 'UAE', status: 'new_user' },
  { email: 'youssef.rashid@email.com', firstName: 'Youssef', lastName: 'Rashid', phone: '+97336000001', country: 'Bahrain', status: 'free_consultation_done' },
  { email: 'noor.ibrahim@email.com', firstName: 'Noor', lastName: 'Ibrahim', phone: '+201001234571', country: 'Egypt', status: 'active_program' },
  { email: 'hamza.tahir@email.com', firstName: 'Hamza', lastName: 'Tahir', phone: '+441231234567', country: 'UK', status: 'new_user' },
];

function generateTempPassword(): string {
  return `NH${Date.now()}!${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST() {
  const supabase = getServiceSupabase();
  const results: any = { therapists: [], clients: [], bookings: [], programs: [], sessions: [], errors: [] };

  try {
    // 1. Create Therapists (including founder as admin)
    console.log('[Seed] Creating therapists...');
    
    for (const therapistData of THERAPIST_SEED_DATA) {
      // Check if user exists
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.find((u: any) => u.email?.toLowerCase() === therapistData.therapistEmail.toLowerCase());

      if (userExists) {
        // Update existing user role if needed
        await supabase.from('users').update({ role: therapistData.role }).eq('id', userExists.id);
        results.therapists.push({ name: therapistData.fullName, status: 'updated' });
      } else {
        // Create new therapist
        const tempPassword = generateTempPassword();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: therapistData.therapistEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: therapistData.fullName.split(' ')[0],
            last_name: therapistData.fullName.split(' ').slice(1).join(' '),
            phone: therapistData.phone,
            country: therapistData.country,
          },
        });

        if (authError) {
          results.errors.push(`Failed to create therapist ${therapistData.fullName}: ${authError.message}`);
          continue;
        }

        if (authData.user) {
          await supabase.from('users').insert({
            id: authData.user.id,
            email: therapistData.therapistEmail,
            role: therapistData.role,
            full_name: therapistData.fullName,
            phone: therapistData.phone || null,
            country: therapistData.country || null,
          });
          results.therapists.push({ name: therapistData.fullName, role: therapistData.role, password: tempPassword, status: 'created' });
        }
      }
    }

    // 2. Get therapist IDs for assignments
    const { data: allTherapists } = await supabase
      .from('users')
      .select('id, full_name, role')
      .in('role', ['admin', 'therapist']);

    const adminTherapist = allTherapists?.find((t: any) => t.role === 'admin');
    const therapistList = allTherapists?.filter((t: any) => t.role === 'therapist') || [];

    // 3. Create Clients with various states
    console.log('[Seed] Creating clients...');
    
    for (const clientData of CLIENT_SEED_DATA) {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.find((u: any) => u.email?.toLowerCase() === clientData.email.toLowerCase());

      let clientId: string;
      let isNewClient = false;

      if (userExists) {
        clientId = userExists.id;
      } else {
        const tempPassword = generateTempPassword();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: clientData.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: clientData.firstName,
            last_name: clientData.lastName,
            phone: clientData.phone,
            country: clientData.country,
          },
        });

        if (authError) {
          results.errors.push(`Failed to create client ${clientData.email}: ${authError.message}`);
          continue;
        }

        if (!authData.user) continue;
        clientId = authData.user.id;
        isNewClient = true;

        await supabase.from('users').insert({
          id: clientId,
          email: clientData.email,
          role: 'client',
          full_name: `${clientData.firstName} ${clientData.lastName}`,
          phone: clientData.phone,
          country: clientData.country,
        });
      }

      results.clients.push({ email: clientData.email, status: isNewClient ? 'created' : 'existing' });

      // Create therapist-client relationships
      const assignedTherapist = therapistList[Math.floor(Math.random() * therapistList.length)];
      if (assignedTherapist && !clientData.status.includes('new')) {
        await supabase.from('therapist_clients').upsert({
          therapist_id: assignedTherapist.id,
          client_id: clientId,
          status: 'active',
        }, { onConflict: 'therapist_id,client_id' });
      }

      // 4. Create bookings and programs based on status
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 1);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30) - 1);
      
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const randomTime = () => `${String(9 + Math.floor(Math.random() * 8)).padStart(2, '0')}:00`;

      switch (clientData.status) {
        case 'free_consultation_booked':
          // Create a pending consultation booking
          const { data: bookedConsultation } = await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: assignedTherapist?.id || adminTherapist?.id,
            therapist_user_id: assignedTherapist?.id || adminTherapist?.id,
            therapist_name: assignedTherapist?.full_name || adminTherapist?.full_name,
            date: formatDate(futureDate),
            time: randomTime(),
            type: 'free_consultation',
            status: 'confirmed',
          }).select().single();
          if (bookedConsultation) results.bookings.push({ type: 'free_consultation', status: 'booked' });
          break;

        case 'free_consultation_done':
          // Create a completed free consultation
          const meetLink1 = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`;
          const { data: completedConsultation } = await supabase.from('bookings').insert({
            user_id: clientId,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            country: clientData.country,
            therapist_id: assignedTherapist?.id || adminTherapist?.id,
            therapist_user_id: assignedTherapist?.id || adminTherapist?.id,
            therapist_name: assignedTherapist?.full_name || adminTherapist?.full_name,
            date: formatDate(pastDate),
            time: randomTime(),
            type: 'free_consultation',
            status: 'completed',
            meeting_link: meetLink1,
          }).select().single();
          if (completedConsultation) results.bookings.push({ type: 'free_consultation', status: 'completed' });
          break;

        case 'active_program':
          // Create a paid program with some sessions done
          const meetLink2 = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`;
          const { data: program } = await supabase.from('programs').insert({
            user_id: clientId,
            therapist_user_id: assignedTherapist?.id || adminTherapist?.id,
            therapist_name: assignedTherapist?.full_name || adminTherapist?.full_name,
            total_sessions: 10,
            used_sessions: 3,
            sessions_completed: 3,
            status: 'active',
            payment_id: `PAY-${Date.now()}`,
            program_type: 'private',
            price_paid: 7700,
            client_name: `${clientData.firstName} ${clientData.lastName}`,
            client_email: clientData.email,
          }).select().single();

          if (program) {
            results.programs.push({ status: 'active', sessions: 10 });
            
            // Create session records
            for (let i = 1; i <= 10; i++) {
              const sessionDate = new Date(pastDate);
              sessionDate.setDate(sessionDate.getDate() + i * 7);
              
              await supabase.from('sessions').insert({
                program_id: program.id,
                client_id: clientId,
                therapist_id: assignedTherapist?.id || adminTherapist?.id,
                session_number: i,
                date: formatDate(sessionDate),
                time: randomTime(),
                status: i <= 3 ? 'completed' : 'scheduled',
                is_complete: i <= 3,
                development_form_submitted: i <= 3,
                meet_link: i <= 3 ? meetLink2 : `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`,
              });
            }
            results.sessions.push({ completed: 3, scheduled: 7 });
          }
          break;

        case 'completed_program':
          // Create a completed program
          const meetLink3 = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`;
          const { data: completedProgram } = await supabase.from('programs').insert({
            user_id: clientId,
            therapist_user_id: adminTherapist?.id,
            therapist_name: adminTherapist?.full_name,
            total_sessions: 10,
            used_sessions: 10,
            sessions_completed: 10,
            status: 'completed',
            payment_id: `PAY-${Date.now()}`,
            program_type: 'private',
            price_paid: 7700,
            client_name: `${clientData.firstName} ${clientData.lastName}`,
            client_email: clientData.email,
          }).select().single();

          if (completedProgram) {
            results.programs.push({ status: 'completed', sessions: 10 });
            
            for (let i = 1; i <= 10; i++) {
              const sessionDate = new Date(pastDate);
              sessionDate.setDate(sessionDate.getDate() + i * 7);
              
              await supabase.from('sessions').insert({
                program_id: completedProgram.id,
                client_id: clientId,
                therapist_id: adminTherapist?.id,
                session_number: i,
                date: formatDate(sessionDate),
                time: randomTime(),
                status: 'completed',
                is_complete: true,
                development_form_submitted: true,
                meet_link: meetLink3,
              });
            }
            results.sessions.push({ completed: 10, scheduled: 0 });
          }
          break;

        case 'new_user':
        default:
          // Just created, no bookings yet
          break;
      }
    }

    // 5. Create some diagnostic assessments for clients with programs
    console.log('[Seed] Creating sample assessments...');
    
    const { data: programsWithSessions } = await supabase
      .from('programs')
      .select('id, user_id, therapist_user_id')
      .eq('status', 'active')
      .limit(2);

    if (programsWithSessions && programsWithSessions.length > 0) {
      for (const prog of programsWithSessions) {
        // Baseline assessment
        await supabase.from('diagnostic_assessments').insert({
          client_id: prog.user_id,
          therapist_id: prog.therapist_user_id,
          is_baseline: true,
          main_complaint: 'Anxiety and stress related to work pressure',
          current_symptoms: ['anxiety', 'overthinking', 'sleep_issues'],
          previous_therapy: true,
          previous_therapy_details: 'CBT therapy for 6 months',
          nervous_system_pattern: 'hyper',
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
          therapy_goal: 'Reduce anxiety from 7 to 3 within 10 sessions',
          status: 'submitted',
        });

        results.assessments = { baseline: 1 };
      }
    }

    // 6. Set up therapist availability (for demo purposes, all therapists available Mon-Fri 9am-6pm)
    console.log('[Seed] Setting up therapist availability...');
    
    for (const therapist of therapistList) {
      // Monday to Friday availability
      for (let day = 1; day <= 5; day++) {
        await supabase.from('therapist_availability').insert({
          therapist_id: therapist.id,
          day_of_week: day,
          start_time: '09:00',
          end_time: '18:00',
          is_blocked: false,
        });
      }
    }

    if (adminTherapist) {
      for (let day = 1; day <= 5; day++) {
        await supabase.from('therapist_availability').insert({
          therapist_id: adminTherapist.id,
          day_of_week: day,
          start_time: '09:00',
          end_time: '18:00',
          is_blocked: false,
        });
      }
    }

    results.availability = 'set up for all therapists';

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      ...results,
    });
  } catch (error) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seed failed', ...results },
      { status: 500 }
    );
  }
}
