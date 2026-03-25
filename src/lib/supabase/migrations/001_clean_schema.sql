-- ============================================================
-- NeuroHolistic Clean Schema Migration
-- Version: 001
-- Description: Complete clean database schema for therapy booking platform
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean rebuild)
DROP TABLE IF EXISTS public.notifications_log CASCADE;
DROP TABLE IF EXISTS public.therapist_clients CASCADE;
DROP TABLE IF EXISTS public.therapist_availability CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.session_materials CASCADE;
DROP TABLE IF EXISTS public.session_development_forms CASCADE;
DROP TABLE IF EXISTS public.diagnostic_assessments CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'therapist', 'admin')),
  full_name TEXT,
  phone TEXT,
  country TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================
-- 2. PROGRAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_sessions INTEGER NOT NULL DEFAULT 10,
  used_sessions INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  payment_id TEXT NOT NULL,
  therapist_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  therapist_name TEXT,
  program_type TEXT CHECK (program_type IN ('private', 'group')),
  price_paid NUMERIC(10,2),
  client_name TEXT,
  client_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_programs_user_id ON public.programs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_therapist_id ON public.programs(therapist_user_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON public.programs(status);

-- ============================================================
-- 3. BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  therapist_id TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  therapist_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'free_consultation' CHECK (type IN ('free_consultation', 'program')),
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'scheduled', 'no_show', 'pending')),
  session_number INTEGER,
  reschedule_count INTEGER NOT NULL DEFAULT 0,
  cancelled_at TIMESTAMPTZ,
  rescheduled_from_date DATE,
  rescheduled_from_time TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_id ON public.bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_user_id ON public.bookings(therapist_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON public.bookings(type);

-- Unique constraint: one free consultation per client (by user_id when available)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_free_consultation_user
  ON public.bookings(user_id, type)
  WHERE type = 'free_consultation' AND status != 'cancelled' AND user_id IS NOT NULL;

-- Also prevent duplicate by email for free consultations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_free_consultation_email
  ON public.bookings(email, type)
  WHERE type = 'free_consultation' AND status != 'cancelled';

-- ============================================================
-- 4. SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  therapist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  date_time TIMESTAMPTZ,
  meet_link TEXT,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 10),
  date DATE,
  time TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'pending')),
  notes TEXT,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  development_form_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_program_id ON public.sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist_id ON public.sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);

-- Unique constraint: one session per session_number per program
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_session_per_program
  ON public.sessions(program_id, session_number);

-- ============================================================
-- 5. DIAGNOSTIC ASSESSMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.diagnostic_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  is_baseline BOOLEAN NOT NULL DEFAULT false,
  client_name TEXT,
  date_of_birth DATE,
  client_email TEXT,
  client_phone TEXT,
  client_country TEXT,
  client_occupation TEXT,
  relationship_status TEXT,
  main_complaint TEXT NOT NULL,
  current_symptoms TEXT[] DEFAULT '{}',
  previous_therapy BOOLEAN DEFAULT false,
  previous_therapy_details TEXT,
  nervous_system_pattern TEXT CHECK (nervous_system_pattern IN ('regulated', 'hyper', 'hypo', 'mixed')),
  emotional_patterns JSONB[] DEFAULT '{}',
  cognitive_patterns JSONB[] DEFAULT '{}',
  body_symptoms JSONB[] DEFAULT '{}',
  behavioral_patterns JSONB[] DEFAULT '{}',
  life_functioning_patterns JSONB[] DEFAULT '{}',
  nervous_system_score INTEGER NOT NULL DEFAULT 0 CHECK (nervous_system_score BETWEEN 0 AND 10),
  emotional_state_score INTEGER NOT NULL DEFAULT 0 CHECK (emotional_state_score BETWEEN 0 AND 10),
  cognitive_patterns_score INTEGER NOT NULL DEFAULT 0 CHECK (cognitive_patterns_score BETWEEN 0 AND 10),
  body_symptoms_score INTEGER NOT NULL DEFAULT 0 CHECK (body_symptoms_score BETWEEN 0 AND 10),
  behavioral_patterns_score INTEGER NOT NULL DEFAULT 0 CHECK (behavioral_patterns_score BETWEEN 0 AND 10),
  life_functioning_score INTEGER NOT NULL DEFAULT 0 CHECK (life_functioning_score BETWEEN 0 AND 10),
  goal_readiness_score INTEGER GENERATED ALWAYS AS (
    nervous_system_score + emotional_state_score + cognitive_patterns_score +
    body_symptoms_score + behavioral_patterns_score + life_functioning_score
  ) STORED,
  root_cause_pattern_timeline TEXT,
  root_cause_parental_influence TEXT,
  root_cause_core_patterns TEXT,
  root_cause_contributing_factors TEXT,
  clinical_condition_brief TEXT,
  therapist_focus TEXT,
  therapy_goal TEXT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_diagnostic_client_id ON public.diagnostic_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_therapist_id ON public.diagnostic_assessments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_is_baseline ON public.diagnostic_assessments(is_baseline);

-- Only one baseline assessment per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_baseline_per_client
  ON public.diagnostic_assessments(client_id)
  WHERE is_baseline = true;

