export type UserRole = 'citizen' | 'admin' | 'worker';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number: string;
  village_ward: string;
  created_at?: string;
}

export interface Household {
  id: string;
  house_number: string;
  head_of_household: string;
  family_members_count: number;
  ward_number: string;
  street_name: string;
  phone_number: string;
  qr_code_id?: string;
  registered_by?: string;
  created_at: string;
}

export type WasteCategory = 'wet' | 'dry' | 'hazardous' | 'sanitary' | 'mixed';
export type ComplaintStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';

export interface WasteReport {
  id: string;
  citizen_id: string;
  citizen_name: string;
  phone_number: string;
  category: WasteCategory;
  description: string;
  ward_number: string;
  location_address: string;
  photo_url?: string;
  status: ComplaintStatus;
  assigned_worker_id?: string;
  assigned_worker_name?: string;
  completion_photo_url?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WasteSchedule {
  id: string;
  ward_number: string;
  ward_name: string;
  ward_name_te: string;
  day_of_week: string;
  day_of_week_te: string;
  collection_time: string;
  waste_types: ('wet' | 'dry')[];
  worker_name: string;
  vehicle_number: string;
}

export interface CollectionRecord {
  id: string;
  date: string;
  ward_number: string;
  worker_id: string;
  worker_name: string;
  wet_waste_kg: number;
  dry_waste_kg: number;
  mixed_waste_kg: number;
  notes?: string;
  created_at: string;
}

export interface CompostRecord {
  id: string;
  batch_number: string;
  start_date: string;
  harvest_date: string | null;
  wet_waste_input_kg: number;
  compost_produced_kg: number;
  quality_grade: 'Grade A' | 'Grade B' | 'Standard';
  distributed_to_farmers_kg: number;
  status: 'composting' | 'ready' | 'distributed';
}

export interface CitizenFeedback {
  id: string;
  citizen_id?: string | null;
  citizen_name: string;
  phone_number: string;
  ward_number: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface WasteItem {
  id: string;
  nameEn: string;
  nameTe: string;
  category: 'wet' | 'dry' | 'hazardous' | 'sanitary';
  binColor: 'green' | 'blue' | 'red' | 'yellow';
  compostable: boolean;
  recyclable: boolean;
  instructionsEn: string;
  instructionsTe: string;
  disposalTipEn: string;
  disposalTipTe: string;
  exampleItems: string;
}
