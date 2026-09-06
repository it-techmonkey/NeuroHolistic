-- =====================================================================
-- CONSOLIDATED CATCH-UP MIGRATION
-- Applies migrations 027, 029 and 030, which are missing from the
-- production database (verified 2026-09-04 against project cippnggwojzgfprgexvh).
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
--
-- SAFE TO RE-RUN: every statement is IF NOT EXISTS / guarded, so running
-- it twice changes nothing. It only ADDS tables and columns — nothing is
-- dropped, renamed, or back-filled, and no existing row is modified.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 027: payment tracking on event registrations
-- Without these columns the PAID event flow fails outright: the
-- create-payment and verify-payment routes write to them on every booking.
-- ---------------------------------------------------------------------
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Added separately so re-running never trips over an existing constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'event_registrations_payment_status_check'
  ) THEN
    ALTER TABLE public.event_registrations
      ADD CONSTRAINT event_registrations_payment_status_check
      CHECK (payment_status IN ('free', 'pending', 'paid', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_reference
  ON public.event_registrations(payment_reference);

-- ---------------------------------------------------------------------
-- 029: which session date a registrant picked
-- ---------------------------------------------------------------------
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS selected_date TEXT;

-- ---------------------------------------------------------------------
-- 030a: one row per live session of an event (Google Meet links)
-- The Meet link and calendar entry are created on the host therapist's
-- connected Google account, so sessions land on her own calendar.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  session_key TEXT NOT NULL,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  meet_link TEXT,
  calendar_event_id TEXT,
  host_therapist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- This unique index is also the concurrency lock used when provisioning
-- Meet links: it guarantees one calendar event per session, even if two
-- people register at the same instant. Do not drop it.
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_meetings_unique_session
  ON public.event_meetings(event_id, session_key);
CREATE INDEX IF NOT EXISTS idx_event_meetings_starts_at
  ON public.event_meetings(starts_at);

ALTER TABLE public.event_meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage event meetings" ON public.event_meetings;
CREATE POLICY "Admins manage event meetings"
  ON public.event_meetings
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- ---------------------------------------------------------------------
-- 030b: reminder de-duplication
-- One row per (registrant, session, reminder type). The unique index is
-- what guarantees nobody is emailed the same reminder twice, even if the
-- cron runs more than once in a day.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_reminders_sent (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('week_before', 'day_before', 'hour_before', 'reminder_7d', 'reminder_24h', 'reminder_1h')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_reminders_unique
  ON public.event_reminders_sent(registration_id, session_key, reminder_type);

ALTER TABLE public.event_reminders_sent ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view event reminders" ON public.event_reminders_sent;
CREATE POLICY "Admins can view event reminders"
  ON public.event_reminders_sent
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- ---------------------------------------------------------------------
-- 030c: cancellation of event registrations
-- Rows are marked cancelled rather than deleted, so the audit trail and
-- any payment reference survive. Cancelled people are skipped by reminders.
-- ---------------------------------------------------------------------
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'event_registrations_status_check'
  ) THEN
    ALTER TABLE public.event_registrations
      ADD CONSTRAINT event_registrations_status_check
      CHECK (status IN ('active', 'cancelled'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_registrations_status
  ON public.event_registrations(status);

-- ---------------------------------------------------------------------
-- 030d: cancellation audit on bookings (cancelled_at already exists)
-- ---------------------------------------------------------------------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

COMMIT;

-- =====================================================================
-- VERIFICATION — should return 8 rows, all with exists = true
-- =====================================================================
SELECT 'event_registrations.payment_status' AS item,
       to_regclass('public.event_registrations') IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='event_registrations' AND column_name='payment_status') AS exists
UNION ALL SELECT 'event_registrations.selected_date',
       EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='event_registrations' AND column_name='selected_date')
UNION ALL SELECT 'event_registrations.status',
       EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='event_registrations' AND column_name='status')
UNION ALL SELECT 'event_registrations.cancelled_by',
       EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='event_registrations' AND column_name='cancelled_by')
UNION ALL SELECT 'bookings.cancelled_by',
       EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='bookings' AND column_name='cancelled_by')
UNION ALL SELECT 'bookings.cancellation_reason',
       EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='bookings' AND column_name='cancellation_reason')
UNION ALL SELECT 'event_meetings table',
       to_regclass('public.event_meetings') IS NOT NULL
UNION ALL SELECT 'event_reminders_sent table',
       to_regclass('public.event_reminders_sent') IS NOT NULL;
