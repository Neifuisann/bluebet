import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { timeRange = 'all' } = req.query;
    
    // Date filters based on time range
    let dateFilter = {};
    
    if (timeRange === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = {
        createdAt: {
          gte: lastWeek
        }
      };
    } else if (timeRange === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateFilter = {
        createdAt: {
          gte: lastMonth
        }
      };
    }

    // Get all users with their predictions
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        predictions: {
          where: {
            ...dateFilter,
            match: {
              status: 'FINISHED'
            }
          },
          select: {
            points: true,
            predictedHomeScore: true,
            predictedAwayScore: true,
            match: {
              select: {
                homeScore: true,
                awayScore: true
              }
            }
          }
        }
      }
    });

    // Calculate stats for each user
    const leaderboardData = users.map(user => {
      let totalPoints = 0;
      let correctPredictions = 0;

      user.predictions.forEach(prediction => {
        // For points, use stored value or calculate if not set
        if (prediction.points !== null) {
          totalPoints += prediction.points;
          if (prediction.points > 0) {
            correctPredictions++;
          }
        } else {
          // Calculate points if not stored (fallback logic)
          const { match, predictedHomeScore, predictedAwayScore } = prediction;
          
          if (match.homeScore === null || match.awayScore === null) {
            return; // Skip matches without scores
          }

          // Exact score prediction - 3 points
          if (predictedHomeScore === match.homeScore && 
              predictedAwayScore === match.awayScore) {
            totalPoints += 3;
            correctPredictions++;
            return;
          }

          // Correct goal difference - 2 points
          const actualDiff = match.homeScore - match.awayScore;
          const predictedDiff = predictedHomeScore - predictedAwayScore;
          
          if (actualDiff === predictedDiff) {
            totalPoints += 2;
            correctPredictions++;
            return;
          }
          
          // Correct result - 1 point
          const actualResult = Math.sign(actualDiff);
          const predictedResult = Math.sign(predictedDiff);
          
          if (actualResult === predictedResult) {
            totalPoints += 1;
            correctPredictions++;
          }
        }
      });

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        totalPoints,
        correctPredictions,
        totalPredictions: user.predictions.length
      };
    });

    // Sort by total points (descending)
    const sortedLeaderboard = leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    return res.status(200).json({ users: sortedLeaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
} 