-- ============================================================
-- 6. SESSION DEVELOPMENT FORMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.session_development_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Pre-session state
  pre_session_energy INTEGER DEFAULT 0 CHECK (pre_session_energy BETWEEN 0 AND 10),
  pre_session_mood INTEGER DEFAULT 0 CHECK (pre_session_mood BETWEEN 0 AND 10),
  pre_session_anxiety INTEGER DEFAULT 0 CHECK (pre_session_anxiety BETWEEN 0 AND 10),
  pre_session_notes TEXT,
  
  -- Post-session state
  post_session_energy INTEGER DEFAULT 0 CHECK (post_session_energy BETWEEN 0 AND 10),
  post_session_mood INTEGER DEFAULT 0 CHECK (post_session_mood BETWEEN 0 AND 10),
  post_session_anxiety INTEGER DEFAULT 0 CHECK (post_session_anxiety BETWEEN 0 AND 10),
  post_session_notes TEXT,
  
  -- Techniques and insights
  techniques_used TEXT[] DEFAULT '{}',
  key_insights TEXT,
  homework_assigned TEXT,
  homework_completed BOOLEAN DEFAULT false,
  
  -- Therapist internal notes (NEVER visible to clients)
  therapist_internal_notes TEXT,
  
  -- Timestamps
  filled_by_client_at TIMESTAMPTZ,
  filled_by_therapist_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- One form per session
  CONSTRAINT unique_session_form UNIQUE (session_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dev_forms_session_id ON public.session_development_forms(session_id);
CREATE INDEX IF NOT EXISTS idx_dev_forms_client_id ON public.session_development_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_dev_forms_therapist_id ON public.session_development_forms(therapist_id);

-- ============================================================
-- 7. SESSION MATERIALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.session_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  material_type TEXT CHECK (material_type IN ('document', 'video', 'audio', 'worksheet', 'exercise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_materials_session_id ON public.session_materials(session_id);
CREATE INDEX IF NOT EXISTS idx_materials_client_id ON public.session_materials(client_id);

-- ============================================================
-- 8. LEADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- ============================================================
-- 9. THERAPIST AVAILABILITY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.therapist_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  exception_date DATE,
  start_time TEXT NOT NULL, -- HH:MM format
  end_time TEXT NOT NULL, -- HH:MM format
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_availability_therapist_id ON public.therapist_availability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_availability_day_of_week ON public.therapist_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_exception_date ON public.therapist_availability(exception_date);

-- ============================================================
-- 10. THERAPIST CLIENTS TABLE (for tracking relationships)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.therapist_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_therapist_clients_therapist_id ON public.therapist_clients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_clients_client_id ON public.therapist_clients(client_id);

-- Unique constraint: one active relationship per therapist-client pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_therapist_client
  ON public.therapist_clients(therapist_id, client_id);

-- ============================================================
-- 11. NOTIFICATIONS LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'booking_confirmed',
  channel TEXT CHECK (channel IN ('email', 'whatsapp', 'sms', 'push')),
  subject TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications_log(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications_log(status);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_diagnostic_updated_at
  BEFORE UPDATE ON public.diagnostic_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_dev_forms_updated_at
  BEFORE UPDATE ON public.session_development_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_materials_updated_at
  BEFORE UPDATE ON public.session_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_availability_updated_at
  BEFORE UPDATE ON public.therapist_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_therapist_clients_updated_at
  BEFORE UPDATE ON public.therapist_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_development_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can view their own profile, admins/therapists can view all
CREATE POLICY "users_view_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admins_view_all_users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'therapist')
    )
  );

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admins_insert_users" ON public.users
  FOR INSERT WITH CHECK (true); -- Allow service role to insert

-- Programs: Clients view own, therapists view their clients, admins view all
CREATE POLICY "clients_view_own_programs" ON public.programs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "therapists_view_their_programs" ON public.programs
  FOR SELECT USING (therapist_user_id = auth.uid());

CREATE POLICY "admins_view_all_programs" ON public.programs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bookings: Similar access patterns
CREATE POLICY "clients_view_own_bookings" ON public.bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "therapists_view_their_bookings" ON public.bookings
  FOR SELECT USING (therapist_user_id = auth.uid());

CREATE POLICY "admins_view_all_bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sessions
CREATE POLICY "clients_view_own_sessions" ON public.sessions
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "therapists_view_their_sessions" ON public.sessions
  FOR SELECT USING (therapist_id = auth.uid());

-- Diagnostic Assessments
CREATE POLICY "clients_view_own_assessments" ON public.diagnostic_assessments
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "therapists_view_their_assessments" ON public.diagnostic_assessments
  FOR SELECT USING (therapist_id = auth.uid());

-- Session Development Forms - clients can view but NOT therapist_internal_notes
-- This is handled at the API layer, not RLS
CREATE POLICY "clients_view_own_dev_forms" ON public.session_development_forms
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "therapists_view_their_dev_forms" ON public.session_development_forms
  FOR SELECT USING (therapist_id = auth.uid());

-- Notifications
CREATE POLICY "users_view_own_notifications" ON public.notifications_log
  FOR SELECT USING (user_id = auth.uid());

-- Leads: only admins
CREATE POLICY "admins_view_leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Therapist Availability: therapists manage own, clients can view
CREATE POLICY "therapists_manage_own_availability" ON public.therapist_availability
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "clients_view_therapist_availability" ON public.therapist_availability
  FOR SELECT USING (true); -- Clients can view availability to book

-- Therapist Clients
CREATE POLICY "therapists_view_their_clients" ON public.therapist_clients
  FOR SELECT USING (therapist_id = auth.uid());

CREATE POLICY "clients_view_their_therapist" ON public.therapist_clients
  FOR SELECT USING (client_id = auth.uid());

-- ============================================================
-- INITIAL DATA (for testing)
-- ============================================================

-- Note: Users will be created via auth signup flow
-- Therapists and admin should be created via Supabase dashboard or seed script

-- Migration complete
COMMENT ON SCHEMA public IS 'NeuroHolistic therapy booking platform schema - clean rebuild';
