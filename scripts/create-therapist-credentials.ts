#!/usr/bin/env tsx
/**
 * Script to create credentials for therapists and admins
 * Run with: npx tsx scripts/create-therapist-credentials.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables. Make sure .env.local is configured.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Generate a secure random password
function generatePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  const password = Array.from(crypto.randomBytes(length), (byte) => allChars[byte % allChars.length]).join('');
  
  // Ensure at least one of each type
  const ensureChars = [
    lowercase[crypto.randomInt(lowercase.length)],
    uppercase[crypto.randomInt(uppercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];
  
  // Replace first 4 chars with guaranteed character types
  let result = password;
  for (let i = 0; i < ensureChars.length; i++) {
    const pos = crypto.randomInt(result.length);
    result = result.substring(0, pos) + ensureChars[i] + result.substring(pos + 1);
  }
  
  return result;
}

// Generate email from name
function generateEmail(firstName: string, lastName: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFirst}.${cleanLast}@neuroholisticinstitute.com`;
}

// Therapist data from team profiles
const therapists = [
  { firstName: 'Fawzia', lastName: 'Yassmina', role: 'therapist' as const },
  { firstName: 'Mariam', lastName: 'Al Kaisi', role: 'therapist' as const },
  { firstName: 'Noura', lastName: 'Youssef', role: 'therapist' as const },
  { firstName: 'Zekra', lastName: 'Khayata', role: 'therapist' as const },
  { firstName: 'Reem', lastName: 'Mobayed', role: 'therapist' as const },
  { firstName: 'Fawares', lastName: 'Azaar', role: 'therapist' as const },
  { firstName: 'Joud', lastName: 'Charafeddin', role: 'therapist' as const },
];

// Admin data
const admins = [
  { firstName: 'Admin', lastName: 'User', role: 'admin' as const },
];

interface CredentialResult {
  email: string;
  password: string;
  fullName: string;
  role: string;
  status: 'success' | 'error';
  error?: string;
}

async function createUser(
  firstName: string,
  lastName: string,
  role: 'therapist' | 'admin'
): Promise<CredentialResult> {
  const email = generateEmail(firstName, lastName);
  const password = generatePassword(16);
  const fullName = `${firstName} ${lastName}`;

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm therapists and admins
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) {
      if (authError.message?.includes('already') || authError.message?.includes('duplicate')) {
        return { email, password: '***', fullName, role, status: 'error', error: 'Email already exists' };
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user');
    }

    // Create user profile in users table
    // First check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin.from('users').insert({
        id: authData.user.id,
        email,
        role,
        full_name: fullName,
      });

      if (profileError) {
        console.warn(`⚠️  Auth user created but profile insert failed for ${fullName}:`, profileError.message);
      }
    }

    return { email, password, fullName, role, status: 'success' };
  } catch (error: any) {
    return { email, password: '***', fullName, role, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('🚀 Creating credentials for NeuroHolistic team...\n');

  const results: CredentialResult[] = [];

  // Create therapists
  console.log('👨‍⚕️ Creating therapist accounts...\n');
  for (const therapist of therapists) {
    const result = await createUser(therapist.firstName, therapist.lastName, therapist.role);
    results.push(result);
    
    if (result.status === 'success') {
      console.log(`✅ ${result.fullName} (${result.role})`);
    } else {
      console.log(`❌ ${result.fullName} - ${result.error}`);
    }
  }

  // Create admins
  console.log('\n🔐 Creating admin accounts...\n');
  for (const admin of admins) {
    const result = await createUser(admin.firstName, admin.lastName, admin.role);
    results.push(result);
    
    if (result.status === 'success') {
      console.log(`✅ ${result.fullName} (${result.role})`);
    } else {
      console.log(`❌ ${result.fullName} - ${result.error}`);
    }
  }

  // Output credentials summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 CREDENTIALS SUMMARY');
  console.log('='.repeat(80) + '\n');

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');

  if (successful.length > 0) {
    console.log('✅ Successfully created accounts:\n');
    console.log('| Full Name | Email | Password | Role |');
    console.log('|-----------|-------|----------|------|');
    
    for (const cred of successful) {
      console.log(`| ${cred.fullName} | ${cred.email} | ${cred.password} | ${cred.role} |`);
    }
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed accounts:\n');
    for (const cred of failed) {
      console.log(`- ${cred.fullName}: ${cred.error}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Summary: ${successful.length} created, ${failed.length} failed\n`);

  // Write credentials to file for easy handover
  if (successful.length > 0) {
    const fs = await import('fs');
    const outputPath = './THERAPIST_CREDENTIALS.md';
    
    let content = `# NeuroHolistic Therapist & Admin Credentials\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Therapist Accounts\n\n`;
    content += `| Full Name | Email | Password | Role |\n`;
    content += `|-----------|-------|----------|------|\n`;
    
    for (const cred of successful.filter(c => c.role === 'therapist')) {
      content += `| ${cred.fullName} | ${cred.email} | ${cred.password} | ${cred.role} |\n`;
    }
    
    content += `\n## Admin Accounts\n\n`;
    content += `| Full Name | Email | Password | Role |\n`;
    content += `|-----------|-------|----------|------|\n`;
    
    for (const cred of successful.filter(c => c.role === 'admin')) {
      content += `| ${cred.fullName} | ${cred.email} | ${cred.password} | ${cred.role} |\n`;
    }
    
    content += `\n## Login URL\n\n`;
    content += `- Development: http://localhost:3000/auth/login\n`;
    content += `- Production: https://neuroholisticinstitute.com/auth/login\n\n`;
    content += `## Notes\n\n`;
    content += `- These credentials are for therapist and admin accounts only\n`;
    content += `- Therapists can upload notes, videos, and PDFs for their clients\n`;
    content += `- Admins have full access to all features\n`;
    content += `- Passwords are auto-generated and secure\n`;
    
    fs.writeFileSync(outputPath, content);
    console.log(`📄 Credentials saved to: ${outputPath}`);
  }
}

main().catch(console.error);