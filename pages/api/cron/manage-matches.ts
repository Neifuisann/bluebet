import type { NextApiRequest, NextApiResponse } from 'next';
import { manageMatches } from '../../../utils/match/MatchGenerator';
import { getPredictionForMatch } from '../../../utils/match/GeminiPredictor';
import { PrismaClient, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API endpoint that will be called periodically (via cron) to manage matches
 * - Starts scheduled matches
 * - Finishes live matches after their duration
 * - Generates new matches as needed
 * - Updates match scores using AI prediction
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This endpoint should only be called via GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Optional security - could check for a secret API key in the request
    // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    // Find LIVE matches that are about to finish
    const now = new Date();
    const liveMatches = await prisma.match.findMany({
      where: { status: 'LIVE' as MatchStatus },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    
    // Process live matches that need finishing with AI predictions
    for (const match of liveMatches) {
      const matchStartTime = new Date(match.updatedAt);
      const elapsedSeconds = (now.getTime() - matchStartTime.getTime()) / 1000;
      
      if (elapsedSeconds >= 110 && elapsedSeconds <= 120) { // About to finish (between 110-120 seconds)
        // Use Gemini to predict the result
        const prediction = await getPredictionForMatch(match);
        
        // Log the prediction for debugging
        console.log(`AI prediction for ${match.homeTeam.name} vs ${match.awayTeam.name}: ${prediction.homeScore}-${prediction.awayScore}`);
        console.log(`Explanation: ${prediction.explanation}`);
        
        // Store prediction explanation in the database if needed
        // For now we'll just complete the match with the predicted scores
        await prisma.match.update({
          where: { id: match.id },
          data: { 
            status: 'FINISHED' as MatchStatus,
            homeScore: prediction.homeScore,
            awayScore: prediction.awayScore
          }
        });
        
        // Generate a replacement match
        await manageMatches();
      }
    }
    
    // Regular match management (start scheduled matches, ensure we have enough upcoming matches)
    const result = await manageMatches();
    
    return res.status(200).json({ 
      message: 'Match management completed successfully',
      matchesManaged: result
    });
  } catch (error) {
    console.error('Error managing matches in cron job:', error);
    return res.status(500).json({ 
      message: 'Error managing matches',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 