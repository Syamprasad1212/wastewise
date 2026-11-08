import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import {
  Recycle,
  Languages,
  Eye,
  Menu,
  X,
  Volume2,
  VolumeX,
  User,
  LogOut,
  ShieldAlert,
  HardHat,
  Home
} from 'lucide-react';
import { speakText, stopSpeech } from '../../lib/speech';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isSimpleMode, toggleSimpleMode, voiceEnabled, toggleVoice } = useAccessibility();
  const { user, role, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSpeechToggle = () => {
    toggleVoice();
    if (!voiceEnabled) {
      const msg = language === 'te' 
        ? 'వేస్ట్‌వైజ్ వాయిస్ అసిస్టెంట్ ఆన్ చేయబడింది'
        : 'WasteWise voice assistant enabled';
      speakText(msg, language);
    } else {
      stopSpeech();
    }
  };

  const navLinks = [
    { id: 'home', label: t('navHome'), icon: <Home className="w-4 h-4" /> },
    { id: 'guide', label: t('navGuide'), icon: <Recycle className="w-4 h-4" /> },
    { id: 'awareness', label: t('navAwareness'), icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'citizen', label: t('navCitizenPortal'), icon: <User className="w-4 h-4" /> },
    { id: 'admin', label: t('navAdminDashboard'), icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'worker', label: t('navWorkerDashboard'), icon: <HardHat className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-emerald-100 shadow-sm">
      {/* Top Utility Bar for Village Accessibility & Language */}
      <div className="bg-forest-800 text-white text-xs sm:text-sm px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium tracking-wide">
            {language === 'te' ? '🌾 స్వచ్ఛ భారత్ - గ్రామీణ | మన గ్రామం - మన పరిశుభ్రత' : '🌾 Swachh Bharat Gramin | Grama Panchayat Clean Village Mission'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Simple Mode Toggle */}
          <button
            onClick={toggleSimpleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
              isSimpleMode
                ? 'bg-yellow-400 text-slate-900 shadow'
                : 'bg-forest-900/60 hover:bg-forest-700 text-white'
            }`}
            title="Toggle Large Text and Visual Mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isSimpleMode ? (language === 'te' ? 'సాధారణ సైజు' : 'Normal View') : t('accessibilityMode')}</span>
          </button>

          {/* Voice Assistance Button */}
          <button
            onClick={handleSpeechToggle}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
              voiceEnabled ? 'bg-emerald-400 text-slate-950' : 'bg-forest-900/60 hover:bg-forest-700 text-white'
            }`}
            title="Voice Assistance"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{language === 'te' ? 'వాయిస్' : 'Voice Help'}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-forest-900 rounded overflow-hidden p-0.5 border border-forest-600">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                language === 'en' ? 'bg-white text-forest-900' : 'text-forest-100 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                language === 'te' ? 'bg-white text-forest-900' : 'text-forest-100 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-md shadow-forest-200 group-hover:scale-105 transition">
              <Recycle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black text-forest-900 tracking-tight flex items-center gap-1">
                WasteWise <span className="text-forest-600 text-xs px-1.5 py-0.5 bg-forest-100 rounded-md">గ్రామీణ</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                {language === 'te' ? 'గ్రామ చెత్త సేకరణ & కంపోస్ట్ వ్యవస్థ' : 'Village Waste Segregation & Management'}
              </p>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-forest-100 text-forest-800 shadow-sm'
                      : 'text-slate-600 hover:text-forest-700 hover:bg-slate-100'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* User Role Quick Switcher & Auth */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{user.full_name.split(' ')[0]}</div>
                  <div className="text-[10px] uppercase font-bold text-forest-700 bg-forest-50 px-1 rounded">
                    {user.role}
                  </div>
                </div>

                {/* Quick Role Toggle for review */}
                <select
                  value={role || 'citizen'}
                  onChange={(e) => {
                    const newRole = e.target.value as any;
                    switchRole(newRole);
                    if (newRole === 'admin') onNavigate('admin');
                    else if (newRole === 'worker') onNavigate('worker');
                    else onNavigate('citizen');
                  }}
                  className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-1 font-medium text-slate-700 cursor-pointer focus:ring-1 focus:ring-forest-500"
                  title="Switch Role Preview"
                >
                  <option value="citizen">Role: Citizen</option>
                  <option value="worker">Role: Worker</option>
                  <option value="admin">Role: Admin</option>
                </select>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                {t('navLogin')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-left ${
                currentPage === link.id
                  ? 'bg-forest-100 text-forest-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}

          {/* Role switcher inside mobile menu */}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">
              {language === 'te' ? 'డెమో పాత్రను ఎంచుకోండి:' : 'Switch Demo User Role:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  switchRole('citizen');
                  onNavigate('citizen');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs font-bold rounded ${
                  role === 'citizen' ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => {
                  switchRole('worker');
                  onNavigate('worker');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs font-bold rounded ${
                  role === 'worker' ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Worker
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs font-bold rounded ${
                  role === 'admin' ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
