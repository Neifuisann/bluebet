import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <Head>
        <title>Football Match Predictions</title>
        <meta name="description" content="Predict football match scores and compete with friends" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center">
        <div className={`max-w-4xl w-full text-center ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold text-blue-800 mb-6 animate-slideInUp">
            Welcome to Football Predictor
          </h1>
          <p className="text-xl mb-8 animate-slideInUp stagger-1">
            Predict match scores, compete with friends, and track your prediction accuracy.
          </p>

          <div className="card p-8 mb-8 hover-lift animate-slideInUp stagger-2">
            <h2 className="text-2xl font-semibold mb-4">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center hover-scale">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">1. Predict Scores</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Submit your predictions before matches begin</p>
              </div>
              <div className="flex flex-col items-center hover-scale">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">2. Score Points</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Earn points for accurate predictions</p>
              </div>
              <div className="flex flex-col items-center hover-scale">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 000 2h6a1 1 0 100-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3zm12-3a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">3. Climb Leaderboard</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Compete with others to reach the top</p>
              </div>
            </div>
          </div>

          {!session ? (
            <div className="flex gap-4 justify-center mb-8 animate-slideInUp stagger-3">
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-lg btn-pulse"
              >
                Sign Up Now
              </Link>
              <Link 
                href="/login" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-6 py-3 rounded-md font-medium text-lg transition-all"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="flex justify-center mb-8 animate-slideInUp stagger-3">
              <Link 
                href="/matches" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-lg btn-pulse"
              >
                View Upcoming Matches
              </Link>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800 animate-slideInUp stagger-3">
            <h2 className="text-xl font-semibold mb-3">Scoring System</h2>
            <ul className="list-disc list-inside text-left">
              <li className="mb-2"><span className="font-medium">3 points</span> - Exact score prediction</li>
              <li className="mb-2"><span className="font-medium">2 points</span> - Correct result and goal difference</li>
              <li className="mb-2"><span className="font-medium">1 point</span> - Correct result only</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
} 