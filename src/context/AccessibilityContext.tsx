import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  voiceEnabled: boolean;
  toggleVoice: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('wastewise_simple_mode') === 'true';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('wastewise_high_contrast') === 'true';
  });

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('wastewise_voice_enabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('wastewise_simple_mode', String(isSimpleMode));
    if (isSimpleMode) {
      document.documentElement.classList.add('accessibility-large-text');
    } else {
      document.documentElement.classList.remove('accessibility-large-text');
    }
  }, [isSimpleMode]);

  useEffect(() => {
    localStorage.setItem('wastewise_high_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('wastewise_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  const toggleSimpleMode = () => setIsSimpleMode(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleVoice = () => setVoiceEnabled(prev => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        isSimpleMode,
        toggleSimpleMode,
        highContrast,
        toggleHighContrast,
        voiceEnabled,
        toggleVoice
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
