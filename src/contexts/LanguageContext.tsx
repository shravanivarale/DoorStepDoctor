import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'DoorStepDoctor',
    'app.subtitle': 'Rural Healthcare Access Platform',
    'login.title': 'Welcome',
    'login.subtitle': 'Sign in to continue',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.signin': 'Sign In',
    'login.asha': 'ASHA Worker',
    'login.phc': 'PHC Doctor',
    'triage.title': 'Patient Assessment',
    'triage.symptoms': 'Patient Symptoms',
    'triage.age': 'Patient Age',
    'triage.gender': 'Gender',
    'triage.submit': 'Submit Assessment',
    'triage.recording': 'Recording...',
    'triage.selectTags': 'Quick Select Symptoms',
    'nav.triage': 'Triage',
    'nav.history': 'History',
    'nav.emergency': 'Emergency Queue',
    'nav.logout': 'Logout',
  },
  hi: {
    'app.title': 'डॉक्टर ऑन डोरस्टेप',
    'app.subtitle': 'ग्रामीण स्वास्थ्य सेवा मंच',
    'login.title': 'स्वागत है',
    'login.subtitle': 'जारी रखने के लिए साइन इन करें',
    'login.username': 'उपयोगकर्ता नाम',
    'login.password': 'पासवर्ड',
    'login.signin': 'साइन इन करें',
    'login.asha': 'आशा कार्यकर्ता',
    'login.phc': 'पीएचसी डॉक्टर',
    'triage.title': 'रोगी मूल्यांकन',
    'triage.symptoms': 'रोगी के लक्षण',
    'triage.age': 'रोगी की आयु',
    'triage.gender': 'लिंग',
    'triage.submit': 'मूल्यांकन जमा करें',
    'triage.recording': 'रिकॉर्डिंग...',
    'triage.selectTags': 'त्वरित लक्षण चुनें',
    'nav.triage': 'ट्राइएज',
    'nav.history': 'इतिहास',
    'nav.emergency': 'आपातकालीन कतार',
    'nav.logout': 'लॉग आउट',
  },
  mr: {
    'app.title': 'डॉक्टर ऑन डोरस्टेप',
    'app.subtitle': 'ग्रामीण आरोग्य सेवा मंच',
    'login.title': 'स्वागत आहे',
    'login.subtitle': 'सुरू ठेवण्यासाठी साइन इन करा',
    'login.username': 'वापरकर्ता नाव',
    'login.password': 'पासवर्ड',
    'login.signin': 'साइन इन करा',
    'login.asha': 'आशा कार्यकर्ता',
    'login.phc': 'पीएचसी डॉक्टर',
    'triage.title': 'रुग्ण मूल्यांकन',
    'triage.symptoms': 'रुग्णाची लक्षणे',
    'triage.age': 'रुग्णाचे वय',
    'triage.gender': 'लिंग',
    'triage.submit': 'मूल्यांकन सबमिट करा',
    'triage.recording': 'रेकॉर्डिंग...',
    'triage.selectTags': 'जलद लक्षणे निवडा',
    'nav.triage': 'ट्रायएज',
    'nav.history': 'इतिहास',
    'nav.emergency': 'आपत्कालीन रांग',
    'nav.logout': 'लॉग आउट',
  },
  ta: {}, // Add Tamil translations
  te: {}, // Add Telugu translations
  kn: {}, // Add Kannada translations
  bn: {}, // Add Bengali translations
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
