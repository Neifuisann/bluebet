import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the token which includes the user id from jwt
    const token = await getToken({ req });
    const userId = token?.id as string | undefined;

    // Get all upcoming matches
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { status: 'SCHEDULED' },
          { status: 'LIVE' }
        ],
        kickoffTime: {
          gte: new Date() // Only return matches in the future
        }
      },
      orderBy: {
        kickoffTime: 'asc'
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        // Include prediction for logged-in user
        predictions: userId ? {
          where: {
            userId: userId
          },
          take: 1
        } : false
      }
    });

    // Transform data to include user's prediction
    const matchesWithPredictions = matches.map(match => {
      const { predictions, ...matchData } = match;
      return {
        ...matchData,
        prediction: predictions?.length > 0 ? predictions[0] : null
      };
    });

    return res.status(200).json({ matches: matchesWithPredictions });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
} 