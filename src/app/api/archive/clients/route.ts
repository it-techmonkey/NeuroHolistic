import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get('therapistId');
    const archivedClientId = searchParams.get('id');

    const supabase = getServiceSupabase();

    if (archivedClientId) {
      const { data, error } = await supabase
        .from('archived_clients')
        .select('*')
        .eq('id', archivedClientId)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ client: data });
    }

    let query = supabase
      .from('archived_clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (therapistId) {
      query = query.eq('created_by', therapistId);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ clients: data || [] });
  } catch (error) {
    console.error('[Archive Clients GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { therapistId, full_name, email, phone, country, date_of_birth, occupation, relationship_status, notes } = body;

    if (!therapistId || !full_name) {
      return NextResponse.json({ error: 'therapistId and full_name are required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('archived_clients')
      .insert({
        full_name,
        email: email || null,
        phone: phone || null,
        country: country || null,
        date_of_birth: date_of_birth || null,
        occupation: occupation || null,
        relationship_status: relationship_status || null,
        notes: notes || null,
        created_by: therapistId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, client: data });
  } catch (error) {
    console.error('[Archive Clients POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, full_name, email, phone, country, date_of_birth, occupation, relationship_status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('archived_clients')
      .update({
        full_name,
        email: email || null,
        phone: phone || null,
        country: country || null,
        date_of_birth: date_of_birth || null,
        occupation: occupation || null,
        relationship_status: relationship_status || null,
        notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, client: data });
  } catch (error) {
    console.error('[Archive Clients PUT] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('archived_clients')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Archive Clients DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
