import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

const SESSION_MATERIALS_BUCKET = 'session-materials';
const MAX_UPLOAD_SIZE = {
  pdf: 20 * 1024 * 1024,   // 20MB
  video: 500 * 1024 * 1024, // 500MB
} as const;

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'therapist' && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const type = formData.get('type') as string | null; // 'pdf' or 'video'

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (type !== 'pdf' && type !== 'video') {
      return NextResponse.json({ error: 'type must be pdf or video' }, { status: 400 });
    }

    // Validate file type
    const normalizedType = file.type.toLowerCase();
    if (type === 'pdf' && normalizedType !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }
    if (type === 'video' && !normalizedType.startsWith('video/')) {
      return NextResponse.json({ error: 'Only video files are allowed' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_UPLOAD_SIZE[type as keyof typeof MAX_UPLOAD_SIZE]) {
      return NextResponse.json(
        { error: type === 'pdf' ? 'PDF must be under 20MB' : 'Video must be under 500MB' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, therapist_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = (buckets ?? []).some(b => b.name === SESSION_MATERIALS_BUCKET);
    if (!bucketExists) {
      await supabase.storage.createBucket(SESSION_MATERIALS_BUCKET, { public: true });
    }

    // Upload file
    const fileExt = file.name.includes('.') ? file.name.split('.').pop() : type === 'pdf' ? 'pdf' : 'mp4';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '');
    const path = `${sessionId}/${type}/${Date.now()}-${safeName}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(SESSION_MATERIALS_BUCKET)
      .upload(path, fileBuffer, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(SESSION_MATERIALS_BUCKET)
      .getPublicUrl(path);

    // Create session_materials record
    const { data: material, error: insertError } = await supabase
      .from('session_materials')
      .insert({
        session_id: sessionId,
        type: type as 'pdf' | 'video',
        url: publicUrl,
        filename: file.name,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded file
      await supabase.storage.from(SESSION_MATERIALS_BUCKET).remove([path]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, material });
  } catch (error) {
    console.error('[Session Material Upload]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
