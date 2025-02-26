import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '../utils/i18n/LanguageContext';
import MatchCountdown from './MatchCountdown';
import MatchAnalysis from './MatchAnalysis';

interface Team {
  id: string;
  name: string;
  logo: string | null;
}

interface Prediction {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  createdAt: string;
}

interface MatchCardProps {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  league: string;
  prediction?: Prediction | null;
  onPredictClick: (matchId: string, prediction?: Prediction | null) => void;
}

export default function MatchCard({
  id,
  homeTeam,
  awayTeam,
  kickoffTime,
  homeScore,
  awayScore,
  status,
  league,
  prediction,
  onPredictClick
}: MatchCardProps) {
  const { t } = useLanguage();
  
  // Format the time
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card p-4 hover-lift transition-all rounded-lg">
      {/* Status badge - top right */}
      <div className="flex justify-end mb-2">
        {status === 'LIVE' && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            LIVE
          </div>
        )}
        {status === 'FINISHED' && (
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
            {t('finished')}
          </div>
        )}
        {status === 'SCHEDULED' && (
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
            {t('upcoming')}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between flex-wrap">
        {/* Home Team */}
        <div className="flex flex-col items-center w-1/3 md:w-1/4">
          <div className="relative w-12 h-12 mb-2">
            {homeTeam.logo ? (
              <Image
                src={homeTeam.logo}
                alt={homeTeam.name}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {homeTeam.name.substring(0, 2)}
              </div>
            )}
          </div>
          <span className="text-center font-medium">{homeTeam.name}</span>
        </div>

        {/* Match Info & Score */}
        <div className="flex flex-col items-center justify-center w-1/3 md:w-2/4">
          {/* Display score for LIVE/FINISHED matches, or VS for scheduled */}
          {(status === 'LIVE' || status === 'FINISHED') && homeScore !== null && awayScore !== null ? (
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold mx-2">{homeScore}</span>
              <span className="text-xl mx-1">-</span>
              <span className="text-3xl font-bold mx-2">{awayScore}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold mx-2">{t('vs')}</span>
            </div>
          )}
          
          {/* Time or Countdown */}
          {status === 'LIVE' ? (
            <div className="w-full max-w-[200px] mt-2">
              <MatchCountdown startTime={new Date(kickoffTime)} status={status} />
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(kickoffTime)}</div>
          )}
          
          {/* League */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{league}</div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center w-1/3 md:w-1/4">
          <div className="relative w-12 h-12 mb-2">
            {awayTeam.logo ? (
              <Image
                src={awayTeam.logo}
                alt={awayTeam.name}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {awayTeam.name.substring(0, 2)}
              </div>
            )}
          </div>
          <span className="text-center font-medium">{awayTeam.name}</span>
        </div>
      </div>
      
      {/* Prediction or Predict Button */}
      <div className="mt-4 flex justify-center">
        {prediction ? (
          <div 
            className="flex flex-col items-center cursor-pointer hover-scale"
            onClick={() => onPredictClick(id, prediction)}
          >
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded text-sm font-medium mb-1">
              {t('yourPrediction')}
            </div>
            <div className="text-lg font-bold">
              {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
            </div>
          </div>
        ) : status !== 'FINISHED' ? (
          <button
            onClick={() => onPredictClick(id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded btn-pulse"
          >
            {t('predict')}
          </button>
        ) : null}
      </div>
      
      {/* Match Analysis for finished matches */}
      {status === 'FINISHED' && homeScore !== null && awayScore !== null && (
        <MatchAnalysis 
          homeTeam={homeTeam.name} 
          awayTeam={awayTeam.name} 
          homeScore={homeScore} 
          awayScore={awayScore} 
        />
      )}
    </div>
  );
} 