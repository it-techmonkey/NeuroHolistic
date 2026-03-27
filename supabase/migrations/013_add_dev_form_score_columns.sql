-- Add missing columns to session_development_forms table
-- These columns are needed for the development form submission

-- Additional pre-session columns
ALTER TABLE public.session_development_forms
ADD COLUMN IF NOT EXISTS previous_session_improvements TEXT,
ADD COLUMN IF NOT EXISTS previous_session_challenges TEXT,
ADD COLUMN IF NOT EXISTS pre_session_symptoms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pre_session_intensity INTEGER DEFAULT 0 CHECK (pre_session_intensity BETWEEN 0 AND 10);

-- Session data columns
ALTER TABLE public.session_development_forms
ADD COLUMN IF NOT EXISTS key_interventions TEXT,
ADD COLUMN IF NOT EXISTS breakthroughs_resistance TEXT;

-- Additional post-session columns
ALTER TABLE public.session_development_forms
ADD COLUMN IF NOT EXISTS post_session_symptoms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS post_session_intensity INTEGER DEFAULT 0 CHECK (post_session_intensity BETWEEN 0 AND 10),
ADD COLUMN IF NOT EXISTS shift_observed TEXT,
ADD COLUMN IF NOT EXISTS client_feedback TEXT,
ADD COLUMN IF NOT EXISTS integration_notes TEXT;

-- Score columns for wellbeing calculation
ALTER TABLE public.session_development_forms
ADD COLUMN IF NOT EXISTS nervous_system_score INTEGER DEFAULT 0 CHECK (nervous_system_score BETWEEN 0 AND 10),
ADD COLUMN IF NOT EXISTS emotional_state_score INTEGER DEFAULT 0 CHECK (emotional_state_score BETWEEN 0 AND 10),
ADD COLUMN IF NOT EXISTS cognitive_patterns_score INTEGER DEFAULT 0 CHECK (cognitive_patterns_score BETWEEN 0 AND 10),
ADD COLUMN IF NOT EXISTS body_symptoms_score INTEGER DEFAULT 0 CHECK (body_symptoms_score BETWEEN 0 AND 10),
ADD COLUMN IF NOT EXISTS behavioral_patterns_score INTEGER DEFAULT 0 CHECK (behavioral_patterns_score BETWEEN 0 AND 10),
ADD COLUMN IF NOT EXISTS life_functioning_score INTEGER DEFAULT 0 CHECK (life_functioning_score BETWEEN 0 AND 10);

-- Add goal_readiness_score as a generated column (sum of all domain scores)
ALTER TABLE public.session_development_forms
ADD COLUMN IF NOT EXISTS goal_readiness_score INTEGER GENERATED ALWAYS AS (
  nervous_system_score + emotional_state_score + cognitive_patterns_score + 
  body_symptoms_score + behavioral_patterns_score + life_functioning_score
) STORED;
