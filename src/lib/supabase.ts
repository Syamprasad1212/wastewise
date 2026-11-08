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
  CitizenFeedback
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-supabase-url')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// Unified Village Data Service
// Operates against live Supabase when env vars are present, or local persistence.
// ==============================================================================

class VillageDataService {
  private reportsKey = 'wastewise_reports';
  private householdsKey = 'wastewise_households';
  private schedulesKey = 'wastewise_schedules';
  private collectionsKey = 'wastewise_collections';
  private compostKey = 'wastewise_compost';
  private feedbackKey = 'wastewise_feedback';

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    if (!localStorage.getItem(this.reportsKey)) {
      localStorage.setItem(this.reportsKey, JSON.stringify(INITIAL_REPORTS));
    }
    if (!localStorage.getItem(this.householdsKey)) {
      localStorage.setItem(this.householdsKey, JSON.stringify(INITIAL_HOUSEHOLDS));
    }
    if (!localStorage.getItem(this.schedulesKey)) {
      localStorage.setItem(this.schedulesKey, JSON.stringify(INITIAL_SCHEDULES));
    }
    if (!localStorage.getItem(this.collectionsKey)) {
      localStorage.setItem(this.collectionsKey, JSON.stringify(INITIAL_COLLECTIONS));
    }
    if (!localStorage.getItem(this.compostKey)) {
      localStorage.setItem(this.compostKey, JSON.stringify(INITIAL_COMPOST));
    }
    if (!localStorage.getItem(this.feedbackKey)) {
      localStorage.setItem(this.feedbackKey, JSON.stringify(INITIAL_FEEDBACK));
    }
  }

  // --- Reports / Complaints ---
  async getReports(): Promise<WasteReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('waste_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as WasteReport[];
    }
    const raw = localStorage.getItem(this.reportsKey);
    return raw ? JSON.parse(raw) : INITIAL_REPORTS;
  }

  async addReport(report: Omit<WasteReport, 'id' | 'created_at' | 'updated_at'>): Promise<WasteReport> {
    const newReport: WasteReport = {
      ...report,
      id: `REP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('waste_reports').insert([{
        report_code: newReport.id,
        citizen_name: newReport.citizen_name,
        phone_number: newReport.phone_number,
        category: newReport.category,
        description: newReport.description,
        ward_number: newReport.ward_number,
        location_address: newReport.location_address,
        photo_url: newReport.photo_url,
        status: newReport.status
      }]);
    }

    const current = await this.getReports();
    const updated = [newReport, ...current];
    localStorage.setItem(this.reportsKey, JSON.stringify(updated));
    return newReport;
  }

  async updateReport(id: string, updates: Partial<WasteReport>): Promise<WasteReport | null> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('waste_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    const current = await this.getReports();
    const index = current.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    current[index] = updatedItem;
    localStorage.setItem(this.reportsKey, JSON.stringify(current));
    return updatedItem;
  }

  // --- Schedules ---
  async getSchedules(): Promise<WasteSchedule[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('waste_schedules').select('*');
      if (!error && data) return data as WasteSchedule[];
    }
    const raw = localStorage.getItem(this.schedulesKey);
    return raw ? JSON.parse(raw) : INITIAL_SCHEDULES;
  }

  async addSchedule(schedule: Omit<WasteSchedule, 'id'>): Promise<WasteSchedule> {
    const newSchedule: WasteSchedule = {
      ...schedule,
      id: `sch-${Date.now()}`
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('waste_schedules').insert([newSchedule]);
    }

    const current = await this.getSchedules();
    const updated = [...current, newSchedule];
    localStorage.setItem(this.schedulesKey, JSON.stringify(updated));
    return newSchedule;
  }

  // --- Households ---
  async getHouseholds(): Promise<Household[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('households').select('*');
      if (!error && data) return data as Household[];
    }
    const raw = localStorage.getItem(this.householdsKey);
    return raw ? JSON.parse(raw) : INITIAL_HOUSEHOLDS;
  }

  async addHousehold(household: Omit<Household, 'id' | 'created_at'>): Promise<Household> {
    const newHousehold: Household = {
      ...household,
      id: `hh-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('households').insert([newHousehold]);
    }

    const current = await this.getHouseholds();
    const updated = [newHousehold, ...current];
    localStorage.setItem(this.householdsKey, JSON.stringify(updated));
    return newHousehold;
  }

  // --- Collection Records ---
  async getCollections(): Promise<CollectionRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('collection_records')
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) return data as CollectionRecord[];
    }
    const raw = localStorage.getItem(this.collectionsKey);
    return raw ? JSON.parse(raw) : INITIAL_COLLECTIONS;
  }

  async addCollection(record: Omit<CollectionRecord, 'id' | 'created_at'>): Promise<CollectionRecord> {
    const newRecord: CollectionRecord = {
      ...record,
      id: `col-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('collection_records').insert([newRecord]);
    }

    const current = await this.getCollections();
    const updated = [newRecord, ...current];
    localStorage.setItem(this.collectionsKey, JSON.stringify(updated));
    return newRecord;
  }

  // --- Compost Records ---
  async getCompost(): Promise<CompostRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('compost_records').select('*');
      if (!error && data) return data as CompostRecord[];
    }
    const raw = localStorage.getItem(this.compostKey);
    return raw ? JSON.parse(raw) : INITIAL_COMPOST;
  }

  async addCompost(record: CompostRecord): Promise<CompostRecord> {
    const current = await this.getCompost();
    const updated = [record, ...current];
    localStorage.setItem(this.compostKey, JSON.stringify(updated));
    return record;
  }

  // --- Feedback ---
  async getFeedback(): Promise<CitizenFeedback[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as CitizenFeedback[];
    }
    const raw = localStorage.getItem(this.feedbackKey);
    return raw ? JSON.parse(raw) : INITIAL_FEEDBACK;
  }

  async addFeedback(item: Omit<CitizenFeedback, 'id' | 'created_at'>): Promise<CitizenFeedback> {
    const newFeedback: CitizenFeedback = {
      ...item,
      id: `fb-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('feedback').insert([newFeedback]);
    }

    const current = await this.getFeedback();
    const updated = [newFeedback, ...current];
    localStorage.setItem(this.feedbackKey, JSON.stringify(updated));
    return newFeedback;
  }
}

export const villageDataService = new VillageDataService();
