-- ==============================================================================
-- WasteWise: Village Waste Management System Database Schema & Security
-- Simple, Stable, Maintainable Supabase PostgreSQL Schema (7 Core Tables)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'worker', 'admin');
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
  registered_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. WASTE REPORTS / COMPLAINTS
CREATE TABLE IF NOT EXISTS public.waste_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_code TEXT UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- 6. WASTE COLLECTION SCHEDULES
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

-- 7. DAILY WASTE COLLECTION RECORDS
CREATE TABLE IF NOT EXISTS public.collection_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ward_number TEXT NOT NULL,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  wet_waste_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  dry_waste_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  mixed_waste_kg NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. COMPOST BATCH RECORDS
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

-- 9. CITIZEN FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  citizen_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  ward_number TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- COLUMN CHECKS FOR SAFE MIGRATION
-- ==============================================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'registered_by'
  ) THEN
    ALTER TABLE public.households ADD COLUMN registered_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'feedback' AND column_name = 'citizen_id'
  ) THEN
    ALTER TABLE public.feedback ADD COLUMN citizen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Clean index creation
CREATE INDEX IF NOT EXISTS idx_waste_reports_citizen ON public.waste_reports(citizen_id);
CREATE INDEX IF NOT EXISTS idx_waste_reports_worker ON public.waste_reports(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_waste_reports_status ON public.waste_reports(status);
CREATE INDEX IF NOT EXISTS idx_feedback_citizen ON public.feedback(citizen_id);

-- ==============================================================================
-- SIMPLE HELPER FUNCTION (PREVENTS RLS RECURSION)
-- ==============================================================================

-- Reads the current authenticated user's role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Automatic profile sync trigger from Supabase Auth
-- Forces new signups to 'citizen' role; admin promotes via SQL Editor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, village_ward, phone_number)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'citizen', -- Always citizen by default
    COALESCE(new.raw_user_meta_data->>'village_ward', 'Ward 1'),
    COALESCE(new.raw_user_meta_data->>'phone_number', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.get_user_role() IN ('worker', 'admin'));

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.get_user_role() = 'admin')
  WITH CHECK (
    (auth.uid() = id) OR
    public.get_user_role() = 'admin'
  );

-- ------------------------------------------------------------------------------
-- 2. HOUSEHOLDS POLICIES
-- Only admins can create, update, or delete household records.
-- Citizens view their own enrolled household; workers and admins view all.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "households_select_policy" ON public.households;
CREATE POLICY "households_select_policy" ON public.households
  FOR SELECT TO authenticated
  USING (registered_by = auth.uid() OR public.get_user_role() IN ('worker', 'admin'));

DROP POLICY IF EXISTS "households_insert_policy" ON public.households;
DROP POLICY IF EXISTS "households_manage_policy" ON public.households;
DROP POLICY IF EXISTS "households_admin_manage_policy" ON public.households;
CREATE POLICY "households_admin_manage_policy" ON public.households
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 3. WASTE REPORTS / COMPLAINTS POLICIES
-- Citizens view own, Workers view assigned, Admins view all.
-- Citizens can insert own, Workers can report violations, Admins can insert.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "reports_select_policy" ON public.waste_reports;
CREATE POLICY "reports_select_policy" ON public.waste_reports
  FOR SELECT TO authenticated
  USING (
    citizen_id = auth.uid() OR
    assigned_worker_id = auth.uid() OR
    public.get_user_role() IN ('worker', 'admin')
  );

DROP POLICY IF EXISTS "reports_insert_policy" ON public.waste_reports;
CREATE POLICY "reports_insert_policy" ON public.waste_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    citizen_id = auth.uid() OR
    public.get_user_role() IN ('worker', 'admin')
  );

-- Simple, reliable update policy: Admin manages all; workers update assigned tasks; citizens update own
DROP POLICY IF EXISTS "reports_update_policy" ON public.waste_reports;
DROP POLICY IF EXISTS "reports_admin_update_policy" ON public.waste_reports;
DROP POLICY IF EXISTS "reports_worker_update_policy" ON public.waste_reports;
DROP POLICY IF EXISTS "reports_citizen_cancel_policy" ON public.waste_reports;

