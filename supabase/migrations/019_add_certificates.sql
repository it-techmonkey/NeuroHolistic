-- ============================================================
-- CERTIFICATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  recipient_name TEXT,
  recipient_email TEXT,
  issued_at DATE,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  qr_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_qr_token ON public.certificates(qr_token);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
