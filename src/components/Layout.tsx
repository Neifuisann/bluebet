import { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            FootballPredictor
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link href="/matches" className="hover:text-blue-200">
              Matches
            </Link>
            <Link href="/leaderboard" className="hover:text-blue-200">
              Leaderboard
            </Link>
            {session ? (
              <>
                <Link href="/my-predictions" className="hover:text-blue-200">
                  My Predictions
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} FootballPredictor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 