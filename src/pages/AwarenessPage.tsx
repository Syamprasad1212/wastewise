import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AwarenessQuiz } from '../components/public/AwarenessQuiz';
import { Sprout, RefreshCw, AlertCircle, Heart, ShieldCheck, HelpCircle } from 'lucide-react';

export const AwarenessPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
          {language === 'te' ? 'గ్రామ పరిరక్షణ విద్య' : 'Village Cleanliness & Compost Education'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
          {language === 'te' ? 'చెత్త నిర్వహణ & సేంద్రీయ ఎరువు తయారీ' : 'Compost, Recycling & Environmental Care'}
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          {language === 'te'
            ? 'మన ఇంటి వద్దే సరైన పద్ధతులు పాటించడం ద్వారా మన వ్యవసాయానికి సహజ బలాన్ని అందించవచ్చు.'
            : 'Simple village-tested practices for household composting, recycling, and protecting our water.'}
        </p>
      </div>

      {/* 3 Informational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Compost Preparation */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {language === 'te' ? 'గ్రామంలో కంపోస్ట్ తయారీ' : 'Compost Preparation at Home & Village'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {language === 'te'
              ? 'తడి చెత్తను (కూరగాయలు, ఆకులు, గోమయం) ఒక గుంతలో వేసి కొద్దిగా మట్టి చల్లాలి. 30 నుండి 45 రోజుల్లో ఇది నల్లటి బలమైన ఎరువుగా మారుతుంది.'
              : 'Kitchen scraps, cattle dung, and fallen leaves can be layered in an earthen pit. In 30 to 45 days, natural bacteria turn this into nutrient-dense black humus for your crops.'}
          </p>
          <div className="text-xs bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 font-semibold">
            {language === 'te' ? '💡 చిట్కా: ప్లాస్టిక్, గాజు, రసాయనాలు కంపోస్ట్ గుంతలో అస్సలు వేయకండి.' : '💡 Rule: Never let non-biodegradable plastic enter the compost bed.'}
          </div>
        </div>

        {/* Card 2: Recycling Guidance */}
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {language === 'te' ? 'రీసైక్లింగ్ నియమాలు' : 'Plastic & Dry Waste Recycling Rules'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {language === 'te'
              ? 'పాల ప్యాకెట్లను కడిగి ఆరబెట్టాలి. ప్లాస్టిక్ వాటర్ బాటిళ్లను తొక్కి చదును చేయాలి. కాగితాలు మరియు అట్టపెట్టెలను తడి కాకుండా చూసుకోవాలి.'
              : 'Rinse milk sachets with water before drying. Flatten PET water bottles and cardboard boxes to save space in the collection pushcart.'}
          </p>
          <div className="text-xs bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 font-semibold">
            {language === 'te' ? '💡 చిట్కా: తడిచిన కాగితం బూజు పడుతుంది, రీసైక్లింగ్‌కు పనికిరాదు.' : '💡 Rule: Wet paper and cardboard turn moldy and lose recyclable market value.'}
          </div>
        </div>

        {/* Card 3: Worker Health & Safety */}
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {language === 'te' ? 'పారిశుద్ధ్య మిత్రుల ఆరోగ్యం' : 'Protecting Sanitation Workers'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {language === 'te'
              ? 'పగిలిన గాజు సీసాలు, బ్లేడ్లు లేదా సూదులను పాత గుడ్డలో చుట్టి మాత్రమే ఇవ్వాలి. శానిటరీ ప్యాడ్లపై ఎరుపు గుర్తు పెట్టాలి. ఇది కార్మికుల ప్రాణాలను కాపాడుతుంది.'
              : 'Always wrap broken glass pieces and sharp blades in thick rags before disposal. Mark sanitary waste with a red cross so workers handle it with protective gloves.'}
          </p>
          <div className="text-xs bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 font-semibold">
            {language === 'te' ? '💡 చిట్కా: మన గ్రామ పరిరక్షకులను గౌరవించడం మన బాధ్యత.' : '💡 Rule: Worker safety and dignified handling is a community duty.'}
          </div>
        </div>

      </div>

      {/* Interactive Quiz Component */}
      <div className="max-w-4xl mx-auto pt-6">
        <AwarenessQuiz />
      </div>

    </div>
  );
};
