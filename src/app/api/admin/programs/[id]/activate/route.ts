import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: programId } = await params;
    const supabase = getServiceSupabase();

    const { data: program, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (fetchError || !program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('programs')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', programId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error activating program:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
