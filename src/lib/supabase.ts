import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_HOUSEHOLDS,
  INITIAL_SCHEDULES,
  INITIAL_REPORTS,
  INITIAL_COLLECTIONS,
  INITIAL_COMPOST,
  INITIAL_FEEDBACK
} from '../data/mockData';
import {
  Household,
  WasteReport,
  WasteSchedule,
  CollectionRecord,
  CompostRecord,
  CitizenFeedback,
  UserProfile,
  UserRole,
  ComplaintStatus
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Production mode is active ONLY when valid, non-placeholder credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Built-in evaluation test profiles (used strictly in Demo Mode)
export const SEED_PROFILES: (UserProfile & { passwordHash: string })[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'citizen@gramapanchayat.in',
    full_name: 'Ramesh Reddy',
    role: 'citizen',
    phone_number: '9848022331',
    village_ward: 'Ward 1',
    created_at: '2026-01-01T00:00:00Z',
    passwordHash: 'Demo@123'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'worker@gramapanchayat.in',
    full_name: 'Mallesh (Sanitation Worker)',
    role: 'worker',
    phone_number: '9848099887',
    village_ward: 'Ward 1 & 2',
    created_at: '2026-01-01T00:00:00Z',
    passwordHash: 'Demo@123'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'admin@gramapanchayat.in',
    full_name: 'Dr. V. Prasad (Panchayat Secretary)',
    role: 'admin',
    phone_number: '9848011220',
    village_ward: 'Central Panchayat Office',
    created_at: '2026-01-01T00:00:00Z',
    passwordHash: 'Demo@123'
  }
];

// ==============================================================================
// Village Data Service
// Strict separation: Production executes against Supabase; Demo mode uses localStorage.
// Production errors are never silently masked or fallen back to demo storage.
// ==============================================================================

class VillageDataService {
  // Demo storage keys are prefixed with 'wastewise_demo_' to prevent collision
  private demoProfilesKey = 'wastewise_demo_profiles';
  private demoReportsKey = 'wastewise_demo_reports';
  private demoHouseholdsKey = 'wastewise_demo_households';
  private demoSchedulesKey = 'wastewise_demo_schedules';
  private demoCollectionsKey = 'wastewise_demo_collections';
  private demoCompostKey = 'wastewise_demo_compost';
  private demoFeedbackKey = 'wastewise_demo_feedback';

  constructor() {
    if (!isSupabaseConfigured) {
      this.initDemoLocalStorage();
    }
  }

  private initDemoLocalStorage() {
    if (!localStorage.getItem(this.demoProfilesKey)) {
      localStorage.setItem(this.demoProfilesKey, JSON.stringify(SEED_PROFILES));
    }
    if (!localStorage.getItem(this.demoReportsKey)) {
      localStorage.setItem(this.demoReportsKey, JSON.stringify(INITIAL_REPORTS));
    }
    if (!localStorage.getItem(this.demoHouseholdsKey)) {
      localStorage.setItem(this.demoHouseholdsKey, JSON.stringify(INITIAL_HOUSEHOLDS));
    }
    if (!localStorage.getItem(this.demoSchedulesKey)) {
      localStorage.setItem(this.demoSchedulesKey, JSON.stringify(INITIAL_SCHEDULES));
    }
    if (!localStorage.getItem(this.demoCollectionsKey)) {
      localStorage.setItem(this.demoCollectionsKey, JSON.stringify(INITIAL_COLLECTIONS));
    }
    if (!localStorage.getItem(this.demoCompostKey)) {
      localStorage.setItem(this.demoCompostKey, JSON.stringify(INITIAL_COMPOST));
    }
    if (!localStorage.getItem(this.demoFeedbackKey)) {
      localStorage.setItem(this.demoFeedbackKey, JSON.stringify(INITIAL_FEEDBACK));
    }
  }

