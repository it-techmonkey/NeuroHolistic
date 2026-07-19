-- ============================================================
-- Retreat waitlist table
-- Captures interest for retreats that don't have a fixed date/
-- booking flow yet (e.g. "Join The Wish List").
-- ============================================================

CREATE TABLE IF NOT EXISTS public.retreat_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retreat_id TEXT NOT NULL,
  retreat_title TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retreat_waitlist_retreat_id ON public.retreat_waitlist(retreat_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_retreat_waitlist_unique_email_per_retreat
  ON public.retreat_waitlist(retreat_id, lower(email));

ALTER TABLE public.retreat_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all retreat waitlist signups"
  ON public.retreat_waitlist
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
