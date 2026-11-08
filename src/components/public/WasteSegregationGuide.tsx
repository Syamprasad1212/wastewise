import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { speakText } from '../../lib/speech';
import { Volume2, Leaf, Box, HeartPulse, Skull } from 'lucide-react';

export const WasteSegregationGuide: React.FC = () => {
  const { language } = useLanguage();

  const bins = [
    {
      id: 'green',
      nameEn: 'Green Bin (Wet / Organic)',
      nameTe: 'ఆకుపచ్చ డబ్బా (తడి చెత్త)',
      colorBg: 'bg-emerald-500',
      borderBg: 'border-emerald-300',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-950',
      icon: <Leaf className="w-8 h-8 text-emerald-600" />,
      itemsEn: 'Vegetable scraps, fruit peels, tea leaves, cooked rice, rotten vegetables, garden leaves, eggshells.',
      itemsTe: 'కూరగాయల ముక్కలు, పండ్ల తొక్కలు, వాడిన టీ పొడి, అన్నం, కుళ్ళిన పదార్థాలు, తోట ఆకులు, గుడ్డు పెంకులు.',
      audioEn: 'Green bin is for wet and organic waste like vegetable peels and food leftovers.',
      audioTe: 'ఆకుపచ్చ డబ్బాలో కూరగాయల వ్యర్థాలు, పండ్ల తొక్కలు మరియు తడి ఆహార పదార్థాలు మాత్రమే వేయాలి.'
    },
    {
      id: 'blue',
      nameEn: 'Blue Bin (Dry / Recyclable)',
      nameTe: 'నీలి డబ్బా (పొడి చెత్త)',
      colorBg: 'bg-blue-500',
      borderBg: 'border-blue-300',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-950',
      icon: <Box className="w-8 h-8 text-blue-600" />,
      itemsEn: 'Plastic bottles, milk bags (rinsed), paper, cartons, cardboard, glass bottles, metal cans, footwear.',
      itemsTe: 'ప్లాస్టిక్ సీసాలు, పాల కవర్లు (కడిగినవి), కాగితాలు, అట్టపెట్టెలు, గాజు సీసాలు, లోహపు డబ్బాలు, చెప్పులు.',
      audioEn: 'Blue bin is for clean dry recyclable waste such as plastic bottles, paper and tins.',
      audioTe: 'నీలి రంగు డబ్బాలో ప్లాస్టిక్ సీసాలు, కాగితం, అట్టపెట్టెలు మొదలైన పొడి వ్యర్థాలు వేయాలి.'
    },
    {
      id: 'yellow',
      nameEn: 'Yellow / Marked (Sanitary Waste)',
      nameTe: 'పసుపు / గుర్తించినవి (శానిటరీ)',
      colorBg: 'bg-amber-500',
      borderBg: 'border-amber-300',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-950',
      icon: <HeartPulse className="w-8 h-8 text-amber-600" />,
      itemsEn: 'Sanitary pads, baby/adult diapers, expired medicines, medical bandages. Wrap securely in paper with red mark.',
      itemsTe: 'శానిటరీ ప్యాడ్లు, పిల్లల డైపర్లు, గడువు ముగిసిన మందులు, బ్యాండేజీలు. న్యూస్‌పేపర్‌లో చుట్టి ఎరుపు గుర్తు పెట్టండి.',
      audioEn: 'Wrap sanitary pads and diapers in newspaper marked with a red cross before handover.',
      audioTe: 'శానిటరీ ప్యాడ్లను వార్తాపత్రికలో చుట్టి ఎరుపు గుర్తు పెట్టి కార్మికుడికి ఇవ్వండి.'
    },
    {
      id: 'red',
      nameEn: 'Red Box (Domestic Hazardous)',
      nameTe: 'ఎరుపు డబ్బా (ప్రమాదకర వ్యర్థాలు)',
      colorBg: 'bg-rose-500',
      borderBg: 'border-rose-300',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-950',
      icon: <Skull className="w-8 h-8 text-rose-600" />,
      itemsEn: 'Pesticide containers, weedicide bottles, dry cell batteries, tube lights, broken thermometers, paints.',
      itemsTe: 'పురుగుమందు డబ్బాలు, కలుపు మందు సీసాలు, బ్యాటరీలు, ట్యూబ్‌లైట్లు, పాదరసం థర్మామీటర్లు, రంగులు.',
      audioEn: 'Hazardous chemicals and batteries go into the red box to prevent groundwater poisoning.',
      audioTe: 'పురుగుమందుల డబ్బాలు మరియు పాత బ్యాటరీలను ఎరుపు డబ్బాలో ప్రత్యేకంగా ఇవ్వండి.'
    }
  ];

  return (
    <section className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            {language === 'te' ? 'రంగు గుర్తులు & సూచనలు' : 'Standard 4-Category Segregation'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {language === 'te' ? 'ఏ చెత్తను ఏ డబ్బాలో వేయాలి?' : 'Which Bin for Which Waste?'}
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            {language === 'te'
              ? 'ప్రతి డబ్బాపై ఉన్న స్పీకర్ గుర్తుపై నొక్కితే సూచనలు తెలుగులో వినిపిస్తాయి.'
              : 'Click the speaker icon on any bin card to listen to audio disposal instructions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bins.map((bin) => (
            <div
              key={bin.id}
              className={`rounded-2xl border-2 ${bin.borderBg} ${bin.lightBg} p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    {bin.icon}
                  </div>
                  <button
                    onClick={() => speakText(language === 'te' ? bin.audioTe : bin.audioEn, language)}
                    className="p-2 bg-white hover:bg-slate-100 rounded-full shadow-sm text-slate-700 hover:text-forest-700 transition"
                    title="Listen instructions"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded text-white text-xs font-bold mb-2 shadow-sm uppercase tracking-wide">
                  <span className={`${bin.colorBg} px-2 py-0.5 rounded`}>
                    {bin.id}
                  </span>
                </div>

                <h3 className={`text-lg font-extrabold ${bin.textColor} mb-2`}>
                  {language === 'te' ? bin.nameTe : bin.nameEn}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {language === 'te' ? bin.itemsTe : bin.itemsEn}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
                {bin.id === 'green' ? '♻️ 100% Compostable / కంపోస్ట్‌' : bin.id === 'blue' ? '📦 100% Recyclable / రీసైకిల్' : '⚠️ Special Handling / జాగ్రత్త'}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
