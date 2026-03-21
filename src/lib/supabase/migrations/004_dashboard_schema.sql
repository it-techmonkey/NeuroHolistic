  -- ============================================================
  -- Migration 004: Schema Additions for 3-Dashboard System
  -- NeuroHolistic Institute
  -- Run in Supabase SQL Editor AFTER migrations 001, 002, 003
  -- ============================================================

  -- ─────────────────────────────────────────────────────────────
  -- 1. EXTEND users TABLE
  -- ─────────────────────────────────────────────────────────────

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
      ALTER TABLE public.users ADD COLUMN full_name TEXT;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
      ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
      ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    END IF;
  END $$;

  -- Extend role enum to support 'founder'
  DO $$ BEGIN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
  END $$;

  ALTER TABLE public.users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('client', 'therapist', 'founder'));

  -- ─────────────────────────────────────────────────────────────
  -- 2. EXTEND bookings TABLE
  -- ─────────────────────────────────────────────────────────────

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='therapist_user_id') THEN
      ALTER TABLE public.bookings ADD COLUMN therapist_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END $$;

  -- ─────────────────────────────────────────────────────────────
  -- 3. EXTEND programs TABLE
  -- ─────────────────────────────────────────────────────────────

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='therapist_user_id') THEN
      ALTER TABLE public.programs ADD COLUMN therapist_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='therapist_name') THEN
      ALTER TABLE public.programs ADD COLUMN therapist_name TEXT;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='program_type') THEN
      ALTER TABLE public.programs ADD COLUMN program_type TEXT DEFAULT 'private' CHECK (program_type IN ('private', 'group'));
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='price_paid') THEN
      ALTER TABLE public.programs ADD COLUMN price_paid INTEGER DEFAULT 0;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='client_name') THEN
      ALTER TABLE public.programs ADD COLUMN client_name TEXT;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='client_email') THEN
      ALTER TABLE public.programs ADD COLUMN client_email TEXT;
    END IF;
  END $$;

  -- ─────────────────────────────────────────────────────────────
  -- 4. EXTEND assessments TABLE
  -- ─────────────────────────────────────────────────────────────

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='therapist_notes') THEN
      ALTER TABLE public.assessments ADD COLUMN therapist_notes TEXT;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='full_name') THEN
      ALTER TABLE public.assessments ADD COLUMN full_name TEXT;
    END IF;
  END $$;

  -- ─────────────────────────────────────────────────────────────
  -- 5. THERAPIST-CLIENT ASSIGNMENT TABLE
  -- ─────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS public.therapist_clients (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes          TEXT,
    UNIQUE (therapist_id, client_id)
  );

  CREATE INDEX IF NOT EXISTS idx_therapist_clients_therapist ON public.therapist_clients(therapist_id);
  CREATE INDEX IF NOT EXISTS idx_therapist_clients_client    ON public.therapist_clients(client_id);

  ALTER TABLE public.therapist_clients ENABLE ROW LEVEL SECURITY;

  DO $$ BEGIN
    DROP POLICY IF EXISTS "Therapists can view their assignments" ON public.therapist_clients;
    CREATE POLICY "Therapists can view their assignments" ON public.therapist_clients
      FOR SELECT USING (
        therapist_id = auth.uid() OR
        client_id = auth.uid() OR
        auth.jwt() ->> 'role' = 'service_role'
      );
  END $$;

  DO $$ BEGIN
    DROP POLICY IF EXISTS "Service role can manage therapist_clients" ON public.therapist_clients;
    CREATE POLICY "Service role can manage therapist_clients" ON public.therapist_clients
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role')
      WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END $$;
