-- ============================================================
-- UPDATE CERTIFICATES TABLE
-- Use this if the certificates table was created from the earlier
-- version that stored QR placement options in the database.
-- ============================================================

-- QR placement and size are now internal template rules in the app.
ALTER TABLE public.certificates
  DROP COLUMN IF EXISTS qr_position,
  DROP COLUMN IF EXISTS qr_size;

-- Normalize records created while the old default title was in use.
UPDATE public.certificates
SET
  title = 'Certificate Of Professional Mastery',
  updated_at = now()
WHERE title = 'Certificate of Completion';

-- Keep core indexes present for existing databases.
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_qr_token ON public.certificates(qr_token);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
