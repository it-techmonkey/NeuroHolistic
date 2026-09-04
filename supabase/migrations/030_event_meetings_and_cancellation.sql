-- ============================================================
-- Events: Google Meet links per session, reminder tracking,
-- and admin-side cancellation of registrations.
--
-- The Meet link and calendar entry are created on the host
-- therapist's connected Google account, so the sessions land on
-- her own calendar rather than a generic institute one.
-- ============================================================

-- ---------- 1. One row per live session of an event ----------
CREATE TABLE IF NOT EXISTS public.event_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  -- Stable key from the static event definition, e.g. "liberation-1".
  session_key TEXT NOT NULL,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  meet_link TEXT,
  calendar_event_id TEXT,
  -- Therapist whose Google account owns the Meet space / calendar entry.
  host_therapist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_meetings_unique_session
  ON public.event_meetings(event_id, session_key);
CREATE INDEX IF NOT EXISTS idx_event_meetings_starts_at ON public.event_meetings(starts_at);

ALTER TABLE public.event_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage event meetings"
  ON public.event_meetings
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- ---------- 2. Reminder de-duplication ----------
CREATE TABLE IF NOT EXISTS public.event_reminders_sent (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('reminder_7d', 'reminder_24h', 'reminder_1h')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_reminders_unique
  ON public.event_reminders_sent(registration_id, session_key, reminder_type);

ALTER TABLE public.event_reminders_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view event reminders"
  ON public.event_reminders_sent
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- ---------- 3. Cancellation of event registrations ----------
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);

-- ---------- 4. Cancellation audit on bookings ----------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
