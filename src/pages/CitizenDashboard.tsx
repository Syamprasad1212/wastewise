import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { villageDataService } from '../lib/supabase';
import { WasteReport, WasteSchedule, WasteCategory, CitizenFeedback } from '../types';
import {
  LayoutDashboard,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Star,
  MapPin,
  Camera,
  Upload,
  User,
  Phone,
  FileText,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'report' | 'complaints' | 'schedule' | 'feedback'>('dashboard');
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [schedules, setSchedules] = useState<WasteSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for new complaint
  const [category, setCategory] = useState<WasteCategory>('mixed');
  const [wardNumber, setWardNumber] = useState(user?.village_ward || 'Ward 1');
  const [locationAddress, setLocationAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form states for feedback
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allReports, allSchedules] = await Promise.all([
      villageDataService.getReports(),
      villageDataService.getSchedules()
    ]);
    setReports(allReports);
    setSchedules(allSchedules);
    setLoading(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationAddress.trim() || !description.trim()) {
      alert(language === 'te' ? 'దయచేసి స్థలం మరియు వివరాలు నమోదు చేయండి.' : 'Please enter location and description.');
      return;
    }

    setSubmitting(true);
    try {
      await villageDataService.addReport({
        citizen_id: user?.id || 'cit-1',
        citizen_name: user?.full_name || 'Village Citizen',
        phone_number: user?.phone_number || '9848022331',
        category,
        description,
        ward_number: wardNumber,
        location_address: locationAddress,
        photo_url: photoPreview || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60',
        status: 'pending'
      });

      setSubmitSuccess(true);
      setDescription('');
      setLocationAddress('');
      setPhotoPreview('');
      await loadData();
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('complaints');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    await villageDataService.addFeedback({
      citizen_name: user?.full_name || 'Citizen',
      phone_number: user?.phone_number || '9848000000',
      ward_number: wardNumber,
      rating,
      comment: feedbackComment
    });

    setFeedbackSent(true);
    setFeedbackComment('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  const getStatusBadge = (status: WasteReport['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">⏳ {t('pending')}</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">👷 {t('assigned')}</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">🔄 {t('in_progress')}</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">✅ {t('resolved')}</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  const citizenTabs = [
    { id: 'dashboard', labelEn: 'Dashboard', labelTe: 'డాష్‌బోర్డు', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'report', labelEn: 'Report Garbage', labelTe: 'చెత్త సమస్య నివేదన', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'complaints', labelEn: `My Complaints (${reports.length})`, labelTe: `నా ఫిర్యాదులు (${reports.length})`, icon: <FileText className="w-4 h-4" /> },
    { id: 'schedule', labelEn: 'Collection Schedule', labelTe: 'సేకరణ సమయాలు', icon: <Calendar className="w-4 h-4" /> },
    { id: 'feedback', labelEn: 'Feedback', labelTe: 'అభిప్రాయం', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-700 to-forest-800 text-white rounded-3xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-forest-200 text-xs font-bold uppercase tracking-wider mb-1">
              <User className="w-4 h-4" />
              <span>{language === 'te' ? 'గ్రామస్థుల వేదిక' : 'Citizen Public Service Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'te' ? `స్వాగతం, ${user?.full_name}` : `Welcome, ${user?.full_name}`}
            </h1>
            <p className="text-forest-100 text-xs sm:text-sm mt-1">
              {language === 'te'
                ? `నమోదైన ప్రాంతం: ${user?.village_ward || 'Ward 1'} | మొబైల్: ${user?.phone_number || '9848022331'}`
                : `Registered Ward: ${user?.village_ward || 'Ward 1'} | Contact: ${user?.phone_number || '9848022331'}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('report')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow flex items-center gap-2 transition"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{language === 'te' ? 'చెత్త ఫిర్యాదు చేయండి' : 'Report Garbage Dump'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2">
        {citizenTabs.map((tab) => {
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

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {language === 'te' ? 'నా మొత్తం ఫిర్యాదులు' : 'My Total Reports'}
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{reports.length}</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {language === 'te' ? 'పరిష్కరించబడినవి' : 'Resolved Sites'}
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
                  {language === 'te' ? 'పరిశీలనలో ఉన్నవి' : 'Pending Review'}
                </span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {reports.filter(r => r.status === 'pending' || r.status === 'assigned').length}
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Next Collection Alert */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-forest-700 font-extrabold text-base">
                <Clock className="w-5 h-5" />
                <span>{language === 'te' ? 'తదుపరి చెత్త సేకరణ సమయం' : 'Upcoming Waste Collection'}</span>
              </div>
              <div className="p-4 bg-forest-50 rounded-xl border border-forest-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-forest-950 text-sm">
                    {user?.village_ward || 'Ward 1'} - Bazaar Area
                  </strong>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Daily Wet Waste
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  {language === 'te'
                    ? 'ఉదయం 06:30 AM నుండి 08:30 AM వరకు పంచాయతీ వాహనం వస్తుంది. తడి చెత్తను ఆకుపచ్చ బుట్టలో సిద్ధంగా ఉంచండి.'
                    : 'Collection vehicle arrives 06:30 AM - 08:30 AM. Keep kitchen wet waste in green bucket ready.'}
                </p>
                <div className="text-[11px] text-forest-800 font-semibold pt-1">
                  Sanitation Worker: <strong>Mallesh (మల్లేష్)</strong> | Vehicle: AP-26-TG-1044
                </div>
              </div>

              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
              >
                <span>{language === 'te' ? 'పూర్తి షెడ్యూల్ చూడండి' : 'View Full Village Schedule'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Grievance Action */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-extrabold text-base">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{language === 'te' ? 'చెత్త సమస్య ఉందా?' : 'Spotted a Garbage Dump?'}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'te'
                    ? 'గ్రామ పరిసరాలలో ఎవరైనా చెత్తను గుట్టలుగా పోసినా లేదా డ్రైనేజీ కాలువల్లో వేసినా వెంటనే ఫోటో తీసి నివేదించండి.'
                    : 'Report open roadside dumping or clogged drains directly. The Grama Panchayat will assign workers to resolve it.'}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('report')}
                className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'te' ? 'ఫోటోతో ఫిర్యాదు నమోదు చేయండి' : 'Report Garbage with Photo'}</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: REPORT GARBAGE COMPLAINT */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'te' ? 'చెత్త సమస్యను నివేదించండి' : 'Report Garbage Dump or Mixed Waste'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'ఫోటో తీసి పంచాయతీ పారిశుద్ధ్య విభాగానికి పంపండి' : 'Upload photo and location for fast Grama Panchayat resolution'}
              </p>
            </div>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                {language === 'te'
                  ? 'మీ ఫిర్యాదు విజయవంతంగా నమోదైంది! పంచాయతీ కార్మికుడికి కేటాయించబడుతుంది.'
                  : 'Grievance submitted successfully! Grama Panchayat worker has been alerted.'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitComplaint} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                {language === 'te' ? 'చెత్త రకం' : 'Waste Category'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mixed', labelEn: 'Mixed Waste', labelTe: 'మిశ్రమ చెత్త' },
                  { id: 'wet', labelEn: 'Overflowing Wet', labelTe: 'కుళ్ళిన తడి చెత్త' },
                  { id: 'dry', labelEn: 'Plastic/Dry Dump', labelTe: 'ప్లాస్టిక్ రాశి' },
                  { id: 'hazardous', labelEn: 'Pesticide/Hazard', labelTe: 'పురుగుమందులు' }
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id as WasteCategory)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      category === cat.id
                        ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {language === 'te' ? cat.labelTe : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Ward & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {language === 'te' ? 'గ్రామ వార్డు' : 'Village Ward'}
                </label>
                <select
                  value={wardNumber}
                  onChange={(e) => setWardNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-forest-600"
                >
                  <option value="Ward 1">Ward 1 (Bazaar Area / బజార్ వీధి)</option>
                  <option value="Ward 2">Ward 2 (Temple Street / గుడి వీధి)</option>
                  <option value="Ward 3">Ward 3 (School Zone / బడి వీధి)</option>
                  <option value="Ward 4">Ward 4 (Canal Road / కాలువ గట్టు)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {language === 'te' ? 'ఖచ్చితమైన స్థలం / గుర్తు' : 'Location Landmark / Street'}
                </label>
                <input
                  type="text"
                  required
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder={language === 'te' ? 'ఉదా: గుడి పక్కన హ్యాండ్‌పంప్ వద్ద' : 'e.g. Near old temple handpump, beside water tank'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-forest-600"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                {language === 'te' ? 'సమస్య వివరణ' : 'Complaint Description'}
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'te' ? 'చెత్త ఎంత సమయం నుండి పేరుకుపోయింది? వాసన లేదా కాలువ పూడిక ఉందా?' : 'How long has it been dumped? Is it causing bad odor or blocking the canal?'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-800 outline-none focus:border-forest-600"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                {language === 'te' ? 'చెత్త ఫోటో అప్‌లోడ్ చేయండి' : 'Upload Photograph of the Garbage'}
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition">
                  <Camera className="w-4 h-4 text-forest-600" />
                  <span>{language === 'te' ? 'ఫోటోను ఎంచుకోండి' : 'Choose / Capture Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoPreview ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-forest-500 shadow-sm">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview('')}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    {language === 'te' ? '(ఫోటో ద్వారా కార్మికులు స్థలాన్ని సులభంగా గుర్తిస్తారు)' : '(Photographs speed up dispatch and resolution)'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition text-base flex items-center justify-center gap-2 pt-3"
            >
              <Upload className="w-4 h-4" />
              <span>
                {submitting
                  ? (language === 'te' ? 'నమోదు అవుతోంది...' : 'Submitting Grievance...')
                  : (language === 'te' ? 'ఫిర్యాదును సమర్పించండి' : 'Submit Grievance to Panchayat')}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MY COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'te' ? 'నా ఫిర్యాదుల స్థితి' : 'Track My Submitted Complaints'}
              </h2>
              <p className="text-xs text-slate-500">
                Live resolution status with before and after photographs verified by sanitation workers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('report')}
              className="bg-forest-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl"
            >
              + {language === 'te' ? 'కొత్త ఫిర్యాదు' : 'New Complaint'}
            </button>
          </div>

          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-white text-slate-700 px-2.5 py-1 rounded-md border">
                      {rep.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 capitalize">
                      {rep.category} Dump in {rep.ward_number}
                    </h3>
                  </div>
                  {getStatusBadge(rep.status)}
                </div>

                <p className="text-xs sm:text-sm text-slate-700">
                  {rep.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rep.location_address}</span>
                </div>

                {/* Photo comparisons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {rep.photo_url && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Uploaded Photo:</span>
                      <div className="w-20 h-20 rounded-xl overflow-hidden border">
                        <img src={rep.photo_url} alt="Grievance" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {rep.completion_photo_url && (
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block mb-1">Cleaned Proof:</span>
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-emerald-500">
                        <img src={rep.completion_photo_url} alt="Cleaned" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {rep.assigned_worker_name && (
                  <div className="text-xs bg-blue-50 text-blue-900 p-2.5 rounded-xl font-medium">
                    👷 Sanitation Worker Assigned: <strong>{rep.assigned_worker_name}</strong>
                    {rep.completion_notes && (
                      <div className="text-emerald-800 text-[11px] mt-0.5">
                        Clean-up Notes: "{rep.completion_notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COLLECTION SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'te' ? 'గ్రామ వార్డుల చెత్త సేకరణ సమయాలు' : 'Ward Waste Collection Schedule'}
            </h2>
            <p className="text-xs text-slate-500">
              Door-to-door morning vehicle schedules for all village wards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-forest-900 text-base">
                    {sch.ward_number} - {language === 'te' ? sch.ward_name_te : sch.ward_name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-forest-100 text-forest-800">
                    {sch.waste_types.join(' & ')} Waste
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-4 h-4 text-forest-600" />
                  <span>{language === 'te' ? sch.day_of_week_te : sch.day_of_week}: <strong>{sch.collection_time}</strong></span>
                </div>
                <div className="text-slate-600 pt-1 border-t border-slate-200">
                  Worker: <strong>{sch.worker_name}</strong> | Vehicle: <span className="font-mono">{sch.vehicle_number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'te' ? 'పంచాయతీకి మీ అభిప్రాయం & రేటింగ్' : 'Citizen Cleanliness Feedback & Rating'}
            </h2>
            <p className="text-xs text-slate-500">
              Help your Grama Panchayat improve daily waste collection and village cleanliness.
            </p>
          </div>

          {feedbackSent && (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{language === 'te' ? 'మీ విలువైన అభిప్రాయానికి ధన్యవాదాలు!' : 'Thank you for your rating and feedback!'}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {language === 'te' ? 'మీ వార్డు పారిశుద్ధ్య సేవల రేటింగ్:' : 'Rate the sanitation service in your ward:'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-slate-700 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {language === 'te' ? 'మీ సలహా లేదా అనుభవం:' : 'Your Suggestions or Comments:'}
              </label>
              <textarea
                rows={3}
                required
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: కార్మికులు ఉదయం సమయానికి వస్తున్నారు...' : 'e.g. Morning collection pushcart came on time, polite behavior...'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-forest-600"
              />
            </div>

            <button
              type="submit"
              className="bg-forest-600 hover:bg-forest-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow"
            >
              {language === 'te' ? 'అభిప్రాయం సమర్పించండి' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
