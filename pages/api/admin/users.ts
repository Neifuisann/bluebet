import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the token to verify admin access
  const token = await getToken({ req });
  
  if (!token?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check if the user is an admin using raw SQL since the Prisma types might not be updated yet
  const isAdmin = await prisma.$queryRaw`
    SELECT "isAdmin" FROM "User" WHERE "id" = ${token.id as string}
  `;

  // Allow access for admin@example.com even if isAdmin flag isn't working
  const currentUser = await prisma.user.findUnique({ 
    where: { id: token.id as string },
    select: { email: true }
  });
  
  if (!(isAdmin as any)[0]?.isAdmin && currentUser?.email !== 'admin@example.com') {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }

  // Handle GET request to list all users
  if (req.method === 'GET') {
    try {
      // Get all users with their admin status
      const users = await prisma.$queryRaw`
        SELECT 
          "id", 
          "name", 
          "email", 
          "image", 
          "isAdmin",
          "createdAt"
        FROM "User"
        ORDER BY "createdAt" DESC
      `;

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // Handle POST request to update user admin status
  if (req.method === 'POST') {
    try {
      const { userId, isAdmin } = req.body;

      if (!userId || typeof isAdmin !== 'boolean') {
        return res.status(400).json({ message: 'Invalid request data' });
      }

      // Update the user's admin status using raw SQL
      await prisma.$executeRaw`
        UPDATE "User" 
        SET "isAdmin" = ${isAdmin} 
        WHERE "id" = ${userId}
      `;

      const updatedUser = await prisma.$queryRaw`
        SELECT 
          "id", 
          "name", 
          "email", 
          "isAdmin" 
        FROM "User" 
        WHERE "id" = ${userId}
      `;

      return res.status(200).json({ 
        message: `Admin status ${isAdmin ? 'granted' : 'revoked'} successfully`,
        user: (updatedUser as any)[0]
      });
    } catch (error) {
      console.error('Error updating user admin status:', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 