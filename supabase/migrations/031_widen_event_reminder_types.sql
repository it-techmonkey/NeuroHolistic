-- ============================================================
-- Widen event_reminders_sent.reminder_type to also accept the
-- curated onboarding-sequence keys (week_before / day_before /
-- hour_before), used by the Quantum Leap email sequence.
--
-- Migration 030 already ran in production with the old, narrower
-- CHECK — this migration only needs to run because of that; it is
-- additive and keeps the old values valid too.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to re-run.
-- ============================================================

BEGIN;

ALTER TABLE public.event_reminders_sent
  DROP CONSTRAINT IF EXISTS event_reminders_sent_reminder_type_check;

ALTER TABLE public.event_reminders_sent
  ADD CONSTRAINT event_reminders_sent_reminder_type_check
  CHECK (reminder_type IN ('week_before', 'day_before', 'hour_before', 'reminder_7d', 'reminder_24h', 'reminder_1h'));

COMMIT;

-- Verification — should return true
SELECT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = 'event_reminders_sent_reminder_type_check'
) AS constraint_widened;
