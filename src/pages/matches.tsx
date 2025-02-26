import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import useSWR from 'swr';

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
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Matches() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data, error, mutate } = useSWR<{ matches: Match[] }>(
    '/api/matches',
    fetcher
  );

  const [activePrediction, setActivePrediction] = useState<{
    matchId: string;
    homeScore: number;
    awayScore: number;
  } | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group matches by date
  const groupMatchesByDate = (matches: Match[]) => {
    const grouped: { [key: string]: Match[] } = {};
    
    if (!matches) return {};

    matches.forEach((match) => {
      const date = formatDate(match.kickoffTime);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(match);
    });

    return grouped;
  };

  const handlePredictionClick = (matchId: string, existingPrediction?: Prediction | null) => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (existingPrediction) {
      setActivePrediction({
        matchId,
        homeScore: existingPrediction.predictedHomeScore,
        awayScore: existingPrediction.predictedAwayScore,
      });
    } else {
      setActivePrediction({
        matchId,
        homeScore: 0,
        awayScore: 0,
      });
    }
  };

  const handleScoreChange = (type: 'home' | 'away', value: number) => {
    if (!activePrediction) return;

    if (value < 0) value = 0;
    if (value > 20) value = 20;

    if (type === 'home') {
      setActivePrediction({
        ...activePrediction,
        homeScore: value,
      });
    } else {
      setActivePrediction({
        ...activePrediction,
        awayScore: value,
      });
    }
  };

  const submitPrediction = async () => {
    if (!activePrediction || !session) return;

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: activePrediction.matchId,
          predictedHomeScore: activePrediction.homeScore,
          predictedAwayScore: activePrediction.awayScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit prediction');
      }

      // Update local data
      await mutate();
      
      // Close prediction form
      setActivePrediction(null);
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert('Failed to submit prediction. Please try again.');
    }
  };

  if (error) return <div className="text-center text-red-600">Failed to load matches</div>;
  if (!data) return <div className="text-center">Loading matches...</div>;

  const groupedMatches = groupMatchesByDate(data.matches);

  return (
    <>
      <Head>
        <title>Upcoming Matches - Football Predictions</title>
        <meta name="description" content="View upcoming football matches and make your predictions" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upcoming Matches</h1>

        {Object.keys(groupedMatches).length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="mb-4">No upcoming matches found.</p>
            {session && session.user && (
              <button
                onClick={() => fetch('/api/seed', { method: 'POST' })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add Sample Matches
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedMatches).map(([date, matches]) => (
            <div key={date} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 bg-gray-100 p-2 rounded">
                {date}
              </h2>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex flex-col items-center w-1/3">
                          <div className="relative w-12 h-12 mb-2">
                            {match.homeTeam.logo ? (
                              <Image
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.name}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                {match.homeTeam.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className="text-center font-medium">{match.homeTeam.name}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-1/3">
                          <div className="text-sm text-gray-500 mb-1">
                            {formatTime(match.kickoffTime)}
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="text-2xl font-bold mx-2">vs</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{match.league}</div>
                        </div>

                        <div className="flex flex-col items-center w-1/3">
                          <div className="relative w-12 h-12 mb-2">
                            {match.awayTeam.logo ? (
                              <Image
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.name}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                {match.awayTeam.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className="text-center font-medium">{match.awayTeam.name}</span>
                        </div>
                      </div>

                      <div className="ml-4">
                        {match.prediction ? (
                          <div 
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => handlePredictionClick(match.id, match.prediction)}
                          >
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium mb-1">
                              Your Prediction
                            </div>
                            <div className="text-lg font-bold">
                              {match.prediction.predictedHomeScore} - {match.prediction.predictedAwayScore}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePredictionClick(match.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                          >
                            Predict
                          </button>
                        )}
                      </div>
                    </div>

                    {activePrediction && activePrediction.matchId === match.id && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-lg font-medium mb-3">Your Prediction</h3>
                        <div className="flex items-center justify-center space-x-8">
                          <div className="flex flex-col items-center">
                            <span className="mb-2">{match.homeTeam.name}</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={activePrediction.homeScore}
                              onChange={(e) => handleScoreChange('home', parseInt(e.target.value) || 0)}
                              className="w-16 text-center px-2 py-1 border rounded"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="mb-2">{match.awayTeam.name}</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={activePrediction.awayScore}
                              onChange={(e) => handleScoreChange('away', parseInt(e.target.value) || 0)}
                              className="w-16 text-center px-2 py-1 border rounded"
                            />
                          </div>
                        </div>
                        <div className="flex justify-center mt-4 space-x-3">
                          <button
                            onClick={() => setActivePrediction(null)}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={submitPrediction}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                          >
                            Submit Prediction
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
} 