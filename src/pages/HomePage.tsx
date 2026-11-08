import React from 'react';
import { Hero } from '../components/public/Hero';
import { ProblemExplainer } from '../components/public/ProblemExplainer';
import { WasteSegregationGuide } from '../components/public/WasteSegregationGuide';
import { HowItWorks } from '../components/public/HowItWorks';
import { AwarenessQuiz } from '../components/public/AwarenessQuiz';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Recycle, ShieldAlert, Award } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-0">
      {/* 1. Hero */}
      <Hero onNavigate={onNavigate} />

      {/* 2. Visual Problem Explainer */}
      <ProblemExplainer />

      {/* 3. Color Coded Segregation Guide */}
      <WasteSegregationGuide />

      {/* 4. How It Works */}
      <HowItWorks />

      {/* 5. Awareness Quiz Preview Section */}
      <section className="py-14 bg-emerald-50/50 border-t border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
              {language === 'te' ? 'గ్రామ పరిజ్ఞానం' : 'Interactive Learning'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {language === 'te' ? 'చెత్త వర్గీకరణ క్విజ్ ఆడండి' : 'Test Your Segregation Skills'}
            </h2>
          </div>
          <AwarenessQuiz />
        </div>
      </section>

      {/* 6. Quick Call to Action Banner */}
      <section className="bg-forest-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black">
            {language === 'te' ? 'మన ఊరుని స్వచ్ఛ గ్రామంగా మారుద్దాం!' : 'Join Hands for a Clean & Green Village'}
          </h2>
          <p className="text-forest-200 text-sm sm:text-base max-w-2xl mx-auto">
            {language === 'te'
              ? 'మీ ఇంట్లోనే తడి మరియు పొడి చెత్తను వేరు చేయండి. ఏవైనా సమస్యలు ఉంటే వెంటనే పంచాయతీకి తెలపండి.'
              : 'Segregate daily, report roadside dumping, and help turn village waste into gold standard organic compost.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('citizen')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-xl transition text-sm shadow"
            >
              {language === 'te' ? 'గ్రామస్థుల వేదికను తెరవండి' : 'Open Citizen Portal'}
            </button>
            <button
              onClick={() => onNavigate('guide')}
              className="bg-forest-800 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-xl border border-forest-600 transition text-sm"
            >
              {language === 'te' ? 'చెత్త రకాల గైడ్' : 'Waste Lookup Database'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
