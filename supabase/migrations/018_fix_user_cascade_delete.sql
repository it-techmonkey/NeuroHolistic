-- ============================================================
-- Fix User Cascade Delete Relationships
-- Version: 018
-- Description: Ensure deleting a user cascades to all their data
-- ============================================================

-- 1. PROGRAMS - client's programs should be deleted when client is deleted
ALTER TABLE public.programs
  DROP CONSTRAINT IF EXISTS programs_user_id_fkey,
  ADD CONSTRAINT programs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. BOOKINGS - client's bookings should be deleted when client is deleted
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
  ADD CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. SESSIONS - client's sessions should be deleted when client is deleted
ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_client_id_fkey,
  ADD CONSTRAINT sessions_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. NOTIFICATIONS_LOG - user's notifications should be deleted when user is deleted
ALTER TABLE public.notifications_log
  DROP CONSTRAINT IF EXISTS notifications_log_user_id_fkey,
  ADD CONSTRAINT notifications_log_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
