-- ===========================================
-- Migration: Add R2 support to documents table
-- Run this in your Supabase SQL Editor
-- ===========================================

-- Add file_key column for R2 object storage reference
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_key TEXT;

-- Add file_size column for tracking upload sizes
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Add index for faster lookups by file_key
CREATE INDEX IF NOT EXISTS idx_documents_file_key ON documents(file_key);

-- Update RLS policy to allow clients to view their documents
-- (Therapists can already upload via the API)
CREATE POLICY "Clients can view their own documents" ON documents
  FOR SELECT
  USING (client_id = auth.uid());

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;
