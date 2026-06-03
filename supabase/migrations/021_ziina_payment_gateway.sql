-- ============================================================
-- Ziina payment gateway support
-- ============================================================

-- Store the server-side checkout context used by the webhook.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Allow academy programs to be tracked alongside private/group programs.
ALTER TABLE public.programs
  DROP CONSTRAINT IF EXISTS programs_program_type_check;

ALTER TABLE public.programs
  ADD CONSTRAINT programs_program_type_check
  CHECK (program_type IN ('private', 'group', 'academy'));

-- Keep webhook processing idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS idx_programs_unique_ziina_payment_id
  ON public.programs(payment_id)
  WHERE payment_id LIKE 'ziina:%';

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique_payment_reference
  ON public.payments(payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_metadata_gateway
  ON public.payments((metadata->>'gateway'));
