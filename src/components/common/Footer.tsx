import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Recycle, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-forest-950 text-slate-300 border-t border-forest-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Panchayat mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-600 text-white flex items-center justify-center">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">WasteWise</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {language === 'te'
                ? 'మన గ్రామం పరిశుభ్రంగా ఉంటే మన కుటుంబం ఆరోగ్యంగా ఉంటుంది. చెత్తను తడి మరియు పొడిగా వేరు చేసి పంచాయతీ మిత్రులకు అందించండి.'
                : 'A clean village is a healthy village. Segregate wet and dry waste at the household source to create organic compost for rural agriculture.'}
            </p>
            <div className="text-xs text-forest-400 font-semibold uppercase tracking-wider">
              {language === 'te' ? 'స్వచ్ఛ భారత్ మిషన్ (గ్రామీణ)' : 'Swachh Bharat Mission (Gramin)'}
            </div>
          </div>

          {/* Col 2: Waste Segregation Bins */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {language === 'te' ? 'బుట్టల రంగు విధానం' : 'Color Coded Bins'}
            </h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{language === 'te' ? 'ఆకుపచ్చ: తడి చెత్త (కూరగాయలు, ఆకులు)' : 'Green: Wet Waste (Kitchen, scraps)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>{language === 'te' ? 'నీలం: పొడి చెత్త (ప్లాస్టిక్, కాగితం)' : 'Blue: Dry Waste (Bottles, paper)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>{language === 'te' ? 'పసుపు: శానిటరీ ప్యాడ్లు & డైపర్లు' : 'Yellow: Sanitary pads & diapers'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>{language === 'te' ? 'ఎరుపు: పురుగుమందు డబ్బాలు, బ్యాటరీలు' : 'Red: Pesticides & toxic items'}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Panchayat Helpline & Emergency */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {language === 'te' ? 'సహాయ కేంద్రం & సంప్రదింపులు' : 'Panchayat Helpline'}
            </h4>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-forest-400" />
                <span>{language === 'te' ? 'టోల్ ఫ్రీ: 1800-425-WASTE' : 'Toll-Free: 1800-425-9278'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-forest-400" />
                <span>panchayat.waste@gov.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-forest-400" />
                <span>Grama Panchayat Office, Main Road</span>
              </div>
            </div>
          </div>

          {/* Col 4: Village Composting Pride */}
          <div className="space-y-3 bg-forest-900/50 p-4 rounded-xl border border-forest-800">
            <h4 className="text-emerald-400 font-bold text-sm">
              {language === 'te' ? 'మన ఎరువు - మన పంటలకు బలం' : 'Village Compost Pride'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'te'
                ? 'మన గ్రామస్తులు ఇచ్చిన తడి చెత్తతో ప్రతి నెలా 400+ కేజీల సేంద్రీయ ఎరువు తయారుచేసి మన స్థానిక రైతులకు ఉచితంగా పంపిణీ చేస్తున్నాము.'
                : 'Over 400 kg of pure organic vermicompost is produced monthly from segregated wet waste, distributed to local farmers.'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-forest-900 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 WasteWise. Grama Panchayat Public Service Portal.</p>
          <p className="flex items-center gap-1">
            Built with care for Rural Cleanliness & Sanitation Workers
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
