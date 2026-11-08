import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { XCircle, CheckCircle, AlertOctagon, Sparkles } from 'lucide-react';

export const ProblemExplainer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            {language === 'te' ? 'సమస్య & పరిష్కారం' : 'Why Segregation Matters in Our Village'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {language === 'te'
              ? 'చెత్త కలపడం వల్ల గ్రామానికి జరిగే నష్టం ఏమిటి?'
              : 'The Danger of Mixed Waste vs The Power of Segregation'}
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
            {language === 'te'
              ? 'తడి మరియు పొడి చెత్తను ఒకే డబ్బాలో కలపడం వల్ల మన కాలువలు మూసుకుపోతాయి, దోమలు ప్రబలుతాయి మరియు మన పంచాయతీ కార్మికులు తీవ్ర ఇబ్బందులు పడతారు.'
              : 'When vegetable waste and plastics are dumped together, it creates toxic leachate, foul smells, clogs village open drains, and prevents natural composting.'}
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Box 1: The Problem (Mixed Waste) */}
          <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900">
                    {language === 'te' ? 'మిశ్రమ చెత్త వల్ల కలిగే అనర్థాలు' : 'Improper / Mixed Waste Disposal'}
                  </h3>
                  <span className="text-xs font-semibold text-red-700">
                    {language === 'te' ? 'పర్యావరణం & ఆరోగ్యానికి హానికరం' : 'Damages Health, Soil & Drainage'}
                  </span>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm block">
                      {language === 'te' ? 'కాలువలు పూడిక & దోమల బెడద' : 'Drainage Clogging & Mosquito Breeding'}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {language === 'te'
                        ? 'ప్లాస్టిక్ కవర్లు మరియు తడి వ్యర్థాలు కలిసి డ్రైనేజీ కాలువలను మూసివేస్తాయి, దీనివల్ల డెంగ్యూ, మలేరియా వస్తాయి.'
                        : 'Plastic covers trap wet garbage inside village drains, breeding disease vectors like malaria and dengue.'}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm block">
                      {language === 'te' ? 'పారిశుద్ధ్య మిత్రులకు ప్రమాదం' : 'Severe Hardship for Sanitation Workers'}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {language === 'te'
                        ? 'గాజు ముక్కలు, మురికి వ్యర్థాలు కలిపి ఉంచినప్పుడు కార్మికుల చేతులకు గాయాలు మరియు అంటువ్యాధులు సోకుతాయి.'
                        : 'Workers must manually segregate broken glass and decayed items, exposing them to skin cuts and infections.'}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm block">
                      {language === 'te' ? 'కంపోస్ట్ ఎరువు తయారు చేయలేము' : 'Compost & Recycling Completely Ruined'}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {language === 'te'
                        ? 'ప్లాస్టిక్ కలిసిన తడి చెత్త కుళ్ళిపోదు; పంటలకు ఉపయోగపడే ఎరువు వృధా అయిపోతుంది.'
                        : 'Wet waste contaminated with non-biodegradables turns into putrid landfill instead of rich farmer fertilizer.'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-red-200 text-xs font-bold text-red-800">
              ⚠️ {language === 'te' ? 'గ్రామ పరిసరాలలో చెత్తను కాల్చడం చట్టరీత్యా నేరం' : 'Open burning produces cancer-causing dioxins!'}
            </div>
          </div>

          {/* Box 2: The Solution (Proper Segregation) */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-forest-600 text-white flex items-center justify-center flex-shrink-0 shadow">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    {language === 'te' ? 'వేస్ట్‌వైజ్ విభజన వల్ల లాభాలు' : 'WasteWise Segregation Solution'}
                  </h3>
                  <span className="text-xs font-semibold text-forest-700">
                    {language === 'te' ? 'స్వచ్ఛమైన గ్రామం & రైతులకు ఉచిత ఎరువు' : 'Clean Village, Healthy Groundwater & Free Fertilizer'}
                  </span>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm block">
                      {language === 'te' ? 'భూసారం పెంచే సేంద్రీయ ఎరువు' : 'Rich Organic Compost for Local Farmers'}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {language === 'te'
                        ? 'ఆకుపచ్చ డబ్బాలోని తడి చెత్తను వర్మీకంపోస్ట్ చేసి మన రైతుల పంటలకు ఉచిత సహజ ఎరువుగా అందిస్తాము.'
                        : 'Kitchen waste is composted in the village vermicompost yard, cutting down expensive chemical fertilizer costs.'}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm block">
                      {language === 'te' ? 'పంచాయతీకి రీసైక్లింగ్ ఆదాయం' : 'Plastic & Dry Waste Recycling Revenue'}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {language === 'te'
                        ? 'శుభ్రమైన ప్లాస్టిక్ సీసాలు, పాల కవర్లు, కాగితం రీసైక్లర్లకు విక్రయించి పంచాయతీ అభివృద్ధికి నిధులు సమకూరుస్తాము.'
                        : 'Clean dry plastic and cardboard are bundled and sold to recyclers, generating village development funds.'}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm block">
                      {language === 'te' ? 'గౌరవప్రదమైన పరిశుభ్రతా సేవ' : 'Dignified & Safe Sanitation Work'}
                    </strong>
                    <span className="text-xs text-slate-600">
                      {language === 'te'
                        ? 'కార్మికులు నేరుగా డబ్బాలను వాహనంలోకి ఖాళీ చేస్తారు. ప్రమాదాలు లేకుండా సమర్థవంతంగా పనిచేయగలరు.'
                        : 'Sanitation workers transfer segregated bins directly into the collection vehicle without hazardous manual sorting.'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200 text-xs font-bold text-forest-800">
              🌿 {language === 'te' ? 'మన ఊరు - మన గౌరవం. ప్రతి ఇల్లూ విభజనలో భాగస్వామి కావాలి.' : 'Our Village, Our Pride. Every household plays an essential role!'}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
