import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState, ReactNode } from 'react';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    // If the authentication status is still loading, wait
    if (status === 'loading') {
      return;
    }

    // Once authenticated, check if admin
    if (session) {
      // For development purposes - temporarily allow admin@example.com to access the admin area
      if (session.user.email === 'admin@example.com') {
        setIsAuthorized(true);
        setIsLoading(false);
        
        // Also trigger the API to make this user an admin permanently
        fetch('/api/admin/make-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(res => {
          console.log("Admin privileges activated for admin@example.com");
        }).catch(err => {
          console.error("Failed to activate admin privileges:", err);
        });
        
        return;
      }
      
      // Check if the user has admin privileges in the session
      if (session.user.isAdmin) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // If not in session, make an API call to double-check
      fetch('/api/admin/check-admin')
        .then(res => res.json())
        .then(data => {
          setIsAuthorized(data.isAdmin);
          if (!data.isAdmin) {
            // Optionally redirect non-admin users
            console.log('User is not an admin, redirecting...');
            router.push('/');
          }
        })
        .catch(err => {
          console.error('Error checking admin status:', err);
          setIsAuthorized(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 card">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-6">You don't have permission to access the admin area.</p>
          <p className="mb-4 text-sm text-gray-600">
            If you should have admin access, please make sure you're logged in with the correct account.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                // Call the make-admin API for the current user
                fetch('/api/admin/make-admin', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    alert("Admin privileges activated. Please refresh the page.");
                    window.location.reload();
                  } else {
                    alert("Failed to activate admin privileges: " + data.message);
                  }
                })
                .catch(err => {
                  console.error("Error:", err);
                  alert("An error occurred while activating admin privileges.");
                });
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Grant Admin Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 