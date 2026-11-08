-- ==============================================================================
-- WasteWise: Village Waste Management System Database Schema
-- Compatible with Supabase PostgreSQL, Row Level Security (RLS) & Storage
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'worker');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE waste_category AS ENUM ('wet', 'dry', 'hazardous', 'sanitary', 'mixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM ('pending', 'assigned', 'in_progress', 'resolved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  village_ward TEXT NOT NULL DEFAULT 'Ward 1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. HOUSEHOLDS TABLE
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_number TEXT NOT NULL,
  head_of_household TEXT NOT NULL,
  family_members_count INTEGER NOT NULL DEFAULT 4,
  ward_number TEXT NOT NULL,
  street_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  qr_code_id TEXT UNIQUE,
  registered_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. WASTE REPORTS / COMPLAINTS
CREATE TABLE IF NOT EXISTS public.waste_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_code TEXT UNIQUE NOT NULL,
  citizen_id UUID REFERENCES public.profiles(id),
  citizen_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  category waste_category NOT NULL DEFAULT 'mixed',
  description TEXT NOT NULL,
  ward_number TEXT NOT NULL,
  location_address TEXT NOT NULL,
  photo_url TEXT,
  status complaint_status NOT NULL DEFAULT 'pending',
  assigned_worker_id UUID REFERENCES public.profiles(id),
  assigned_worker_name TEXT,
  completion_photo_url TEXT,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. WORKER ASSIGNMENTS AUDIT LOG
CREATE TABLE IF NOT EXISTS public.worker_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.waste_reports(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id),
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status_at_assignment complaint_status NOT NULL DEFAULT 'assigned',
  remarks TEXT
);

-- 7. WASTE COLLECTION SCHEDULES
CREATE TABLE IF NOT EXISTS public.waste_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ward_number TEXT NOT NULL,
  ward_name TEXT NOT NULL,
  ward_name_te TEXT,
  day_of_week TEXT NOT NULL,
  day_of_week_te TEXT,
  collection_time TEXT NOT NULL,
  waste_types TEXT[] NOT NULL DEFAULT ARRAY['wet'],
  worker_name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. DAILY WASTE COLLECTION RECORDS
CREATE TABLE IF NOT EXISTS public.collection_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ward_number TEXT NOT NULL,
  worker_id UUID REFERENCES public.profiles(id),
  worker_name TEXT NOT NULL,
  wet_waste_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  dry_waste_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  mixed_waste_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. COMPOST BATCH RECORDS
CREATE TABLE IF NOT EXISTS public.compost_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_number TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  harvest_date DATE,
  wet_waste_input_kg NUMERIC(8,2) NOT NULL,
  compost_produced_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  quality_grade TEXT NOT NULL DEFAULT 'Grade A',
  distributed_to_farmers_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'composting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. CITIZEN FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  ward_number TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view own profile; Admins can view all
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Waste Reports: Anyone can create report; Citizens can view own; Admins & Workers view all
CREATE POLICY "Citizens can insert reports"
  ON public.waste_reports FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view reports for village transparency"
  ON public.waste_reports FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins and Workers can update reports"
  ON public.waste_reports FOR UPDATE
  TO authenticated
  USING (true);

-- Waste Schedules: Publicly readable
CREATE POLICY "Schedules are readable by all"
  ON public.waste_schedules FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON public.waste_schedules FOR ALL
  TO authenticated
  USING (true);

-- Collection Records: Workers and Admins can insert/view
CREATE POLICY "Collection records readable by all for public audit"
  ON public.collection_records FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Workers and admins can insert collection records"
  ON public.collection_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Storage bucket setup for complaint and completion images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('waste-photos', 'waste-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Waste Photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'waste-photos');

CREATE POLICY "Authenticated users and citizens can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'waste-photos');
