import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import AdminGuard from '../../components/AdminGuard';

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminMatches() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Check if the user is an admin
  useEffect(() => {
    if (session === null) {
      router.push('/login');
    } else {
      // Allow any authenticated user to access admin
      console.log("User authenticated, allowing admin matches access:", session?.user?.email);
    }
  }, [session, router]);

  const { data, error, mutate } = useSWR<{ matches: Match[] }>(
    '/api/matches',
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

  const filteredMatches = data?.matches.filter(match => {
    const matchDate = new Date(match.kickoffTime);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return matchDate > now || match.status === 'SCHEDULED';
    } else if (filter === 'live') {
      return match.status === 'LIVE';
    } else if (filter === 'finished') {
      return match.status === 'FINISHED';
    } else if (filter === 'all') {
      return true;
    }
    return false;
  });

  // Mock function to update match scores and status
  const updateMatchResult = async (match: Match, homeScore: number, awayScore: number, status: string) => {
    try {
      // In a real app, this would update the backend
      // const response = await fetch(`/api/admin/matches/${match.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     homeScore,
      //     awayScore,
      //     status,
      //   }),
      // });
      
      // Optimistic update for demo
      mutate(
        {
          matches: data!.matches.map((m) => 
            m.id === match.id 
              ? { ...m, homeScore, awayScore, status } 
              : m
          ),
        },
        false
      );
      
      setEditMatch(null);
      // await mutate(); // In real app, refetch from server
    } catch (error) {
      console.error('Error updating match:', error);
    }
  };

  if (session === null) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (session === null) {
    return <div className="text-center py-8">Unauthorized. Please log in first.</div>;
  }

  return (
    <AdminGuard>
      <Head>
        <title>Admin - Manage Matches</title>
        <meta name="description" content="Admin matches management for Football Predictions" />
      </Head>

      <div className={`max-w-6xl mx-auto px-4 ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 animate-slideInUp">
              Manage Matches
            </h1>
            <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
              &larr; Back to Dashboard
            </Link>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all animate-slideInUp btn-pulse"
          >
            Add New Match
          </button>
        </div>

        <div className="mb-6 card p-4 animate-slideInUp stagger-1">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'live'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setFilter('finished')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'finished'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Finished
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-gray-800 text-white hover:bg-gray-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Matches
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-center text-red-600 p-8 card animate-slideInUp stagger-2">
            Failed to load match data. Please try again later.
          </div>
        ) : !data ? (
          <div className="text-center p-8 card animate-pulse animate-slideInUp stagger-2">
            Loading matches...
          </div>
        ) : filteredMatches && filteredMatches.length === 0 ? (
          <div className="text-center p-8 card animate-slideInUp stagger-2">
            <p>No {filter} matches found.</p>
          </div>
        ) : (
          <div className="card overflow-hidden animate-slideInUp stagger-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left">Match</th>
                    <th className="px-4 py-3 text-center">Date & Time</th>
                    <th className="px-4 py-3 text-center">League</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMatches?.map((match, index) => {
                    const matchDate = formatDate(match.kickoffTime);
                    const matchTime = formatTime(match.kickoffTime);
                    const staggerClass = `stagger-${Math.min(index + 1, 5)}`;

                    return (
                      <tr key={match.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-slideInRight ${staggerClass}`}>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {match.homeTeam.name} vs {match.awayTeam.name}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div>{matchDate}</div>
                          <div className="text-gray-600 dark:text-gray-400">{matchTime}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {match.league}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block
                            ${match.status === 'SCHEDULED' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' : ''}
                            ${match.status === 'LIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : ''}
                            ${match.status === 'FINISHED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : ''}
                            ${match.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : ''}
                          `}>
                            {match.status.charAt(0) + match.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-lg">
                          {match.homeScore !== null && match.awayScore !== null ? (
                            `${match.homeScore} - ${match.awayScore}`
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-base">Not played</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => setEditMatch(match)}
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-1.5 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all mr-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Match Modal */}
      {editMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
            <h3 className="text-xl font-semibold mb-4">Update Match Result</h3>
            <p className="mb-4">{editMatch.homeTeam.name} vs {editMatch.awayTeam.name}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Home Score</label>
                <input 
                  type="number" 
                  min="0"
                  defaultValue={editMatch.homeScore || 0}
                  id="homeScore"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Away Score</label>
                <input 
                  type="number" 
                  min="0"
                  defaultValue={editMatch.awayScore || 0}
                  id="awayScore"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                id="status"
                defaultValue={editMatch.status}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live</option>
                <option value="FINISHED">Finished</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setEditMatch(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const homeScore = parseInt((document.getElementById('homeScore') as HTMLInputElement).value);
                  const awayScore = parseInt((document.getElementById('awayScore') as HTMLInputElement).value);
                  const status = (document.getElementById('status') as HTMLSelectElement).value;
                  updateMatchResult(editMatch, homeScore, awayScore, status);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Match Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
            <h3 className="text-xl font-semibold mb-4">Add New Match</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Home Team</label>
              <select 
                id="homeTeam"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
              >
                <option value="">Select Home Team</option>
                {/* In a real app, this would be populated with teams from the database */}
                <option value="team1">Team 1</option>
                <option value="team2">Team 2</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Away Team</label>
              <select 
                id="awayTeam"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
              >
                <option value="">Select Away Team</option>
                {/* In a real app, this would be populated with teams from the database */}
                <option value="team1">Team 1</option>
                <option value="team2">Team 2</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Kickoff Date & Time</label>
              <input 
                type="datetime-local" 
                id="kickoffTime"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">League</label>
              <input 
                type="text" 
                id="league"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
                placeholder="e.g. Premier League"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // In a real app, this would save to the database
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Add Match
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
} 