  // --- Storage Helper for Waste Photos ---
  // Stores permanent Supabase Storage object paths in the database instead of short-lived signed URLs.
  async uploadWastePhoto(file: File, userId: string): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5 MB.');
      }

      // Upload into user-scoped folder to satisfy RLS ownership policy: auth.uid()/filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('waste-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload photo to secure storage: ${uploadError.message}`);
      }

      // Return the permanent object path to be saved in the database
      return filePath;
    }

    // Demo Mode: convert to Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Generates fresh signed URLs on demand for private Supabase Storage paths
  async getPhotoUrl(pathOrUrl: string | undefined | null): Promise<string> {
    if (!pathOrUrl) return '';

    // If already an external HTTP/HTTPS URL or Data URL, return directly
    if (
      pathOrUrl.startsWith('http://') ||
      pathOrUrl.startsWith('https://') ||
      pathOrUrl.startsWith('data:')
    ) {
      return pathOrUrl;
    }

    if (isSupabaseConfigured && supabase) {
      const cleanPath = pathOrUrl.replace(/^waste-photos\//, '');
      const { data, error } = await supabase.storage
        .from('waste-photos')
        .createSignedUrl(cleanPath, 3600); // 1-hour fresh signed URL

      if (error || !data?.signedUrl) {
        console.warn(`Could not create signed URL for path "${cleanPath}":`, error?.message);
        return pathOrUrl;
      }
      return data.signedUrl;
    }

    return pathOrUrl;
  }

  // --- Profiles & Authentication ---
  async getProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        throw new Error(`Database error fetching profiles: ${error.message}`);
      }
      return data as UserProfile[];
    }
    const raw = localStorage.getItem(this.demoProfilesKey);
    return raw ? JSON.parse(raw) : SEED_PROFILES;
  }

  async getProfileByEmail(email: string): Promise<(UserProfile & { passwordHash?: string }) | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error fetching profile for ${cleanEmail}: ${error.message}`);
      }
      return data as UserProfile | null;
    }

    const raw = localStorage.getItem(this.demoProfilesKey);
    const profiles: (UserProfile & { passwordHash?: string })[] = raw ? JSON.parse(raw) : SEED_PROFILES;
    return profiles.find(p => p.email.toLowerCase() === cleanEmail) || null;
  }

  async addProfile(profile: UserProfile & { passwordHash?: string }): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone_number: profile.phone_number,
          role: profile.role,
          village_ward: profile.village_ward
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error creating profile: ${error.message}`);
      }
      return data as UserProfile;
    }

    const raw = localStorage.getItem(this.demoProfilesKey);
    const profiles: (UserProfile & { passwordHash?: string })[] = raw ? JSON.parse(raw) : SEED_PROFILES;
    profiles.push(profile);
    localStorage.setItem(this.demoProfilesKey, JSON.stringify(profiles));
    return profile;
  }

  // --- Reports / Complaints ---
  async getReports(): Promise<WasteReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('waste_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error fetching waste reports: ${error.message}`);
      }

      // Generate fresh signed URLs on demand for private storage photos
      const resolvedReports = await Promise.all(
        (data as WasteReport[]).map(async (rep) => {
          const resolved = { ...rep };
          if (rep.photo_url) {
            resolved.photo_url = await this.getPhotoUrl(rep.photo_url);
          }
          if (rep.completion_photo_url) {
            resolved.completion_photo_url = await this.getPhotoUrl(rep.completion_photo_url);
          }
          return resolved;
        })
      );

      return resolvedReports;
    }

    const raw = localStorage.getItem(this.demoReportsKey);
    return raw ? JSON.parse(raw) : INITIAL_REPORTS;
  }

  // Worker task status and notes update
  async updateWorkerTask(
    reportId: string,
    status: ComplaintStatus,
    completionNotes?: string,
    completionPhotoUrl?: string
  ): Promise<WasteReport> {
    const updates: Partial<WasteReport> = {
      status,
      ...(completionNotes !== undefined ? { completion_notes: completionNotes } : {}),
      ...(completionPhotoUrl !== undefined ? { completion_photo_url: completionPhotoUrl } : {})
    };
    return this.updateReport(reportId, updates);
  }

  async addReport(report: Omit<WasteReport, 'id' | 'created_at' | 'updated_at'>): Promise<WasteReport> {
    const reportCode = `REP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('waste_reports')
        .insert([{
          report_code: reportCode,
          citizen_id: report.citizen_id,
          citizen_name: report.citizen_name,
          phone_number: report.phone_number,
          category: report.category,
          description: report.description,
          ward_number: report.ward_number,
          location_address: report.location_address,
          photo_url: report.photo_url || null,
          status: report.status || 'pending'
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error submitting complaint: ${error.message}`);
      }
      return data as WasteReport;
    }

    const newReport: WasteReport = {
      ...report,
      id: reportCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const current = await this.getReports();
    const updated = [newReport, ...current];
    localStorage.setItem(this.demoReportsKey, JSON.stringify(updated));
    return newReport;
  }

  async updateReport(id: string, updates: Partial<WasteReport>): Promise<WasteReport> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('waste_reports')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error updating complaint ${id}: ${error.message}`);
      }
      return data as WasteReport;
    }

    const current = await this.getReports();
    const index = current.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Report with id ${id} not found.`);
    }

    const updatedItem = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    current[index] = updatedItem;
    localStorage.setItem(this.demoReportsKey, JSON.stringify(current));
    return updatedItem;
  }

  // --- Schedules ---
  async getSchedules(): Promise<WasteSchedule[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('waste_schedules')
        .select('*')
        .order('ward_number');

      if (error) {
        throw new Error(`Database error fetching schedules: ${error.message}`);
      }
      return data as WasteSchedule[];
    }

    const raw = localStorage.getItem(this.demoSchedulesKey);
    return raw ? JSON.parse(raw) : INITIAL_SCHEDULES;
  }

  async addSchedule(schedule: Omit<WasteSchedule, 'id'>): Promise<WasteSchedule> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('waste_schedules')
        .insert([{
          ward_number: schedule.ward_number,
          ward_name: schedule.ward_name,
          ward_name_te: schedule.ward_name_te,
          day_of_week: schedule.day_of_week,
          day_of_week_te: schedule.day_of_week_te,
          collection_time: schedule.collection_time,
          waste_types: schedule.waste_types,
          worker_name: schedule.worker_name,
          vehicle_number: schedule.vehicle_number
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error creating schedule: ${error.message}`);
      }
      return data as WasteSchedule;
    }

    const newSchedule: WasteSchedule = {
      ...schedule,
      id: `sch-${Date.now()}`
    };
    const current = await this.getSchedules();
    const updated = [...current, newSchedule];
    localStorage.setItem(this.demoSchedulesKey, JSON.stringify(updated));
    return newSchedule;
  }

  // --- Households ---
  async getHouseholds(): Promise<Household[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error fetching households: ${error.message}`);
      }
      return data as Household[];
    }

    const raw = localStorage.getItem(this.demoHouseholdsKey);
    const households: Household[] = raw ? JSON.parse(raw) : INITIAL_HOUSEHOLDS;

    // In demo mode, if the active user is a worker, restrict to their assigned ward
    const demoUserRaw = localStorage.getItem('wastewise_demo_user');
    if (demoUserRaw) {
      try {
        const demoUser = JSON.parse(demoUserRaw);
        if (demoUser.role === 'worker' && demoUser.village_ward) {
          // Exact ward matching (prevents substring collision like Ward 1 matching Ward 10)
          const assignedWards = demoUser.village_ward.split(/[,&/]/).map((w: string) => w.trim());
          return households.filter(h => assignedWards.includes(h.ward_number));
        }
      } catch {
        // Ignore parse error
      }
    }

    return households;
  }

  async addHousehold(household: Omit<Household, 'id' | 'created_at'>): Promise<Household> {
    if (isSupabaseConfigured && supabase) {
      let registeredBy = household.registered_by;
      if (!registeredBy) {
        const { data: authData } = await supabase.auth.getUser();
        registeredBy = authData?.user?.id;
      }

      const { data, error } = await supabase
        .from('households')
        .insert([{
          house_number: household.house_number,
          head_of_household: household.head_of_household,
          family_members_count: household.family_members_count,
          ward_number: household.ward_number,
          street_name: household.street_name,
          phone_number: household.phone_number,
          qr_code_id: household.qr_code_id || null,
          registered_by: registeredBy || null
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error enrolling household: ${error.message}`);
      }
      return data as Household;
    }

    const newHousehold: Household = {
      ...household,
      id: `hh-${Date.now()}`,
      registered_by: household.registered_by || '00000000-0000-0000-0000-000000000003',
      created_at: new Date().toISOString()
    };
    const current = await this.getHouseholds();
    const updated = [newHousehold, ...current];
    localStorage.setItem(this.demoHouseholdsKey, JSON.stringify(updated));
    return newHousehold;
  }

  // --- Collection Records ---
  async getCollections(): Promise<CollectionRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('collection_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw new Error(`Database error fetching collection records: ${error.message}`);
      }
      return data as CollectionRecord[];
    }

    const raw = localStorage.getItem(this.demoCollectionsKey);
    return raw ? JSON.parse(raw) : INITIAL_COLLECTIONS;
  }

  async addCollection(record: Omit<CollectionRecord, 'id' | 'created_at'>): Promise<CollectionRecord> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('collection_records')
        .insert([{
          date: record.date,
          ward_number: record.ward_number,
          worker_id: record.worker_id,
          worker_name: record.worker_name,
          wet_waste_kg: record.wet_waste_kg,
          dry_waste_kg: record.dry_waste_kg,
          mixed_waste_kg: record.mixed_waste_kg,
          notes: record.notes || null
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error saving collection log: ${error.message}`);
      }
      return data as CollectionRecord;
    }

    const newRecord: CollectionRecord = {
      ...record,
      id: `col-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const current = await this.getCollections();
    const updated = [newRecord, ...current];
    localStorage.setItem(this.demoCollectionsKey, JSON.stringify(updated));
    return newRecord;
  }

  // --- Compost Records ---
  async getCompost(): Promise<CompostRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('compost_records')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        throw new Error(`Database error fetching compost records: ${error.message}`);
      }
      return data as CompostRecord[];
    }

    const raw = localStorage.getItem(this.demoCompostKey);
    return raw ? JSON.parse(raw) : INITIAL_COMPOST;
  }

  async addCompost(record: CompostRecord): Promise<CompostRecord> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('compost_records')
        .insert([{
          batch_number: record.batch_number,
          start_date: record.start_date,
          harvest_date: record.harvest_date || null,
          wet_waste_input_kg: record.wet_waste_input_kg,
          compost_produced_kg: record.compost_produced_kg,
          quality_grade: record.quality_grade,
          distributed_to_farmers_kg: record.distributed_to_farmers_kg,
          status: record.status
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error creating compost batch: ${error.message}`);
      }
      return data as CompostRecord;
    }

    const current = await this.getCompost();
    const updated = [record, ...current];
    localStorage.setItem(this.demoCompostKey, JSON.stringify(updated));
    return record;
  }

  // --- Feedback ---
  async getFeedback(): Promise<CitizenFeedback[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error fetching feedback: ${error.message}`);
      }
      return data as CitizenFeedback[];
    }

    const raw = localStorage.getItem(this.demoFeedbackKey);
    return raw ? JSON.parse(raw) : INITIAL_FEEDBACK;
  }

  async addFeedback(item: Omit<CitizenFeedback, 'id' | 'created_at'>): Promise<CitizenFeedback> {
    if (isSupabaseConfigured && supabase) {
      let citizenId: string | undefined = item.citizen_id || undefined;
      if (!citizenId) {
        const { data: authData } = await supabase.auth.getUser();
        citizenId = authData?.user?.id;
      }

      if (!citizenId) {
        throw new Error('Authenticated citizen ID is required to submit feedback.');
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          citizen_id: citizenId,
          citizen_name: item.citizen_name,
          phone_number: item.phone_number,
          ward_number: item.ward_number,
          rating: item.rating,
          comment: item.comment
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error submitting feedback: ${error.message}`);
      }
      return data as CitizenFeedback;
    }

    const newFeedback: CitizenFeedback = {
      ...item,
      citizen_id: item.citizen_id || '00000000-0000-0000-0000-000000000001',
      id: `fb-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const current = await this.getFeedback();
    const updated = [newFeedback, ...current];
    localStorage.setItem(this.demoFeedbackKey, JSON.stringify(updated));
    return newFeedback;
  }
}

export const villageDataService = new VillageDataService();
