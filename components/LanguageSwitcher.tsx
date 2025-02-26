import { useLanguage } from '../utils/i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative group">
      <button
        className="flex items-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-colors"
        aria-label={t('language')}
        title={t('language')}
      >
        <span className="mr-1 font-medium">{language === 'en' ? '🇬🇧' : '🇻🇳'}</span>
        <span className="hidden md:inline">{language.toUpperCase()}</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden transform scale-0 group-hover:scale-100 transition-transform origin-top z-50">
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' : ''}`}
        >
          <span className="mr-2">🇬🇧</span>
          <span>English</span>
        </button>
        <button
          onClick={() => setLanguage('vi')}
          className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${language === 'vi' ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' : ''}`}
        >
          <span className="mr-2">🇻🇳</span>
          <span>Tiếng Việt</span>
        </button>
      </div>
    </div>
  );
} 