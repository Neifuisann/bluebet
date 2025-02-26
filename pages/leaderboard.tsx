import { useState, useEffect } from 'react';
import Head from 'next/head';
import useSWR from 'swr';

interface LeaderboardUser {
  id: string;
  name: string;
  image: string | null;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const { data, error } = useSWR<{ users: LeaderboardUser[] }>(
    `/api/leaderboard?timeRange=${timeRange}`,
    fetcher
  );

  return (
    <>
      <Head>
        <title>Leaderboard - Football Predictions</title>
        <meta name="description" content="See the top football match predictors" />
      </Head>

      <div className={`max-w-4xl mx-auto ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
        <h1 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-300 animate-slideInUp">
          Prediction Leaderboard
        </h1>
        
        <div className="mb-6 card p-4 hover-lift animate-slideInUp stagger-1">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-xl font-semibold">Top Predictors</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 rounded-md transition-all ${
                  timeRange === 'all'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-md transition-all ${
                  timeRange === 'month'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-md transition-all ${
                  timeRange === 'week'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                This Week
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-center text-red-600 p-8 card animate-slideInUp stagger-2">
            Failed to load leaderboard data
          </div>
        ) : !data ? (
          <div className="text-center p-8 card animate-pulse animate-slideInUp stagger-2">
            Loading leaderboard...
          </div>
        ) : data.users.length === 0 ? (
          <div className="text-center p-8 card animate-slideInUp stagger-2">
            <p>No prediction data available yet.</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              As users make predictions and matches finish, the leaderboard will populate.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden animate-slideInUp stagger-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-center">Points</th>
                    <th className="px-4 py-3 text-center">Accuracy</th>
                    <th className="px-4 py-3 text-center">Predictions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.users.map((user, index) => {
                    const accuracy = user.totalPredictions > 0
                      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
                      : 0;
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover-scale-subtle">
                        <td className="px-4 py-4 font-semibold">
                          {index === 0 && (
                            <span className="inline-block w-8 h-8 bg-yellow-400 text-white rounded-full flex items-center justify-center mr-2 animate-pulse-slow">
                              1
                            </span>
                          )}
                          {index === 1 && (
                            <span className="inline-block w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center mr-2">
                              2
                            </span>
                          )}
                          {index === 2 && (
                            <span className="inline-block w-8 h-8 bg-yellow-700 text-white rounded-full flex items-center justify-center mr-2">
                              3
                            </span>
                          )}
                          {index > 2 && (
                            <span className="inline-block w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center mr-2">
                              {index + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">{user.name || 'Anonymous User'}</div>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-lg">
                          {user.totalPoints}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all"
                                style={{ width: `${accuracy}%` }}
                              ></div>
                            </div>
                            <span className="ml-2">{accuracy}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {user.totalPredictions}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800 animate-slideInUp stagger-3">
          <h2 className="text-xl font-semibold mb-3">How Points Are Calculated</h2>
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