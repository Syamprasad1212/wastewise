// ==============================================================================
// WasteWise: Provision Demo Accounts using official Supabase Auth SDK
// Run: node scripts/seed-demo-users.js
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseAnonKey = '';

envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  const k = key.trim();
  const v = vals.join('=').trim();
  if (k === 'VITE_SUPABASE_URL') supabaseUrl = v;
  if (k === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = v;
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEMO_USERS = [
  {
    email: 'citizen@gramapanchayat.in',
    password: 'Demo@123',
    name: 'Ramesh Reddy',
    phone: '9848022331',
    ward: 'Ward 1',
    role: 'citizen'
  },
  {
    email: 'worker@gramapanchayat.in',
    password: 'Demo@123',
    name: 'Mallesh (Sanitation Worker)',
    phone: '9848099887',
    ward: 'Ward 1 & 2',
    role: 'worker'
  },
  {
    email: 'admin@gramapanchayat.in',
    password: 'Demo@123',
    name: 'Dr. V. Prasad (Panchayat Secretary)',
    phone: '9848011220',
    ward: 'Central Panchayat Office',
    role: 'admin'
  }
];

async function seed() {
  console.log('--- WasteWise Demo Account Provisioning ---');
  console.log('Connecting to:', supabaseUrl);

  for (const user of DEMO_USERS) {
    console.log(`\nProvisioning ${user.role}: ${user.email}...`);

    // 1. Try Signing In first (in case account already exists)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (!signInError && signInData.user) {
      console.log(`✓ Account already active: ${user.email} (ID: ${signInData.user.id})`);
      continue;
    }

    // 2. Sign up via official Supabase Auth SDK
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.name,
          phone_number: user.phone,
          village_ward: user.ward
        }
      }
    });

    if (signUpError) {
      console.warn(`! SignUp Notice for ${user.email}: ${signUpError.message}`);
    } else if (signUpData.user) {
      console.log(`✓ Created via Supabase Auth: ${user.email} (ID: ${signUpData.user.id})`);
    }
  }

  console.log('\n--- Setup Instructions for Roles & Confirmation ---');
  console.log('In your Supabase SQL Editor, run this 2-line query to set roles:');
  console.log("UPDATE public.profiles SET role = 'worker' WHERE email = 'worker@gramapanchayat.in';");
  console.log("UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@gramapanchayat.in';");
  console.log('UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;');
}

seed();
