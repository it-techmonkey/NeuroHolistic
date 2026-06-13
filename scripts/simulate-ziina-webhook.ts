#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split(/\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase service credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const intentId = `TEST_INTENT_${Date.now()}`;
  const amountFils = 100000; // AED 1000.00
  const amountAed = amountFils / 100;

  // Reuse an existing user from the `users` table to satisfy foreign keys
  const { data: existingUser, error: existingUserError } = await supabase.from('users').select('id,email').limit(1).maybeSingle();
  if (existingUserError) {
    console.error('Failed to query users table:', existingUserError);
    process.exit(1);
  }

  if (!existingUser) {
    console.error('No existing user found in `users` table. Please create a test user in the app before running this script.');
    process.exit(1);
  }

  const userId = existingUser.id;
  console.log('Using existing user', existingUser.email, 'id=', userId);
  console.log('Inserting test payment with payment_reference =', intentId, 'user_id =', userId);
  const { data: payment, error } = await supabase.from('payments').insert({
    user_id: null,
    amount: amountAed,
    currency: 'AED',
    type: 'full_program',
    status: 'pending',
    payment_reference: intentId,
    program_id: null,
      metadata: {
      gateway: 'ziina',
      userId: userId,
      amountFils,
      amountAed,
      currency: 'AED',
      clientName: 'Webhook Test',
      clientEmail: 'webhook-test@local.test',
      totalSessions: 10,
      storedProgramType: 'private',
    },
  }).select().single();

  if (error) {
    console.error('Failed to insert payment:', error);
    process.exit(1);
  }

  console.log('Inserted payment id:', payment.id);

  const payload = {
    event: 'payment_intent.status.updated',
    data: {
      id: intentId,
      status: 'completed',
      amount: amountFils,
      currency_code: 'AED',
    },
  };

  console.log('Calling local webhook endpoint /api/ziina/webhook');

  const raw = JSON.stringify(payload);
  const secret = process.env.ZIINA_WEBHOOK_SECRET || '';
  const crypto = await import('crypto');
  const signature = crypto.createHmac('sha256', secret).update(raw).digest('hex');

  const res = await fetch('http://localhost:3000/api/ziina/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hmac-signature': signature },
    body: raw,
  });

  const text = await res.text();
  console.log('Webhook response status:', res.status);
  console.log('Webhook response body:', text);

  console.log('\nCheck the admin dashboard: pending payments should be processed/created.');
}

main().catch((err) => {
  console.error('Error simulating webhook:', err);
  process.exit(1);
});
