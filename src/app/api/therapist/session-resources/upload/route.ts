import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';

const THERAPIST_RESOURCES_BUCKET =
  process.env.SUPABASE_THERAPIST_RESOURCES_BUCKET || 'therapist-session-resources';

const MAX_UPLOAD_SIZE = {
  pdf: 15 * 1024 * 1024,
  video: 100 * 1024 * 1024,
} as const;

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-');
}

async function ensureBucketExists(supabase: ReturnType<typeof getServiceSupabase>) {
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    throw new Error(bucketsError.message);
  }

  const bucketExists = (buckets ?? []).some((bucket) => bucket.name === THERAPIST_RESOURCES_BUCKET);
  if (bucketExists) {
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(THERAPIST_RESOURCES_BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_UPLOAD_SIZE.video}`,
  });

  if (createBucketError && !createBucketError.message.toLowerCase().includes('already exists')) {
    throw new Error(createBucketError.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: roleData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (roleData?.role !== 'therapist' && roleData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const bookingId = formData.get('bookingId');
    const kind = formData.get('kind');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
    }

    if (typeof bookingId !== 'string' || !bookingId) {
      return NextResponse.json({ error: 'bookingId is required.' }, { status: 400 });
    }

    if (kind !== 'pdf' && kind !== 'video') {
      return NextResponse.json({ error: 'Invalid resource kind.' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE[kind]) {
      return NextResponse.json(
        {
          error:
            kind === 'pdf'
              ? 'PDF files must be 15MB or smaller.'
              : 'Video files must be 100MB or smaller.',
        },
        { status: 400 }
      );
    }

    const normalizedType = file.type.toLowerCase();
    const isPdf = kind === 'pdf' && normalizedType === 'application/pdf';
    const isVideo = kind === 'video' && normalizedType.startsWith('video/');

    if (!isPdf && !isVideo) {
      return NextResponse.json(
        {
          error: kind === 'pdf' ? 'Only PDF documents are allowed.' : 'Only video files are allowed.',
        },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id,therapist_user_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (roleData?.role === 'therapist' && booking.therapist_user_id !== user.id) {
      return NextResponse.json({ error: 'This booking is not assigned to you.' }, { status: 403 });
    }

    await ensureBucketExists(supabase);

    const fileExt = file.name.includes('.') ? file.name.split('.').pop() : kind === 'pdf' ? 'pdf' : 'mp4';
    const safeName = sanitizeFilename(file.name.replace(/\.[^.]+$/, ''));
    const path = `${bookingId}/${kind}/${Date.now()}-${crypto.randomUUID()}-${safeName}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(THERAPIST_RESOURCES_BUCKET)
      .upload(path, fileBuffer, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(THERAPIST_RESOURCES_BUCKET).getPublicUrl(path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path,
      bucket: THERAPIST_RESOURCES_BUCKET,
      fileName: file.name,
      kind,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
