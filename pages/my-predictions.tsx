import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import useSWR from 'swr';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
}

interface Prediction {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  points: number | null;
  createdAt: string;
  match: Match;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MyPredictions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
  }

  const { data, error } = useSWR<{ predictions: Prediction[] }>(
    session ? '/api/predictions' : null,
    fetcher
  );

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

  // Check prediction result
  const getPredictionResult = (prediction: Prediction) => {
    const match = prediction.match;
    
    if (match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null) {
      return { status: 'pending', text: 'Pending' };
    }
    
    // Exact score prediction
    if (prediction.predictedHomeScore === match.homeScore && 
        prediction.predictedAwayScore === match.awayScore) {
      return { status: 'exact', text: 'Exact Score', points: 3 };
    }
    
    // Correct goal difference
    const actualDiff = match.homeScore - match.awayScore;
    const predictedDiff = prediction.predictedHomeScore - prediction.predictedAwayScore;
    
    if (actualDiff === predictedDiff) {
      return { status: 'diff', text: 'Correct Difference', points: 2 };
    }
    
    // Correct result
    const actualResult = Math.sign(actualDiff);
    const predictedResult = Math.sign(predictedDiff);
    
    if (actualResult === predictedResult) {
      return { status: 'result', text: 'Correct Result', points: 1 };
    }
    
    return { status: 'wrong', text: 'Incorrect', points: 0 };
  };

  if (status === 'loading') {
    return <div className="text-center py-8 animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">Failed to load predictions</div>;
  }

  if (!data) {
    return <div className="text-center py-8 animate-pulse">Loading predictions...</div>;
  }

  return (
    <>
      <Head>
        <title>My Predictions - Football Predictions</title>
        <meta name="description" content="View your football match predictions" />
      </Head>

      <div className={`max-w-4xl mx-auto ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
        <h1 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-300 animate-slideInUp">My Predictions</h1>

        {data.predictions.length === 0 ? (
          <div className="card p-8 text-center animate-slideInUp stagger-1">
            <p className="mb-4 text-lg">You haven't made any predictions yet.</p>
            <Link
              href="/matches"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium inline-block transition-all btn-pulse"
            >
              Predict Upcoming Matches
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden animate-slideInUp stagger-1">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left">Match</th>
                    <th className="px-4 py-3 text-center">Date & Time</th>
                    <th className="px-4 py-3 text-center">Your Prediction</th>
                    <th className="px-4 py-3 text-center">Actual Score</th>
                    <th className="px-4 py-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.predictions.map((prediction, index) => {
                    const result = getPredictionResult(prediction);
                    const match = prediction.match;
                    const matchDate = formatDate(match.kickoffTime);
                    const matchTime = formatTime(match.kickoffTime);
                    const isMatchFinished = match.status === 'FINISHED';
                    const staggerClass = `stagger-${Math.min(index + 1, 5)}`;

                    return (
                      <tr key={prediction.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-slideInRight ${staggerClass} hover-scale-subtle`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 relative mr-2">
                              {match.homeTeam.logo ? (
                                <Image
                                  src={match.homeTeam.logo}
                                  alt={match.homeTeam.name}
                                  fill
                                  className="object-contain"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm">
                                  {match.homeTeam.name.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{match.homeTeam.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">vs</div>
                              <div className="font-medium">{match.awayTeam.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div>{matchDate}</div>
                          <div className="text-gray-600 dark:text-gray-400">{matchTime}</div>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-lg">
                          {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isMatchFinished && match.homeScore !== null && match.awayScore !== null ? (
                            <span className="font-semibold text-lg">
                              {match.homeScore} - {match.awayScore}
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isMatchFinished ? (
                            <div className={`
                              px-3 py-1 rounded-full text-sm font-medium inline-block transition-all
                              ${result.status === 'exact' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' : ''}
                              ${result.status === 'diff' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' : ''}
                              ${result.status === 'result' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' : ''}
                              ${result.status === 'wrong' ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300' : ''}
                            `}>
                              {result.text}
                              {result.points !== undefined && (
                                <span className="font-bold ml-1">
                                  ({result.points} pts)
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-medium inline-block">
                              Waiting
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800 animate-slideInUp stagger-2">
          <h2 className="text-xl font-semibold mb-3">Prediction Points System</h2>
          <ul className="list-disc list-inside">
            <li className="mb-2"><span className="font-medium">3 points</span> - Exact score prediction</li>
            <li className="mb-2"><span className="font-medium">2 points</span> - Correct result and goal difference</li>
            <li className="mb-2"><span className="font-medium">1 point</span> - Correct result only (win/loss/draw)</li>
          </ul>
        </div>
      </div>
    </>
  );
} 