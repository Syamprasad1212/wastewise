import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'te';

interface Translations {
  [key: string]: {
    en: string;
    te: string;
  };
}

export const DICTIONARY: Translations = {
  // Brand & Nav
  appName: {
    en: 'WasteWise',
    te: 'వేస్ట్‌వైజ్'
  },
  appTagline: {
    en: 'Village Waste Management & Segregation System',
    te: 'గ్రామ చెత్త సేకరణ & విభజన నిర్వహణ వ్యవస్థ'
  },
  navHome: {
    en: 'Home',
    te: 'హోమ్'
  },
  navGuide: {
    en: 'Waste Guide',
    te: 'చెత్త గుర్తింపు గైడ్'
  },
  navAwareness: {
    en: 'Awareness & Quiz',
    te: 'అవగాహన & క్విజ్'
  },
  navCitizenPortal: {
    en: 'Citizen Portal',
    te: 'గ్రామస్థుల వేదిక'
  },
  navAdminDashboard: {
    en: 'Panchayat Admin',
    te: 'పంచాయతీ కార్యాలయం'
  },
  navWorkerDashboard: {
    en: 'Sanitation Worker',
    te: 'పారిశుద్ధ్య కార్మికులు'
  },
  navLogin: {
    en: 'Login',
    te: 'లాగిన్'
  },
  navRegister: {
    en: 'Register Household',
    te: 'ఇంటి నమోదు'
  },
  navLogout: {
    en: 'Logout',
    te: 'లాగౌట్'
  },

  // Accessibility
  accessibilityMode: {
    en: 'Simple Mode (Easy View)',
    te: 'సరళమైన సులభ వీక్షణ'
  },
  readOutLoud: {
    en: 'Listen to Voice',
    te: 'వాయిస్ వినండి'
  },

  // Common Actions
  submit: {
    en: 'Submit',
    te: 'సమర్పించండి'
  },
  cancel: {
    en: 'Cancel',
    te: 'రద్దు చేయండి'
  },
  save: {
    en: 'Save',
    te: 'భద్రపరచు'
  },
  search: {
    en: 'Search waste item...',
    te: 'చెత్త రకాన్ని వెతకండి...'
  },
  all: {
    en: 'All',
    te: 'అన్నీ'
  },
  viewDetails: {
    en: 'View Details',
    te: 'వివరాలు చూడండి'
  },
  status: {
    en: 'Status',
    te: 'స్థితి'
  },
  date: {
    en: 'Date',
    te: 'తేదీ'
  },
  location: {
    en: 'Location / Ward',
    te: 'ప్రాంతం / వార్డు'
  },

  // Waste Categories
  wetWaste: {
    en: 'Wet Waste (Organic)',
    te: 'తడి చెత్త (కుళ్ళిపోయేది)'
  },
  dryWaste: {
    en: 'Dry Waste (Recyclable)',
    te: 'పొడి చెత్త (రీసైకిల్ అయ్యేది)'
  },
  sanitaryWaste: {
    en: 'Sanitary Waste',
    te: 'శానిటరీ వ్యర్థాలు'
  },
  hazardousWaste: {
    en: 'Hazardous Waste',
    te: 'ప్రమాదకర వ్యర్థాలు'
  },
  mixedWaste: {
    en: 'Mixed Waste',
    te: 'మిశ్రమ చెత్త'
  },

  // Statuses
  pending: {
    en: 'Pending Review',
    te: 'పరిశీలనలో ఉంది'
  },
  assigned: {
    en: 'Worker Assigned',
    te: 'కార్మికుడికి కేటాయించబడింది'
  },
  in_progress: {
    en: 'Collection in Progress',
    te: 'పని జరుగుతోంది'
  },
  resolved: {
    en: 'Resolved / Cleaned',
    te: 'పరిష్కరించబడింది'
  },

  // Hero Section
  heroTitle: {
    en: 'Clean Village, Healthy Future',
    te: 'పరిశుభ్రమైన గ్రామం – ఆరోగ్యకరమైన భవిష్యత్తు'
  },
  heroSubtitle: {
    en: 'Separate wet and dry waste at your doorstep. Help our Grama Panchayat workers turn waste into rich organic compost and protect our village soil and water.',
    te: 'ఇంటి వద్దే తడి మరియు పొడి చెత్తను వేరు చేయండి. మన గ్రామ పంచాయతీ కార్మికులకు సహకరించి, వ్యర్థాల నుండి సహజ ఎరువు తయారుచేసి భూమిని, నీటిని కాపాడుకుందాం.'
  },
  heroCTA1: {
    en: 'Identify Waste Category',
    te: 'చెత్త రకాన్ని గుర్తించండి'
  },
  heroCTA2: {
    en: 'Report Garbage Dump',
    te: 'చెత్త సమస్యను తెలపండి'
  },

  // Segregation Golden Rules
  ruleGreenBin: {
    en: 'Green Bin: Kitchen scraps, fruit peels, leaves, leftover food. Never mix plastic!',
    te: 'ఆకుపచ్చ డబ్బా: వంటగది వ్యర్థాలు, పండ్ల తొక్కలు, ఆకులు, అన్నం. ప్లాస్టిక్ అస్సలు కలపవద్దు!'
  },
  ruleBlueBin: {
    en: 'Blue Bin: Clean plastic bottles, milk covers, paper, cardboard, glass and tin cans.',
    te: 'నీలి డబ్బా: శుభ్రమైన ప్లాస్టిక్ సీసాలు, పాల కవర్లు, కాగితాలు, అట్టపెట్టెలు, గాజు మరియు టిన్నులు.'
  },
  ruleYellowBin: {
    en: 'Yellow / Marked: Wrap diapers and sanitary napkins in newspaper with a red cross.',
    te: 'పసుపు / గుర్తించినవి: డైపర్లు, శానిటరీ నాప్‌కిన్‌లను న్యూస్‌పేపర్‌లో చుట్టి ఎరుపు గుర్తు పెట్టండి.'
  },
  ruleRedBin: {
    en: 'Red Box: Pesticide cans, broken tubelights, old batteries. Hand over separately.',
    te: 'ఎరుపు డబ్బా: పురుగుమందుల డబ్బాలు, పగిలిన ట్యూబ్‌లైట్లు, పాత బ్యాటరీలు విడిగా ఇవ్వండి.'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('wastewise_lang');
    return saved === 'te' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('wastewise_lang', lang);
  };

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][language] || DICTIONARY[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
