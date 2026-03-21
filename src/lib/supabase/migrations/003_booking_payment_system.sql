-- ============================================================
-- Migration 003: Booking & Payment System
-- NeuroHolistic Institute
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ─────────────────────────────────────────────────────────────

-- Add meeting_link to bookings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'meeting_link'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN meeting_link TEXT;
  END IF;
END $$;

-- Add status to bookings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN status TEXT DEFAULT 'confirmed'
      CHECK (status IN ('confirmed', 'cancelled', 'completed'));
  END IF;
END $$;

-- Add user_id to bookings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Drop old type check constraint (to allow free_consultation)
DO $$ BEGIN
  ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_type_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add status to programs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.programs ADD COLUMN status TEXT DEFAULT 'active'
      CHECK (status IN ('active', 'completed', 'cancelled'));
  END IF;
END $$;

-- Add sessions_completed to programs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'sessions_completed'
  ) THEN
    ALTER TABLE public.programs ADD COLUMN sessions_completed INTEGER DEFAULT 0;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. LEADS TABLE (Free Consultation signups)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  mobile      TEXT NOT NULL,
  email       TEXT NOT NULL,
  country     TEXT NOT NULL,
  source      TEXT DEFAULT 'free_consultation',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_lead_email CHECK (
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  )
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public to insert leads" ON public.leads;
  CREATE POLICY "Allow public to insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public to read own lead" ON public.leads;
  CREATE POLICY "Allow public to read own lead" ON public.leads
    FOR SELECT USING (true);
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. PAYMENTS TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount            INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'AED',
  type              TEXT NOT NULL CHECK (type IN ('full_program', 'single_session')),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference TEXT,
  program_id        UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id   ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference  ON public.payments(payment_reference);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
  CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;
  CREATE POLICY "Service role can insert payments" ON public.payments
    FOR INSERT WITH CHECK (true);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;
  CREATE POLICY "Service role can update payments" ON public.payments
    FOR UPDATE USING (true);
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. SESSIONS TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id     UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  booking_id     UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL,
  date           DATE,
  time           TEXT,
  status         TEXT NOT NULL DEFAULT 'scheduled'
                 CHECK (status IN ('scheduled', 'completed', 'cancelled', 'pending')),
  notes          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_program_id ON public.sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date       ON public.sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status     ON public.sessions(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_program_number
  ON public.sessions(program_id, session_number);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
  CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (
      program_id IN (
        SELECT id FROM public.programs WHERE user_id = auth.uid()
      )
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role can manage sessions" ON public.sessions;
  CREATE POLICY "Service role can manage sessions" ON public.sessions
    FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ─────────────────────────────────────────────────────────────
-- 5. AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_sessions_updated_at ON public.sessions;
CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
