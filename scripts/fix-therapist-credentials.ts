#!/usr/bin/env tsx
/**
 * Script to fix therapist and admin credentials
 * This script will:
 * 1. List all users in auth
 * 2. Confirm their emails
 * 3. Reset passwords if needed
 * 4. Ensure users table has correct roles
 * 
 * Run with: npx tsx scripts/fix-therapist-credentials.ts
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
  console.error('Missing environment variables. Make sure .env.local is configured.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Generate a secure random password (simpler, more readable)
function generatePassword(length: number = 16): string {
  const lowercase = 'abcdefghijkmnopqrstuvwxyz'; // removed l, similar to 1
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // removed I, O, similar to 1, 0
  const numbers = '23456789'; // removed 0, 1
  const symbols = '!@#$%&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  // Generate random password
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += allChars[bytes[i] % allChars.length];
  }
  
  // Ensure at least one of each required type
  const required = [
    lowercase[crypto.randomInt(lowercase.length)],
    uppercase[crypto.randomInt(uppercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];
  
  // Replace random positions with required characters
  let result = password;
  for (let i = 0; i < required.length; i++) {
    const pos = crypto.randomInt(length);
    result = result.substring(0, pos) + required[i] + result.substring(pos + 1);
  }
  
  return result;
}

// Generate email from name
function generateEmail(firstName: string, lastName: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFirst}.${cleanLast}@neuroholisticinstitute.com`;
}

// Therapist data
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
  status: 'success' | 'error' | 'updated';
  error?: string;
}

async function fixUser(
  firstName: string,
  lastName: string,
  role: 'therapist' | 'admin'
): Promise<CredentialResult> {
  const email = generateEmail(firstName, lastName);
  const password = generatePassword(16);
  const fullName = `${firstName} ${lastName}`;

  try {
    // First, check if user exists in auth
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const existingUser = usersList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      console.log(`  User exists: ${email} (id: ${existingUser.id})`);
      console.log(`    - Email confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`    - Created: ${existingUser.created_at}`);
      
      // Update the user's password and ensure email is confirmed
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          email_confirm: true, // Force confirm email
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
          },
        }
      );
      
      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }
      
      console.log(`    - Password updated and email confirmed`);
      
      // Update or insert in users table
      const { error: upsertError } = await supabaseAdmin.from('users').upsert({
        id: existingUser.id,
        email,
        role,
        full_name: fullName,
      }, {
        onConflict: 'id',
      });
      
      if (upsertError) {
        console.warn(`    - Warning: Could not update users table: ${upsertError.message}`);
      }
      
      return { email, password, fullName, role, status: 'updated' };
    } else {
      // User doesn't exist, create new
      console.log(`  Creating new user: ${email}`);
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
        },
      });

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned after creation');
      }

      // Create user in users table
      const { error: insertError } = await supabaseAdmin.from('users').upsert({
        id: authData.user.id,
        email,
        role,
        full_name: fullName,
      });

      if (insertError) {
        console.warn(`    - Warning: Could not create users table entry: ${insertError.message}`);
      }

      return { email, password, fullName, role, status: 'success' };
    }
  } catch (error: any) {
    console.error(`    - Error: ${error.message}`);
    return { email, password: '***', fullName, role, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('Fixing NeuroHolistic Therapist & Admin Credentials');
  console.log('='.repeat(80));
  console.log();

  const results: CredentialResult[] = [];

  // Fix therapists
  console.log('Processing therapist accounts...\n');
  for (const therapist of therapists) {
    const result = await fixUser(therapist.firstName, therapist.lastName, therapist.role);
    results.push(result);
  }

  // Fix admins
  console.log('\nProcessing admin accounts...\n');
  for (const admin of admins) {
    const result = await fixUser(admin.firstName, admin.lastName, admin.role);
    results.push(result);
  }

  // Output summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80) + '\n');

  const successful = results.filter(r => r.status === 'success');
  const updated = results.filter(r => r.status === 'updated');
  const failed = results.filter(r => r.status === 'error');

  if (successful.length > 0) {
    console.log('New accounts created:\n');
    console.log('| Full Name | Email | Password | Role |');
    console.log('|-----------|-------|----------|------|');
    
    for (const cred of successful) {
      console.log(`| ${cred.fullName} | ${cred.email} | ${cred.password} | ${cred.role} |`);
    }
  }

  if (updated.length > 0) {
    console.log('\nExisting accounts updated:\n');
    console.log('| Full Name | Email | Password | Role |');
    console.log('|-----------|-------|----------|------|');
    
    for (const cred of updated) {
      console.log(`| ${cred.fullName} | ${cred.email} | ${cred.password} | ${cred.role} |`);
    }
  }

  if (failed.length > 0) {
    console.log('\nFailed accounts:\n');
    for (const cred of failed) {
      console.log(`- ${cred.fullName}: ${cred.error}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`New: ${successful.length}, Updated: ${updated.length}, Failed: ${failed.length}`);
  console.log('='.repeat(80));

  // Write credentials to file
  const allSuccessful = [...successful, ...updated];
  if (allSuccessful.length > 0) {
    const outputPath = './THERAPIST_CREDENTIALS.md';
    
    let content = `# NeuroHolistic Therapist & Admin Credentials\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Therapist Accounts\n\n`;
    content += `| Full Name | Email | Password | Role |\n`;
    content += `|-----------|-------|----------|------|\n`;
    
    for (const cred of allSuccessful.filter(c => c.role === 'therapist')) {
      content += `| ${cred.fullName} | ${cred.email} | ${cred.password} | ${cred.role} |\n`;
    }
    
    content += `\n## Admin Accounts\n\n`;
    content += `| Full Name | Email | Password | Role |\n`;
    content += `|-----------|-------|----------|------|\n`;
    
    for (const cred of allSuccessful.filter(c => c.role === 'admin')) {
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
    console.log(`\nCredentials saved to: ${outputPath}`);
  }
}

main().catch(console.error);
