-- Add file_key column and make file_url nullable for signed URL support
-- The file_key is used to generate signed URLs on-demand for private R2 buckets

-- Add file_key column to store the R2 object key
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS file_key TEXT;

-- Make file_url nullable since we now use signed URLs
ALTER TABLE public.documents
ALTER COLUMN file_url DROP NOT NULL;

-- Add index for file_key lookups
CREATE INDEX IF NOT EXISTS idx_documents_file_key ON public.documents(file_key);