CREATE POLICY "reports_update_policy" ON public.waste_reports
  FOR UPDATE TO authenticated
  USING (
    public.get_user_role() IN ('worker', 'admin') OR
    citizen_id = auth.uid()
  )
  WITH CHECK (
    public.get_user_role() IN ('worker', 'admin') OR
    citizen_id = auth.uid()
  );

-- Admins can delete complaints
DROP POLICY IF EXISTS "reports_delete_policy" ON public.waste_reports;
CREATE POLICY "reports_delete_policy" ON public.waste_reports
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Remove complex trigger if it exists
DROP TRIGGER IF EXISTS trg_validate_waste_report_update ON public.waste_reports;
DROP FUNCTION IF EXISTS public.validate_waste_report_update();

-- ------------------------------------------------------------------------------
-- 4. WASTE SCHEDULES POLICIES
-- Public village knowledge for all citizens and workers
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "schedules_select_policy" ON public.waste_schedules;
CREATE POLICY "schedules_select_policy" ON public.waste_schedules
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "schedules_manage_policy" ON public.waste_schedules;
CREATE POLICY "schedules_manage_policy" ON public.waste_schedules
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 5. DAILY COLLECTION RECORDS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "collections_select_policy" ON public.collection_records;
CREATE POLICY "collections_select_policy" ON public.collection_records
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "collections_insert_policy" ON public.collection_records;
CREATE POLICY "collections_insert_policy" ON public.collection_records
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('worker', 'admin'));

DROP POLICY IF EXISTS "collections_manage_policy" ON public.collection_records;
CREATE POLICY "collections_manage_policy" ON public.collection_records
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 6. COMPOST BATCH RECORDS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "compost_select_policy" ON public.compost_records;
CREATE POLICY "compost_select_policy" ON public.compost_records
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "compost_manage_policy" ON public.compost_records;
CREATE POLICY "compost_manage_policy" ON public.compost_records
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 7. CITIZEN FEEDBACK POLICIES
-- Only citizens can submit feedback and citizen_id must strictly match auth.uid()
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "feedback_select_policy" ON public.feedback;
CREATE POLICY "feedback_select_policy" ON public.feedback
  FOR SELECT TO authenticated
  USING (citizen_id = auth.uid() OR public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "feedback_insert_policy" ON public.feedback;
CREATE POLICY "feedback_insert_policy" ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    citizen_id = auth.uid() AND
    public.get_user_role() = 'citizen'
  );

DROP POLICY IF EXISTS "feedback_delete_policy" ON public.feedback;
CREATE POLICY "feedback_delete_policy" ON public.feedback
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ==============================================================================
-- STORAGE: ONE PRIVATE BUCKET FOR WASTE PHOTOS
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'waste-photos',
  'waste-photos',
  false,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[];

-- Thoroughly drop all legacy and permissive storage policies to eliminate any bypass
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to Waste Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to Photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow all users to read waste-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to read waste-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to waste-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users and citizens can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload own waste photos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized users can view waste photos" ON storage.objects;
DROP POLICY IF EXISTS "Owner or admin can delete waste photos" ON storage.objects;
DROP POLICY IF EXISTS "storage_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "waste_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "waste_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "waste_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "waste_photos_delete" ON storage.objects;

-- Storage Policy 1: Authenticated users upload photos strictly into their own folder
CREATE POLICY "storage_upload_policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'waste-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Policy 2: Restrict photo reading to the photo owner, assigned worker, and admin
CREATE POLICY "storage_select_policy" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'waste-photos' AND (
      public.get_user_role() = 'admin' OR
      (storage.foldername(name))[1] = auth.uid()::text OR
      (
        public.get_user_role() = 'worker' AND EXISTS (
          SELECT 1 FROM public.waste_reports wr
          WHERE wr.assigned_worker_id = auth.uid()
            AND (
              wr.photo_url = name OR
              wr.completion_photo_url = name OR
              wr.photo_url LIKE ('%' || name) OR
              wr.completion_photo_url LIKE ('%' || name)
            )
        )
      )
    )
  );

-- Storage Policy 3: Only the photo owner or an Admin can delete photos
CREATE POLICY "storage_delete_policy" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'waste-photos' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      public.get_user_role() = 'admin'
    )
  );
