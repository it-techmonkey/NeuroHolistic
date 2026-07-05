import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim().replace(/^['"]|["']$/g, '');
    if (key && value && !process.env[key]) process.env[key] = value;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  const testUserId = '1f0bde27-4ee2-419f-9bc2-93598f70786e';
  
  const { error: delError } = await supabase
    .from('bookings')
    .delete()
    .eq('user_id', testUserId);

  if (delError) {
    console.error('Failed to delete bookings:', delError);
  } else {
    console.log('Successfully deleted bookings for test user!');
  }
}

run().catch(console.error);
