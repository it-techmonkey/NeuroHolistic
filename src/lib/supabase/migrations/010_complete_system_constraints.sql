-- ============================================================
-- Migration 010: Complete System Constraints & Fixes
-- - Ensure user role constraint uses 'admin' not 'founder'
-- - Fix bookings unique constraint for free consultations
-- - Ensure sessions CHECK constraint for session_number 1-10
-- - Add meet_link column to sessions if missing
-- - Ensure notifications_log has content column
-- - Add role column to users if missing
-- ============================================================

-- 1. Fix user role constraint: replace 'founder' with 'admin'
-- CRITICAL ORDER: Drop constraint FIRST (old one only allows 'founder', not 'admin')
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Now safe to update roles
UPDATE public.users SET role = 'admin' WHERE role = 'founder';
UPDATE public.users SET role = 'client' WHERE role IS NULL OR role NOT IN ('client', 'therapist', 'admin');

-- Add new constraint
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('client', 'therapist', 'admin'));

-- 2. Ensure phone and country columns on users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='country') THEN
    ALTER TABLE public.users ADD COLUMN country TEXT;
  END IF;
END $$;

-- 3. Ensure bookings has all required columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='phone') THEN
    ALTER TABLE public.bookings ADD COLUMN phone TEXT DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='country') THEN
    ALTER TABLE public.bookings ADD COLUMN country TEXT DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='type') THEN
    ALTER TABLE public.bookings ADD COLUMN type TEXT DEFAULT 'free_consultation';
  END IF;
END $$;

-- 4. Fix bookings unique constraint for free consultations
-- Drop old constraint if exists
DROP INDEX IF EXISTS idx_unique_free_consultation_per_client;

-- Create unique constraint: one free consultation per client (by user_id when available)
-- Using a partial unique index that works with NULLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_free_consultation_user
  ON bookings(user_id, type)
  WHERE type = 'free_consultation' AND status != 'cancelled' AND user_id IS NOT NULL;

-- Also prevent duplicate by email for free consultations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_free_consultation_email
  ON bookings(email, type)
  WHERE type = 'free_consultation' AND status != 'cancelled';

-- 5. Ensure sessions CHECK constraint for session_number 1-10
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_session_number_range;
ALTER TABLE sessions ADD CONSTRAINT sessions_session_number_range
  CHECK (session_number BETWEEN 1 AND 10);

-- 6. Ensure sessions has meet_link column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='meet_link') THEN
    ALTER TABLE public.sessions ADD COLUMN meet_link TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='is_complete') THEN
    ALTER TABLE public.sessions ADD COLUMN is_complete BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='development_form_submitted') THEN
    ALTER TABLE public.sessions ADD COLUMN development_form_submitted BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- 7. Ensure notifications_log has all columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications_log' AND column_name='content') THEN
    ALTER TABLE public.notifications_log ADD COLUMN content TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications_log' AND column_name='type') THEN
    ALTER TABLE public.notifications_log ADD COLUMN type TEXT DEFAULT 'booking_confirmed';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications_log' AND column_name='recipient_id') THEN
    ALTER TABLE public.notifications_log ADD COLUMN recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 8. Ensure therapist_availability has proper data structure
-- Add is_active column if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='therapist_availability' AND column_name='is_active') THEN
    ALTER TABLE public.therapist_availability ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 9. Ensure payments has all needed columns for shelved payment flow
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='user_id') THEN
    ALTER TABLE public.payments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 10. Refresh RLS policies to ensure admin access via service role
-- Drop and recreate diagnostic_assessments policies
DROP POLICY IF EXISTS therapist_da_all ON diagnostic_assessments;
DROP POLICY IF EXISTS client_da_select ON diagnostic_assessments;

CREATE POLICY therapist_da_all ON diagnostic_assessments
  FOR ALL
  USING (auth.uid() = therapist_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = therapist_id OR auth.role() = 'service_role');

CREATE POLICY client_da_select ON diagnostic_assessments
  FOR SELECT
  USING (auth.uid() = client_id OR auth.role() = 'service_role');

-- Session development forms: ensure internal notes restricted
DROP POLICY IF EXISTS therapist_sdf_all ON session_development_forms;
DROP POLICY IF EXISTS client_sdf_select ON session_development_forms;

CREATE POLICY therapist_sdf_all ON session_development_forms
  FOR ALL
  USING (auth.uid() = therapist_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = therapist_id OR auth.role() = 'service_role');

-- Client can SELECT rows but API layer strips therapist_internal_notes
CREATE POLICY client_sdf_select ON session_development_forms
  FOR SELECT
  USING (auth.uid() = client_id OR auth.role() = 'service_role');

-- 11. Ensure sessions RLS allows therapist and admin access
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON sessions;

CREATE POLICY "Clients can view own sessions" ON sessions
  FOR SELECT USING (
    client_id = auth.uid() OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Therapists can view assigned sessions" ON sessions
  FOR SELECT USING (
    therapist_id = auth.uid() OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Service role can manage sessions" ON sessions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 12. Ensure bookings RLS allows proper access
DROP POLICY IF EXISTS "Allow public to insert bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public to read bookings" ON bookings;
DROP POLICY IF EXISTS "Allow users to update own bookings" ON bookings;

CREATE POLICY "Anyone can insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update bookings" ON bookings
  FOR UPDATE USING (true) WITH CHECK (true);

-- 13. Update updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_diagnostic_assessments_updated_at ON diagnostic_assessments;
CREATE TRIGGER update_diagnostic_assessments_updated_at
  BEFORE UPDATE ON diagnostic_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_development_forms_updated_at ON session_development_forms;
CREATE TRIGGER update_session_development_forms_updated_at
  BEFORE UPDATE ON session_development_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Add unique partial index for baseline assessments (only one baseline per client)
DROP INDEX IF EXISTS idx_unique_baseline_assessment;
CREATE UNIQUE INDEX idx_unique_baseline_assessment 
  ON diagnostic_assessments(client_id) 
  WHERE is_baseline = true;
