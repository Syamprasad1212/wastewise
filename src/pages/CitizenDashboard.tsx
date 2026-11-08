import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { villageDataService } from '../lib/supabase';
import { WasteReport, WasteSchedule, WasteCategory, CitizenFeedback } from '../types';
import {
  AlertTriangle,
  Upload,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Star,
  MapPin,
  Camera,
  Image as ImageIcon,
  User,
  Phone
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

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
        citizen_id: user?.id || 'cit-guest',
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
      setTimeout(() => setSubmitSuccess(false), 5000);
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

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Citizen Welcome Card */}
      <div className="bg-gradient-to-r from-forest-700 to-forest-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-forest-200 text-xs font-bold uppercase tracking-wider mb-1">
              <User className="w-4 h-4" />
              <span>{language === 'te' ? 'గ్రామస్థుల పోర్టల్' : 'Citizen Public Service Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'te' ? `స్వాగతం, ${user?.full_name || 'గ్రామస్థులు'}` : `Welcome, ${user?.full_name || 'Citizen'}`}
            </h1>
            <p className="text-forest-100 text-sm mt-1">
              {language === 'te'
                ? `మీ ప్రాంతం: ${user?.village_ward || 'Ward 1'} | ఫోన్: ${user?.phone_number || '9848022331'}`
                : `Assigned Ward: ${user?.village_ward || 'Ward 1'} | Helpline: 1800-425-9278`}
            </p>
          </div>

          <div className="bg-forest-900/60 p-3 rounded-xl border border-forest-600 text-center">
            <span className="text-xs text-forest-200 font-semibold block">
              {language === 'te' ? 'నా ఫిర్యాదులు' : 'My Complaints'}
            </span>
            <span className="text-2xl font-black text-white">{reports.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: File New Complaint Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
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

              {/* Ward Selection */}
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

              {/* Photo Upload with live preview */}
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
                      {language === 'te' ? '(ఫోటో ద్వారా వేగంగా పరిష్కారం లభిస్తుంది)' : '(Photos help workers locate and resolve quickly)'}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition text-base flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {submitting
                      ? (language === 'te' ? 'నమోదు అవుతోంది...' : 'Submitting Grievance...')
                      : (language === 'te' ? 'ఫిర్యాదును సమర్పించండి' : 'Submit Grievance to Panchayat')}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Citizen Feedback Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-forest-600" />
              <h3 className="font-bold text-slate-900 text-lg">
                {language === 'te' ? 'పంచాయతీకి మీ అభిప్రాయం' : 'Citizen Feedback & Rating'}
              </h3>
            </div>

            {feedbackSent && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                {language === 'te' ? 'మీ అభిప్రాయానికి ధన్యవాదాలు!' : 'Thank you for your rating and feedback!'}
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {language === 'te' ? 'మీ ప్రాంత పారిశుద్ధ్య సేవల రేటింగ్:' : 'Rate sanitation cleanliness in your ward:'}
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
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder={language === 'te' ? 'మీ అభిప్రాయాన్ని రాయండి (ఉదా: కార్మికులు సమయానికి వస్తున్నారు)...' : 'Share your comments (e.g. morning vehicle came on time, polite worker)...'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-forest-600"
                />
              </div>

              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                {language === 'te' ? 'అభిప్రాయం పంపండి' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Collection Schedules & Track Existing Reports */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Ward Collection Timings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-forest-600" />
              <h3 className="font-bold text-slate-900 text-lg">
                {language === 'te' ? 'మీ వార్డు చెత్త సేకరణ సమయాలు' : 'Ward Collection Schedule'}
              </h3>
            </div>

            <div className="space-y-3">
              {schedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-forest-900">
                      {sch.ward_number} - {language === 'te' ? sch.ward_name_te : sch.ward_name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-forest-100 text-forest-800">
                      {sch.waste_types.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'te' ? sch.day_of_week_te : sch.day_of_week}: <strong>{sch.collection_time}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === 'te' ? 'కార్మికుడు: ' : 'Worker: '}
                    <strong>{sch.worker_name}</strong> ({sch.vehicle_number})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grievance Tracking List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">
                {language === 'te' ? 'ఫిర్యాదుల స్థితి' : 'Track Grievances'}
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                {reports.length} {language === 'te' ? 'మొత్తం' : 'Total'}
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 block">{rep.id}</span>
                      <h4 className="text-sm font-bold text-slate-900 capitalize mt-0.5">
                        {rep.category} Dump - {rep.ward_number}
                      </h4>
                    </div>
                    {getStatusBadge(rep.status)}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {rep.description}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{rep.location_address}</span>
                  </div>

                  {/* Photo comparison if resolved */}
                  {rep.photo_url && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border">
                        <img src={rep.photo_url} alt="Complaint" className="w-full h-full object-cover" />
                      </div>
                      {rep.completion_photo_url && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-600">→ Cleaned:</span>
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-500">
                            <img src={rep.completion_photo_url} alt="Cleaned" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {rep.assigned_worker_name && (
                    <div className="text-[11px] bg-blue-50 text-blue-900 p-2 rounded-lg font-medium">
                      👷 Assigned to: <strong>{rep.assigned_worker_name}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
