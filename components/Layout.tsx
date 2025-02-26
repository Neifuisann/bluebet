import { ReactNode, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../utils/i18n/LanguageContext';
import CreditBalance from './CreditBalance';
import MathChallenge from './MathChallenge';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.asPath]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className={`bg-blue-800 text-white transition-all duration-300 ${scrolled ? 'shadow-lg py-2' : 'shadow-md py-4'} sticky top-0 z-10`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover-scale flex items-center">
            <span className="flex items-center">
              <svg className="w-8 h-8 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2L12 22"></path>
                <path d="M2 12L22 12"></path>
              </svg>
              <span className="hidden sm:inline">FootballPredictor</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`hover:text-blue-200 transition-all ${router.pathname === '/' ? 'font-bold border-b-2 border-white' : ''}`}
            >
              {t('home')}
            </Link>
            <Link 
              href="/matches" 
              className={`hover:text-blue-200 transition-all ${router.pathname === '/matches' ? 'font-bold border-b-2 border-white' : ''}`}
            >
              {t('matches')}
            </Link>
            <Link 
              href="/leaderboard" 
              className={`hover:text-blue-200 transition-all ${router.pathname === '/leaderboard' ? 'font-bold border-b-2 border-white' : ''}`}
            >
              {t('leaderboard')}
            </Link>
            {session ? (
              <>
                <Link 
                  href="/my-predictions" 
                  className={`hover:text-blue-200 transition-all ${router.pathname === '/my-predictions' ? 'font-bold border-b-2 border-white' : ''}`}
                >
                  {t('myPredictions')}
                </Link>
                {/* If user is admin, show admin link */}
                {session.user?.isAdmin ? (
                  <Link 
                    href="/admin" 
                    className={`hover:text-blue-200 transition-all ${router.pathname.startsWith('/admin') ? 'font-bold border-b-2 border-white' : ''}`}
                  >
                    {t('adminDashboard')}
                  </Link>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <CreditBalance />
                      <MathChallenge />
                    </div>
                  </>
                )}
                <button 
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md btn-pulse"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md btn-pulse"
                >
                  {t('login')}
                </Link>
                <Link 
                  href="/register" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md btn-pulse"
                >
                  {t('register')}
                </Link>
              </>
            )}
            
            {/* Theme & Language Toggles */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-900 py-4 animate-fadeIn">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`hover:text-blue-200 transition-all px-2 py-2 rounded-md ${router.pathname === '/' ? 'bg-blue-700 font-bold' : ''}`}
              >
                {t('home')}
              </Link>
              <Link 
                href="/matches" 
                className={`hover:text-blue-200 transition-all px-2 py-2 rounded-md ${router.pathname === '/matches' ? 'bg-blue-700 font-bold' : ''}`}
              >
                {t('matches')}
              </Link>
              <Link 
                href="/leaderboard" 
                className={`hover:text-blue-200 transition-all px-2 py-2 rounded-md ${router.pathname === '/leaderboard' ? 'bg-blue-700 font-bold' : ''}`}
              >
                {t('leaderboard')}
              </Link>
              {session ? (
                <>
                  <Link 
                    href="/my-predictions" 
                    className={`hover:text-blue-200 transition-all px-2 py-2 rounded-md ${router.pathname === '/my-predictions' ? 'bg-blue-700 font-bold' : ''}`}
                  >
                    {t('myPredictions')}
                  </Link>
                  {/* If user is admin, show admin link */}
                  {session.user?.isAdmin ? (
                    <Link 
                      href="/admin" 
                      className={`hover:text-blue-200 transition-all px-2 py-2 rounded-md ${router.pathname.startsWith('/admin') ? 'bg-blue-700 font-bold' : ''}`}
                    >
                      {t('adminDashboard')}
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <CreditBalance />
                        <MathChallenge />
                      </div>
                    </>
                  )}
                  <button 
                    onClick={() => signOut()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full text-left"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full text-center"
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full text-center"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} FootballPredictor. All rights reserved.</p>
          <div className="flex justify-center mt-4 space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 