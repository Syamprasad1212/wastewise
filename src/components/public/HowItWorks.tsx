import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Truck, Sprout, Award } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { language } = useLanguage();

  const steps = [
    {
      step: '01',
      titleEn: 'Segregate at Home',
      titleTe: 'ఇంటి వద్దే వేరు చేయడం',
      descEn: 'Keep wet kitchen scraps in green bucket and dry items in blue bucket. Never mix plastics with organic waste.',
      descTe: 'వంటగది తడి వ్యర్థాలను ఆకుపచ్చ బుట్టలో, ప్లాస్టిక్ కాగితాలను నీలి బుట్టలో విడివిడిగా ఉంచండి.',
      icon: <Home className="w-6 h-6 text-emerald-600" />
    },
    {
      step: '02',
      titleEn: 'Doorstep Collection',
      titleTe: 'ఇంటి వద్ద పంచాయతీ సేకరణ',
      descEn: 'Panchayat sanitation vehicle arrives on scheduled morning time. Hand over bins separately to the worker.',
      descTe: 'పంచాయతీ రిక్షా లేదా ఆటో ఉదయం సమయానికి వస్తుంది. రెండు డబ్బాలను విడివిడిగా కార్మికులకు ఇవ్వండి.',
      icon: <Truck className="w-6 h-6 text-blue-600" />
    },
    {
      step: '03',
      titleEn: 'Village Composting Yard',
      titleTe: 'గ్రామ వర్మీకంపోస్ట్ కేంద్రం',
      descEn: 'Wet waste goes into aerobic compost pits. In 30 days it converts into black organic manure.',
      descTe: 'సేకరించిన తడి చెత్తను కంపోస్ట్ గుంతల్లో వేసి 30 రోజుల్లో నాణ్యమైన సేంద్రీయ ఎరువుగా తయారుచేస్తారు.',
      icon: <Sprout className="w-6 h-6 text-amber-600" />
    },
    {
      step: '04',
      titleEn: 'Empowering Village Farmers',
      titleTe: 'రైతులకు ఉచిత ఎరువు పంపిణీ',
      descEn: 'Grama Panchayat distributes tested organic compost to village farmers, increasing crop yield and soil health.',
      descTe: 'తయారైన సేంద్రీయ ఎరువును మన స్థానిక రైతులకు అందిస్తారు, దీనితో రసాయన ఎరువుల ఖర్చు తగ్గుతుంది.',
      icon: <Award className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <section className="py-14 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            {language === 'te' ? 'కార్యవిధానం' : 'System Workflow'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {language === 'te' ? 'వేస్ట్‌వైజ్ ఎలా పనిచేస్తుంది?' : 'How WasteWise Transforms Village Waste'}
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            {language === 'te'
              ? 'ప్రతి పౌరుడు మరియు పంచాయతీ చేతులు కలిపితే మన గ్రామం ఆదర్శ గ్రామంగా మారుతుంది.'
              : 'A seamless 4-step cycle from kitchen door to fertile farmland.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div
              key={st.step}
              className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-300 hover:bg-emerald-50/20 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition">
                    {st.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300 group-hover:text-forest-600 transition">
                    {st.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {language === 'te' ? st.titleTe : st.titleEn}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'te' ? st.descTe : st.descEn}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400 font-black text-lg">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
