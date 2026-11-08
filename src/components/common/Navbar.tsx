import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import {
  Recycle,
  Eye,
  Menu,
  X,
  Volume2,
  VolumeX,
  User,
  LogOut,
  ShieldAlert,
  HardHat,
  Home,
  LayoutDashboard
} from 'lucide-react';
import { speakText, stopSpeech } from '../../lib/speech';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isSimpleMode, toggleSimpleMode, voiceEnabled, toggleVoice } = useAccessibility();
  const { user, role, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  // Public Links always visible
  const publicLinks = [
    { id: 'home', label: t('navHome'), icon: <Home className="w-4 h-4" /> },
    { id: 'guide', label: t('navGuide'), icon: <Recycle className="w-4 h-4" /> },
    { id: 'awareness', label: t('navAwareness'), icon: <ShieldAlert className="w-4 h-4" /> }
  ];

  // Role dashboard target
  const getDashboardTarget = () => {
    if (role === 'admin') return { id: 'admin', label: language === 'te' ? 'పంచాయతీ అడ్మిన్' : 'Panchayat Admin' };
    if (role === 'worker') return { id: 'worker', label: language === 'te' ? 'పారిశుద్ధ్య డాష్‌బోర్డు' : 'Worker Dashboard' };
    return { id: 'citizen', label: language === 'te' ? 'నా డాష్‌బోర్డు' : 'Citizen Dashboard' };
  };

  const dashboardTarget = user ? getDashboardTarget() : null;

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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => {
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

            {/* Authenticated user's dedicated dashboard link */}
            {user && dashboardTarget && (
              <button
                onClick={() => onNavigate(dashboardTarget.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition ml-2 ${
                  currentPage === dashboardTarget.id
                    ? 'bg-forest-600 text-white shadow'
                    : 'bg-forest-50 text-forest-800 hover:bg-forest-100 border border-forest-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {dashboardTarget.label}
              </button>
            )}
          </nav>

          {/* Right Action: Login button if logged out, or Account Menu & Logout if authenticated */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{user.full_name}</div>
                  <div className="text-[10px] uppercase font-bold text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded inline-block">
                    {user.role === 'admin' ? 'Panchayat Admin' : user.role === 'worker' ? 'Sanitation Worker' : 'Citizen'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 transition"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-forest-600 hover:bg-forest-700 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-sm transition"
              >
                {t('navLogin')}
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {publicLinks.map((link) => (
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

          {/* If authenticated, show their dashboard link */}
          {user && dashboardTarget && (
            <button
              onClick={() => {
                onNavigate(dashboardTarget.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-bold text-left ${
                currentPage === dashboardTarget.id
                  ? 'bg-forest-600 text-white'
                  : 'bg-forest-50 text-forest-900 border border-forest-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              {dashboardTarget.label}
            </button>
          )}

          {/* Mobile Auth action */}
          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-3">
                <div className="px-2">
                  <div className="text-sm font-bold text-slate-800">{user.full_name}</div>
                  <div className="text-xs text-forest-700 font-semibold uppercase">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-forest-600 text-white font-bold py-2.5 rounded-xl text-center text-sm"
              >
                {t('navLogin')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
