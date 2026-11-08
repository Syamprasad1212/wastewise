// Web Speech API text-to-speech helper for accessibility in Telugu and English
export const speakText = (text: string, language: 'en' | 'te' = 'en') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
  utterance.rate = 0.9; // Slightly slower for better comprehension in rural areas
  utterance.pitch = 1.0;

  // Attempt to select an Indian English or Telugu voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes(language === 'te' ? 'te' : 'en-in') ||
        v.lang.toLowerCase().includes('en')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
