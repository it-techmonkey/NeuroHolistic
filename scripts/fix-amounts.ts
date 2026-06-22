/**
 * Fix payments and programs with inflated amounts (were stored as fils instead of AED).
 * Run: npx tsx scripts/fix-amounts.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('--- Fix Inflated Amounts ---\n');

  // Fix payments where amount looks like it was multiplied by 100
  // Valid AED amounts for programs: 7700, 9000, 4500, 25000
  // Valid AED amounts for sessions: 800, 500, 1000
  // If amount > 10000 it's likely inflated
  const { data: payments, error: pErr } = await supabase
    .from('payments')
    .select('*')
    .gt('amount', 10000);

  if (pErr) {
    console.error('Failed to fetch payments:', pErr.message);
    process.exit(1);
  }

  console.log(`Found ${(payments ?? []).length} payments with inflated amounts:`);
  for (const p of (payments ?? [])) {
    const correctAmount = Math.round(p.amount / 100);
    console.log(`  Payment ${p.id}: ${p.amount} -> ${correctAmount} AED (${p.payment_reference})`);
    const { error: upErr } = await supabase
      .from('payments')
      .update({ amount: correctAmount })
      .eq('id', p.id);
    if (upErr) {
      console.error(`  Failed to update payment ${p.id}:`, upErr.message);
    }
  }

  // Fix programs where price_paid looks inflated
  const { data: programs, error: prErr } = await supabase
    .from('programs')
    .select('*')
    .gt('price_paid', 10000);

  if (prErr) {
    console.error('Failed to fetch programs:', prErr.message);
    process.exit(1);
  }

  console.log(`\nFound ${(programs ?? []).length} programs with inflated price_paid:`);
  for (const p of (programs ?? [])) {
    const correctPrice = Math.round(p.price_paid / 100);
    console.log(`  Program ${p.id}: ${p.price_paid} -> ${correctPrice} AED`);
    const { error: upErr } = await supabase
      .from('programs')
      .update({ price_paid: correctPrice })
      .eq('id', p.id);
    if (upErr) {
      console.error(`  Failed to update program ${p.id}:`, upErr.message);
    }
  }

  console.log('\nDone.');
}

main();
