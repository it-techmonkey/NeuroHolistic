import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

function isValidEmail(email: string) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, mobile, email, country } = body;

    // Validate
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!mobile?.trim()) return NextResponse.json({ error: 'Mobile is required' }, { status: 400 });
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Insert lead - leads table uses 'phone' not 'mobile', and has no 'country' column
    // Store country in notes instead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: name.trim(),
        phone: mobile.trim(),
        email: email.trim().toLowerCase(),
        source: 'free_consultation',
        notes: country?.trim() ? `Country: ${country.trim()}` : null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[ConsultationLead] DB error:', error);
      return NextResponse.json(
        { error: 'Failed to save your details. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, leadId: data.id });
  } catch (err) {
    console.error('[ConsultationLead] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
