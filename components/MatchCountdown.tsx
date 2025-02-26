import { useState, useEffect } from 'react';
import { MATCH_DURATION } from '../utils/match/MatchGenerator';
import { useLanguage } from '../utils/i18n/LanguageContext';

interface MatchCountdownProps {
  startTime: Date;
  status: string;
}

export default function MatchCountdown({ startTime, status }: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timePercent, setTimePercent] = useState<number>(100);
  const { t } = useLanguage();

  useEffect(() => {
    // Only run for LIVE matches
    if (status !== 'LIVE') {
      return;
    }

    // Calculate initial time left
    const calculateTimeLeft = () => {
      const now = new Date();
      const matchStart = new Date(startTime);
      const elapsedSeconds = (now.getTime() - matchStart.getTime()) / 1000;
      const remainingSeconds = Math.max(0, MATCH_DURATION - elapsedSeconds);
      
      setTimeLeft(Math.floor(remainingSeconds));
      setTimePercent(Math.max(0, Math.min(100, (remainingSeconds / MATCH_DURATION) * 100)));
    };

    // Calculate immediately and then set interval
    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [startTime, status]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine color based on time remaining
  const getColorClass = (): string => {
    if (timePercent > 66) return 'bg-green-500';
    if (timePercent > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (status === 'SCHEDULED') {
    return (
      <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-xs font-medium animate-pulse">
        {t('upcomingMatches')}
      </div>
    );
  }

  if (status === 'FINISHED') {
    return (
      <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium">
        Finished
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium">LIVE</span>
        <span>{formatTime(timeLeft)}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getColorClass()}`} 
          style={{ width: `${timePercent}%` }}
        />
      </div>
    </div>
  );
} 