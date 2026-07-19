-- ============================================================
-- Add payment tracking to event_registrations for paid events.
-- ============================================================

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'paid', 'failed')),
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_reference ON public.event_registrations(payment_reference);
