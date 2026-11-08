import React, { useState, useMemo } from 'react';
import { WASTE_DATABASE } from '../data/wasteDatabase';
import { useLanguage } from '../context/LanguageContext';
import { speakText } from '../lib/speech';
import { Search, Volume2, CheckCircle2, XCircle, Leaf, Box, HeartPulse, Skull, Sparkles } from 'lucide-react';
import { WasteCategory } from '../types';

export const WasteGuidePage: React.FC = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return WASTE_DATABASE.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchCategory;

      const matchNameEn = item.nameEn.toLowerCase().includes(term);
      const matchNameTe = item.nameTe.toLowerCase().includes(term);
      const matchExamples = item.exampleItems.toLowerCase().includes(term);
      const matchInstructions = item.instructionsEn.toLowerCase().includes(term) || item.instructionsTe.toLowerCase().includes(term);

      return matchCategory && (matchNameEn || matchNameTe || matchExamples || matchInstructions);
    });
  }, [searchTerm, selectedCategory]);

  const categories = [
    { id: 'all', labelEn: 'All Items', labelTe: 'అన్ని వ్యర్థాలు', count: WASTE_DATABASE.length },
    { id: 'wet', labelEn: 'Wet / Organic (Green)', labelTe: 'తడి చెత్త (ఆకుపచ్చ)', count: WASTE_DATABASE.filter(i => i.category === 'wet').length },
    { id: 'dry', labelEn: 'Dry / Recyclable (Blue)', labelTe: 'పొడి చెత్త (నీలం)', count: WASTE_DATABASE.filter(i => i.category === 'dry').length },
    { id: 'sanitary', labelEn: 'Sanitary (Yellow)', labelTe: 'శానిటరీ (పసుపు)', count: WASTE_DATABASE.filter(i => i.category === 'sanitary').length },
    { id: 'hazardous', labelEn: 'Hazardous (Red)', labelTe: 'ప్రమాదకర (ఎరుపు)', count: WASTE_DATABASE.filter(i => i.category === 'hazardous').length },
  ];

  const getBinBadge = (binColor: string) => {
    switch (binColor) {
      case 'green':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          labelEn: 'Green Bin (Wet)',
          labelTe: 'ఆకుపచ్చ డబ్బా (తడి)'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          dot: 'bg-blue-600',
          labelEn: 'Blue Bin (Dry)',
          labelTe: 'నీలి డబ్బా (పొడి)'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-600',
          labelEn: 'Yellow / Marked',
          labelTe: 'పసుపు / గుర్తించినవి'
        };
      case 'red':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          labelEn: 'Red Box (Hazard)',
          labelTe: 'ఎరుపు డబ్బా (ప్రమాదకరం)'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-600',
          labelEn: 'General',
          labelTe: 'సాధారణ'
        };
    }
  };

  const handleReadItem = (item: typeof WASTE_DATABASE[0]) => {
    const text = language === 'te'
      ? `${item.nameTe}. ఇది ${item.category === 'wet' ? 'తడి చెత్త' : item.category === 'dry' ? 'పొడి చెత్త' : item.category === 'sanitary' ? 'శానిటరీ వ్యర్థం' : 'ప్రమాదకర వ్యర్థం'}. ${item.instructionsTe}`
      : `${item.nameEn}. Category: ${item.category} waste. ${item.instructionsEn}`;
    speakText(text, language);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
          {language === 'te' ? 'గ్రామ చెత్త శోధన పట్టిక' : 'Smart Waste Identification Guide'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
          {language === 'te' ? 'చెత్తను సరిగ్గా గుర్తించి వేయండి' : 'Look Up Any Household Waste Item'}
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          {language === 'te'
            ? 'అరటి తొక్కలు, ప్లాస్టిక్ సీసాలు, పాల కవర్లు లేదా పురుగుమందుల డబ్బాలు మొదలైన వాటిని ఎలా పారవేయాలో ఇక్కడ వెతకండి.'
            : 'Instant guidance on banana peels, bottles, cartons, diapers, and agricultural waste.'}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'te' ? 'వస్తువు పేరుతో వెతకండి (ఉదా: ప్లాస్టిక్, అరటి, పాలు, కాగితం...)' : 'Search waste item (e.g. banana, milk pouch, bottle, egg, pesticide)...'}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-forest-200 rounded-2xl shadow-sm focus:border-forest-600 focus:ring-2 focus:ring-forest-200 outline-none text-base font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-forest-600 text-white shadow-md shadow-forest-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{language === 'te' ? cat.labelTe : cat.labelEn}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-forest-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const badge = getBinBadge(item.binColor);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Bin Badge & Audio Button */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-extrabold ${badge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      <span>{language === 'te' ? badge.labelTe : badge.labelEn}</span>
                    </div>

                    <button
                      onClick={() => handleReadItem(item)}
                      className="p-1.5 text-slate-400 hover:text-forest-700 hover:bg-forest-50 rounded-lg transition"
                      title="Listen audio instructions"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Title & Local Name */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {language === 'te' ? item.nameTe : item.nameEn}
                  </h3>
                  <div className="text-xs font-medium text-slate-500 mb-3">
                    {language === 'te' ? item.nameEn : item.nameTe}
                  </div>

                  {/* Examples */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    <strong className="text-slate-800">
                      {language === 'te' ? 'ఉదాహరణలు: ' : 'Examples: '}
                    </strong>
                    {item.exampleItems}
                  </div>

                  {/* Disposal Instruction */}
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1 mb-3">
                    <p className="font-semibold text-forest-900">
                      {language === 'te' ? item.instructionsTe : item.instructionsEn}
                    </p>
                    <p className="text-slate-500 text-xs italic">
                      💡 {language === 'te' ? item.disposalTipTe : item.disposalTipEn}
                    </p>
                  </div>
                </div>

                {/* Bottom Tags: Compostable / Recyclable */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    {item.compostable ? (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'te' ? 'కంపోస్ట్ చేయవచ్చు' : 'Compostable'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {language === 'te' ? 'కంపోస్ట్ కాదు' : 'Not compostable'}
                      </span>
                    )}
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    {item.recyclable ? (
                      <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'te' ? 'రీసైకిల్ చేయవచ్చు' : 'Recyclable'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {language === 'te' ? 'రీసైకిల్ కాదు' : 'Non-recyclable'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search State */
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">
            {language === 'te' ? 'ఏమీ కనుగొనబడలేదు' : 'No waste item matched'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'te' ? 'దయచేసి వేరే పేరుతో వెతకండి లేదా పంచాయతీ సహాయ కేంద్రాన్ని సంప్రదించండి.' : 'Try searching for general keywords like plastic, banana, bottle or leaves.'}
          </p>
        </div>
      )}
    </div>
  );
};
