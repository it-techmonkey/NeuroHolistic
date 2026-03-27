import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import getR2Client, { R2_BUCKET_NAME } from '@/lib/r2/client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// POST - Generate presigned URL for client-side upload
export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType, sessionId, clientId } = body;

    if (!fileName || !fileType || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user is a therapist or admin
    const supabase = getServiceSupabase();
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isTherapist = userData?.role === 'therapist' || userData?.role === 'admin';

    if (!isTherapist) {
      return NextResponse.json({ error: 'Only therapists can upload documents' }, { status: 403 });
    }

    // Verify the therapist is assigned to this client
    const { data: assignment } = await supabase
      .from('therapist_clients')
      .select('id')
      .eq('therapist_id', user.id)
      .eq('client_id', clientId)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ error: 'Unauthorized to upload for this client' }, { status: 403 });
    }

    // Check if session is completed (if sessionId provided)
    if (sessionId) {
      const { data: session } = await supabase
        .from('sessions')
        .select('status')
        .eq('id', sessionId)
        .single();

      if (session?.status === 'completed') {
        return NextResponse.json({ error: 'Cannot upload documents to a completed session' }, { status: 403 });
      }
    }

    // Generate unique file key
    const fileExtension = fileName.split('.').pop() || '';
    const fileKey = `clients/${clientId}/sessions/${sessionId || 'general'}/${randomUUID()}.${fileExtension}`;

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        uploadedBy: user.id,
        clientId,
        sessionId: sessionId || '',
      },
    });

    const presignedUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 3600 }); // 1 hour expiry

    return NextResponse.json({
      uploadUrl: presignedUrl,
      fileKey,
      publicUrl: process.env.R2_PUBLIC_URL 
        ? `https://${process.env.R2_PUBLIC_URL}/${fileKey}`
        : null,
    });
  } catch (error) {
    console.error('[Upload URL Generation]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}
