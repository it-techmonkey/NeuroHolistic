# Cloudflare R2 Integration Setup Guide

This guide walks you through setting up Cloudflare R2 for document storage in the NeuroHolistic application.

## Prerequisites

- A Cloudflare account (free tier works)
- Supabase project with database access
- Node.js 18+ installed

## Step 1: Create Cloudflare R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage** in the left sidebar
3. Click **Create bucket**
4. Configure:
   - **Bucket name**: `neuroholistic-docs` (or your preferred name)
   - **Location**: Auto
   - **Default storage class**: Standard
5. Click **Create bucket**

## Step 2: Generate R2 API Credentials

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Configure:
   - **Token name**: `neuroholistic-upload`
   - **Permissions**: Object Read & Write
   - **Account resources**: Include your bucket
   - **TTL**: No expiration (or set your preferred duration)
4. Click **Create API Token**
5. **Save these values immediately** (they won't be shown again):
   - `Access Key ID`
   - `Secret Access Key`

## Step 3: Get Account ID

1. Go to your Cloudflare Dashboard
2. Your Account ID is in the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`
3. Or find it in **Workers & Pages** > **Overview**

## Step 4: Enable Public Access (Optional)

For direct file access without signed URLs:

1. Go to your R2 bucket
2. Click **Settings**
3. Enable **Public access via r2.dev URL**
4. Note the public domain (e.g., `pub-abc123.r2.dev`)

## Step 5: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=neuroholistic-docs
R2_PUBLIC_URL=pub-xxx.r2.dev  # Optional, leave empty if not using public access
```

## Step 6: Run Database Migration

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run the migration script from `supabase/migrations/add_r2_support.sql`:

```sql
-- Add file_key column for R2 object storage reference
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_key TEXT;

-- Add file_size column for tracking upload sizes
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Add index for faster lookups by file_key
CREATE INDEX IF NOT EXISTS idx_documents_file_key ON documents(file_key);

-- Update RLS policy to allow clients to view their documents
CREATE POLICY "Clients can view their own documents" ON documents
  FOR SELECT
  USING (client_id = auth.uid());
```

## Step 7: Configure CORS on R2 Bucket

If uploads fail due to CORS errors:

1. Go to your R2 bucket **Settings**
2. Under **CORS configuration**, add:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Step 8: Verify Setup

1. Start your development server:
```bash
npm run dev
```

2. As a therapist, try uploading a document to a client's session
3. As the client, verify the document appears in their dashboard

## How It Works

### Upload Flow (Therapist)

1. Therapist selects a file to upload
2. Frontend calls `/api/documents/upload-url` to get a presigned URL
3. File is uploaded directly to R2 using the presigned URL
4. Frontend calls `/api/documents` to save metadata
5. Document is now visible to the client

### Access Flow (Client)

1. Client dashboard fetches documents from `/api/documents`
2. Documents include the R2 public URL or signed URL
3. Client can view/download documents directly from R2

## File Storage Structure

```
bucket/
├── clients/
│   ├── {clientId}/
│   │   ├── sessions/
│   │   │   ├── {sessionId}/
│   │   │   │   ├── {uuid}.pdf
│   │   │   │   ├── {uuid}.docx
│   │   │   │   └── ...
│   │   │   └── general/
│   │   │       └── ...
│   │   └── ...
│   └── ...
└── ...
```

## Troubleshooting

### "Access Denied" errors
- Verify R2 access keys are correct
- Check that the API token has Read & Write permissions
- Ensure the token hasn't expired

### "CORS" errors on upload
- Configure CORS on your R2 bucket (see Step 7)
- Ensure your origin is in the allowed origins list

### Files not appearing
- Check the documents table in Supabase
- Verify the `file_key` column exists
- Check browser console for errors

### Public URLs not working
- Ensure public access is enabled on your bucket
- Verify `R2_PUBLIC_URL` environment variable is set correctly

## Cost Considerations

**Cloudflare R2 Free Tier includes:**
- 10 GB storage per month
- 10 million Class A operations per month
- 10 million Class B operations per month
- Zero egress fees (data transfer out is free)

This is typically sufficient for most therapy applications.

## Security Notes

- Presigned URLs expire after 1 hour
- Only therapists can upload documents (enforced by API)
- Clients can only view documents assigned to them
- Files are stored with metadata linking to client and session
