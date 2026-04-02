-- Add 'pending' status to programs table for payment verification flow
-- Programs start as 'pending' when client submits payment, become 'active' after admin verifies

-- Update the status CHECK constraint to include 'pending'
ALTER TABLE public.programs DROP CONSTRAINT IF EXISTS programs_status_check;
ALTER TABLE public.programs ADD CONSTRAINT programs_status_check
  CHECK (status IN ('pending', 'active', 'completed', 'cancelled'));

-- Add payment_status column for tracking admin verification
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS payment_status TEXT
  DEFAULT 'pending_verification'
  CHECK (payment_status IN ('pending_verification', 'verified', 'rejected'));

-- Add timestamp for when payment was submitted by client
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ;

-- Add timestamp for when admin verified the payment
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;

-- Add admin notes field for payment verification
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add index for pending payments (admin dashboard query)
CREATE INDEX IF NOT EXISTS idx_programs_payment_status ON public.programs(payment_status)
  WHERE payment_status = 'pending_verification';

-- Update existing programs to have verified payment status
UPDATE public.programs
SET payment_status = 'verified',
    payment_verified_at = created_at
WHERE payment_status = 'pending_verification' AND status = 'active';
