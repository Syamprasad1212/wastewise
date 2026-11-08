import { Household, WasteReport, WasteSchedule, CollectionRecord, CompostRecord, CitizenFeedback } from '../types';

export const INITIAL_HOUSEHOLDS: Household[] = [
  {
    id: 'hh-1',
    house_number: '2-14/A',
    head_of_household: 'Ramesh Reddy',
    family_members_count: 5,
    ward_number: 'Ward 1',
    street_name: 'Bazaar Street / బజార్ వీధి',
    phone_number: '9848022331',
    qr_code_id: 'QR-W1-001',
    created_at: '2026-01-10T09:00:00Z'
  },
  {
    id: 'hh-2',
    house_number: '3-55/B',
    head_of_household: 'Lakshmi Devi',
    family_members_count: 4,
    ward_number: 'Ward 2',
    street_name: 'Temple Road / గుడి వీధి',
    phone_number: '9848033442',
    qr_code_id: 'QR-W2-014',
    created_at: '2026-01-11T10:30:00Z'
  },
  {
    id: 'hh-3',
    house_number: '1-88/C',
    head_of_household: 'Venkat Rao',
    family_members_count: 6,
    ward_number: 'Ward 3',
    street_name: 'School Street / బడి వీధి',
    phone_number: '9848044553',
    qr_code_id: 'QR-W3-022',
    created_at: '2026-01-12T11:00:00Z'
  },
  {
    id: 'hh-4',
    house_number: '4-12/1',
    head_of_household: 'Saraswathi Bai',
    family_members_count: 3,
    ward_number: 'Ward 4',
    street_name: 'Panchayat Office Lane / పంచాయతీ కార్యాలయం సందు',
    phone_number: '9848055664',
    qr_code_id: 'QR-W4-005',
    created_at: '2026-01-15T08:30:00Z'
  }
];

export const INITIAL_SCHEDULES: WasteSchedule[] = [
  {
    id: 'sch-1',
    ward_number: 'Ward 1',
    ward_name: 'Bazaar Area',
    ward_name_te: 'బజార్ ప్రాంతం',
    day_of_week: 'Daily (Mon - Sat)',
    day_of_week_te: 'ప్రతిరోజు (సోమ - శని)',
    collection_time: '06:30 AM - 08:30 AM',
    waste_types: ['wet'],
    worker_name: 'Mallesh (మల్లేష్)',
    vehicle_number: 'AP-26-TG-1044'
  },
  {
    id: 'sch-2',
    ward_number: 'Ward 1',
    ward_name: 'Bazaar Area',
    ward_name_te: 'బజార్ ప్రాంతం',
    day_of_week: 'Wednesday & Saturday',
    day_of_week_te: 'బుధవారం & శనివారం',
    collection_time: '02:00 PM - 04:30 PM',
    waste_types: ['dry'],
    worker_name: 'Mallesh (మల్లేష్)',
    vehicle_number: 'AP-26-TG-1044'
  },
  {
    id: 'sch-3',
    ward_number: 'Ward 2',
    ward_name: 'Temple Street',
    ward_name_te: 'గుడి వీధి ప్రాంతం',
    day_of_week: 'Daily (Mon - Sat)',
    day_of_week_te: 'ప్రతిరోజు (సోమ - శని)',
    collection_time: '07:00 AM - 09:00 AM',
    waste_types: ['wet'],
    worker_name: 'Koteswara Rao (కోటేశ్వరరావు)',
    vehicle_number: 'AP-26-TG-1048'
  },
  {
    id: 'sch-4',
    ward_number: 'Ward 3',
    ward_name: 'ZPH School & Colony',
    ward_name_te: 'పాఠశాల & కాలనీ',
    day_of_week: 'Tuesday & Friday',
    day_of_week_te: 'మంగళవారం & శుక్రవారం',
    collection_time: '08:30 AM - 10:30 AM',
    waste_types: ['dry'],
    worker_name: 'Suresh Kumar (సురేష్)',
    vehicle_number: 'AP-26-TG-1050'
  }
];

