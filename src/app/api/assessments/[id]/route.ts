import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getUserRole } from '@/lib/roles';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createServiceClient(supabaseUrl, supabaseKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('[Assessment API] GET /api/assessments/:id -', id);

  try {
    // Require authentication
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing assessment ID' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
      }
      console.error('[Assessment API] Database error:', error.message);
      return NextResponse.json({ success: false, error: 'Failed to fetch assessment' }, { status: 500 });
    }

    // Ownership check: clients can only read their own; therapists can read any
    if (data.user_id !== user.id) {
      const role = await getUserRole(user.id);
      if (role !== 'therapist') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    console.log('[Assessment API] Assessment retrieved:', data?.id);

    return NextResponse.json({ success: true, assessment: data });
  } catch (err: any) {
    console.error('[Assessment API] Unhandled error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + err.message },
      { status: 500 }
    );
  }
}
