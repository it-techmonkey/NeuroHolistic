-- Fix RLS circular dependency for users table
-- The issue: users can't read their own role because admins_view_all_users 
-- policy tries to query users table to check if user is admin, creating a loop

-- Drop the problematic policies
DROP POLICY IF EXISTS "users_view_own" ON public.users;
DROP POLICY IF EXISTS "admins_view_all_users" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "admins_insert_users" ON public.users;

-- Fixed policies - no circular dependency
-- 1. Users can view their own profile (including role)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 2. Therapists and admins can view all users (using JWT claims for simplicity)
CREATE POLICY "therapists_admins_select_all" ON public.users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'therapist' OR 
    auth.jwt() ->> 'role' = 'admin'
  );

-- 3. Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Allow inserts (for service role and signup)
CREATE POLICY "allow_inserts" ON public.users
  FOR INSERT WITH CHECK (true);

-- 5. Allow authenticated users to read all users (simpler approach for role resolution)
-- This is needed for the /api/auth/me endpoint to work correctly with regular client
CREATE POLICY "authenticated_read_users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Note: The /api/auth/me endpoint should use service role key to bypass RLS entirely
