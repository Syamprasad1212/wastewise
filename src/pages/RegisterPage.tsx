import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 1');
  const [role, setRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    await register(name, email || `${phone}@citizen.in`, phone, role, ward);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      if (role === 'admin') onNavigate('admin');
      else if (role === 'worker') onNavigate('worker');
      else onNavigate('citizen');
    }, 1200);
  };

  return (
    <div className="py-12 max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-lg space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {language === 'te' ? 'గ్రామ నివాసి నమోదు' : 'Household Registration'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'te' ? 'పంచాయతీ చెత్త సేకరణ సేవలను పొందండి' : 'Enroll in daily waste collection and grievance tracking'}
          </p>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'te' ? 'నమోదు పూర్తయింది! పోర్టల్‌లోకి తీసుకెళ్తున్నాము...' : 'Registration successful! Redirecting to portal...'}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'పూర్తి పేరు' : 'Full Name (Head of Household)'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Reddy"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'మొబైల్ ఫోన్ నంబర్' : 'Mobile Phone Number'}
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9848022331"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'గ్రామ వార్డు' : 'Village Ward'}
            </label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-forest-600 font-semibold"
            >
              <option value="Ward 1">Ward 1 (Bazaar Area / బజార్ వీధి)</option>
              <option value="Ward 2">Ward 2 (Temple Street / గుడి వీధి)</option>
              <option value="Ward 3">Ward 3 (School Zone / బడి వీధి)</option>
              <option value="Ward 4">Ward 4 (Canal Road / కాలువ గట్టు)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'పాత్ర' : 'Account Type'}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-forest-600 font-semibold"
            >
              <option value="citizen">Citizen (గ్రామస్థుడు)</option>
              <option value="worker">Sanitation Worker (పారిశుద్ధ్య కార్మికుడు)</option>
              <option value="admin">Panchayat Administrator (పంచాయతీ కార్యాలయం)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'te' ? 'ఇమెయిల్ (ఐచ్ఛికం)' : 'Email Address (Optional)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@village.in"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating...' : language === 'te' ? 'నమోదు చేసుకోండి' : 'Register Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          <span>{language === 'te' ? 'ఇప్పటికే ఖాతా ఉందా? ' : 'Already have an account? '}</span>
          <button
            onClick={() => onNavigate('login')}
            className="text-forest-700 font-bold hover:underline"
          >
            {language === 'te' ? 'లాగిన్ అవ్వండి' : 'Sign In here'}
          </button>
        </div>

      </div>
    </div>
  );
};
