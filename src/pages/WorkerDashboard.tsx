import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { villageDataService } from '../lib/supabase';
import { WasteReport, CollectionRecord } from '../types';
import {
  HardHat,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  AlertTriangle,
  Scale,
  Plus,
  Phone,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'daily' | 'mixed'>('dashboard');
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [selectedTask, setSelectedTask] = useState<WasteReport | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState('');
  const [completionPhotoFile, setCompletionPhotoFile] = useState<File | null>(null);
  const [resolving, setResolving] = useState(false);
  const [taskError, setTaskError] = useState('');

  // Mixed waste report state
  const [mixedHouseNo, setMixedHouseNo] = useState('');
  const [mixedWard, setMixedWard] = useState('Ward 1');
  const [mixedNotes, setMixedNotes] = useState('');
  const [mixedReportSuccess, setMixedReportSuccess] = useState(false);
  const [mixedError, setMixedError] = useState('');

  // Daily Waste Quantity Logger state
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logWard, setLogWard] = useState('Ward 1');
  const [logWetKg, setLogWetKg] = useState<number>(180);
  const [logDryKg, setLogDryKg] = useState<number>(95);
  const [logMixedKg, setLogMixedKg] = useState<number>(15);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);
  const [dailyError, setDailyError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [submittingDaily, setSubmittingDaily] = useState(false);

  useEffect(() => {
    loadWorkerTasks();
  }, [user]);

  const loadWorkerTasks = async () => {
    setLoading(true);
    try {
      const all = await villageDataService.getReports();
      const workerTasks = all.filter(
        r => r.assigned_worker_id === user?.id ||
             r.assigned_worker_name?.toLowerCase().includes('mallesh') ||
             r.status === 'assigned' ||
             r.status === 'in_progress'
      );
      setReports(workerTasks.length > 0 ? workerTasks : all);
    } catch (err: any) {
      console.error('Error loading worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: WasteReport['status']) => {
    setUpdatingStatusId(reportId);
    try {
      await villageDataService.updateWorkerTask(reportId, status);
      await loadWorkerTasks();
    } catch (err: any) {
      alert(`Could not update task: ${err.message || err}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompletionPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResolveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setResolving(true);
    setTaskError('');
    try {
      let finalPhoto = completionPhoto;
      if (completionPhotoFile && user?.id) {
        try {
          finalPhoto = await villageDataService.uploadWastePhoto(completionPhotoFile, user.id);
        } catch (photoErr: any) {
          console.warn('Storage upload error, using preview:', photoErr);
        }
      }

      await villageDataService.updateWorkerTask(
        selectedTask.id,
        'resolved',
        completionNotes || 'Cleaned and sanitized by sanitation team.',
        finalPhoto || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60'
      );

      setSelectedTask(null);
      setCompletionNotes('');
      setCompletionPhoto('');
      setCompletionPhotoFile(null);
      await loadWorkerTasks();
    } catch (err: any) {
      setTaskError(err.message || 'Failed to resolve task.');
    } finally {
      setResolving(false);
    }
  };

  const handleLogDailyCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setDailyError('');
    setSubmittingDaily(true);
    try {
      await villageDataService.addCollection({
        date: logDate,
        ward_number: logWard,
        worker_id: user?.id || '00000000-0000-0000-0000-000000000002',
        worker_name: user?.full_name?.split(' ')[0] || 'Mallesh',
        wet_waste_kg: Number(logWetKg),
        dry_waste_kg: Number(logDryKg),
        mixed_waste_kg: Number(logMixedKg),
        notes: logNotes
      });

      setLogSuccess(true);
      setTimeout(() => {
        setLogSuccess(false);
        setActiveTab('dashboard');
      }, 2000);
    } catch (err: any) {
      setDailyError(err.message || 'Failed to save daily collection.');
    } finally {
      setSubmittingDaily(false);
    }
  };

  const handleReportMixedWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    setMixedError('');
    try {
      await villageDataService.addReport({
        citizen_id: user?.id || '00000000-0000-0000-0000-000000000002',
        citizen_name: `Incident at House ${mixedHouseNo}`,
        phone_number: 'Panchayat Notice',
        category: 'mixed',
        description: `Sanitation Worker reported household failed to segregate waste: ${mixedNotes}`,
        ward_number: mixedWard,
        location_address: `Door No ${mixedHouseNo}, ${mixedWard}`,
        status: 'pending'
      });

      setMixedReportSuccess(true);
      setTimeout(() => {
        setMixedReportSuccess(false);
        setMixedHouseNo('');
        setMixedNotes('');
        setActiveTab('tasks');
      }, 2000);
      await loadWorkerTasks();
    } catch (err: any) {
      setMixedError(err.message || 'Failed to submit mixed waste notice.');
    }
  };

  const workerTabs = [
    { id: 'dashboard', labelEn: 'Dashboard', labelTe: 'డాష్‌బోర్డు', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', labelEn: `Assigned Tasks (${reports.length})`, labelTe: `కేటాయించిన పనులు (${reports.length})`, icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'daily', labelEn: 'Daily Collection', labelTe: 'రోజువారీ తూకం', icon: <Scale className="w-4 h-4" /> },
    { id: 'mixed', labelEn: 'Report Mixed Waste', labelTe: 'మిశ్రమ చెత్త నోటీస్', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  const pendingTasksCount = reports.filter(r => r.status !== 'resolved').length;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-forest-800 text-white rounded-3xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-forest-200 text-xs font-bold uppercase tracking-wider mb-1">
              <HardHat className="w-4 h-4" />
              <span>{language === 'te' ? 'పారిశుద్ధ్య కార్మికుల పోర్టల్' : 'Sanitation Worker Operational Console'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'te' ? `నమస్కారం, ${user?.full_name}` : `Namaste, ${user?.full_name}`}
            </h1>
            <p className="text-forest-100 text-xs sm:text-sm mt-1">
              {language === 'te' ? 'మార్గాలు: వార్డు 1 & 2 | ఉదయం 06:30 నుండి డోర్-టు-డోర్ సేకరణ' : 'Assigned Routes: Ward 1 & 2 | Morning Doorstep Collection'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-forest-900/60 px-3.5 py-2 rounded-xl text-xs font-bold border border-forest-600">
              {pendingTasksCount} {language === 'te' ? 'పెండింగ్ పనులు' : 'Pending Tasks'}
            </span>
          </div>
        </div>
      </div>

      {/* Role-Specific Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2">
        {workerTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-forest-600 text-forest-800 bg-forest-50/70 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-t-xl'
              }`}
            >
              {tab.icon}
              <span>{language === 'te' ? tab.labelTe : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WORKER DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {language === 'te' ? 'కేటాయించిన పనులు' : 'Active Tasks'}
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{reports.length}</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {language === 'te' ? 'నేడు శుభ్రం చేసినవి' : 'Cleaned & Resolved'}
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {reports.filter(r => r.status === 'resolved').length}
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {language === 'te' ? 'తక్షణ చర్యలు' : 'Pending Action'}
                </span>
                <div className="text-2xl font-black text-amber-600 mt-1">{pendingTasksCount}</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">
                {language === 'te' ? 'త్వరిత చర్యలు' : 'Quick Operational Actions'}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('daily')}
                  className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-left transition flex items-center justify-between"
                >
                  <div>
                    <strong className="text-emerald-950 text-sm block">
                      {language === 'te' ? 'నేటి చెత్త తూకం నమోదు చేయండి' : 'Log Daily Waste Weight (Kg)'}
                    </strong>
                    <span className="text-xs text-emerald-800">
                      {language === 'te' ? 'తడి, పొడి మరియు మిశ్రమ చెత్త పరిమాణం' : 'Record wet, dry and mixed waste kilograms'}
                    </span>
                  </div>
                  <Scale className="w-5 h-5 text-emerald-700" />
                </button>

                <button
                  onClick={() => setActiveTab('mixed')}
                  className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-left transition flex items-center justify-between"
                >
                  <div>
                    <strong className="text-rose-950 text-sm block">
                      {language === 'te' ? 'మిశ్రమ చెత్త నోటీస్ నివేదించండి' : 'Report Non-Segregated House'}
                    </strong>
                    <span className="text-xs text-rose-800">
                      {language === 'te' ? 'నియమం పాటించని ఇంటి నంబరు పంచాయతీకి పంపండి' : 'Alert Panchayat Secretary for household counseling'}
                    </span>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">
                  {language === 'te' ? 'పారిశుద్ధ్య మార్గదర్శకాలు' : 'Daily Safety & Field Guide'}
                </h3>
                <ul className="text-xs text-slate-600 space-y-2 mt-3">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Wear rubber gloves and safety boots before handling bins.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Separate sharp glass or medical items immediately into marked boxes.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Always capture a clear photograph after cleaning a reported waste dump.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveTab('tasks')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                {language === 'te' ? 'పనుల జాబితాకు వెళ్ళండి' : 'Go to Assigned Task List'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'te' ? 'కేటాయించిన పారిశుద్ధ్య పనులు' : 'Assigned Clean-up Grievances'}
            </h2>
            <p className="text-xs text-slate-500">
              Update status from 'in_progress' to 'resolved' and attach completion photos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">
                  {language === 'te' ? 'కేటాయించిన పనులు లేవు' : 'No Cleaning Tasks Assigned'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {language === 'te'
                    ? 'ప్రస్తుతం మీ పరిధిలో ఎలాంటి పెండింగ్ పనులు లేవు. అన్ని ఫిర్యాదులు పరిష్కరించబడ్డాయి!'
                    : 'All reported grievances in your ward are currently resolved. Check back when new complaints are assigned.'}
                </p>
              </div>
            ) : (
              reports.map((task) => (
              <div
                key={task.id}
                className={`rounded-2xl border-2 p-5 flex flex-col justify-between transition ${
                  task.status === 'resolved'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {task.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      task.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      task.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 capitalize">
                    {task.category} Dump in {task.ward_number}
                  </h3>

                  <p className="text-xs text-slate-600">{task.description}</p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-white p-2.5 rounded-xl border border-slate-200">
                    <MapPin className="w-4 h-4 text-forest-600 flex-shrink-0" />
                    <span className="line-clamp-1">{task.location_address}</span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Citizen: <strong>{task.citizen_name}</strong> | Phone: <a href={`tel:${task.phone_number}`} className="text-forest-700 underline font-mono">{task.phone_number}</a>
                  </div>

                  {task.photo_url && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Citizen photo:</span>
                      <div className="w-full h-32 rounded-xl overflow-hidden border">
                        <img src={task.photo_url} alt="Waste dump" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {task.completion_photo_url && (
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block mb-1">Cleaned Photo Proof:</span>
                      <div className="w-full h-32 rounded-xl overflow-hidden border border-emerald-500">
                        <img src={task.completion_photo_url} alt="Cleaned" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  {task.status !== 'resolved' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                        disabled={task.status === 'in_progress' || updatingStatusId === task.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                          task.status === 'in_progress'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50'
                        }`}
                      >
                        {updatingStatusId === task.id && (
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                        )}
                        <span>{task.status === 'in_progress' ? 'Working Now...' : 'Start Cleaning'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedTask(task)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'te' ? 'పూర్తయింది (ఫోటో అప్‌లోడ్)' : 'Mark Cleaned & Proof'}</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cleaned & Verified</span>
                    </div>
                  )}
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY WASTE COLLECTION LOGGER */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'te' ? 'రోజువారీ చెత్త సేకరణ తూకం నమోదు' : 'Record Daily Waste Collection Weight (Kg)'}
            </h2>
            <p className="text-xs text-slate-500">
              Enter daily quantities delivered to the village vermicompost and recycling yard.
            </p>
          </div>

          {logSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{language === 'te' ? 'నేటి రికార్డు విజయవంతంగా నమోదైంది!' : 'Daily collection record saved to village registry!'}</span>
            </div>
          )}

          {dailyError && (
            <div className="p-4 bg-rose-50 text-rose-800 border border-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{dailyError}</span>
            </div>
          )}

          <form onSubmit={handleLogDailyCollection} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ward Number</label>
                <select
                  value={logWard}
                  onChange={(e) => setLogWard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="Ward 1">Ward 1 (Bazaar Area)</option>
                  <option value="Ward 2">Ward 2 (Temple Street)</option>
                  <option value="Ward 3">Ward 3 (School Zone)</option>
                  <option value="Ward 4">Ward 4 (Canal Road)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-emerald-800 block mb-1">🌱 Wet Waste (kg)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={logWetKg}
                  onChange={(e) => setLogWetKg(Number(e.target.value))}
                  className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-sm font-bold text-emerald-950"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-blue-800 block mb-1">📦 Dry Waste (kg)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={logDryKg}
                  onChange={(e) => setLogDryKg(Number(e.target.value))}
                  className="w-full bg-blue-50 border border-blue-300 rounded-xl p-2.5 text-sm font-bold text-blue-950"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-rose-800 block mb-1">⚠️ Mixed Waste (kg)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={logMixedKg}
                  onChange={(e) => setLogMixedKg(Number(e.target.value))}
                  className="w-full bg-rose-50 border border-rose-300 rounded-xl p-2.5 text-sm font-bold text-rose-950"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Observations / Notes</label>
              <textarea
                rows={2}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="e.g. 95% compliance in Bazaar area today"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={submittingDaily}
              className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow transition flex items-center justify-center gap-2"
            >
              {submittingDaily && (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>
                {submittingDaily
                  ? (language === 'te' ? 'సేవ్ అవుతోంది...' : 'Saving Record...')
                  : (language === 'te' ? 'తూకం సేవ్ చేయండి' : 'Save Daily Collection Entry')}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: REPORT MIXED WASTE INCIDENT */}
      {activeTab === 'mixed' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'te' ? 'మిశ్రమ చెత్త నోటీస్ నివేదన' : 'Report Household Mixing Dry & Wet Waste'}
            </h2>
            <p className="text-xs text-slate-500">
              Notifies Panchayat Secretary so ward councilors can conduct doorstep counseling.
            </p>
          </div>

          {mixedReportSuccess && (
            <div className="p-4 bg-rose-50 text-rose-900 border border-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-rose-600" />
              <span>{language === 'te' ? 'నోటీస్ పంచాయతీ కార్యాలయానికి పంపబడింది!' : 'Incident reported to Panchayat Secretary!'}</span>
            </div>
          )}

          {mixedError && (
            <div className="p-4 bg-rose-50 text-rose-800 border border-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{mixedError}</span>
            </div>
          )}

          <form onSubmit={handleReportMixedWaste} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Household Door Number</label>
              <input
                type="text"
                required
                value={mixedHouseNo}
                onChange={(e) => setMixedHouseNo(e.target.value)}
                placeholder="e.g. 2-14/B"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ward Number</label>
              <select
                value={mixedWard}
                onChange={(e) => setMixedWard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="Ward 1">Ward 1</option>
                <option value="Ward 2">Ward 2</option>
                <option value="Ward 3">Ward 3</option>
                <option value="Ward 4">Ward 4</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Violation Details</label>
              <textarea
                rows={3}
                required
                value={mixedNotes}
                onChange={(e) => setMixedNotes(e.target.value)}
                placeholder="e.g. Household mixed plastic bottles and plastic wrappers inside wet organic bucket"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-3 rounded-xl text-xs shadow transition"
            >
              {language === 'te' ? 'పంచాయతీకి నివేదించండి' : 'Submit Mixed Waste Report'}
            </button>
          </form>
        </div>
      )}

      {/* Completion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {language === 'te' ? 'పని పూర్తయిన రుజువు (ఫోటో)' : 'Upload Cleaning Completion Proof'}
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕ Close
              </button>
            </div>

            {taskError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{taskError}</span>
              </div>
            )}

            <form onSubmit={handleResolveTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'te' ? 'పరిశుభ్రం చేసిన ఫోటో' : 'Photograph of Cleaned Site'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-forest-600" />
                    <span>Capture Cleaned Site</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {completionPhoto && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500">
                      <img src={completionPhoto} alt="Cleaned" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'te' ? 'పని వివరాలు / ముగింపు నోట్స్' : 'Completion Remarks'}
                </label>
                <input
                  type="text"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Waste cleared, bleaching powder spread to disinfect"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl text-xs shadow"
                >
                  {resolving ? 'Submitting...' : 'Confirm Cleaned'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