export const INITIAL_REPORTS: WasteReport[] = [
  {
    id: 'REP-2026-001',
    citizen_id: 'cit-1',
    citizen_name: 'Ramesh Reddy',
    phone_number: '9848022331',
    category: 'mixed',
    description: 'Mixed dry and vegetable garbage dumped near bazaar vegetable market corner causing foul smell.',
    ward_number: 'Ward 1',
    location_address: 'Opposite Sri Venkateswara Provision Stores, Bazaar St',
    photo_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60',
    status: 'assigned',
    assigned_worker_id: 'worker-1',
    assigned_worker_name: 'Mallesh',
    created_at: '2026-02-01T08:15:00Z',
    updated_at: '2026-02-01T09:30:00Z'
  },
  {
    id: 'REP-2026-002',
    citizen_id: 'cit-2',
    citizen_name: 'Lakshmi Devi',
    phone_number: '9848033442',
    category: 'wet',
    description: 'Overflowing wet waste bin near community handpump.',
    ward_number: 'Ward 2',
    location_address: 'Near Old Shiva Temple Handpump, Ward 2',
    photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60',
    status: 'resolved',
    assigned_worker_id: 'worker-2',
    assigned_worker_name: 'Koteswara Rao',
    completion_photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
    completion_notes: 'Waste cleared, lime powder sprayed to prevent flies.',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T14:20:00Z'
  },
  {
    id: 'REP-2026-003',
    citizen_id: 'cit-3',
    citizen_name: 'Venkat Rao',
    phone_number: '9848044553',
    category: 'hazardous',
    description: 'Broken pesticide bottles left by roadside near culvert.',
    ward_number: 'Ward 3',
    location_address: 'North Canal Road, beside ZP High School boundary',
    photo_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=60',
    status: 'pending',
    created_at: '2026-02-02T11:45:00Z',
    updated_at: '2026-02-02T11:45:00Z'
  }
];

export const INITIAL_COLLECTIONS: CollectionRecord[] = [
  {
    id: 'col-1',
    date: '2026-02-07',
    ward_number: 'Ward 1',
    worker_id: 'worker-1',
    worker_name: 'Mallesh',
    wet_waste_kg: 240,
    dry_waste_kg: 110,
    mixed_waste_kg: 25,
    notes: 'Good segregation compliance in Bazaar area today.',
    created_at: '2026-02-07T11:30:00Z'
  },
  {
    id: 'col-2',
    date: '2026-02-07',
    ward_number: 'Ward 2',
    worker_id: 'worker-2',
    worker_name: 'Koteswara Rao',
    wet_waste_kg: 195,
    dry_waste_kg: 90,
    mixed_waste_kg: 40,
    notes: 'Awareness needed at 4 households in Temple street.',
    created_at: '2026-02-07T12:00:00Z'
  },
  {
    id: 'col-3',
    date: '2026-02-06',
    ward_number: 'Ward 3',
    worker_id: 'worker-3',
    worker_name: 'Suresh Kumar',
    wet_waste_kg: 210,
    dry_waste_kg: 130,
    mixed_waste_kg: 18,
    notes: 'School zone segregated nicely.',
    created_at: '2026-02-06T12:15:00Z'
  }
];

export const INITIAL_COMPOST: CompostRecord[] = [
  {
    id: 'cmp-1',
    batch_number: 'GP-CMP-2026-B1',
    start_date: '2026-01-05',
    harvest_date: '2026-02-05',
    wet_waste_input_kg: 1200,
    compost_produced_kg: 420,
    quality_grade: 'Grade A',
    distributed_to_farmers_kg: 350,
    status: 'distributed'
  },
  {
    id: 'cmp-2',
    batch_number: 'GP-CMP-2026-B2',
    start_date: '2026-01-20',
    harvest_date: '2026-02-20',
    wet_waste_input_kg: 1450,
    compost_produced_kg: 0,
    quality_grade: 'Grade A',
    distributed_to_farmers_kg: 0,
    status: 'composting'
  }
];

export const INITIAL_FEEDBACK: CitizenFeedback[] = [
  {
    id: 'fb-1',
    citizen_name: 'Srinivasulu',
    phone_number: '9848077889',
    ward_number: 'Ward 1',
    rating: 5,
    comment: 'Morning waste collection is now regular! Sanitation worker Mallesh is very polite and guides us on keeping wet and dry separate.',
    created_at: '2026-02-05T14:00:00Z'
  },
  {
    id: 'fb-2',
    citizen_name: 'Padmavathi',
    phone_number: '9848099001',
    ward_number: 'Ward 3',
    rating: 4,
    comment: 'Complaint regarding the school culvert was addressed promptly within 24 hours. Good work Grama Panchayat!',
    created_at: '2026-02-06T16:30:00Z'
  }
];
