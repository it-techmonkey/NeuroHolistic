import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// POST - Upload file directly to R2 server-side (bypasses CORS)
export async function POST(request: NextRequest) {
  const logs: string[] = [];
  
  try {
    logs.push('1. Starting upload process');
    
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    
    if (!user) {
      logs.push('2. Auth failed - no user');
      return NextResponse.json({ error: 'Unauthorized', logs }, { status: 401 });
    }
    logs.push(`2. User authenticated: ${user.id}`);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('clientId') as string | null;
    const sessionId = formData.get('sessionId') as string | null;
    const description = formData.get('description') as string | null;

    logs.push(`3. FormData parsed - file: ${file?.name}, clientId: ${clientId}, sessionId: ${sessionId}`);

    if (!file) {
      return NextResponse.json({ error: 'File is required', logs }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required', logs }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    logs.push('4. Supabase client created');

    // Verify the user is a therapist or admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      logs.push(`4a. Users query error: ${userError.message}`);
      return NextResponse.json({ error: 'User lookup failed', logs }, { status: 500 });
    }
    logs.push(`4. User role: ${userData?.role}`);

    const isTherapist = userData?.role === 'therapist' || userData?.role === 'admin';

    if (!isTherapist) {
      return NextResponse.json({ error: 'Only therapists can upload documents', logs }, { status: 403 });
    }

    // Verify the therapist is assigned to this client
    logs.push(`5. Checking therapist-client assignment`);
    const { data: assignment, error: assignmentError } = await supabase
      .from('therapist_clients')
      .select('id')
      .eq('therapist_id', user.id)
      .eq('client_id', clientId)
      .maybeSingle();

    if (assignmentError) {
      logs.push(`5a. Assignment query error: ${assignmentError.message}`);
      return NextResponse.json({ error: 'Assignment check failed', logs }, { status: 500 });
    }

    if (!assignment) {
      logs.push('5b. No assignment found');
      return NextResponse.json({ error: 'Unauthorized to upload for this client', logs }, { status: 403 });
    }
    logs.push('5. Assignment verified');

    // Check if session is completed (if sessionId provided)
    if (sessionId) {
      logs.push(`6. Checking session status for: ${sessionId}`);
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('status')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        logs.push(`6a. Session query error: ${sessionError.message}`);
        // Continue anyway - session might not exist yet or might be optional
      } else if (session?.status === 'completed') {
        logs.push('6b. Session is completed - blocking upload');
        return NextResponse.json({ error: 'Cannot upload documents to a completed session', logs }, { status: 403 });
      } else {
        logs.push(`6. Session status: ${session?.status || 'unknown'}`);
      }
    }

    // Import R2 client
    logs.push('7. Loading R2 client');
    let getR2Client, R2_BUCKET_NAME, R2_PUBLIC_URL;
    try {
      const r2Module = await import('@/lib/r2/client');
      getR2Client = r2Module.default;
      R2_BUCKET_NAME = r2Module.R2_BUCKET_NAME;
      R2_PUBLIC_URL = r2Module.R2_PUBLIC_URL;
      logs.push(`7. R2 module loaded - bucket: ${R2_BUCKET_NAME}`);
    } catch (r2ImportError) {
      logs.push(`7a. R2 import error: ${r2ImportError instanceof Error ? r2ImportError.message : r2ImportError}`);
      return NextResponse.json({ error: 'R2 configuration failed', logs }, { status: 500 });
    }

    let r2Client;
    try {
      r2Client = getR2Client();
      logs.push('7. R2 client initialized');
    } catch (r2InitError) {
      logs.push(`7b. R2 init error: ${r2InitError instanceof Error ? r2InitError.message : r2InitError}`);
      return NextResponse.json({ error: 'R2 client initialization failed', logs }, { status: 500 });
    }

    // Generate file key
    const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'pdf';
    const fileKey = `clients/${clientId}/sessions/${sessionId || 'general'}/${randomUUID()}.${fileExtension}`;
    logs.push(`8. Generated file key: ${fileKey}`);

    // Convert file to buffer
    logs.push('9. Converting file to buffer');
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    logs.push(`9. Buffer size: ${fileBuffer.length} bytes`);

    // Determine document type
    let docType: 'pdf' | 'video' | 'image' | 'other' = 'other';
    const contentType = file.type.toLowerCase();
    if (contentType === 'application/pdf') docType = 'pdf';
    else if (contentType.startsWith('video/')) docType = 'video';
    else if (contentType.startsWith('image/')) docType = 'image';
    logs.push(`10. Document type: ${docType}`);

    // Upload to R2
    logs.push('11. Uploading to R2');
    try {
      await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.type,
        Metadata: {
          uploadedBy: user.id,
          clientId,
          sessionId: sessionId || '',
        },
      }));
      logs.push('11. R2 upload successful');
    } catch (r2UploadError) {
      logs.push(`11a. R2 upload error: ${r2UploadError instanceof Error ? r2UploadError.message : r2UploadError}`);
      return NextResponse.json({ error: 'R2 upload failed', logs }, { status: 500 });
    }

    // Build the public URL
    const fileUrl = R2_PUBLIC_URL
      ? `https://${R2_PUBLIC_URL}/${fileKey}`
      : '';
    logs.push(`12. File URL: ${fileUrl}`);

    // Save document metadata to database
    logs.push('13. Saving document metadata to database');
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        client_id: clientId,
        session_id: sessionId || null,
        therapist_id: user.id,
        type: docType,
        file_url: fileUrl,
        file_key: fileKey,
        file_name: file.name,
        file_size: file.size,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      logs.push(`13a. Database insert error: ${error.message}`);
      logs.push(`13b. Error details: ${JSON.stringify(error)}`);
      return NextResponse.json({ error: error.message, logs }, { status: 500 });
    }

    logs.push('14. Upload complete!');
    return NextResponse.json({ success: true, document, logs });
  } catch (error) {
    logs.push(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logs.push(`STACK: ${error instanceof Error ? error.stack?.substring(0, 500) : 'No stack'}`);
    console.error('[Document Upload]', error);
    return NextResponse.json({ error: 'Internal server error', logs }, { status: 500 });
  }
}
