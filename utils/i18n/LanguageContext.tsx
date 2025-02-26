import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { TranslationKey, translations } from './translations';

type LanguageContextType = {
  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get language from localStorage, default to 'en'
  const [language, setLanguageState] = useState<'en' | 'vi'>('en');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'en' || savedLanguage === 'vi') {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: 'en' | 'vi') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  // Translation function
  const t = (key: TranslationKey): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found.`);
      return key;
    }
    return translations[key][language];
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 