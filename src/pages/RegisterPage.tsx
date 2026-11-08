import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserPlus, ArrowRight, CheckCircle2, AlertCircle, Lock, Mail, Phone, MapPin, User } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { registerCitizen } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 1');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage(
        language === 'te'
          ? 'దయచేసి అన్ని వివరాలు నమోదు చేయండి.'
          : 'Please enter all required fields.'
      );
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await registerCitizen(name, email, phone, ward, password);

    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onNavigate('citizen');
    }, 1200);
  };

  return (
    <div className="py-12 max-w-md mx-auto px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            {language === 'te' ? 'గ్రామస్థుల నమోదు' : 'Citizen Household Registration'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            {language === 'te' ? 'కొత్త ఖాతా సృష్టించండి' : 'Enroll Your Household'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'te'
              ? 'గ్రామ పంచాయతీ చెత్త సేకరణ సేవలను పొందేందుకు నమోదు చేసుకోండి'
              : 'Sign up to report garbage dumps and receive doorstep collection updates'}
          </p>
        </div>

        {/* Security Notice: Public registration is for citizens only */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
          ℹ️ {language === 'te'
            ? 'ఈ నమోదు గ్రామ ప్రజలకు మాత్రమే. పారిశుద్ధ్య కార్మికులు & అడ్మిన్ ఖాతాలు పంచాయతీ కార్యాలయం ద్వారా కేటాయించబడతాయి.'
            : 'This registration is for village citizens. Sanitation worker & admin accounts are authorized directly by the Panchayat.'}
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'te'
                ? 'నమోదు పూర్తయింది! గ్రామస్థుల డాష్‌బోర్డుకు తీసుకెళ్తున్నాము...'
                : 'Registration successful! Opening Citizen Dashboard...'}
            </span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'పూర్తి పేరు (ఇంటి పెద్ద)' : 'Full Name (Head of Household)'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Reddy"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-forest-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'ఇమెయిల్ చిరునామా' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@village.in"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-forest-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'మొబైల్ ఫోన్ నంబర్' : 'Mobile Phone Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9848022331"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-forest-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'గ్రామ వార్డు' : 'Village Ward'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-forest-600 focus:bg-white font-semibold transition"
              >
                <option value="Ward 1">Ward 1 (Bazaar Area / బజార్ వీధి)</option>
                <option value="Ward 2">Ward 2 (Temple Street / గుడి వీధి)</option>
                <option value="Ward 3">Ward 3 (School Zone / బడి వీధి)</option>
                <option value="Ward 4">Ward 4 (Canal Road / కాలువ గట్టు)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
            </label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating...' : language === 'te' ? 'ఖాతా సృష్టించండి' : 'Complete Citizen Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span>{language === 'te' ? 'ఇప్పటికే ఖాతా ఉందా? ' : 'Already registered? '}</span>
          <button
            onClick={() => onNavigate('login')}
            className="text-forest-700 font-bold hover:underline"
          >
            {language === 'te' ? 'ఇక్కడ లాగిన్ అవ్వండి' : 'Sign In to Portal'}
          </button>
        </div>

      </div>
    </div>
  );
};
