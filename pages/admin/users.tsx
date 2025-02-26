import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../components/AdminGuard';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const { data: session } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (user: User) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          isAdmin: !user.isAdmin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u
        )
      );

      // Show a confirmation message
      alert(`Admin status ${user.isAdmin ? 'removed from' : 'granted to'} ${user.name || user.email}`);
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. Please try again.');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminGuard>
      <Head>
        <title>Admin - Manage Users</title>
        <meta name="description" content="Admin users management for Football Predictions" />
      </Head>

      <div className={`max-w-6xl mx-auto px-4 ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 animate-slideInUp">
              Manage Users
            </h1>
            <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
              &larr; Back to Dashboard
            </Link>
          </div>
          <button
            onClick={fetchUsers}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all animate-slideInUp"
          >
            Refresh Users
          </button>
        </div>

        <div className="mb-6 card p-4 animate-slideInUp stagger-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers?.length || 0} user{(filteredUsers?.length || 0) !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
        
        {error ? (
          <div className="text-center text-red-600 p-8 card animate-slideInUp stagger-2">
            {error}
          </div>
        ) : loading ? (
          <div className="text-center p-8 card animate-pulse animate-slideInUp stagger-2">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-8 card animate-slideInUp stagger-2">
            <p>No users found matching your search criteria.</p>
          </div>
        ) : (
          <div className="card overflow-hidden animate-slideInUp stagger-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-center">Admin</th>
                    <th className="px-4 py-3 text-center">Joined</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user, index) => {
                    const staggerClass = `stagger-${Math.min(index + 1, 5)}`;
                    const isCurrentUser = session?.user?.email === user.email;
                    
                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-slideInRight ${staggerClass}`}>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {user.name || 'Anonymous User'}
                            {isCurrentUser && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>{user.email}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {user.isAdmin ? (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                              Admin
                            </span>
                          ) : (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs font-medium">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleAdminStatus(user)}
                            className={`${
                              user.isAdmin
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            } p-1.5 rounded-md hover:bg-opacity-75 transition-all`}
                            title={user.isAdmin ? 'Remove admin status' : 'Grant admin status'}
                            disabled={isCurrentUser} // Don't allow users to remove their own admin status
                          >
                            {user.isAdmin ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            )}
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
    </AdminGuard>
  );
} 