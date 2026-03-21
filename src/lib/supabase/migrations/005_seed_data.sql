-- ============================================================
-- Seed Data: NeuroHolistic Institute
-- Run AFTER migrations 001–004
-- Creates test users, assessments, programs, bookings, payments
-- ============================================================
-- NOTE: In Supabase you cannot directly insert into auth.users from SQL.
-- This script inserts into public.users only.
-- Use the Supabase Dashboard → Authentication → Add user
-- to create the following test accounts first, then run this script.
--
-- Test accounts to create manually:
--   founder@neuroholistic.com     / Password123! (role: founder)
--   dr.fawzia@neuroholistic.com   / Password123! (role: therapist)
--   mariam@neuroholistic.com      / Password123! (role: therapist)
--   noura@neuroholistic.com       / Password123! (role: therapist)
--   sarah.ali@test.com            / Password123! (role: client)
--   ahmed.hassan@test.com         / Password123! (role: client)
--   laya.mansouri@test.com        / Password123! (role: client)
--   rawan.malik@test.com          / Password123! (role: client)
--   omar.nasser@test.com          / Password123! (role: client)
--
-- After creating them in Auth, run this script with the actual UUIDs
-- substituted below, OR run the helper function at the bottom.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- HELPER FUNCTION: Insert seed data using actual auth UUIDs
-- Call: SELECT seed_neuroholistic_data(); after creating auth users
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.seed_neuroholistic_data()
RETURNS TEXT AS $$
DECLARE
  v_founder_id    UUID;
  v_therapist1_id UUID;
  v_therapist2_id UUID;
  v_therapist3_id UUID;
  v_client1_id    UUID;
  v_client2_id    UUID;
  v_client3_id    UUID;
  v_client4_id    UUID;
  v_client5_id    UUID;
  v_prog1_id      UUID;
  v_prog2_id      UUID;
  v_prog3_id      UUID;
  v_prog4_id      UUID;
  v_pay1_id       UUID;
  v_pay2_id       UUID;
  v_pay3_id       UUID;
  v_pay4_id       UUID;
  v_book1_id      UUID;
