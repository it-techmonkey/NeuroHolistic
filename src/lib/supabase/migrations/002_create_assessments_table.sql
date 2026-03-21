-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User info
  user_id UUID,
  email TEXT,
  assessment_type TEXT DEFAULT 'initial',
  
  -- Raw form data
  raw_responses_json JSONB NOT NULL,
  
  -- Individual Scores (0-100)
  nervous_system_score NUMERIC(5, 2),
  emotional_pattern_score NUMERIC(5, 2),
  family_imprint_score NUMERIC(5, 2),
  incident_load_score NUMERIC(5, 2),
  body_symptom_score NUMERIC(5, 2),
  current_stress_score NUMERIC(5, 2),
  
  -- Final scores
  overall_dysregulation_score NUMERIC(5, 2),
  overall_severity_band TEXT,
  
  -- Classification
  nervous_system_type TEXT,
  primary_core_wound TEXT,
  secondary_core_wound TEXT,
  dominant_parental_influence TEXT,
  possible_origin_period TEXT,
  
  -- Recommendation
  recommended_phase_primary TEXT,
  recommended_phase_secondary TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT user_id_check CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_email ON public.assessments(email);
CREATE INDEX IF NOT EXISTS idx_assessments_submitted_at ON public.assessments(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_overall_score ON public.assessments(overall_dysregulation_score);

-- Enable RLS (Row Level Security)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow users to view their own assessments
CREATE POLICY "Users can view their own assessments" ON public.assessments
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    email = auth.email() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Allow service role to insert/update/delete (needed for API)
CREATE POLICY "Service role can manage all assessments" ON public.assessments
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
