-- ==============================================================================
-- WasteWise: Demo Roles & Confirmation Setup (Safe SQL)
-- Run this in your Supabase Project -> SQL Editor
-- This ensures all demo users are confirmed and roles are assigned in public.profiles
-- ==============================================================================

-- 1. Ensure all users are confirmed (bypasses email verification for demo)
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. Configure roles and details in public.profiles
UPDATE public.profiles
SET role = 'worker',
    full_name = 'Mallesh (Sanitation Worker)',
    village_ward = 'Ward 1 & 2',
    phone_number = '9848099887'
WHERE email = 'worker@gramapanchayat.in';

UPDATE public.profiles
SET role = 'admin',
    full_name = 'Dr. V. Prasad (Panchayat Secretary)',
    village_ward = 'Central Panchayat Office',
    phone_number = '9848011220'
WHERE email = 'admin@gramapanchayat.in';

UPDATE public.profiles
SET role = 'citizen',
    full_name = 'Ramesh Reddy',
    village_ward = 'Ward 1',
    phone_number = '9848022331'
WHERE email = 'citizen@gramapanchayat.in';