BEGIN

  -- ── Look up auth.users by email ──────────────────────────
  SELECT id INTO v_founder_id    FROM auth.users WHERE email = 'founder@neuroholistic.com';
  SELECT id INTO v_therapist1_id FROM auth.users WHERE email = 'dr.fawzia@neuroholistic.com';
  SELECT id INTO v_therapist2_id FROM auth.users WHERE email = 'mariam@neuroholistic.com';
  SELECT id INTO v_therapist3_id FROM auth.users WHERE email = 'noura@neuroholistic.com';
  SELECT id INTO v_client1_id    FROM auth.users WHERE email = 'sarah.ali@test.com';
  SELECT id INTO v_client2_id    FROM auth.users WHERE email = 'ahmed.hassan@test.com';
  SELECT id INTO v_client3_id    FROM auth.users WHERE email = 'laya.mansouri@test.com';
  SELECT id INTO v_client4_id    FROM auth.users WHERE email = 'rawan.malik@test.com';
  SELECT id INTO v_client5_id    FROM auth.users WHERE email = 'omar.nasser@test.com';

  IF v_founder_id IS NULL THEN
    RETURN 'ERROR: founder@neuroholistic.com not found in auth.users. Create auth users first.';
  END IF;

  -- ── public.users ─────────────────────────────────────────
  INSERT INTO public.users (id, email, role, full_name, phone)
  VALUES
    (v_founder_id,    'founder@neuroholistic.com',   'founder',   'Dr. Fawzia Yassmina', '+971 50 100 0001'),
    (v_therapist1_id, 'dr.fawzia@neuroholistic.com', 'therapist', 'Dr. Fawzia Yassmina', '+971 50 100 0002'),
    (v_therapist2_id, 'mariam@neuroholistic.com',    'therapist', 'Mariam Al Kaisi',     '+971 50 100 0003'),
    (v_therapist3_id, 'noura@neuroholistic.com',     'therapist', 'Noura Youssef',       '+971 50 100 0004'),
    (v_client1_id,    'sarah.ali@test.com',           'client',    'Sarah Ali',           '+971 50 200 0001'),
    (v_client2_id,    'ahmed.hassan@test.com',        'client',    'Ahmed Hassan',        '+971 50 200 0002'),
    (v_client3_id,    'laya.mansouri@test.com',       'client',    'Laya Mansouri',       '+971 55 300 0003'),
    (v_client4_id,    'rawan.malik@test.com',         'client',    'Rawan Malik',         '+971 55 300 0004'),
    (v_client5_id,    'omar.nasser@test.com',         'client',    'Omar Nasser',         '+971 55 300 0005')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

  -- ── therapist_clients assignments ────────────────────────
  INSERT INTO public.therapist_clients (therapist_id, client_id)
  VALUES
    (v_therapist1_id, v_client1_id),
    (v_therapist1_id, v_client2_id),
    (v_therapist2_id, v_client3_id),
    (v_therapist2_id, v_client4_id),
    (v_therapist3_id, v_client5_id)
  ON CONFLICT DO NOTHING;

  -- ── payments ─────────────────────────────────────────────
  v_pay1_id := gen_random_uuid();
  v_pay2_id := gen_random_uuid();
  v_pay3_id := gen_random_uuid();
  v_pay4_id := gen_random_uuid();

  INSERT INTO public.payments (id, user_id, amount, currency, type, status, payment_reference, created_at)
  VALUES
    (v_pay1_id, v_client1_id, 770000, 'AED', 'full_program',   'paid',    'ziina_ref_001', NOW() - INTERVAL '45 days'),
    (v_pay2_id, v_client2_id, 770000, 'AED', 'full_program',   'paid',    'ziina_ref_002', NOW() - INTERVAL '30 days'),
    (v_pay3_id, v_client3_id,  80000, 'AED', 'single_session', 'paid',    'ziina_ref_003', NOW() - INTERVAL '15 days'),
    (v_pay4_id, v_client4_id, 770000, 'AED', 'full_program',   'pending', NULL,            NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

  -- ── programs ─────────────────────────────────────────────
  v_prog1_id := gen_random_uuid();
  v_prog2_id := gen_random_uuid();
  v_prog3_id := gen_random_uuid();
  v_prog4_id := gen_random_uuid();

  INSERT INTO public.programs (id, user_id, total_sessions, used_sessions, sessions_completed, status, payment_id, therapist_user_id, therapist_name, program_type, price_paid, client_name, client_email, created_at)
  VALUES
    (v_prog1_id, v_client1_id, 10, 6, 6, 'active',    v_pay1_id, v_therapist1_id, 'Dr. Fawzia Yassmina', 'private', 770000, 'Sarah Ali',     'sarah.ali@test.com',   NOW() - INTERVAL '45 days'),
    (v_prog2_id, v_client2_id, 10, 3, 3, 'active',    v_pay2_id, v_therapist1_id, 'Dr. Fawzia Yassmina', 'private', 770000, 'Ahmed Hassan',  'ahmed.hassan@test.com',NOW() - INTERVAL '30 days'),
    (v_prog3_id, v_client3_id,  1, 1, 1, 'completed', v_pay3_id, v_therapist2_id, 'Mariam Al Kaisi',     'private',  80000, 'Laya Mansouri', 'laya.mansouri@test.com',NOW() - INTERVAL '15 days'),
    (v_prog4_id, v_client5_id, 10, 0, 0, 'active',    v_pay4_id, v_therapist3_id, 'Noura Youssef',       'private', 770000, 'Omar Nasser',   'omar.nasser@test.com', NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

  -- Update payments with program_id
  UPDATE public.payments SET program_id = v_prog1_id WHERE id = v_pay1_id;
  UPDATE public.payments SET program_id = v_prog2_id WHERE id = v_pay2_id;
  UPDATE public.payments SET program_id = v_prog3_id WHERE id = v_pay3_id;
  UPDATE public.payments SET program_id = v_prog4_id WHERE id = v_pay4_id;

  -- ── bookings ─────────────────────────────────────────────
  INSERT INTO public.bookings (id, user_id, name, email, phone, country, therapist_id, therapist_name, therapist_user_id, date, time, type, program_id, meeting_link, status, created_at)
  VALUES
    -- Sarah Ali - 6 completed sessions
    (gen_random_uuid(), v_client1_id, 'Sarah Ali',    'sarah.ali@test.com',    '+971502000001', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '40 days')::DATE, '10:00', 'program', v_prog1_id, 'https://meet.google.com/abc-defg-hij', 'completed', NOW() - INTERVAL '40 days'),
    (gen_random_uuid(), v_client1_id, 'Sarah Ali',    'sarah.ali@test.com',    '+971502000001', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '33 days')::DATE, '10:00', 'program', v_prog1_id, 'https://meet.google.com/abc-defg-hij', 'completed', NOW() - INTERVAL '33 days'),
    (gen_random_uuid(), v_client1_id, 'Sarah Ali',    'sarah.ali@test.com',    '+971502000001', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '26 days')::DATE, '10:00', 'program', v_prog1_id, 'https://meet.google.com/abc-defg-hij', 'completed', NOW() - INTERVAL '26 days'),
    (gen_random_uuid(), v_client1_id, 'Sarah Ali',    'sarah.ali@test.com',    '+971502000001', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '19 days')::DATE, '10:00', 'program', v_prog1_id, 'https://meet.google.com/abc-defg-hij', 'completed', NOW() - INTERVAL '19 days'),
    (gen_random_uuid(), v_client1_id, 'Sarah Ali',    'sarah.ali@test.com',    '+971502000001', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '12 days')::DATE, '10:00', 'program', v_prog1_id, 'https://meet.google.com/abc-defg-hij', 'completed', NOW() - INTERVAL '12 days'),
    (gen_random_uuid(), v_client1_id, 'Sarah Ali',    'sarah.ali@test.com',    '+971502000001', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '5 days')::DATE,  '10:00', 'program', v_prog1_id, 'https://meet.google.com/abc-defg-hij', 'completed', NOW() - INTERVAL '5 days'),
    -- Sarah Ali - 1 upcoming session
    (gen_random_uuid(), v_client1_id, 'Sarah Ali',    'sarah.ali@test.com',    '+971502000001', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() + INTERVAL '7 days')::DATE,  '10:00', 'program', v_prog1_id, 'https://meet.google.com/abc-defg-hij', 'confirmed', NOW()),
    -- Ahmed Hassan - 3 completed, 1 upcoming
    (gen_random_uuid(), v_client2_id, 'Ahmed Hassan', 'ahmed.hassan@test.com', '+971502000002', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '25 days')::DATE, '14:00', 'program', v_prog2_id, 'https://meet.google.com/klm-nopq-rst', 'completed', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_client2_id, 'Ahmed Hassan', 'ahmed.hassan@test.com', '+971502000002', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '18 days')::DATE, '14:00', 'program', v_prog2_id, 'https://meet.google.com/klm-nopq-rst', 'completed', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_client2_id, 'Ahmed Hassan', 'ahmed.hassan@test.com', '+971502000002', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() - INTERVAL '11 days')::DATE, '14:00', 'program', v_prog2_id, 'https://meet.google.com/klm-nopq-rst', 'completed', NOW() - INTERVAL '11 days'),
    (gen_random_uuid(), v_client2_id, 'Ahmed Hassan', 'ahmed.hassan@test.com', '+971502000002', 'UAE', 'dr-fawzia-yassmina', 'Dr. Fawzia Yassmina', v_therapist1_id, (NOW() + INTERVAL '4 days')::DATE,  '14:00', 'program', v_prog2_id, 'https://meet.google.com/klm-nopq-rst', 'confirmed', NOW()),
    -- Laya Mansouri - single session completed
    (gen_random_uuid(), v_client3_id, 'Laya Mansouri','laya.mansouri@test.com','+971553000003', 'UAE', 'mariam-al-kaisi',    'Mariam Al Kaisi',     v_therapist2_id, (NOW() - INTERVAL '10 days')::DATE, '11:00', 'program', v_prog3_id, 'https://meet.google.com/uvw-xyz1-234', 'completed', NOW() - INTERVAL '10 days'),
    -- Free consultations
    (gen_random_uuid(), NULL,          'Fatima Al Zaabi','fatima@test.com',    '+971559000001', 'UAE', 'reem-mobayed',      'Reem Mobayed',        NULL,            (NOW() - INTERVAL '3 days')::DATE,  '09:00', 'free_consultation', NULL, 'https://meet.google.com/free-cons-01', 'completed', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), NULL,          'Khalid Rashid',  'khalid@test.com',   '+971559000002', 'UAE', 'joud-charafeddin',  'Joud Charafeddin',    NULL,            (NOW() + INTERVAL '2 days')::DATE,  '16:00', 'free_consultation', NULL, 'https://meet.google.com/free-cons-02', 'confirmed', NOW())
  ON CONFLICT DO NOTHING;

  -- ── sessions records ─────────────────────────────────────
  INSERT INTO public.sessions (program_id, session_number, date, time, status)
  VALUES
    (v_prog1_id, 1,  (NOW() - INTERVAL '40 days')::DATE, '10:00', 'completed'),
    (v_prog1_id, 2,  (NOW() - INTERVAL '33 days')::DATE, '10:00', 'completed'),
    (v_prog1_id, 3,  (NOW() - INTERVAL '26 days')::DATE, '10:00', 'completed'),
    (v_prog1_id, 4,  (NOW() - INTERVAL '19 days')::DATE, '10:00', 'completed'),
    (v_prog1_id, 5,  (NOW() - INTERVAL '12 days')::DATE, '10:00', 'completed'),
    (v_prog1_id, 6,  (NOW() - INTERVAL '5 days')::DATE,  '10:00', 'completed'),
    (v_prog1_id, 7,  (NOW() + INTERVAL '7 days')::DATE,  '10:00', 'scheduled'),
    (v_prog2_id, 1,  (NOW() - INTERVAL '25 days')::DATE, '14:00', 'completed'),
    (v_prog2_id, 2,  (NOW() - INTERVAL '18 days')::DATE, '14:00', 'completed'),
    (v_prog2_id, 3,  (NOW() - INTERVAL '11 days')::DATE, '14:00', 'completed'),
    (v_prog2_id, 4,  (NOW() + INTERVAL '4 days')::DATE,  '14:00', 'scheduled'),
    (v_prog3_id, 1,  (NOW() - INTERVAL '10 days')::DATE, '11:00', 'completed')
  ON CONFLICT DO NOTHING;

  -- ── assessments ──────────────────────────────────────────
  INSERT INTO public.assessments (
    user_id, email, full_name, assessment_type,
    nervous_system_score, emotional_pattern_score, family_imprint_score,
    incident_load_score, body_symptom_score, current_stress_score,
    overall_dysregulation_score, overall_severity_band,
    nervous_system_type, primary_core_wound, secondary_core_wound,
    dominant_parental_influence, possible_origin_period,
    recommended_phase_primary, recommended_phase_secondary,
    status, submitted_at,
    raw_responses_json
  )
  VALUES
    -- Sarah Ali: High dysregulation
    (v_client1_id, 'sarah.ali@test.com', 'Sarah Ali', 'initial',
     78, 72, 65, 58, 70, 68, 72, 'High',
     'hyper', 'control_safety', 'abandonment', 'mother', 'early_childhood',
     'Phase 1', 'Phase 2', 'submitted', NOW() - INTERVAL '50 days',
     '{"basicInfo":{"firstName":"Sarah","lastName":"Ali","email":"sarah.ali@test.com"}}'::jsonb),
    -- Ahmed Hassan: Moderate dysregulation
    (v_client2_id, 'ahmed.hassan@test.com', 'Ahmed Hassan', 'initial',
     55, 48, 42, 35, 52, 45, 48, 'Moderate',
     'mixed', 'worth_rejection', 'suppression_expression', 'father', 'adolescence',
     'Phase 2', 'Phase 3', 'submitted', NOW() - INTERVAL '35 days',
     '{"basicInfo":{"firstName":"Ahmed","lastName":"Hassan","email":"ahmed.hassan@test.com"}}'::jsonb),
    -- Laya Mansouri: Significant dysregulation
    (v_client3_id, 'laya.mansouri@test.com', 'Laya Mansouri', 'initial',
     62, 58, 55, 45, 60, 55, 58, 'Significant',
     'hyper', 'abandonment', 'control_safety', 'both', 'early_childhood',
     'Phase 1-2', 'Phase 3', 'submitted', NOW() - INTERVAL '20 days',
     '{"basicInfo":{"firstName":"Laya","lastName":"Mansouri","email":"laya.mansouri@test.com"}}'::jsonb),
    -- Rawan Malik: Mild dysregulation
    (v_client4_id, 'rawan.malik@test.com', 'Rawan Malik', 'initial',
     28, 32, 25, 20, 30, 22, 27, 'Mild',
     'regulated', 'worth_rejection', 'unknown', 'father', 'adulthood',
     'Phase 3', 'Phase 4', 'submitted', NOW() - INTERVAL '5 days',
     '{"basicInfo":{"firstName":"Rawan","lastName":"Malik","email":"rawan.malik@test.com"}}'::jsonb),
    -- Omar Nasser: Very High dysregulation
    (v_client5_id, 'omar.nasser@test.com', 'Omar Nasser', 'initial',
     88, 82, 75, 70, 85, 80, 82, 'Very High',
     'hyper', 'suppression_expression', 'control_safety', 'both', 'early_childhood',
     'Phase 1', 'Phase 2', 'submitted', NOW() - INTERVAL '3 days',
     '{"basicInfo":{"firstName":"Omar","lastName":"Nasser","email":"omar.nasser@test.com"}}'::jsonb)
  ON CONFLICT DO NOTHING;

  -- ── leads (free consultation signups) ────────────────────
  INSERT INTO public.leads (name, mobile, email, country, source, created_at)
  VALUES
    ('Fatima Al Zaabi',  '+971559000001', 'fatima@test.com',    'UAE',         'free_consultation', NOW() - INTERVAL '3 days'),
    ('Khalid Rashid',    '+971559000002', 'khalid@test.com',    'UAE',         'free_consultation', NOW() - INTERVAL '2 days'),
    ('Nour Al Salem',    '+971559000003', 'nour@test.com',      'Saudi Arabia','free_consultation', NOW() - INTERVAL '7 days'),
    ('Hana Kassem',      '+971559000004', 'hana@test.com',      'UAE',         'free_consultation', NOW() - INTERVAL '10 days'),
    ('Tariq Mahmoud',    '+971559000005', 'tariq@test.com',     'Kuwait',      'free_consultation', NOW() - INTERVAL '12 days'),
    ('Rana Al Husseini', '+971559000006', 'rana@test.com',      'Jordan',      'free_consultation', NOW() - INTERVAL '14 days'),
    ('Dina Hassan',      '+971559000007', 'dina@test.com',      'Egypt',       'free_consultation', NOW() - INTERVAL '18 days'),
    ('Faris Al Khayat',  '+971559000008', 'faris@test.com',     'UAE',         'free_consultation', NOW() - INTERVAL '20 days'),
    ('Maya Bakr',        '+971559000009', 'maya@test.com',      'Lebanon',     'free_consultation', NOW() - INTERVAL '22 days'),
    ('Yusuf Ali',        '+971559000010', 'yusuf@test.com',     'UAE',         'free_consultation', NOW() - INTERVAL '25 days')
  ON CONFLICT DO NOTHING;

  RETURN 'Seed data inserted successfully! 3 therapists, 5 clients, 5 assessments, 4 programs, 15 bookings, 10 leads.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- HOW TO RUN:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create each user listed at the top of this file
-- 3. Run this SQL in the SQL Editor
-- 4. Then call: SELECT seed_neuroholistic_data();
-- ─────────────────────────────────────────────────────────────
