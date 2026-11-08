import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { speakText } from '../../lib/speech';
import { Search, AlertTriangle, Calendar, Volume2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { villageDataService, isSupabaseConfigured } from '../../lib/supabase';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    households: 0,
    compostKg: 0,
    resolvedPct: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [households, composts, reports] = await Promise.all([
          villageDataService.getHouseholds(),
          villageDataService.getCompost(),
          villageDataService.getReports()
        ]);

        const totalCompost = composts.reduce((sum, c) => sum + (c.compost_produced_kg || 0), 0);
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const pct = reports.length > 0 ? Math.round((resolved / reports.length) * 100) : 100;

        setStats({
          households: households.length,
          compostKg: totalCompost,
          resolvedPct: pct
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleVoiceIntroduction = () => {
    const text = language === 'te'
      ? 'వేస్ట్‌వైజ్ గ్రామ చెత్త నిర్వహణ వ్యవస్థకు స్వాగతం. మీ ఇంటి తడి చెత్తను ఆకుపచ్చ డబ్బాలో, పొడి చెత్తను నీలి డబ్బాలో వేయండి. సమస్యలు ఉంటే ఫోటో తీసి పంచాయతీకి తెలియజేయండి.'
      : 'Welcome to WasteWise Village Waste Management System. Segregate wet kitchen waste in the green bin and dry recyclable items in the blue bin. Report roadside garbage dumps directly to our Grama Panchayat.';
    speakText(text, language);
  };

  const handleReportClick = () => {
    if (user && user.role === 'citizen') {
      onNavigate('citizen');
    } else if (user) {
      onNavigate(user.role);
    } else {
      onNavigate('login');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-forest-50 via-white to-slate-50 py-10 lg:py-14 border-b border-forest-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100 border border-forest-200 text-forest-800 text-xs sm:text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-ping"></span>
              <span>{language === 'te' ? 'గ్రామ పంచాయతీ పరిశుభ్రతా సంకల్పం' : 'Grama Panchayat Swachh Village Initiative'}</span>
              <button
                onClick={handleVoiceIntroduction}
                className="ml-1 p-1 hover:bg-forest-200 rounded-full transition text-forest-800"
                title="Listen in Telugu or English"
              >
                <Volume2 className="w-4 h-4 text-forest-700" />
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {t('heroSubtitle')}
            </p>

            {/* Visual Value Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{language === 'te' ? 'తడి చెత్త నుండి నాణ్యమైన కంపోస్ట్ ఎరువు' : 'Wet waste turned into organic farm compost'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{language === 'te' ? 'డ్రైనేజీ పూడిక & విషపు పొగలకు అడ్డుకట్ట' : 'Prevents clogged drains and open burning'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{language === 'te' ? 'పారిశుద్ధ్య కార్మికులకు గౌరవం & భద్రత' : 'Protects dignity of sanitation workers'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{language === 'te' ? 'ఫోటోతో ఫిర్యాదుల తక్షణ పరిష్కారం' : 'Fast photographic grievance redressal'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('guide')}
                className="flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md shadow-forest-200 transition group text-base"
              >
                <Search className="w-5 h-5" />
                <span>{t('heroCTA1')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={handleReportClick}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md shadow-amber-100 transition text-base"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>{t('heroCTA2')}</span>
              </button>

              <button
                onClick={() => {
                  if (user) {
                    onNavigate(user.role);
                  } else {
                    onNavigate('login');
                  }
                }}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-3.5 rounded-xl border border-slate-300 shadow-sm transition text-base"
              >
                <Calendar className="w-5 h-5 text-forest-600" />
                <span>{language === 'te' ? 'సేకరణ సమయాలు' : 'Collection Schedule'}</span>
              </button>
            </div>
          </div>

          {/* 2-Bin Household Segregation Guide Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                  {language === 'te' ? 'ఇంటి వద్ద 2 డబ్బాల సూత్రం' : 'The 2-Bin Household Rule'}
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {language === 'te' ? 'తప్పనిసరి' : 'Mandatory'}
                </span>
              </div>

              {/* Wet Bin Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow">
                  🌱
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-base">
                    {language === 'te' ? 'ఆకుపచ్చ డబ్బా (తడి చెత్త)' : 'Green Bin (Wet / Organic)'}
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-900 mt-0.5">
                    {language === 'te'
                      ? 'కూరగాయలు, అరటి తొక్కలు, ఎండిన ఆకులు, మిగిలిన ఆహారం. ప్లాస్టిక్ లేదా కవర్లు వేయకండి!'
                      : 'Vegetable scraps, fruit peels, leftover rice, tea powder. No plastic bags!'}
                  </p>
                </div>
              </div>

              {/* Dry Bin Card */}
              <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-500/40 flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow">
                  📦
                </div>
                <div>
                  <h4 className="font-bold text-blue-950 text-base">
                    {language === 'te' ? 'నీలి డబ్బా (పొడి చెత్త)' : 'Blue Bin (Dry / Recyclable)'}
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-900 mt-0.5">
                    {language === 'te'
                      ? 'ప్లాస్టిక్ సీసాలు, పాల ప్యాకెట్లు, పేపర్లు, అట్టపెట్టెలు, గాజు, రేకులు. పొడిగా ఉంచండి.'
                      : 'Plastic bottles, milk bags, newspapers, cardboard boxes, glass, tins. Keep dry.'}
                  </p>
                </div>
              </div>

              {/* Data Accuracy Counters */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <span>
                    {isSupabaseConfigured
                      ? (language === 'te' ? 'లైవ్ పంచాయతీ రికార్డులు' : 'Live Panchayat Database')
                      : (language === 'te' ? 'నమూనా డెమో గణాంకాలు' : 'Sample Prototype Data')}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {isSupabaseConfigured ? 'Connected' : 'Demo Mode'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-lg font-black text-forest-700">{stats.households}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {language === 'te' ? 'నమోదైన ఇళ్లు' : 'Enrolled Houses'}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-lg font-black text-emerald-700">{stats.compostKg} kg</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {language === 'te' ? 'కంపోస్ట్ ఎరువు' : 'Compost Ready'}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-lg font-black text-blue-700">{stats.resolvedPct}%</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {language === 'te' ? 'పరిష్కారం' : 'Resolution Rate'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
