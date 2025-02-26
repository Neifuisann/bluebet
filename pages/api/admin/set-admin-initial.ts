import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This is a development-only endpoint
  // In production, you would want additional security here
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user to be an admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true
      }
    });

    return res.status(200).json({ 
      message: `User ${email} has been granted admin privileges`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error setting admin:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
} 