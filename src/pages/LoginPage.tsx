import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { User, HardHat, ShieldAlert, ArrowRight, Lock, Mail, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, authNotice, clearAuthNotice } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleTabChange = (newTab: UserRole) => {
    setActiveTab(newTab);
    setErrorMessage('');
    clearAuthNotice();
    setEmail('');
    setPassword('');
  };

  const handlePrefillDemo = () => {
    if (activeTab === 'citizen') {
      setEmail('citizen@gramapanchayat.in');
      setPassword('Demo@123');
    } else if (activeTab === 'worker') {
      setEmail('worker@gramapanchayat.in');
      setPassword('Demo@123');
    } else {
      setEmail('admin@gramapanchayat.in');
      setPassword('Demo@123');
    }
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage(
        language === 'te'
          ? 'దయచేసి ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.'
          : 'Please enter your registered email and password.'
      );
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const result = await login(email, password, activeTab);

    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      return;
    }

    // Role-based redirection
    if (result.role === 'admin') {
      onNavigate('admin');
    } else if (result.role === 'worker') {
      onNavigate('worker');
    } else {
      onNavigate('citizen');
    }
  };

  const tabs: { id: UserRole; labelEn: string; labelTe: string; icon: React.ReactNode }[] = [
    {
      id: 'citizen',
      labelEn: 'Citizen',
      labelTe: 'గ్రామస్థుడు',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'worker',
      labelEn: 'Sanitation Worker',
      labelTe: 'పారిశుద్ధ్య కార్మికుడు',
      icon: <HardHat className="w-5 h-5" />
    },
    {
      id: 'admin',
      labelEn: 'Panchayat Admin',
      labelTe: 'పంచాయతీ అడ్మిన్',
      icon: <ShieldAlert className="w-5 h-5" />
    }
  ];

  return (
    <div className="py-12 max-w-lg mx-auto px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            {language === 'te' ? 'కేంద్రీకృత లాగిన్' : 'Unified Public Service Login'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {language === 'te' ? 'వేస్ట్‌వైజ్ పోర్టల్ లాగిన్' : 'WasteWise Portal Login'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'te'
              ? 'మీ ఖాతా రకాన్ని ఎంచుకుని అధికారిక ఆధారాలతో ప్రవేశించండి'
              : 'Select your account role and sign in with authorized credentials'}
          </p>
        </div>

        {/* 3 Selectable Account Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-forest-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.icon}
                <span className="line-clamp-1">{language === 'te' ? tab.labelTe : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Role Description Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
          <span>
            {activeTab === 'citizen' && (
              language === 'te'
                ? 'గ్రామస్థుల వేదిక: చెత్త సమస్యలను నివేదించండి, సేకరణ సమయాలు మరియు స్థితిని చూడండి.'
                : 'Citizen Portal: Report waste dumps, view doorstep collection schedules, and track grievance resolution.'
            )}
            {activeTab === 'worker' && (
              language === 'te'
                ? 'పారిశుద్ధ్య మిత్రులు: మీకు కేటాయించిన పనులను చూడండి, రోజువారీ తూకం నమోదు చేయండి.'
                : 'Sanitation Worker Portal: Access assigned cleaning routes, upload completion proofs, and log daily collection weights.'
            )}
            {activeTab === 'admin' && (
              language === 'te'
                ? 'పంచాయతీ కార్యాలయం: సర్పంచ్ మరియు కార్యదర్శుల కోసం గ్రామ పారిశుద్ధ్య పర్యవేక్షణ.'
                : 'Panchayat Administrative Console: Official portal for Sarpanch and Panchayat Secretary to manage village sanitation.'
            )}
          </span>
        </div>

        {/* Error Alert */}
        {(errorMessage || (authNotice?.type === 'error' && !errorMessage)) && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage || authNotice?.message}</span>
          </div>
        )}

        {/* Success Alert (e.g. Email verified) */}
        {!errorMessage && authNotice?.type === 'success' && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{authNotice.message}</span>
          </div>
        )}

        {/* Dynamic Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {activeTab === 'citizen'
                ? (language === 'te' ? 'ఇమెయిల్ చిరునామా' : 'Email Address')
                : (language === 'te' ? 'నమోదైన అధికారిక ఇమెయిల్' : 'Registered Official Email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  activeTab === 'citizen'
                    ? 'citizen@gramapanchayat.in'
                    : activeTab === 'worker'
                    ? 'worker@gramapanchayat.in'
                    : 'admin@gramapanchayat.in'
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-forest-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
              </label>
              {activeTab === 'citizen' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-forest-700 hover:underline"
                >
                  {language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-forest-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {loading
                ? (language === 'te' ? 'ధృవీకరిస్తోంది...' : 'Verifying credentials...')
                : activeTab === 'citizen'
                ? (language === 'te' ? 'గ్రామస్థుల లాగిన్' : 'Citizen Sign In')
                : activeTab === 'worker'
                ? (language === 'te' ? 'కార్మికుల లాగిన్' : 'Sanitation Worker Sign In')
                : (language === 'te' ? 'అడ్మిన్ లాగిన్' : 'Panchayat Admin Sign In')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Citizen Register Link (Only on Citizen Tab) */}
        {activeTab === 'citizen' && (
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            <span>{language === 'te' ? 'గ్రామంలో కొత్త ఇల్లా? ' : 'New household in the village? '}</span>
            <button
              onClick={() => onNavigate('register')}
              className="text-forest-700 font-bold hover:underline"
            >
              {language === 'te' ? 'ఇంటి నమోదు ఇక్కడ చేయండి' : 'Create Citizen Account'}
            </button>
          </div>
        )}

        {/* Worker & Admin Provisioning Notice */}
        {(activeTab === 'worker' || activeTab === 'admin') && (
          <div className="text-center pt-2 text-[11px] text-slate-500 border-t border-slate-100 leading-relaxed">
            ℹ️ {language === 'te'
              ? 'పారిశుద్ధ్య కార్మికులు మరియు అడ్మిన్ ఖాతాలు పంచాయతీ కార్యాలయం ద్వారా మాత్రమే సృష్టించబడతాయి.'
              : 'Sanitation worker & administrator accounts are provisioned exclusively by the Grama Panchayat office.'}
          </div>
        )}

        {/* Quick Demo Pre-fill Pill (Evaluator Aid) */}
        <div className="p-3 bg-forest-50/70 border border-forest-200/80 rounded-xl flex items-center justify-between text-xs">
          <div className="text-forest-900 font-medium">
            <span className="font-bold">Test Account: </span>
            <span className="font-mono">{activeTab}@gramapanchayat.in</span>
            <span className="text-slate-500 ml-2 font-normal">(Password: Demo@123)</span>
          </div>
          <button
            type="button"
            onClick={handlePrefillDemo}
            className="bg-white hover:bg-forest-100 text-forest-800 font-bold px-2.5 py-1 rounded-lg border border-forest-300 text-[11px] transition"
          >
            Fill Demo
          </button>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">
              {language === 'te' ? 'పాస్‌వర్డ్ సహాయం' : 'Password Reset Assistance'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'te'
                ? 'గ్రామస్థుల పాస్‌వర్డ్ రీసెట్ కోసం మీ నమోదైన మొబైల్ నంబర్‌తో గ్రామ పంచాయతీ కార్యాలయాన్ని సంప్రదించండి లేదా హెల్ప్‌లైన్ 1800-425-9278 కి కాల్ చేయండి.'
                : 'For citizen account password recovery, please visit the Grama Panchayat office with your registered mobile phone or contact the toll-free village helpline at 1800-425-9278.'}
            </p>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowForgotModal(false)}
                className="bg-forest-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                {language === 'te' ? 'సరే' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
