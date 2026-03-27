import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

// GET - Fetch documents for a client or session
export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const clientId = request.nextUrl.searchParams.get('clientId');
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    let query = supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: documents, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform documents to include full URL from R2 if needed
    const transformedDocs = (documents ?? []).map((doc: any) => ({
      ...doc,
      // Use file_url directly, it should contain the full R2 URL or Supabase storage URL
      file_url: doc.file_url || (doc.file_key && process.env.R2_PUBLIC_URL 
        ? `https://${process.env.R2_PUBLIC_URL}/${doc.file_key}` 
        : null),
    }));

    return NextResponse.json({ documents: transformedDocs });
  } catch (error) {
    console.error('[Documents GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create document metadata (use with presigned URL flow)
// After client uploads via presigned URL, call this to save metadata
export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      client_id, 
      session_id, 
      type, 
      file_url, 
      file_key,
      file_name, 
      description,
      file_size
    } = body;

    if (!client_id || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Must have either file_url or file_key
    if (!file_url && !file_key) {
      return NextResponse.json({ error: 'file_url or file_key is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Verify the user is a therapist or admin
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
      .eq('client_id', client_id)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ error: 'Unauthorized to upload for this client' }, { status: 403 });
    }

    // Check if session is completed (if session_id provided)
    if (session_id) {
      const { data: session } = await supabase
        .from('sessions')
        .select('status')
        .eq('id', session_id)
        .single();

      if (session?.status === 'completed') {
        return NextResponse.json({ error: 'Cannot upload documents to a completed session' }, { status: 403 });
      }
    }

    // Determine the final file URL
    let finalFileUrl = file_url;
    if (!finalFileUrl && file_key && process.env.R2_PUBLIC_URL) {
      finalFileUrl = `https://${process.env.R2_PUBLIC_URL}/${file_key}`;
    }

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        client_id,
        session_id: session_id || null,
        therapist_id: user.id,
        type,
        file_url: finalFileUrl,
        file_key: file_key || null,
        file_name: file_name || 'Untitled',
        file_size: file_size || null,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Document Save Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('[Documents POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a document (also deletes from R2)
export async function DELETE(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Get document details including file_key and session_id for R2 deletion and session status check
    const { data: doc } = await supabase
      .from('documents')
      .select('id, therapist_id, file_key, session_id')
      .eq('id', documentId)
      .single();

    if (!doc || doc.therapist_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if session is completed
    if (doc.session_id) {
      const { data: session } = await supabase
        .from('sessions')
        .select('status')
        .eq('id', doc.session_id)
        .single();

      if (session?.status === 'completed') {
        return NextResponse.json({ error: 'Cannot delete documents from a completed session' }, { status: 403 });
      }
    }

    // Delete from R2 if file_key exists
    if (doc.file_key) {
      try {
        const getR2Client = (await import('@/lib/r2/client')).default;
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        const { R2_BUCKET_NAME } = await import('@/lib/r2/client');
        
        await getR2Client().send(new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: doc.file_key,
        }));
      } catch (r2Error) {
        console.error('[R2 Delete Error]', r2Error);
        // Continue with database deletion even if R2 delete fails
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Documents DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
