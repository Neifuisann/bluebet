import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
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
    const token = await getToken({ req });
    
    if (!token?.id) {
      return res.status(401).json({ 
        isAdmin: false,
        message: 'Not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { isAdmin: true }
    });

    if (!user) {
      return res.status(404).json({ 
        isAdmin: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({ 
      isAdmin: !!user.isAdmin,
      message: user.isAdmin ? 'User has admin privileges' : 'User does not have admin privileges'
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ 
      isAdmin: false,
      message: 'Something went wrong'
    });
  }
} 