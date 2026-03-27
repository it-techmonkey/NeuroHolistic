-- Migration: 012_therapist_google_tokens.sql
-- Description: Add table for storing Google OAuth tokens for therapists
-- Date: 2026-03-26

BEGIN;

-- Create therapist_google_tokens table
CREATE TABLE IF NOT EXISTS public.therapist_google_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expiry_date TIMESTAMPTZ NOT NULL,
    scope TEXT,
    token_type TEXT DEFAULT 'Bearer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one token record per user
    CONSTRAINT unique_user_google_tokens UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_therapist_google_tokens_user_id 
    ON public.therapist_google_tokens(user_id);

-- Enable RLS
ALTER TABLE public.therapist_google_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Therapists can only read their own tokens
CREATE POLICY "therapists_read_own_tokens" 
    ON public.therapist_google_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Therapists can insert their own tokens
CREATE POLICY "therapists_insert_own_tokens" 
    ON public.therapist_google_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Therapists can update their own tokens
CREATE POLICY "therapists_update_own_tokens" 
    ON public.therapist_google_tokens
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Therapists can delete their own tokens (disconnect)
CREATE POLICY "therapists_delete_own_tokens" 
    ON public.therapist_google_tokens
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Admins can read all tokens (for debugging/support)
CREATE POLICY "admins_read_all_tokens" 
    ON public.therapist_google_tokens
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'therapist')
        )
    );

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "service_role_all_operations" 
    ON public.therapist_google_tokens
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_therapist_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_therapist_google_tokens_updated_at
    BEFORE UPDATE ON public.therapist_google_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_therapist_google_tokens_updated_at();

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.therapist_google_tokens TO authenticated;
GRANT ALL ON public.therapist_google_tokens TO service_role;

COMMIT;
