import type { NextApiRequest, NextApiResponse } from 'next';
import { generateRandomMatches } from '../../utils/match/MatchGenerator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API endpoint to seed initial matches
 * This is useful for testing and demo purposes
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if we already have active matches
    const existingMatches = await prisma.match.count({
      where: {
        status: {
          in: ['SCHEDULED', 'LIVE']
        }
      }
    });

    // Only seed if we have fewer than 5 matches
    if (existingMatches < 5) {
      const matchesToGenerate = 5 - existingMatches;
      
      // Generate the requested number of matches
      const generatedMatches = await generateRandomMatches(matchesToGenerate);
      
      return res.status(200).json({ 
        message: `Successfully seeded ${generatedMatches.length} new matches`,
        matches: generatedMatches
      });
    } else {
      return res.status(200).json({ 
        message: 'No new matches needed', 
        existingCount: existingMatches 
      });
    }
  } catch (error) {
    console.error('Error seeding matches:', error);
    return res.status(500).json({ 
      message: 'Error seeding matches',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 