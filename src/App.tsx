import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
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
import { ShieldAlert, HardHat, Lock, ArrowRight, UserCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { user, role, switchRole } = useAuth();
  const { language } = useLanguage();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Role Protection check
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'guide':
        return <WasteGuidePage />;
      case 'awareness':
        return <AwarenessPage />;
      case 'citizen':
        return <CitizenDashboard />;
      case 'admin':
        if (role !== 'admin') {
          return (
            <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'పంచాయతీ అడ్మిన్ అనుమతి అవసరం' : 'Panchayat Admin Permission Required'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? 'ఈ పేజీ సర్పంచ్ మరియు పంచాయతీ కార్యదర్శికి మాత్రమే పరిమితం. డెమో కోసం ఒక క్లిక్‌తో అడ్మిన్‌గా లాగిన్ అవ్వండి.'
                  : 'This dashboard is reserved for Grama Panchayat administrators. Click below to view with Admin credentials.'}
              </p>
              <button
                onClick={() => switchRole('admin')}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow"
              >
                {language === 'te' ? 'అడ్మిన్‌గా ప్రవేశించండి' : 'Switch to Panchayat Admin View'}
              </button>
            </div>
          );
        }
        return <AdminDashboard />;
      case 'worker':
        if (role !== 'worker' && role !== 'admin') {
          return (
            <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <HardHat className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {language === 'te' ? 'పారిశుద్ధ్య కార్మికుల అనుమతి అవసరం' : 'Sanitation Worker Portal'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'te'
                  ? 'ఈ డ్యాష్‌బోర్డు పారిశుద్ధ్య మిత్రుల కోసం రూపొందించబడింది. డెమో కోసం వర్కర్‌గా మారండి.'
                  : 'This dashboard is reserved for sanitation workers. Click below to test with Worker credentials.'}
              </p>
              <button
                onClick={() => switchRole('worker')}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow"
              >
                {language === 'te' ? 'కార్మికుడిగా ప్రవేశించండి' : 'Switch to Sanitation Worker View'}
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
