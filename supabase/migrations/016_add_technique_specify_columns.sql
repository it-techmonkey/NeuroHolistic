-- Add specify columns for Targeted Therapy and Scanning techniques
-- These columns store custom descriptions when therapists select these techniques

ALTER TABLE public.session_development_forms
ADD COLUMN IF NOT EXISTS targeted_therapy_specify TEXT,
ADD COLUMN IF NOT EXISTS scanning_specify TEXT;
