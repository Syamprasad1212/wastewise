import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { User, ShieldAlert, HardHat, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchRole } = useAuth();
  const { language } = useLanguage();

  const [role, setRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email || `${role}@gramapanchayat.in`, role);
    setLoading(false);
    if (role === 'admin') onNavigate('admin');
    else if (role === 'worker') onNavigate('worker');
    else onNavigate('citizen');
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    switchRole(demoRole);
    if (demoRole === 'admin') onNavigate('admin');
    else if (demoRole === 'worker') onNavigate('worker');
    else onNavigate('citizen');
  };

  return (
    <div className="py-12 max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-lg space-y-6">
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900">
            {language === 'te' ? 'వేస్ట్‌వైజ్ లాగిన్' : 'WasteWise Portal Login'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'te' ? 'మీ ఖాతాలోకి ప్రవేశించండి' : 'Select your role and access your dashboard'}
          </p>
        </div>

        {/* Quick Evaluator One-Click Buttons */}
        <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl space-y-2">
          <span className="text-[11px] font-bold text-forest-800 uppercase block tracking-wider">
            ⚡ Quick 1-Click Demo Login
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleQuickDemo('citizen')}
              className="py-1.5 px-2 bg-white hover:bg-forest-100 text-slate-800 rounded-lg text-xs font-bold border border-forest-200 transition"
            >
              Citizen
            </button>
            <button
              onClick={() => handleQuickDemo('worker')}
              className="py-1.5 px-2 bg-white hover:bg-forest-100 text-slate-800 rounded-lg text-xs font-bold border border-forest-200 transition"
            >
              Worker
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-forest-100 text-slate-800 rounded-lg text-xs font-bold border border-forest-200 transition"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'మీ పాత్రను ఎంచుకోండి' : 'Select Your Role'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'citizen', labelEn: 'Citizen', icon: <User className="w-3.5 h-3.5" /> },
                { id: 'worker', labelEn: 'Worker', icon: <HardHat className="w-3.5 h-3.5" /> },
                { id: 'admin', labelEn: 'Admin', icon: <ShieldAlert className="w-3.5 h-3.5" /> }
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id as UserRole)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    role === r.id
                      ? 'border-forest-600 bg-forest-600 text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {r.icon}
                  <span>{r.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'ఇమెయిల్ లేదా ఫోన్' : 'Email Address or Mobile'}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${role}@gramapanchayat.in`}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Logging in...' : language === 'te' ? 'లాగిన్ అవ్వండి' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          <span>{language === 'te' ? 'కొత్త ఇంటి నమోదు కొరకా? ' : 'New household in the village? '}</span>
          <button
            onClick={() => onNavigate('register')}
            className="text-forest-700 font-bold hover:underline"
          >
            {language === 'te' ? 'ఇక్కడ నమోదు చేసుకోండి' : 'Register Household here'}
          </button>
        </div>

      </div>
    </div>
  );
};
