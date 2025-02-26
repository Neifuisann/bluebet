import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '../utils/i18n/LanguageContext';

export default function MathChallenge() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [answer, setAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; isCorrect?: boolean; creditsAwarded?: number; } | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Get a new math challenge
  const getNewChallenge = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      setFeedback(null);
      setAnswer('');
      
      const response = await fetch('/api/credits/math-challenge');
      if (!response.ok) {
        throw new Error('Failed to get math challenge');
      }
      
      const data = await response.json();
      setQuestion(data.question);
      setDifficulty(data.difficulty);
      
      // Start a 5-minute timer
      setTimer(5 * 60);
      
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
    } catch (error) {
      console.error('Error getting math challenge:', error);
      setFeedback({ message: 'Failed to load challenge. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit the answer
  const submitAnswer = async () => {
    if (!session || !question || !answer) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/credits/math-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: parseFloat(answer) }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setFeedback({
          message: data.message,
          isCorrect: true,
          creditsAwarded: data.creditsAwarded
        });
        setQuestion(null);
        
        // Clear the timer
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        setTimer(null);
      } else {
        setFeedback({
          message: data.message,
          isCorrect: false
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback({ message: 'Failed to submit answer. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Format the timer as MM:SS
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  if (!session) {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-3 py-2 rounded-lg transition-all"
        title="Earn credits by solving math problems"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
        <span className="hidden sm:inline">Math Challenge</span>
        <span className="inline sm:hidden">+</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Math Challenge</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Solve math challenges to earn credits. The harder the challenge, the more credits you earn!
              </p>
              
              {difficulty && (
                <div className="flex mb-2">
                  <span 
                    className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded 
                      ${difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                      ${difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                      ${difficulty === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                    `}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                  
                  {timer !== null && (
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded 
                      ${timer > 60 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                      ${timer <= 60 && timer > 30 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                      ${timer <= 30 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                    `}
                    >
                      Time left: {formatTime(timer)}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {question ? (
              <div className="mb-6">
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-medium dark:text-white">{question}</p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Answer
                  </label>
                  <input
                    type="text"
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your answer..."
                  />
                </div>
                
                {feedback && (
                  <div className={`p-3 mb-4 rounded-md 
                    ${feedback.isCorrect === true ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                    ${feedback.isCorrect === false ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                    ${feedback.isCorrect === undefined ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                  `}>
                    {feedback.message}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={getNewChallenge}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    New Challenge
                  </button>
                  <button
                    onClick={submitAnswer}
                    disabled={isLoading || !answer}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Checking...' : 'Submit'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {feedback && (
                  <div className={`p-3 mb-6 rounded-md 
                    ${feedback.isCorrect === true ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                    ${feedback.isCorrect === false ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                    ${feedback.isCorrect === undefined ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                  `}>
                    {feedback.message}
                  </div>
                )}
                
                <button
                  onClick={getNewChallenge}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Start Challenge'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 