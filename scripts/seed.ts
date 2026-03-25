import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = `${__dirname}/../.env.local`;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (key && value && !process.env[key]) process.env[key] = value;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type UserRow = {
  id: string;
  email: string;
  role: 'client' | 'therapist' | 'founder';
  full_name: string | null;
};

type SeedClient = {
  id: string;
  email: string;
  fullName: string;
};

type SeedTherapist = {
  id: string;
  fullName: string;
  slug: string;
};

function isoDateFromNow(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function scoreSet(base: number) {
  return {
    nervous_system_score: Math.min(10, base + 1),
    emotional_pattern_score: Math.min(10, base + 2),
    family_imprint_score: Math.min(10, base + 1),
    incident_load_score: Math.min(10, base + 1),
    body_symptom_score: Math.min(10, base),
    current_stress_score: Math.min(10, base + 2),
    overall_dysregulation_score: Math.min(10, base + 1.2),
  };
}

async function run() {
  console.log('🌱 Seeding workflow data (without changing users)...');

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id,email,role,full_name');

  if (usersError || !users) {
    console.error('Failed to load users:', usersError?.message);
    process.exit(1);
  }

  const typedUsers = users as UserRow[];
  const clientsRaw = typedUsers.filter((u) => u.role === 'client');
  const therapistsRaw = typedUsers.filter((u) => u.role === 'therapist');

  if (clientsRaw.length < 3 || therapistsRaw.length < 1) {
    console.error('Need at least 3 clients and 1 therapist user to seed meaningful data.');
    process.exit(1);
  }

  const clients: SeedClient[] = clientsRaw.slice(0, 5).map((c) => ({
    id: c.id,
    email: c.email,
    fullName: c.full_name || c.email.split('@')[0],
  }));

  const therapists: SeedTherapist[] = therapistsRaw.slice(0, 2).map((t) => ({
    id: t.id,
    fullName: t.full_name || t.email.split('@')[0],
    slug: slugify(t.full_name || t.email.split('@')[0]),
  }));

  const therapistA = therapists[0];
  const therapistB = therapists[1] || therapists[0];

  const clientIds = clients.map((c) => c.id);
  const clientEmails = clients.map((c) => c.email);

  console.log('🧹 Clearing prior data for selected clients...');

  await supabase.from('therapist_session_assessments').delete().in('client_id', clientIds);
  await supabase.from('sessions').delete().in('client_id', clientIds);
  await supabase.from('bookings').delete().in('user_id', clientIds);
  await supabase.from('programs').delete().in('user_id', clientIds);
  await supabase.from('payments').delete().in('user_id', clientIds);
  await supabase.from('therapist_clients').delete().in('client_id', clientIds);
  await supabase.from('assessments').delete().in('user_id', clientIds);
  await supabase.from('leads').delete().in('email', clientEmails);

  console.log('🔗 Creating therapist-client assignments...');

  const assignmentRows = clients.map((client, idx) => ({
    therapist_id: idx % 2 === 0 ? therapistA.id : therapistB.id,
    client_id: client.id,
    notes: 'Seed assignment for workflow demo',
  }));

  await supabase.from('therapist_clients').insert(assignmentRows);

  console.log('🧾 Creating baseline assessments...');

  await supabase.from('assessments').insert(
    clients.map((client, idx) => {
      const scores = scoreSet(3 + (idx % 4));
      return {
        user_id: client.id,
        email: client.email,
        full_name: client.fullName,
        assessment_type: 'initial',
        raw_responses_json: { source: 'seed-script' },
        ...scores,
        overall_severity_band: scores.overall_dysregulation_score >= 7 ? 'High' : 'Moderate',
        nervous_system_type: 'Mixed',
        primary_core_wound: 'Safety',
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      };
    })
  );

  console.log('💳 Creating payments + programs for selected clients...');

  const programClients = clients.slice(1, 4);

  for (let i = 0; i < programClients.length; i += 1) {
    const client = programClients[i];
    const paymentType = i === 1 ? 'single_session' : 'full_program';
    const paymentAmount = paymentType === 'single_session' ? 80000 : 770000;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: client.id,
        amount: paymentAmount,
        currency: 'AED',
        type: paymentType,
        status: 'paid',
        payment_reference: `seed-demo-${client.id.slice(0, 8)}`,
      })
      .select('id')
      .single();

    if (paymentError || !payment) {
      console.error('Failed to create payment for', client.email, paymentError?.message);
      continue;
    }

    const assignedTherapist = i % 2 === 0 ? therapistA : therapistB;

    await supabase.from('programs').insert({
      user_id: client.id,
      total_sessions: paymentType === 'single_session' ? 1 : 10,
      used_sessions: paymentType === 'single_session' ? 0 : 2,
      sessions_completed: paymentType === 'single_session' ? 0 : 2,
      status: 'active',
      payment_id: payment.id,
      therapist_user_id: assignedTherapist.id,
      therapist_name: assignedTherapist.fullName,
      program_type: 'private',
      price_paid: paymentAmount,
      client_name: client.fullName,
      client_email: client.email,
    });
  }

  console.log('📅 Creating consultation and program bookings...');

  await supabase.from('bookings').insert({
    user_id: clients[0].id,
    name: clients[0].fullName,
    email: clients[0].email,
    phone: '+971500000001',
    country: 'UAE',
    therapist_id: therapistA.slug,
    therapist_name: therapistA.fullName,
    therapist_user_id: therapistA.id,
    date: isoDateFromNow(-15),
    time: '11:00',
    type: 'free_consultation',
    status: 'completed',
    meeting_link: 'https://meet.google.com/new',
    session_number: null,
    reschedule_count: 0,
  });

  if (clients[4]) {
    await supabase.from('bookings').insert({
      user_id: clients[4].id,
      name: clients[4].fullName,
      email: clients[4].email,
      phone: '+971500000005',
      country: 'UAE',
      therapist_id: therapistB.slug,
      therapist_name: therapistB.fullName,
      therapist_user_id: therapistB.id,
      date: isoDateFromNow(3),
      time: '16:00',
      type: 'free_consultation',
      status: 'confirmed',
      meeting_link: 'https://meet.google.com/new',
      session_number: null,
      reschedule_count: 0,
    });
  }

  for (let i = 0; i < programClients.length; i += 1) {
    const client = programClients[i];
    const assignedTherapist = i % 2 === 0 ? therapistA : therapistB;

    const { data: program } = await supabase
      .from('programs')
      .select('id')
      .eq('user_id', client.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (!program) continue;

    const bookingRows = [
      {
        user_id: client.id,
        name: client.fullName,
        email: client.email,
        phone: '+971500000100',
        country: 'UAE',
        therapist_id: assignedTherapist.slug,
        therapist_name: assignedTherapist.fullName,
        therapist_user_id: assignedTherapist.id,
        date: isoDateFromNow(-14),
        time: '09:00',
        type: 'program' as const,
        program_id: program.id,
        status: 'completed' as const,
        meeting_link: 'https://meet.google.com/new',
        session_number: 1,
        reschedule_count: 0,
      },
      {
        user_id: client.id,
        name: client.fullName,
        email: client.email,
        phone: '+971500000100',
        country: 'UAE',
        therapist_id: assignedTherapist.slug,
        therapist_name: assignedTherapist.fullName,
        therapist_user_id: assignedTherapist.id,
        date: isoDateFromNow(-7),
        time: '11:00',
        type: 'program' as const,
        program_id: program.id,
        status: 'completed' as const,
        meeting_link: 'https://meet.google.com/new',
        session_number: 2,
        reschedule_count: 0,
      },
      {
        user_id: client.id,
        name: client.fullName,
        email: client.email,
        phone: '+971500000100',
        country: 'UAE',
        therapist_id: assignedTherapist.slug,
        therapist_name: assignedTherapist.fullName,
        therapist_user_id: assignedTherapist.id,
        date: isoDateFromNow(4),
        time: '14:00',
        type: 'program' as const,
        program_id: program.id,
        status: 'confirmed' as const,
        meeting_link: 'https://meet.google.com/new',
        session_number: 3,
        reschedule_count: 0,
      },
    ];

    const { data: insertedBookings } = await supabase
      .from('bookings')
      .insert(bookingRows)
      .select('id,status,session_number,date,time,meeting_link');

    if (!insertedBookings) continue;

    for (const booking of insertedBookings) {
      await supabase.from('sessions').insert({
        program_id: program.id,
        booking_id: booking.id,
        client_id: client.id,
        therapist_id: assignedTherapist.id,
        session_number: booking.session_number || 1,
        date: booking.date,
        time: booking.time,
        date_time: `${booking.date}T${booking.time}:00+04:00`,
        meet_link: booking.meeting_link,
        status: booking.status === 'completed' ? 'completed' : 'scheduled',
      });
    }

    const completedBookings = insertedBookings.filter((b) => b.status === 'completed');

    for (const [idx, booking] of completedBookings.entries()) {
      const scores = scoreSet(4 + idx);
      const { data: sessionRow } = await supabase
        .from('sessions')
        .select('id')
        .eq('booking_id', booking.id)
        .maybeSingle();

      await supabase.from('therapist_session_assessments').insert({
        booking_id: booking.id,
        session_id: sessionRow?.id || null,
        therapist_id: assignedTherapist.id,
        client_id: client.id,
        ...scores,
        therapist_notes: 'Seeded therapist notes for completed session.',
        observations: 'Observed improved regulation compared to baseline.',
        recommendations: 'Continue grounding practice and sleep hygiene protocol.',
        resource_pdf_url: 'https://example.com/seed-resources/session-guide.pdf',
        resource_mp4_url: 'https://example.com/seed-resources/session-practice.mp4',
      });

      await supabase
        .from('sessions')
        .update({
          assessment_score: scores.overall_dysregulation_score,
          assessment_notes: 'Seeded therapist notes for completed session.',
        })
        .eq('booking_id', booking.id);
    }
  }

  const [{ count: programCount }, { count: bookingCount }, { count: sessionCount }, { count: tsaCount }] =
    await Promise.all([
      supabase.from('programs').select('*', { count: 'exact', head: true }).in('user_id', clientIds),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).in('user_id', clientIds),
      supabase.from('sessions').select('*', { count: 'exact', head: true }).in('client_id', clientIds),
      supabase
        .from('therapist_session_assessments')
        .select('*', { count: 'exact', head: true })
        .in('client_id', clientIds),
    ]);

  console.log('✅ Seed complete (users unchanged).');
  console.log(`   Clients seeded: ${clients.length}`);
  console.log(`   Programs: ${programCount ?? 0}`);
  console.log(`   Bookings: ${bookingCount ?? 0}`);
  console.log(`   Sessions: ${sessionCount ?? 0}`);
  console.log(`   Therapist session assessments: ${tsaCount ?? 0}`);
  console.log('   Scenarios included:');
  console.log('   - client with completed free consultation only');
  console.log('   - client with upcoming free consultation');
  console.log('   - clients with active paid programs and completed + upcoming sessions');
}

run().catch((error) => {
  console.error('❌ Seed script failed:', error);
  process.exit(1);
});
