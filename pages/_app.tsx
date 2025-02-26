import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Layout from '../components/Layout';
import { LanguageProvider } from '../utils/i18n/LanguageContext';
import { ThemeProvider } from '../utils/theme/ThemeContext';
import { useEffect } from 'react';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // Add code to handle initial theme on page load to prevent flashing
  useEffect(() => {
    // If dark mode is saved in local storage, or user prefers dark scheme
    // Add dark mode class to document before rendering
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <LanguageProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 