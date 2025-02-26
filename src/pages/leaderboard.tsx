import { useState } from 'react';
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

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Prediction Leaderboard</h1>
        
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Top Predictors</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 rounded-md ${
                  timeRange === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-md ${
                  timeRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-md ${
                  timeRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                This Week
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-center text-red-600 p-8 bg-white rounded-lg shadow-md">
            Failed to load leaderboard data
          </div>
        ) : !data ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            Loading leaderboard...
          </div>
        ) : data.users.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p>No prediction data available yet.</p>
            <p className="text-gray-600 mt-2">
              As users make predictions and matches finish, the leaderboard will populate.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-center">Points</th>
                  <th className="px-4 py-3 text-center">Accuracy</th>
                  <th className="px-4 py-3 text-center">Predictions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.users.map((user, index) => {
                  const accuracy = user.totalPredictions > 0
                    ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
                    : 0;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-semibold">
                        {index === 0 && (
                          <span className="inline-block w-8 h-8 bg-yellow-400 text-white rounded-full flex items-center justify-center mr-2">
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
                          <span className="inline-block w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center mr-2">
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
                          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
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
        )}

        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
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