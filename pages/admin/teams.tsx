import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import AdminGuard from '../../components/AdminGuard';

interface Team {
  id: string;
  name: string;
  logo: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminTeams() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    logo: '',
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // In a real application, you would fetch teams from your API
  // For this demo, we'll mock the data
  const mockTeams: Team[] = [
    { id: '1', name: 'Arsenal', logo: '/teams/arsenal.png' },
    { id: '2', name: 'Chelsea', logo: '/teams/chelsea.png' },
    { id: '3', name: 'Liverpool', logo: '/teams/liverpool.png' },
    { id: '4', name: 'Manchester City', logo: '/teams/man_city.png' },
    { id: '5', name: 'Manchester United', logo: '/teams/man_utd.png' },
    { id: '6', name: 'Newcastle United', logo: '/teams/newcastle.png' },
    { id: '7', name: 'Tottenham Hotspur', logo: '/teams/tottenham.png' },
    { id: '8', name: 'Aston Villa', logo: '/teams/aston_villa.png' },
  ];

  // Mock SWR data
  const { data, error, mutate } = useSWR('teams', () => {
    return new Promise<{ teams: Team[] }>((resolve) => {
      setTimeout(() => {
        resolve({ teams: mockTeams });
      }, 1000);
    });
  });

  const filteredTeams = data?.teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeam = () => {
    // In a real app, you would call your API to add the team
    // For this demo, we'll just update the local state
    if (!newTeam.name) {
      alert('Team name is required');
      return;
    }

    const newId = (data?.teams.length || 0) + 1;
    const updatedTeams = [
      ...(data?.teams || []),
      {
        id: newId.toString(),
        name: newTeam.name,
        logo: newTeam.logo || null,
      },
    ];

    mutate({ teams: updatedTeams }, false);
    setNewTeam({ name: '', logo: '' });
    setShowAddModal(false);
  };

  const handleEditTeam = () => {
    if (!editTeam) return;

    // In a real app, you would call your API to update the team
    // For this demo, we'll just update the local state
    const updatedTeams = data?.teams.map((team) =>
      team.id === editTeam.id ? editTeam : team
    );

    mutate({ teams: updatedTeams || [] }, false);
    setEditTeam(null);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    // In a real app, you would call your API to delete the team
    // For this demo, we'll just update the local state
    const updatedTeams = data?.teams.filter((team) => team.id !== teamId);
    mutate({ teams: updatedTeams || [] }, false);
  };

  return (
    <AdminGuard>
      <Head>
        <title>Admin - Manage Teams</title>
        <meta name="description" content="Admin teams management for Football Predictions" />
      </Head>

      <div className={`max-w-6xl mx-auto px-4 ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 animate-slideInUp">
              Manage Teams
            </h1>
            <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
              &larr; Back to Dashboard
            </Link>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all animate-slideInUp btn-pulse"
          >
            Add New Team
          </button>
        </div>

        <div className="mb-6 card p-4 animate-slideInUp stagger-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className="text-center text-red-600 p-8 card animate-slideInUp stagger-2">
            Failed to load team data. Please try again later.
          </div>
        ) : !data ? (
          <div className="text-center p-8 card animate-pulse animate-slideInUp stagger-2">
            Loading teams...
          </div>
        ) : filteredTeams && filteredTeams.length === 0 ? (
          <div className="text-center p-8 card animate-slideInUp stagger-2">
            <p>No teams found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideInUp stagger-2">
            {filteredTeams?.map((team, index) => (
              <div key={team.id} className="card p-4 hover-lift">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {team.logo ? (
                        <div className="w-10 h-10 relative">
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="object-contain"
                            width={40}
                            height={40}
                          />
                        </div>
                      ) : (
                        <span className="text-lg font-semibold">{team.name.substring(0, 2)}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditTeam(team)}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-1.5 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all"
                      title="Edit team"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-all"
                      title="Delete team"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
            <h3 className="text-xl font-semibold mb-4">Add New Team</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Team Name</label>
              <input 
                type="text" 
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
                placeholder="e.g. Arsenal"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input 
                type="text" 
                value={newTeam.logo}
                onChange={(e) => setNewTeam({...newTeam, logo: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
                placeholder="e.g. /teams/arsenal.png"
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
                onClick={handleAddTeam}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Add Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
            <h3 className="text-xl font-semibold mb-4">Edit Team</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Team Name</label>
              <input 
                type="text" 
                value={editTeam.name}
                onChange={(e) => setEditTeam({...editTeam, name: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input 
                type="text" 
                value={editTeam.logo || ''}
                onChange={(e) => setEditTeam({...editTeam, logo: e.target.value || null})}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setEditTeam(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditTeam}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
} 