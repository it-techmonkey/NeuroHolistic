-- ============================================================
-- Migration 006: Session Clinical Records + Rescheduling
-- NeuroHolistic Institute
-- ============================================================

-- 1) Add update/reschedule tracking to bookings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='bookings' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='bookings' AND column_name='rescheduled_from_date'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN rescheduled_from_date DATE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='bookings' AND column_name='rescheduled_from_time'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN rescheduled_from_time TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='bookings' AND column_name='google_calendar_event_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN google_calendar_event_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_therapist_date_time_status
  ON public.bookings(therapist_id, date, time, status);

CREATE INDEX IF NOT EXISTS idx_bookings_therapist_user_date_time_status
  ON public.bookings(therapist_user_id, date, time, status);

CREATE INDEX IF NOT EXISTS idx_bookings_google_calendar_event_id
  ON public.bookings(google_calendar_event_id);

-- 1b) Extend sessions to hold end-to-end lifecycle fields
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='client_id'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='therapist_id'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN therapist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='date_time'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN date_time TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='meet_link'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN meet_link TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='assessment_score'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN assessment_score NUMERIC(5,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='assessment_notes'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN assessment_notes TEXT;
  END IF;
END $$;

-- 2) Session-level therapist assessments
CREATE TABLE IF NOT EXISTS public.therapist_session_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nervous_system_score NUMERIC(5,2) NOT NULL,
  emotional_pattern_score NUMERIC(5,2) NOT NULL,
  family_imprint_score NUMERIC(5,2) NOT NULL,
  incident_load_score NUMERIC(5,2) NOT NULL,
  body_symptom_score NUMERIC(5,2) NOT NULL,
  current_stress_score NUMERIC(5,2) NOT NULL,
  overall_dysregulation_score NUMERIC(5,2) NOT NULL,
  therapist_notes TEXT,
  resource_pdf_url TEXT,
  resource_mp4_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_tsa_client_id_created_at
  ON public.therapist_session_assessments(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tsa_therapist_id_created_at
  ON public.therapist_session_assessments(therapist_id, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='therapist_session_assessments' AND column_name='observations'
  ) THEN
    ALTER TABLE public.therapist_session_assessments ADD COLUMN observations TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='therapist_session_assessments' AND column_name='recommendations'
  ) THEN
    ALTER TABLE public.therapist_session_assessments ADD COLUMN recommendations TEXT;
  END IF;
END $$;

ALTER TABLE public.therapist_session_assessments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Therapist session assessments read policy" ON public.therapist_session_assessments;
  CREATE POLICY "Therapist session assessments read policy"
    ON public.therapist_session_assessments
    FOR SELECT USING (
      therapist_id = auth.uid()
      OR client_id = auth.uid()
      OR auth.jwt() ->> 'role' = 'service_role'
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Therapist session assessments write policy" ON public.therapist_session_assessments;
  CREATE POLICY "Therapist session assessments write policy"
    ON public.therapist_session_assessments
    FOR ALL USING (
      therapist_id = auth.uid()
      OR auth.jwt() ->> 'role' = 'service_role'
    )
    WITH CHECK (
      therapist_id = auth.uid()
      OR auth.jwt() ->> 'role' = 'service_role'
    );
END $$;