import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This is a utility endpoint to grant admin access during setup
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Update the user to be an admin
    await prisma.$executeRaw`UPDATE "User" SET "isAdmin" = true WHERE "email" = 'admin@example.com'`;

    return res.status(200).json({ 
      success: true,
      message: 'Admin privileges granted to admin@example.com'
    });
  } catch (error) {
    console.error('Error setting admin:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
} 