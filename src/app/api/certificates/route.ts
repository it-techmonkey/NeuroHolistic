import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('id, certificate_number, title, recipient_name, recipient_email, issued_at, file_name, qr_token, status, created_at')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ certificates: certificates ?? [] });
  } catch (error) {
    console.error('[Certificates GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
