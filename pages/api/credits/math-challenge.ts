import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
import { generateMathProblem, MathProblem } from '../../../utils/math/MathProblemGenerator';

const prisma = new PrismaClient();

// Store active challenges in memory to verify solutions
// In a production app, this should be in a database or Redis
const activeUserChallenges: Record<string, MathProblem & { expiry: number }> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
    
  if (!token?.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = token.id as string;

  // GET: Generate a new math challenge for the user
  if (req.method === 'GET') {
    try {
      // Check if user needs credits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate difficulty based on user's credit balance
      let difficulty: 'easy' | 'medium' | 'hard';
      if (user.credits <= 2) {
        difficulty = 'easy';
      } else if (user.credits <= 10) {
        difficulty = 'medium';
      } else {
        difficulty = 'hard';
      }

      // Generate a new math problem
      const problem = generateMathProblem(difficulty);
      
      // Store the problem with expiry (5 minutes)
      activeUserChallenges[userId] = {
        ...problem,
        expiry: Date.now() + 5 * 60 * 1000
      };
      
      // Return the challenge without the answer
      return res.status(200).json({
        question: problem.question,
        difficulty: problem.difficulty
      });
    } catch (error) {
      console.error('Error generating math challenge:', error);
      return res.status(500).json({ message: 'Failed to generate challenge' });
    }
  }
  
  // POST: Verify the user's answer and award credits if correct
  if (req.method === 'POST') {
    try {
      const { answer } = req.body;
      
      if (answer === undefined || answer === null) {
        return res.status(400).json({ message: 'Answer is required' });
      }
      
      // Check if user has an active challenge
      const userChallenge = activeUserChallenges[userId];
      if (!userChallenge) {
        return res.status(400).json({ message: 'No active challenge found. Request a new one.' });
      }
      
      // Check if challenge has expired
      if (Date.now() > userChallenge.expiry) {
        delete activeUserChallenges[userId];
        return res.status(400).json({ message: 'Challenge expired. Request a new one.' });
      }
      
      // Convert the submitted answer to a number for comparison
      const numericAnswer = Number(answer);
      
      // Check if the answer is correct (allow small rounding errors for decimal results)
      const isCorrect = Math.abs(numericAnswer - userChallenge.answer) < 0.01;
      
      if (isCorrect) {
        // Award credits based on difficulty
        let creditsToAward = 1;
        if (userChallenge.difficulty === 'medium') creditsToAward = 2;
        if (userChallenge.difficulty === 'hard') creditsToAward = 3;
        
        // Update user's credits
        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: creditsToAward
            }
          }
        });
        
        // Remove the challenge
        delete activeUserChallenges[userId];
        
        return res.status(200).json({
          success: true,
          message: `Correct! You've earned ${creditsToAward} credit${creditsToAward > 1 ? 's' : ''}.`,
          creditsAwarded: creditsToAward
        });
      } else {
        // Incorrect answer
        return res.status(200).json({
          success: false,
          message: `Incorrect answer. The correct answer was ${userChallenge.answer}.`,
          correctAnswer: userChallenge.answer
        });
      }
    } catch (error) {
      console.error('Error verifying math challenge:', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 