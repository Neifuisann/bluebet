import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import useSWR from 'swr';
import MatchCard from '../components/MatchCard';
import MatchUpdater from '../components/MatchUpdater';
import { useLanguage } from '../utils/i18n/LanguageContext';

interface Team {
  id: string;
  name: string;
  logo: string | null;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  league: string;
  prediction?: Prediction | null;
}

interface Prediction {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Matches() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [editingPrediction, setEditingPrediction] = useState<Prediction | null>(null);
  
  // Added filter state
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');

  // Use SWR for data fetching with auto-refresh (10 seconds)
  const { data, error, mutate } = useSWR('/api/matches', fetcher, { 
    refreshInterval: 10000, // refresh every 10 seconds
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (selectedMatch) {
      if (selectedMatch.prediction) {
        setHomeScore(selectedMatch.prediction.predictedHomeScore);
        setAwayScore(selectedMatch.prediction.predictedAwayScore);
        setEditingPrediction(selectedMatch.prediction);
      } else {
        setHomeScore(0);
        setAwayScore(0);
        setEditingPrediction(null);
      }
    }
  }, [selectedMatch]);

  const handlePredictionClick = (matchId: string, prediction?: Prediction | null) => {
    if (!session) {
      router.push('/login');
      return;
    }

    const match = data?.matches ? data.matches.find((m: Match) => m.id === matchId) : null;
    if (match) {
      setSelectedMatch(match);
      setShowPredictionModal(true);
    }
  };

  const handleSubmitPrediction = async () => {
    if (!selectedMatch || !session) return;

    try {
      const apiUrl = `/api/predictions${editingPrediction ? `/${editingPrediction.id}` : ''}`;
      const method = editingPrediction ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          homeScore,
          awayScore,
        }),
      });

      if (response.ok) {
        mutate(); // Refresh data
        setShowPredictionModal(false);
      } else {
        const error = await response.json();
        console.error('Failed to submit prediction:', error);
        // You could show an error toast here
      }
    } catch (error) {
      console.error('Error submitting prediction:', error);
    }
  };

  // Filter matches based on the selected filter
  const filteredMatches = data?.matches ? data.matches.filter((match: Match) => {
    if (filter === 'all') return true;
    if (filter === 'live') return match.status === 'LIVE';
    if (filter === 'upcoming') return match.status === 'SCHEDULED';
    if (filter === 'finished') return match.status === 'FINISHED';
    return true;
  }) : [];

  // Group matches by date (only for upcoming matches)
  const groupMatchesByDate = (matches: Match[]) => {
    const grouped: Record<string, Match[]> = {};
    
    matches.forEach((match) => {
      const date = new Date(match.kickoffTime).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(match);
    });
    
    return grouped;
  };

  // Group matches only if filter is 'all' or 'upcoming'
  const shouldGroupByDate = filter === 'all' || filter === 'upcoming';
  const groupedMatches = shouldGroupByDate ? groupMatchesByDate(filteredMatches) : {};

  return (
    <>
      <Head>
        <title>{t('matches')} | Football Predictor</title>
      </Head>

      {/* Include the match updater component */}
      <MatchUpdater />

      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
          {t('matches')}
        </h1>

        {/* Filter buttons */}
        <div className="mb-6 card p-4 animate-slideInUp stagger-1">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-gray-800 dark:bg-gray-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'live'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t('upcoming')}
            </button>
            <button
              onClick={() => setFilter('finished')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'finished'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t('finished')}
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-center text-red-600 p-8 card animate-slideInUp stagger-2">
            Failed to load match data. Please try again later.
          </div>
        ) : !data || !data.matches ? (
          <div className="text-center p-8 card animate-pulse animate-slideInUp stagger-2">
            Loading matches...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center p-8 card animate-slideInUp stagger-2">
            <p>No {filter} matches found.</p>
            {session && (
              <button 
                onClick={async () => {
                  try {
                    await fetch('/api/seed-matches', { method: 'POST' });
                    mutate(); // Refresh data after seeding
                  } catch (error) {
                    console.error('Error seeding matches:', error);
                  }
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md btn-pulse"
              >
                Generate Sample Matches
              </button>
            )}
          </div>
        ) : shouldGroupByDate ? (
          // Display grouped by date
          Object.entries(groupedMatches).map(([date, matches], dateIndex) => (
            <div key={date} className={`mb-8 animate-slideInUp`} style={{ animationDelay: `${dateIndex * 0.1}s` }}>
              <h2 className="text-xl font-semibold mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {date}
              </h2>
              <div className="space-y-4">
                {matches.map((match, matchIndex) => (
                  <MatchCard
                    key={match.id}
                    id={match.id}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    kickoffTime={match.kickoffTime}
                    homeScore={match.homeScore}
                    awayScore={match.awayScore}
                    status={match.status}
                    league={match.league}
                    prediction={match.prediction}
                    onPredictClick={handlePredictionClick}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Display flat list for live and finished matches
          <div className="space-y-4 animate-slideInUp stagger-2">
            {filteredMatches.map((match: Match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                kickoffTime={match.kickoffTime}
                homeScore={match.homeScore}
                awayScore={match.awayScore}
                status={match.status}
                league={match.league}
                prediction={match.prediction}
                onPredictClick={handlePredictionClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prediction Modal */}
      {showPredictionModal && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full animate-scaleIn">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{t('yourPrediction')}</h2>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col items-center space-y-2 w-1/3">
                <div className="relative w-12 h-12">
                  {selectedMatch.homeTeam.logo ? (
                    <Image
                      src={selectedMatch.homeTeam.logo}
                      alt={selectedMatch.homeTeam.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {selectedMatch.homeTeam.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="text-center font-medium dark:text-white">{selectedMatch.homeTeam.name}</span>
              </div>
              
              <div className="flex items-center space-x-4 w-1/3">
                <div className="w-full">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={homeScore}
                    onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                    className="w-16 h-16 text-center text-2xl rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xl font-bold dark:text-white">-</span>
                <div className="w-full">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={awayScore}
                    onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                    className="w-16 h-16 text-center text-2xl rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2 w-1/3">
                <div className="relative w-12 h-12">
                  {selectedMatch.awayTeam.logo ? (
                    <Image
                      src={selectedMatch.awayTeam.logo}
                      alt={selectedMatch.awayTeam.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {selectedMatch.awayTeam.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="text-center font-medium dark:text-white">{selectedMatch.awayTeam.name}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowPredictionModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmitPrediction}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors btn-pulse"
              >
                {t('submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 