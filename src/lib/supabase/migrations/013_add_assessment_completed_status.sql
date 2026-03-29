-- ============================================================
-- Migration: Add 'completed' status to diagnostic_assessments
-- Version: 013
-- Description: Add 'completed' status option to assessment workflow
-- ============================================================

-- Drop the existing check constraint
ALTER TABLE public.diagnostic_assessments 
  DROP CONSTRAINT IF EXISTS diagnostic_assessments_status_check;

-- Add new check constraint with 'completed' status
ALTER TABLE public.diagnostic_assessments 
  ADD CONSTRAINT diagnostic_assessments_status_check 
  CHECK (status IN ('draft', 'submitted', 'completed'));

-- Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_diagnostic_status ON public.diagnostic_assessments(status);

-- Migration complete
COMMENT ON CONSTRAINT diagnostic_assessments_status_check ON public.diagnostic_assessments 
  IS 'Updated to include completed status for assessment workflow';
