import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data
const teams = [
  { name: 'Manchester United', logo: '/teams/man_utd.png' },
  { name: 'Arsenal', logo: '/teams/arsenal.png' },
  { name: 'Chelsea', logo: '/teams/chelsea.png' },
  { name: 'Liverpool', logo: '/teams/liverpool.png' },
  { name: 'Manchester City', logo: '/teams/man_city.png' },
  { name: 'Tottenham Hotspur', logo: '/teams/tottenham.png' },
  { name: 'Newcastle United', logo: '/teams/newcastle.png' },
  { name: 'Aston Villa', logo: '/teams/aston_villa.png' },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // For security in production, you would want to add authentication here
  // to ensure only admins can seed the database

  try {
    // Add teams
    for (const team of teams) {
      await prisma.team.upsert({
        where: { name: team.name },
        update: {},
        create: {
          name: team.name,
          logo: team.logo,
        },
      });
    }

    // Get all teams
    const dbTeams = await prisma.team.findMany();

    // Create upcoming matches for the next 7 days
    const now = new Date();
    const matches = [];

    for (let i = 1; i <= 7; i++) {
      const matchDate = new Date();
      matchDate.setDate(now.getDate() + i);
      
      // Create 2 matches per day
      for (let j = 0; j < 2; j++) {
        // Randomly select home and away teams
        const availableTeams = [...dbTeams];
        const homeTeamIndex = Math.floor(Math.random() * availableTeams.length);
        const homeTeam = availableTeams.splice(homeTeamIndex, 1)[0];
        
        const awayTeamIndex = Math.floor(Math.random() * availableTeams.length);
        const awayTeam = availableTeams.splice(awayTeamIndex, 1)[0];

        // Set kickoff time (15:00 or 19:30)
        const kickoffTime = new Date(matchDate);
        kickoffTime.setHours(j === 0 ? 15 : 19, j === 0 ? 0 : 30, 0, 0);

        matches.push({
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          kickoffTime,
          league: 'Premier League',
        });
      }
    }

    // Add matches to database
    for (const match of matches) {
      await prisma.match.create({
        data: match,
      });
    }

    res.status(200).json({ 
      message: 'Database seeded successfully',
      teamsAdded: dbTeams.length,
      matchesAdded: matches.length
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
} 