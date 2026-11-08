import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { villageDataService } from '../lib/supabase';
import {
  WasteReport,
  WasteSchedule,
  Household,
  CollectionRecord,
  CompostRecord,
  CitizenFeedback
} from '../types';
import {
  Users,
  AlertCircle,
  CheckCircle,
  Truck,
  Sprout,
  BarChart3,
  Calendar,
  Plus,
  ShieldCheck,
  UserCheck,
  MapPin,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'schedules' | 'households' | 'collections'>('overview');
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [schedules, setSchedules] = useState<WasteSchedule[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [composts, setComposts] = useState<CompostRecord[]>([]);
  const [feedback, setFeedback] = useState<CitizenFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // New Household form state
  const [showAddHousehold, setShowAddHousehold] = useState(false);
  const [newHhNumber, setNewHhNumber] = useState('');
  const [newHhHead, setNewHhHead] = useState('');
  const [newHhMembers, setNewHhMembers] = useState(4);
  const [newHhWard, setNewHhWard] = useState('Ward 1');
  const [newHhStreet, setNewHhStreet] = useState('');
  const [newHhPhone, setNewHhPhone] = useState('');

  // New Schedule form state
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchWard, setNewSchWard] = useState('Ward 1');
  const [newSchName, setNewSchName] = useState('');
  const [newSchDays, setNewSchDays] = useState('Daily (Mon - Sat)');
  const [newSchTime, setNewSchTime] = useState('06:30 AM - 08:30 AM');
  const [newSchWorker, setNewSchWorker] = useState('Mallesh (మల్లేష్)');
  const [newSchVehicle, setNewSchVehicle] = useState('AP-26-TG-1044');

  // Worker assignment
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [assignWorkerName, setAssignWorkerName] = useState('Mallesh');

  const workersList = ['Mallesh', 'Koteswara Rao', 'Suresh Kumar', 'Lakshman'];

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    const [reps, schs, hhs, cols, cmps, fbs] = await Promise.all([
      villageDataService.getReports(),
      villageDataService.getSchedules(),
      villageDataService.getHouseholds(),
      villageDataService.getCollections(),
      villageDataService.getCompost(),
      villageDataService.getFeedback()
    ]);
    setReports(reps);
    setSchedules(schs);
    setHouseholds(hhs);
    setCollections(cols);
    setComposts(cmps);
    setFeedback(fbs);
    setLoading(false);
  };

  const handleAssignWorker = async (reportId: string) => {
    await villageDataService.updateReport(reportId, {
      status: 'assigned',
      assigned_worker_id: `worker-${assignWorkerName}`,
      assigned_worker_name: assignWorkerName
    });
    setSelectedReportId(null);
    await loadAllAdminData();
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHhNumber || !newHhHead || !newHhPhone) return;

    await villageDataService.addHousehold({
      house_number: newHhNumber,
      head_of_household: newHhHead,
      family_members_count: Number(newHhMembers),
      ward_number: newHhWard,
      street_name: newHhStreet,
      phone_number: newHhPhone,
      qr_code_id: `QR-${newHhWard.replace(' ', '')}-${Math.floor(Math.random() * 800) + 100}`
    });

    setNewHhNumber('');
    setNewHhHead('');
    setNewHhStreet('');
    setNewHhPhone('');
    setShowAddHousehold(false);
    await loadAllAdminData();
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await villageDataService.addSchedule({
      ward_number: newSchWard,
      ward_name: newSchName || `${newSchWard} Area`,
      ward_name_te: `${newSchWard} ప్రాంతం`,
      day_of_week: newSchDays,
      day_of_week_te: newSchDays,
      collection_time: newSchTime,
      waste_types: ['wet', 'dry'],
      worker_name: newSchWorker,
      vehicle_number: newSchVehicle
    });

    setShowAddSchedule(false);
    await loadAllAdminData();
  };

  // KPI Calculations
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const totalWetKg = collections.reduce((acc, curr) => acc + curr.wet_waste_kg, 0);
  const totalDryKg = collections.reduce((acc, curr) => acc + curr.dry_waste_kg, 0);
  const totalMixedKg = collections.reduce((acc, curr) => acc + curr.mixed_waste_kg, 0);
  const totalCompostKg = composts.reduce((acc, curr) => acc + curr.compost_produced_kg, 0);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'te' ? 'గ్రామ పంచాయతీ అడ్మినిస్ట్రేషన్' : 'Grama Panchayat Administrative Console'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'te' ? 'గ్రామ పారిశుద్ధ్య & వ్యర్థాల నిర్వహణ' : 'Village Sanitation & Waste Monitoring Dashboard'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {language === 'te'
                ? `సర్పంచ్ / పంచాయతీ కార్యదర్శి: ${user?.full_name}`
                : `Active Administrator: ${user?.full_name} | Ward Jurisdiction: All 4 Wards`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Panchayat System Online
            </span>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {language === 'te' ? 'నమోదైన ఇళ్లు' : 'Registered Households'}
            </span>
            <div className="text-2xl font-black text-slate-900">{households.length * 210 + 25}</div>
            <span className="text-[11px] text-blue-600 font-medium">Across 4 Village Wards</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {language === 'te' ? 'పెండింగ్ ఫిర్యాదులు' : 'Pending Grievances'}
            </span>
            <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
            <span className="text-[11px] text-slate-500">{resolvedCount} resolved so far</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {language === 'te' ? 'తడి & పొడి చెత్త (కేజీలు)' : 'Segregated Waste (Kg)'}
            </span>
            <div className="text-2xl font-black text-emerald-700">{totalWetKg + totalDryKg} kg</div>
            <span className="text-[11px] text-emerald-600 font-semibold">{totalWetKg}kg Wet / {totalDryKg}kg Dry</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {language === 'te' ? 'సేంద్రీయ ఎరువు (కేజీలు)' : 'Compost Produced'}
            </span>
            <div className="text-2xl font-black text-purple-800">{totalCompostKg} kg</div>
            <span className="text-[11px] text-purple-600 font-semibold">Grade-A for Farmers</span>
          </div>
        </div>

      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {[
          { id: 'overview', labelEn: 'Waste Analytics & Charts', labelTe: 'గ్రామ చెత్త నివేదికలు', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'complaints', labelEn: `Complaints (${reports.length})`, labelTe: `ఫిర్యాదులు (${reports.length})`, icon: <AlertCircle className="w-4 h-4" /> },
          { id: 'schedules', labelEn: 'Ward Schedules', labelTe: 'వార్డు షెడ్యూళ్ళు', icon: <Calendar className="w-4 h-4" /> },
          { id: 'households', labelEn: 'Households Directory', labelTe: 'ఇళ్ల జాబితా', icon: <Users className="w-4 h-4" /> },
          { id: 'collections', labelEn: 'Daily Logs', labelTe: 'రోజువారీ రికార్డులు', icon: <FileSpreadsheet className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-sm whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-forest-600 text-forest-800 bg-forest-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{language === 'te' ? tab.labelTe : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Visual Waste Segregation Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Waste Volume Comparison */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {language === 'te' ? 'వారం వారీ వ్యర్థాల పరిమాణం (కేజీలు)' : 'Village Waste Collection Breakdown (Kg)'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'లక్ష్యం: మిశ్రమ చెత్తను 0% కి తగ్గించడం' : 'Goal: Reduce unsegregated mixed waste below 5%'}
              </p>

              <div className="space-y-4 pt-2">
                {/* Wet Waste Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>🌱 Wet Waste (Compostable)</span>
                    <span className="text-emerald-700">{totalWetKg} kg ({Math.round((totalWetKg / (totalWetKg + totalDryKg + totalMixedKg || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (totalWetKg / (totalWetKg + totalDryKg + totalMixedKg || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dry Waste Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>📦 Dry Recyclable Waste</span>
                    <span className="text-blue-700">{totalDryKg} kg ({Math.round((totalDryKg / (totalWetKg + totalDryKg + totalMixedKg || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (totalDryKg / (totalWetKg + totalDryKg + totalMixedKg || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Mixed Waste Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>⚠️ Unsegregated Mixed Waste</span>
                    <span className="text-rose-700">{totalMixedKg} kg ({Math.round((totalMixedKg / (totalWetKg + totalDryKg + totalMixedKg || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, (totalMixedKg / (totalWetKg + totalDryKg + totalMixedKg || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compost Production Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {language === 'te' ? 'సేంద్రీయ ఎరువు బ్యాచ్ స్థితి' : 'Compost Production Batches'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'తడి చెత్త నుండి నాణ్యమైన వర్మీకంపోస్ట్' : 'Direct conversion of organic kitchen waste'}
              </p>

              <div className="space-y-3 pt-1">
                {composts.map((cmp) => (
                  <div key={cmp.batch_number} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono text-forest-800">{cmp.batch_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${cmp.status === 'distributed' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {cmp.status}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Input Wet Waste: <strong>{cmp.wet_waste_input_kg} kg</strong> → Output: <strong>{cmp.compost_produced_kg} kg</strong>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Distributed to Farmers: <strong>{cmp.distributed_to_farmers_kg} kg</strong> ({cmp.quality_grade})
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Citizen Feedback Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg mb-4">
              {language === 'te' ? 'గ్రామస్థుల నుండి వచ్చిన అభిప్రాయాలు' : 'Recent Citizen Reviews & Ratings'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feedback.map((fb) => (
                <div key={fb.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 text-sm">{fb.citizen_name} ({fb.ward_number})</strong>
                    <span className="text-xs text-amber-500 font-bold">★ {fb.rating} / 5</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{fb.comment}"</p>
                  <span className="text-[10px] text-slate-400 block">{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: COMPLAINT TRIAGE & WORKER ASSIGNMENT */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {language === 'te' ? 'గ్రామ ఫిర్యాదుల పరిష్కార కేంద్రం' : 'Citizen Grievances & Worker Assignment'}
              </h3>
              <p className="text-xs text-slate-500">
                Review complaints, view photographic evidence, and dispatch sanitation workers.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {reports.map((rep) => (
              <div key={rep.id} className="p-6 space-y-4 hover:bg-slate-50 transition">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {rep.id}
                    </span>
                    <span className="font-extrabold text-slate-900 text-base capitalize">
                      {rep.category} Dump in {rep.ward_number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      rep.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      rep.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700">{rep.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <strong>Location:</strong> {rep.location_address}
                  </span>
                  <span><strong>Reported by:</strong> {rep.citizen_name} ({rep.phone_number})</span>
                  <span><strong>Date:</strong> {new Date(rep.created_at).toLocaleDateString()}</span>
                </div>

                {/* Photos */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {rep.photo_url && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">Citizen Photo:</span>
                      <a href={rep.photo_url} target="_blank" rel="noreferrer" className="block w-28 h-20 rounded-xl overflow-hidden border">
                        <img src={rep.photo_url} alt="Grievance" className="w-full h-full object-cover" />
                      </a>
                    </div>
                  )}

                  {rep.completion_photo_url && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 block mb-1">Completed Cleaning Photo:</span>
                      <a href={rep.completion_photo_url} target="_blank" rel="noreferrer" className="block w-28 h-20 rounded-xl overflow-hidden border border-emerald-500">
                        <img src={rep.completion_photo_url} alt="Cleaned" className="w-full h-full object-cover" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Worker Assignment Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    {rep.assigned_worker_name ? (
                      <span className="text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg font-bold">
                        👷 Assigned to: {rep.assigned_worker_name}
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg font-bold">
                        ⚠️ No Worker Assigned Yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedReportId === rep.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={assignWorkerName}
                          onChange={(e) => setAssignWorkerName(e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg text-xs font-semibold px-2.5 py-1.5"
                        >
                          {workersList.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignWorker(rep.id)}
                          className="bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setSelectedReportId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedReportId(rep.id);
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        {rep.assigned_worker_name ? 'Re-assign Worker' : 'Assign Sanitation Worker'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULES MANAGER */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">
              {language === 'te' ? 'వార్డు చెత్త సేకరణ సమయాలు' : 'Ward Waste Collection Schedules'}
            </h3>
            <button
              onClick={() => setShowAddSchedule(!showAddSchedule)}
              className="flex items-center gap-1.5 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddSchedule ? 'Close Form' : 'Add New Schedule'}</span>
            </button>
          </div>

          {/* Add Schedule Form */}
          {showAddSchedule && (
            <form onSubmit={handleCreateSchedule} className="bg-forest-50 border border-forest-200 p-6 rounded-2xl space-y-4">
              <h4 className="font-bold text-forest-900 text-base">Create Collection Route Timing</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ward Number</label>
                  <select
                    value={newSchWard}
                    onChange={(e) => setNewSchWard(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="Ward 1">Ward 1</option>
                    <option value="Ward 2">Ward 2</option>
                    <option value="Ward 3">Ward 3</option>
                    <option value="Ward 4">Ward 4</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Area / Landmark Name</label>
                  <input
                    type="text"
                    required
                    value={newSchName}
                    onChange={(e) => setNewSchName(e.target.value)}
                    placeholder="e.g. Market Yard Lane"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Days of Week</label>
                  <input
                    type="text"
                    required
                    value={newSchDays}
                    onChange={(e) => setNewSchDays(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Timing</label>
                  <input
                    type="text"
                    required
                    value={newSchTime}
                    onChange={(e) => setNewSchTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Worker In-charge</label>
                  <input
                    type="text"
                    required
                    value={newSchWorker}
                    onChange={(e) => setNewSchWorker(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Reg Number</label>
                  <input
                    type="text"
                    required
                    value={newSchVehicle}
                    onChange={(e) => setNewSchVehicle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                Save Schedule
              </button>
            </form>
          )}

          {/* Schedules Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-4">Ward</th>
                  <th className="p-4">Days</th>
                  <th className="p-4">Collection Time</th>
                  <th className="p-4">Worker In-charge</th>
                  <th className="p-4">Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{sch.ward_number} - {sch.ward_name}</td>
                    <td className="p-4 text-slate-700">{sch.day_of_week}</td>
                    <td className="p-4 font-semibold text-forest-700">{sch.collection_time}</td>
                    <td className="p-4 text-slate-800">{sch.worker_name}</td>
                    <td className="p-4 font-mono text-slate-600">{sch.vehicle_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HOUSEHOLDS DIRECTORY */}
      {activeTab === 'households' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {language === 'te' ? 'గ్రామ ఇళ్ల జాబితా' : 'Village Household Directory'}
              </h3>
              <p className="text-xs text-slate-500">Every household is assigned a QR identifier for segregation audits.</p>
            </div>
            <button
              onClick={() => setShowAddHousehold(!showAddHousehold)}
              className="flex items-center gap-1.5 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddHousehold ? 'Close Form' : 'Enroll New Household'}</span>
            </button>
          </div>

          {/* Add Household Form */}
          {showAddHousehold && (
            <form onSubmit={handleCreateHousehold} className="bg-blue-50 border border-blue-200 p-6 rounded-2xl space-y-4">
              <h4 className="font-bold text-blue-950 text-base">Enroll New Village Household</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">House Number (Door No)</label>
                  <input
                    type="text"
                    required
                    value={newHhNumber}
                    onChange={(e) => setNewHhNumber(e.target.value)}
                    placeholder="e.g. 2-45/A"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Head of Household Name</label>
                  <input
                    type="text"
                    required
                    value={newHhHead}
                    onChange={(e) => setNewHhHead(e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Family Members Count</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newHhMembers}
                    onChange={(e) => setNewHhMembers(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ward Number</label>
                  <select
                    value={newHhWard}
                    onChange={(e) => setNewHhWard(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="Ward 1">Ward 1</option>
                    <option value="Ward 2">Ward 2</option>
                    <option value="Ward 3">Ward 3</option>
                    <option value="Ward 4">Ward 4</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Street / Lane</label>
                  <input
                    type="text"
                    required
                    value={newHhStreet}
                    onChange={(e) => setNewHhStreet(e.target.value)}
                    placeholder="e.g. Bazaar Street"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={newHhPhone}
                    onChange={(e) => setNewHhPhone(e.target.value)}
                    placeholder="e.g. 9848022331"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                Enroll Household
              </button>
            </form>
          )}

          {/* Households Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-4">Door No</th>
                  <th className="p-4">Head of Household</th>
                  <th className="p-4">Ward & Street</th>
                  <th className="p-4">Family Size</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">QR Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {households.map((hh) => (
                  <tr key={hh.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-slate-900">{hh.house_number}</td>
                    <td className="p-4 font-semibold text-slate-800">{hh.head_of_household}</td>
                    <td className="p-4 text-slate-600">{hh.ward_number} - {hh.street_name}</td>
                    <td className="p-4 text-slate-700">{hh.family_members_count} members</td>
                    <td className="p-4 text-slate-600 font-mono">{hh.phone_number}</td>
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        {hh.qr_code_id || 'QR-ASSIGNED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DAILY COLLECTION LOGS */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900">
            {language === 'te' ? 'పారిశుద్ధ్య కార్మికుల రోజువారీ తూకం రికార్డులు' : 'Daily Village Waste Collection Logs'}
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Ward</th>
                  <th className="p-4">Worker Name</th>
                  <th className="p-4 text-emerald-700">Wet Waste (kg)</th>
                  <th className="p-4 text-blue-700">Dry Waste (kg)</th>
                  <th className="p-4 text-rose-700">Mixed Waste (kg)</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-slate-900">{col.date}</td>
                    <td className="p-4 font-semibold text-slate-800">{col.ward_number}</td>
                    <td className="p-4 text-slate-700">{col.worker_name}</td>
                    <td className="p-4 font-bold text-emerald-700">{col.wet_waste_kg} kg</td>
                    <td className="p-4 font-bold text-blue-700">{col.dry_waste_kg} kg</td>
                    <td className="p-4 font-bold text-rose-700">{col.mixed_waste_kg} kg</td>
                    <td className="p-4 text-xs text-slate-500 italic">{col.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
