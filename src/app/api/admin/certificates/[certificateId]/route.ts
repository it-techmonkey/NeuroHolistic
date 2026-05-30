import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import getR2Client, { R2_BUCKET_NAME } from '@/lib/r2/client';

async function requireAdmin() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: userData } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return {};
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const { certificateId } = await params;
    const body = await request.json();
    const status = body.status === 'revoked' ? 'revoked' : 'active';

    const supabase = getServiceSupabase();
    const { data: certificate, error } = await supabase
      .from('certificates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', certificateId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error('[Admin Certificates PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const { certificateId } = await params;
    const supabase = getServiceSupabase();

    const { data: certificate, error: fetchError } = await supabase
      .from('certificates')
      .select('id, file_key')
      .eq('id', certificateId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (certificate.file_key) {
      try {
        await getR2Client().send(new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: certificate.file_key,
        }));
      } catch (r2Error) {
        console.error('[Certificate R2 Delete Error]', r2Error);
      }
    }

    const { error: deleteError } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certificateId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Certificates DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
