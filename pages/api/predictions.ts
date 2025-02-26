import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  
  if (!token?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = token.id as string;

  // POST - Create or update a prediction
  if (req.method === 'POST') {
    try {
      const { matchId, predictedHomeScore, predictedAwayScore } = req.body;

      if (!matchId || typeof predictedHomeScore !== 'number' || typeof predictedAwayScore !== 'number') {
        return res.status(400).json({ message: 'Invalid data provided' });
      }

      // Check if the match exists and is still open for predictions
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: { 
          id: true, 
          kickoffTime: true,
          status: true
        }
      });

      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }

      // Check if the match has already started
      if (match.status !== 'SCHEDULED' || new Date(match.kickoffTime) < new Date()) {
        return res.status(400).json({ message: 'Predictions closed for this match' });
      }

      // Get the user's current credits using raw query to bypass type issues
      const userResult = await prisma.$queryRaw`
        SELECT id, credits FROM User WHERE id = ${userId}
      `;
      
      const user = Array.isArray(userResult) && userResult.length > 0 
        ? userResult[0] as { id: string; credits: number }
        : null;

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user has enough credits (1 credit per prediction)
      if (user.credits < 1) {
        return res.status(400).json({ 
          message: 'Insufficient credits to make a prediction. Please earn more credits.',
          creditsNeeded: 1,
          currentCredits: user.credits
        });
      }

      // Use raw SQL for updating credits to bypass type issues
      await prisma.$executeRaw`
        UPDATE User SET credits = credits - 1 WHERE id = ${userId}
      `;
      
      // Create or update the prediction
      const prediction = await prisma.prediction.upsert({
        where: {
          userId_matchId: {
            userId,
            matchId
          }
        },
        update: {
          predictedHomeScore,
          predictedAwayScore
        },
        create: {
          userId,
          matchId,
          predictedHomeScore,
          predictedAwayScore
        }
      });
      
      // Get updated user credits
      const updatedUserResult = await prisma.$queryRaw`
        SELECT credits FROM User WHERE id = ${userId}
      `;
      
      const remainingCredits = Array.isArray(updatedUserResult) && updatedUserResult.length > 0
        ? (updatedUserResult[0] as { credits: number }).credits
        : 0;

      return res.status(200).json({
        prediction,
        remainingCredits
      });
    } catch (error) {
      console.error('Error saving prediction:', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // GET - Get user's predictions
  if (req.method === 'GET') {
    try {
      const predictions = await prisma.prediction.findMany({
        where: {
          userId
        },
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({ predictions });
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 