-- ============================================================
-- Track which session date a registrant selected, for events
-- that run the same program on multiple dates
-- (e.g. NeuroHolistic Consciousness Quantum Leap).
-- ============================================================

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS selected_date TEXT;
