import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '../utils/i18n/LanguageContext';

interface CreditBalanceProps {
  className?: string;
}

export default function CreditBalance({ className = '' }: CreditBalanceProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      if (!session) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/credits/getUser');
        if (!response.ok) {
          throw new Error('Failed to fetch credits');
        }
        
        const data = await response.json();
        setCredits(data.user.credits);
      } catch (err) {
        console.error('Error fetching credits:', err);
        setError('Failed to load credits');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCredits();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchCredits, 30000);
    
    return () => clearInterval(intervalId);
  }, [session]);

  if (!session) {
    return null;
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100 px-3 py-1 rounded-full flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : error ? (
          <span title={error}>?</span>
        ) : (
          <span>{credits}</span>
        )}
      </div>
    </div>
  );
} 