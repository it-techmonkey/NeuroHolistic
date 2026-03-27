import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';

// POST - Confirm upload and save document metadata
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
      file_key, 
      file_url, 
      file_name, 
      description,
      file_size 
    } = body;

    if (!client_id || !file_key || !file_url || !type || !file_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Save document metadata to database
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        client_id,
        session_id: session_id || null,
        therapist_id: user.id,
        type,
        file_url,
        file_key, // Store the R2 key for future reference
        file_name,
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
    console.error('[Upload Completion]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
