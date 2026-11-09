import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { WasteGuidePage } from './pages/WasteGuidePage';
import { AwarenessPage } from './pages/AwarenessPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Lock, ShieldAlert, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { user, role, isLoading, authNotice, clearAuthNotice } = useAuth();
  const { language } = useLanguage();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If email confirmation succeeds upon callback, open citizen dashboard automatically
  useEffect(() => {
    if (authNotice?.type === 'success' && user?.role && (currentPage === 'home' || currentPage === 'login')) {
      setCurrentPage(user.role);
    }
  }, [authNotice, user]);

  // Secure Role Protection & Route Guarding
  const renderPage = () => {
    if (isLoading && ['citizen', 'admin', 'worker'].includes(currentPage)) {
      return (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-forest-600 border-t-transparent"></div>
          <p className="text-xs text-slate-500 font-semibold">
            {language === 'te' ? 'రుజువులను ధృవీకరిస్తోంది...' : 'Verifying secure session credentials...'}
          </p>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'guide':
        return <WasteGuidePage />;
      case 'awareness':
        return <AwarenessPage />;
      case 'citizen':
        if (!user) {
          return (
            <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'లాగిన్ అవసరం' : 'Citizen Sign In Required'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? 'గ్రామస్థుల పోర్టల్ మరియు ఫిర్యాదుల ట్రాకింగ్ కోసం దయచేసి లాగిన్ అవ్వండి.'
                  : 'Please sign in with your citizen account to submit grievances and track collection schedules.'}
              </p>
              <button
                onClick={() => handleNavigate('login')}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow"
              >
                {language === 'te' ? 'లాగిన్ పేజీకి వెళ్ళండి' : 'Go to Login Page'}
              </button>
            </div>
          );
        }
        if (role !== 'citizen') {
          return (
            <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'గ్రామస్థుల ఖాతా కాదు' : 'Citizen Account Only'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? `మీరు '${role}' గా లాగిన్ అయి ఉన్నారు. దయచేసి మీ డాష్‌బోర్డును తెరవండి.`
                  : `You are currently signed in as '${role}'. Please use your designated dashboard.`}
              </p>
              <button
                onClick={() => handleNavigate(role || 'home')}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow"
              >
                {language === 'te' ? 'నా డాష్‌బోర్డుకు వెళ్ళండి' : 'Go to My Dashboard'}
              </button>
            </div>
          );
        }
        return <CitizenDashboard />;

      case 'admin':
        if (!user) {
          return (
            <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'అధికారిక లాగిన్ అవసరం' : 'Administrator Sign In Required'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? 'పంచాయతీ కార్యాలయ కన్సోల్‌ను వీక్షించడానికి అధీకృత అడ్మిన్ ఖాతాతో లాగిన్ అవ్వండి.'
                  : 'Please sign in with authorized Panchayat Administrator credentials.'}
              </p>
              <button
                onClick={() => handleNavigate('login')}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow"
              >
                {language === 'te' ? 'అడ్మిన్ లాగిన్ పేజీ' : 'Go to Admin Login'}
              </button>
            </div>
          );
        }
        if (role !== 'admin') {
          return (
            <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'అనుమతి నిరాకరించబడింది' : 'Access Denied: Unauthorized'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? 'ఈ పేజీ సర్పంచ్ మరియు పంచాయతీ కార్యదర్శికి మాత్రమే పరిమితం. మీ ఖాతాకు అడ్మిన్ అనుమతులు లేవు.'
                  : 'This console is strictly restricted to Panchayat Administrators. Your account does not have administrative permissions.'}
              </p>
              <button
                onClick={() => handleNavigate(role || 'home')}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'te' ? 'నా పోర్టల్‌కు తిరిగి వెళ్ళండి' : 'Return to My Portal'}</span>
              </button>
            </div>
          );
        }
        return <AdminDashboard />;

      case 'worker':
        if (!user) {
          return (
            <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'పారిశుద్ధ్య లాగిన్ అవసరం' : 'Sanitation Worker Sign In Required'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? 'పనులను చూడటానికి మరియు చెత్త తూకం నమోదు చేయడానికి కార్మికుల లాగిన్ చేయండి.'
                  : 'Please sign in with your authorized Sanitation Worker credentials.'}
              </p>
              <button
                onClick={() => handleNavigate('login')}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow"
              >
                {language === 'te' ? 'లాగిన్ పేజీకి వెళ్ళండి' : 'Go to Worker Login'}
              </button>
            </div>
          );
        }
        if (role !== 'worker' && role !== 'admin') {
          return (
            <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'కార్మికుల అనుమతి అవసరం' : 'Access Denied: Worker Area'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? 'ఈ డ్యాష్‌బోర్డు పారిశుద్ధ్య మిత్రుల కోసం మాత్రమే కేటాయించబడింది.'
                  : 'This console is reserved exclusively for registered village sanitation workers.'}
              </p>
              <button
                onClick={() => handleNavigate(role || 'home')}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'te' ? 'నా పోర్టల్‌కు తిరిగి వెళ్ళండి' : 'Return to My Portal'}</span>
              </button>
            </div>
          );
        }
        return <WorkerDashboard />;

      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Global Authentication / Verification Notice Banner */}
      {authNotice && (
        <div
          role="alert"
          className={`border-b px-4 py-3 text-xs sm:text-sm font-semibold transition ${
            authNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {authNotice.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <span>{authNotice.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {authNotice.type === 'error' && currentPage !== 'login' && (
                <button
                  onClick={() => {
                    handleNavigate('login');
                    clearAuthNotice();
                  }}
                  className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-3 py-1 rounded-lg transition"
                >
                  Go to Login
                </button>
              )}
              {authNotice.type === 'success' && user && currentPage !== user.role && (
                <button
                  onClick={() => handleNavigate(user.role)}
                  className="bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-3 py-1 rounded-lg transition"
                >
                  Open Dashboard
                </button>
              )}
              <button
                onClick={clearAuthNotice}
                aria-label="Dismiss notification"
                className="text-xs text-slate-500 hover:text-slate-800 font-bold px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
};

export default App;
