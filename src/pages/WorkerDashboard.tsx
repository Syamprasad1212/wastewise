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
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [selectedTask, setSelectedTask] = useState<WasteReport | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState('');
  const [resolving, setResolving] = useState(false);

  // Mixed waste report modal
  const [showMixedReporter, setShowMixedReporter] = useState(false);
  const [mixedHouseNo, setMixedHouseNo] = useState('');
  const [mixedWard, setMixedWard] = useState('Ward 1');
  const [mixedNotes, setMixedNotes] = useState('');
  const [mixedReportSuccess, setMixedReportSuccess] = useState(false);

  // Daily Waste Quantity Logger state
  const [showDailyLogger, setShowDailyLogger] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logWard, setLogWard] = useState('Ward 1');
  const [logWetKg, setLogWetKg] = useState<number>(180);
  const [logDryKg, setLogDryKg] = useState<number>(95);
  const [logMixedKg, setLogMixedKg] = useState<number>(15);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  useEffect(() => {
    loadWorkerTasks();
  }, [user]);

  const loadWorkerTasks = async () => {
    setLoading(true);
    const all = await villageDataService.getReports();
    // Filter tasks assigned to this worker, or show pending tasks if none assigned
    const workerTasks = all.filter(
      r => r.assigned_worker_id === user?.id ||
           r.assigned_worker_name?.toLowerCase().includes('mallesh') ||
           r.status === 'assigned' ||
           r.status === 'in_progress'
    );
    setReports(workerTasks.length > 0 ? workerTasks : all);
    setLoading(false);
  };

  const handleUpdateStatus = async (reportId: string, status: WasteReport['status']) => {
    await villageDataService.updateReport(reportId, { status });
    await loadWorkerTasks();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    await villageDataService.updateReport(selectedTask.id, {
      status: 'resolved',
      completion_notes: completionNotes || 'Cleaned and sanitized by sanitation team.',
      completion_photo_url: completionPhoto || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60'
    });

    setResolving(false);
    setSelectedTask(null);
    setCompletionNotes('');
    setCompletionPhoto('');
    await loadWorkerTasks();
  };

  const handleLogDailyCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    await villageDataService.addCollection({
      date: logDate,
      ward_number: logWard,
      worker_id: user?.id || 'worker-1',
      worker_name: user?.full_name?.split(' ')[0] || 'Mallesh',
      wet_waste_kg: Number(logWetKg),
      dry_waste_kg: Number(logDryKg),
      mixed_waste_kg: Number(logMixedKg),
      notes: logNotes
    });

    setLogSuccess(true);
    setTimeout(() => {
      setLogSuccess(false);
      setShowDailyLogger(false);
    }, 2500);
  };

  const handleReportMixedWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    await villageDataService.addReport({
      citizen_id: 'auto-reported',
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
      setShowMixedReporter(false);
      setMixedHouseNo('');
      setMixedNotes('');
    }, 2500);
    await loadWorkerTasks();
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Card */}
      <div className="bg-forest-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-forest-200 text-xs font-bold uppercase tracking-wider mb-1">
              <HardHat className="w-4 h-4" />
              <span>{language === 'te' ? 'పారిశుద్ధ్య కార్మికుల డ్యాష్‌బోర్డు' : 'Sanitation Worker Operational Console'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'te' ? `నమస్కారం, ${user?.full_name}` : `Namaste, ${user?.full_name}`}
            </h1>
            <p className="text-forest-100 text-sm mt-1">
              {language === 'te' ? 'నేటి మార్గం: వార్డు 1 & 2 | ఉదయం 06:30 నుండి సేకరణ' : 'Assigned Route: Ward 1 & 2 | Morning Doorstep Collection'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowDailyLogger(!showDailyLogger)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition"
            >
              <Scale className="w-4 h-4" />
              <span>{language === 'te' ? 'నేటి చెత్త తూకం నమోదు' : 'Log Daily Waste (Kg)'}</span>
            </button>

            <button
              onClick={() => setShowMixedReporter(!showMixedReporter)}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{language === 'te' ? 'మిశ్రమ చెత్త నోటీస్' : 'Report Mixed Waste'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Waste Logger Modal / Section */}
      {showDailyLogger && (
        <div className="bg-emerald-50 border-2 border-emerald-500 p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-800" />
              <h3 className="font-extrabold text-emerald-950 text-lg">
                {language === 'te' ? 'రోజువారీ సేకరించిన చెత్త పరిమాణం (కేజీలలో)' : 'Record Daily Waste Quantities Collected'}
              </h3>
            </div>
            <button
              onClick={() => setShowDailyLogger(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          {logSuccess && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'te' ? 'నేటి రికార్డు విజయవంతంగా నమోదైంది!' : 'Daily collection record saved to village registry!'}</span>
            </div>
          )}

          <form onSubmit={handleLogDailyCollection} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ward</label>
              <select
                value={logWard}
                onChange={(e) => setLogWard(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
              >
                <option value="Ward 1">Ward 1 (Bazaar)</option>
                <option value="Ward 2">Ward 2 (Temple)</option>
                <option value="Ward 3">Ward 3 (School)</option>
                <option value="Ward 4">Ward 4 (Canal)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-emerald-800 block mb-1">🌱 Wet Waste (kg)</label>
              <input
                type="number"
                required
                min={0}
                value={logWetKg}
                onChange={(e) => setLogWetKg(Number(e.target.value))}
                className="w-full bg-white border border-emerald-400 rounded-lg p-2 text-xs font-bold"
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
                className="w-full bg-white border border-blue-400 rounded-lg p-2 text-xs font-bold"
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
                className="w-full bg-white border border-rose-400 rounded-lg p-2 text-xs font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Observations / Segregation Notes</label>
              <input
                type="text"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="e.g. 95% households gave segregated wet buckets today"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 rounded-lg text-xs"
              >
                Save Daily Log
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mixed Waste Reporter Modal */}
      {showMixedReporter && (
        <div className="bg-rose-50 border-2 border-rose-500 p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-700" />
              <h3 className="font-extrabold text-rose-950 text-lg">
                {language === 'te' ? 'మిశ్రమ చెత్త రిపోర్టింగ్ (నియమ ఉల్లంఘన)' : 'Report Non-Segregated Mixed Household Waste'}
              </h3>
            </div>
            <button
              onClick={() => setShowMixedReporter(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          {mixedReportSuccess && (
            <div className="p-3 bg-rose-600 text-white rounded-xl text-xs font-bold">
              {language === 'te' ? 'నోటీస్ పంచాయతీ కార్యాలయానికి పంపబడింది!' : 'Incident reported to Panchayat Secretary for counseling.'}
            </div>
          )}

          <form onSubmit={handleReportMixedWaste} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Household Door No</label>
              <input
                type="text"
                required
                value={mixedHouseNo}
                onChange={(e) => setMixedHouseNo(e.target.value)}
                placeholder="e.g. 2-14/B"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ward</label>
              <select
                value={mixedWard}
                onChange={(e) => setMixedWard(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
              >
                <option value="Ward 1">Ward 1</option>
                <option value="Ward 2">Ward 2</option>
                <option value="Ward 3">Ward 3</option>
                <option value="Ward 4">Ward 4</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Incident Details</label>
              <input
                type="text"
                required
                value={mixedNotes}
                onChange={(e) => setMixedNotes(e.target.value)}
                placeholder="e.g. Plastic mixed in wet food scraps"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-6 py-2 rounded-lg text-xs"
              >
                Submit Incident to Panchayat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assigned Tasks & Complaints List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {language === 'te' ? 'కేటాయించిన పనులు & ఫిర్యాదులు' : 'My Assigned Clean-up Tasks'}
            </h3>
            <p className="text-xs text-slate-500">
              Update task status in real time and upload completion photograph to notify the citizen.
            </p>
          </div>
          <span className="text-xs font-bold bg-forest-100 text-forest-800 px-3 py-1 rounded-full">
            {reports.length} {language === 'te' ? 'పనులు' : 'Tasks Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((task) => (
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
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    task.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                    task.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 capitalize">
                  {task.category} Dump in {task.ward_number}
                </h4>

                <p className="text-xs text-slate-600">
                  {task.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-white p-2 rounded-lg border border-slate-200">
                  <MapPin className="w-4 h-4 text-forest-600 flex-shrink-0" />
                  <span className="line-clamp-1">{task.location_address}</span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Citizen: <strong>{task.citizen_name}</strong> | Phone: <a href={`tel:${task.phone_number}`} className="text-forest-700 underline font-mono">{task.phone_number}</a>
                </div>

                {/* Citizen Photo */}
                {task.photo_url && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Citizen photo:</span>
                    <div className="w-full h-32 rounded-xl overflow-hidden border">
                      <img src={task.photo_url} alt="Waste dump" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Resolved Photo if done */}
                {task.completion_photo_url && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 block mb-1">Cleaned Photo Proof:</span>
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-emerald-500">
                      <img src={task.completion_photo_url} alt="Cleaned" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                {task.status !== 'resolved' ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        task.status === 'in_progress'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {task.status === 'in_progress' ? 'Working Now...' : 'Start Cleaning'}
                    </button>

                    <button
                      onClick={() => setSelectedTask(task)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'పూర్తయింది (ఫోటో అప్‌లోడ్)' : 'Mark Cleaned & Upload Proof'}</span>
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
          ))}
        </div>
      </div>

      {/* Completion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {language === 'te' ? 'పని పూర్తయిన రుజువు (ఫోటో)' : 'Upload Cleaning Completion Proof'}
              </h4>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕ Close
              </button>
            </div>

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
