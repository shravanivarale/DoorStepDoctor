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
  ta: {
    'app.title': 'டோர்ஸ்டெப் டாக்டர்',
    'app.subtitle': 'கிராமப்புற சுகாதார அணுகல் தளம்',
    'login.title': 'வரவேற்கிறோம்',
    'login.subtitle': 'தொடர உள்நுழையவும்',
    'login.username': 'பயனர் பெயர்',
    'login.password': 'கடவுச்சொல்',
    'login.signin': 'உள்நுழைக',
    'login.asha': 'ஆஷா பணியாளர்',
    'login.phc': 'PHC மருத்துவர்',
    'triage.title': 'நோயாளி மதிப்பீடு',
    'triage.symptoms': 'நோயாளி அறிகுறிகள்',
    'triage.age': 'நோயாளி வயது',
    'triage.gender': 'பாலினம்',
    'triage.submit': 'மதிப்பீட்டை சமர்ப்பிக்கவும்',
    'triage.recording': 'பதிவு செய்கிறது...',
    'triage.selectTags': 'விரைவு அறிகுறிகளைத் தேர்ந்தெடுக்கவும்',
    'nav.triage': 'ட்ரையேஜ்',
    'nav.history': 'வரலாறு',
    'nav.emergency': 'அவசர வரிசை',
    'nav.logout': 'வெளியேறு',
  },
  te: {
    'app.title': 'డోర్‌స్టెప్ డాక్టర్',
    'app.subtitle': 'గ్రామీణ ఆరోగ్య సంరక్షణ వేదిక',
    'login.title': 'స్వాగతం',
    'login.subtitle': 'కొనసాగించడానికి సైన్ ఇన్ చేయండి',
    'login.username': 'వినియోగదారు పేరు',
    'login.password': 'పాస్‌వర్డ్',
    'login.signin': 'సైన్ ఇన్ చేయండి',
    'login.asha': 'ఆశా కార్యకర్త',
    'login.phc': 'PHC వైద్యుడు',
    'triage.title': 'రోగి అంచనా',
    'triage.symptoms': 'రోగి లక్షణాలు',
    'triage.age': 'రోగి వయస్సు',
    'triage.gender': 'లింగం',
    'triage.submit': 'అంచనాను సమర్పించండి',
    'triage.recording': 'రికార్డింగ్...',
    'triage.selectTags': 'త్వరిత లక్షణాలను ఎంచుకోండి',
    'nav.triage': 'ట్రయాజ్',
    'nav.history': 'చరిత్ర',
    'nav.emergency': 'అత్యవసర క్యూ',
    'nav.logout': 'లాగ్ అవుట్',
  },
  kn: {
    'app.title': 'ಡೋರ್‌ಸ್ಟೆಪ್ ಡಾಕ್ಟರ್',
    'app.subtitle': 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಸೇವಾ ವೇದಿಕೆ',
    'login.title': 'ಸ್ವಾಗತ',
    'login.subtitle': 'ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
    'login.username': 'ಬಳಕೆದಾರ ಹೆಸರು',
    'login.password': 'ಪಾಸ್‌ವರ್ಡ್',
    'login.signin': 'ಸೈನ್ ಇನ್ ಮಾಡಿ',
    'login.asha': 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ',
    'login.phc': 'PHC ವೈದ್ಯರು',
    'triage.title': 'ರೋಗಿ ಮೌಲ್ಯಮಾಪನ',
    'triage.symptoms': 'ರೋಗಿ ಲಕ್ಷಣಗಳು',
    'triage.age': 'ರೋಗಿ ವಯಸ್ಸು',
    'triage.gender': 'ಲಿಂಗ',
    'triage.submit': 'ಮೌಲ್ಯಮಾಪನ ಸಲ್ಲಿಸಿ',
    'triage.recording': 'ರೆಕಾರ್ಡಿಂಗ್...',
    'triage.selectTags': 'ತ್ವರಿತ ಲಕ್ಷಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'nav.triage': 'ಟ್ರಯಾಜ್',
    'nav.history': 'ಇತಿಹಾಸ',
    'nav.emergency': 'ತುರ್ತು ಸರತಿ',
    'nav.logout': 'ಲಾಗ್ ಔಟ್',
  },
  bn: {
    'app.title': 'ডোরস্টেপ ডক্টর',
    'app.subtitle': 'গ্রামীণ স্বাস্থ্যসেবা প্ল্যাটফর্ম',
    'login.title': 'স্বাগতম',
    'login.subtitle': 'চালিয়ে যেতে সাইন ইন করুন',
    'login.username': 'ব্যবহারকারীর নাম',
    'login.password': 'পাসওয়ার্ড',
    'login.signin': 'সাইন ইন করুন',
    'login.asha': 'আশা কর্মী',
    'login.phc': 'PHC ডাক্তার',
    'triage.title': 'রোগী মূল্যায়ন',
    'triage.symptoms': 'রোগীর লক্ষণ',
    'triage.age': 'রোগীর বয়স',
    'triage.gender': 'লিঙ্গ',
    'triage.submit': 'মূল্যায়ন জমা দিন',
    'triage.recording': 'রেকর্ডিং...',
    'triage.selectTags': 'দ্রুত লক্ষণ নির্বাচন করুন',
    'nav.triage': 'ট্রায়াজ',
    'nav.history': 'ইতিহাস',
    'nav.emergency': 'জরুরি সারি',
    'nav.logout': 'লগ আউট',
  },
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
