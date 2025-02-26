import { useEffect, useState, useRef } from 'react';

/**
 * Component that periodically triggers match updates
 * This is invisible and just runs in the background
 */
export default function MatchUpdater() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to update matches
    const updateMatches = async () => {
      if (isUpdating) return;
      
      try {
        setIsUpdating(true);
        setError(null);
        
        // Call our API endpoint to manage matches
        const response = await fetch('/api/cron/manage-matches');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update matches: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Match update result:', data);
        
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Error updating matches:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsUpdating(false);
      }
    };

    // Trigger initial update
    updateMatches();
    
    // Set up interval to update matches (increased to 30 seconds for less frequent updates)
    intervalRef.current = setInterval(updateMatches, 30000);
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty dependency array so this only runs once on mount

  // This component doesn't render anything visible
  return null;
} 