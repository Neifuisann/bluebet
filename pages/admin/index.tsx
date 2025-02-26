import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminGuard from '../../components/AdminGuard';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({
    users: '...',
    predictions: '...',
    matches: '...'
  });

  useEffect(() => {
    setIsLoaded(true);
    
    // In a real app, you would fetch these stats from your API
    // For now, just mocking the data
    const fetchStats = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        users: '250',
        predictions: '1,432',
        matches: '86'
      });
    };
    
    fetchStats();
  }, []);

  // Check if the user is an admin (this would typically be checked server-side too)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Allow any authenticated user to access admin
      console.log("User authenticated, allowing admin access:", session?.user?.email);
    }
  }, [status, session, router]);

  if (status === 'loading' || !isLoaded) {
    return <div className="text-center py-8 animate-pulse">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="text-center py-8">Unauthorized. Please log in first.</div>;
  }

  return (
    <AdminGuard>
      <Head>
        <title>Admin Dashboard - Football Predictions</title>
        <meta name="description" content="Admin dashboard for Football Predictions" />
      </Head>

      <div className={`max-w-7xl mx-auto px-4 ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
        <h1 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-300 animate-slideInUp">
          Admin Dashboard
        </h1>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Matches Management */}
          <Link 
            href="/admin/matches" 
            className="card p-6 hover-lift transition-all animate-slideInUp stagger-1"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Manage Matches</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Add, edit, and update match results. Control fixture data and statuses.
            </p>
            <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
              Manage matches
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </span>
          </Link>

          {/* Users Management */}
          <Link 
            href="/admin/users" 
            className="card p-6 hover-lift transition-all animate-slideInUp stagger-2"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Manage Users</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              View and manage user accounts. Reset passwords and edit user details.
            </p>
            <span className="text-green-600 dark:text-green-400 font-medium flex items-center">
              Manage users
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </span>
          </Link>

          {/* Teams Management */}
          <Link 
            href="/admin/teams" 
            className="card p-6 hover-lift transition-all animate-slideInUp stagger-3"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Manage Teams</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Add, edit, and remove teams. Update team logos and information.
            </p>
            <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center">
              Manage teams
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </span>
          </Link>

          {/* Predictions Overview */}
          <Link 
            href="/admin/predictions" 
            className="card p-6 hover-lift transition-all animate-slideInUp stagger-4"
          >
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Predictions Overview</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              View all user predictions. See statistics and trends.
            </p>
            <span className="text-yellow-600 dark:text-yellow-400 font-medium flex items-center">
              View predictions
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </span>
          </Link>

          {/* System Settings */}
          <Link 
            href="/admin/settings" 
            className="card p-6 hover-lift transition-all animate-slideInUp stagger-5"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">System Settings</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Configure application settings. Manage scoring rules and site behavior.
            </p>
            <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center">
              Manage settings
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </span>
          </Link>

          {/* Data Import/Export */}
          <Link 
            href="/admin/data" 
            className="card p-6 hover-lift transition-all animate-slideInUp stagger-6"
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Data Management</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Import and export data. Manage fixtures and run database maintenance.
            </p>
            <span className="text-red-600 dark:text-red-400 font-medium flex items-center">
              Manage data
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </span>
          </Link>
        </div>

        <div className="mt-8 card p-6 animate-slideInUp stagger-7">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Total Users</h3>
                <span className="text-2xl font-bold">{stats.users}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active accounts in the system
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Total Predictions</h3>
                <span className="text-2xl font-bold">{stats.predictions}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Predictions made by users
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Upcoming Matches</h3>
                <span className="text-2xl font-bold">{stats.matches}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Matches available for prediction
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
} 