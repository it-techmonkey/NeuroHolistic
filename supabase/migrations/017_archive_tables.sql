-- ============================================================
-- Archive Feature: Manual Entry for Past Clients
-- Version: 017
-- Description: Tables for archived/past clients with assessment and development forms
-- ============================================================

-- 1. ARCHIVED CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.archived_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  country TEXT,
  date_of_birth DATE,
  occupation TEXT,
  relationship_status TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_archived_clients_created_by ON public.archived_clients(created_by);

-- 2. ARCHIVED ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.archived_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  archived_client_id UUID NOT NULL REFERENCES public.archived_clients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Client demographic (copied at assessment time)
  client_name TEXT,
  date_of_birth DATE,
  client_email TEXT,
  client_phone TEXT,
  client_country TEXT,
  client_occupation TEXT,
  relationship_status TEXT,

  -- Main concerns
  main_complaint TEXT NOT NULL,
  current_symptoms TEXT[] DEFAULT '{}',

  -- Previous therapy
  previous_therapy BOOLEAN DEFAULT false,
  previous_therapy_details TEXT,

  -- Core assessment patterns
  nervous_system_pattern TEXT CHECK (nervous_system_pattern IN ('regulated', 'hyper', 'hypo', 'mixed')),
  emotional_patterns JSONB[] DEFAULT '{}',
  cognitive_patterns JSONB[] DEFAULT '{}',
  body_symptoms JSONB[] DEFAULT '{}',
  behavioral_patterns JSONB[] DEFAULT '{}',
  life_functioning_patterns JSONB[] DEFAULT '{}',

  -- Scores (0-10)
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

  -- Root cause analysis
  root_cause_pattern_timeline TEXT,
  root_cause_parental_influence TEXT,
  root_cause_core_patterns TEXT,
  root_cause_contributing_factors TEXT,

  -- Clinical summary
  clinical_condition_brief TEXT,
  therapist_focus TEXT,
  therapy_goal TEXT,

  -- Metadata
  assessment_date DATE,
  session_number INTEGER,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_archived_assessments_client ON public.archived_assessments(archived_client_id);
CREATE INDEX IF NOT EXISTS idx_archived_assessments_therapist ON public.archived_assessments(therapist_id);

-- 3. ARCHIVED DEVELOPMENT FORMS TABLE
CREATE TABLE IF NOT EXISTS public.archived_development_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  archived_client_id UUID NOT NULL REFERENCES public.archived_clients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Session info
  session_number INTEGER,
  session_date DATE,

  -- Pre-session data
  previous_session_improvements TEXT,
  previous_session_challenges TEXT,
  pre_session_symptoms TEXT[] DEFAULT '{}',
  pre_session_intensity INTEGER DEFAULT 0 CHECK (pre_session_intensity BETWEEN 0 AND 10),
  pre_session_mood INTEGER DEFAULT 0 CHECK (pre_session_mood BETWEEN 0 AND 10),

  -- Session data
  techniques_used TEXT[] DEFAULT '{}',
  targeted_therapy_specify TEXT,
  scanning_specify TEXT,
  key_interventions TEXT,
  breakthroughs_resistance TEXT,

  -- Post-session data
  post_session_symptoms TEXT[] DEFAULT '{}',
  post_session_intensity INTEGER DEFAULT 0 CHECK (post_session_intensity BETWEEN 0 AND 10),
  post_session_mood INTEGER DEFAULT 0 CHECK (post_session_mood BETWEEN 0 AND 10),
  shift_observed TEXT,
  client_feedback TEXT,
  integration_notes TEXT,

  -- Therapist internal notes
  therapist_internal_notes TEXT,

  -- Scores (0-10)
  nervous_system_score INTEGER DEFAULT 0 CHECK (nervous_system_score BETWEEN 0 AND 10),
  emotional_state_score INTEGER DEFAULT 0 CHECK (emotional_state_score BETWEEN 0 AND 10),
  cognitive_patterns_score INTEGER DEFAULT 0 CHECK (cognitive_patterns_score BETWEEN 0 AND 10),
  body_symptoms_score INTEGER DEFAULT 0 CHECK (body_symptoms_score BETWEEN 0 AND 10),
  behavioral_patterns_score INTEGER DEFAULT 0 CHECK (behavioral_patterns_score BETWEEN 0 AND 10),
  life_functioning_score INTEGER DEFAULT 0 CHECK (life_functioning_score BETWEEN 0 AND 10),
  goal_readiness_score INTEGER GENERATED ALWAYS AS (
    nervous_system_score + emotional_state_score + cognitive_patterns_score +
    body_symptoms_score + behavioral_patterns_score + life_functioning_score
  ) STORED,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_archived_dev_forms_client ON public.archived_development_forms(archived_client_id);
CREATE INDEX IF NOT EXISTS idx_archived_dev_forms_therapist ON public.archived_development_forms(therapist_id);

-- 4. TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS trigger_archived_clients_updated_at ON public.archived_clients;
CREATE TRIGGER trigger_archived_clients_updated_at
  BEFORE UPDATE ON public.archived_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_archived_assessments_updated_at ON public.archived_assessments;
CREATE TRIGGER trigger_archived_assessments_updated_at
  BEFORE UPDATE ON public.archived_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_archived_dev_forms_updated_at ON public.archived_development_forms;
CREATE TRIGGER trigger_archived_dev_forms_updated_at
  BEFORE UPDATE ON public.archived_development_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. RLS POLICIES
ALTER TABLE public.archived_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_development_forms ENABLE ROW LEVEL SECURITY;

-- Therapists can manage their own archived clients
DROP POLICY IF EXISTS "Therapists manage archived_clients" ON public.archived_clients;
CREATE POLICY "Therapists manage archived_clients" ON public.archived_clients
  FOR ALL USING (created_by = auth.uid());

-- Therapists can manage their own archived assessments
DROP POLICY IF EXISTS "Therapists manage archived_assessments" ON public.archived_assessments;
CREATE POLICY "Therapists manage archived_assessments" ON public.archived_assessments
  FOR ALL USING (therapist_id = auth.uid());

-- Therapists can manage their own archived development forms
DROP POLICY IF EXISTS "Therapists manage archived_dev_forms" ON public.archived_development_forms;
CREATE POLICY "Therapists manage archived_dev_forms" ON public.archived_development_forms
  FOR ALL USING (therapist_id = auth.uid());
