import { PrismaClient, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

// The duration of each match in seconds
export const MATCH_DURATION = 120; // 2 minutes

// Popular football teams to use for random match generation
const POPULAR_TEAMS = [
  "Manchester United",
  "Liverpool",
  "Arsenal",
  "Chelsea",
  "Manchester City",
  "Tottenham Hotspur",
  "Barcelona",
  "Real Madrid",
  "Bayern Munich",
  "Paris Saint-Germain",
  "Juventus",
  "AC Milan",
  "Inter Milan",
  "Borussia Dortmund",
  "Ajax",
  "Porto",
  "Benfica",
  "Sporting CP",
  "Atletico Madrid",
  "Sevilla"
];

// Leagues for random match generation
const LEAGUES = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Champions League",
  "Europa League"
];

/**
 * Generates a random match between two teams
 */
export async function generateRandomMatch() {
  try {
    // Get all teams from the database
    const dbTeams = await prisma.team.findMany();
    
    // If there are no teams in the database, use the popular teams list
    const availableTeams = dbTeams.length > 0 ? dbTeams : 
      POPULAR_TEAMS.map((name, index) => ({ 
        id: `temp-${index}`, 
        name, 
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    // Select two random teams ensuring they're different
    let homeTeamIndex = Math.floor(Math.random() * availableTeams.length);
    let awayTeamIndex;
    do {
      awayTeamIndex = Math.floor(Math.random() * availableTeams.length);
    } while (awayTeamIndex === homeTeamIndex);

    const homeTeam = availableTeams[homeTeamIndex];
    const awayTeam = availableTeams[awayTeamIndex];
    
    // Choose a random league
    const league = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
    
    // Set kickoff time to now
    const kickoffTime = new Date();
    
    // If using database teams, create the match in the database
    if (dbTeams.length > 0) {
      const newMatch = await prisma.match.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          kickoffTime: kickoffTime,
          status: 'SCHEDULED' as MatchStatus,
          league,
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      });
      
      return newMatch;
    } else {
      // Return a mock match object if not using the database
      return {
        id: `match-${Date.now()}`,
        homeTeamId: homeTeam.id,
        homeTeam,
        awayTeamId: awayTeam.id,
        awayTeam,
        kickoffTime,
        homeScore: null,
        awayScore: null,
        status: 'SCHEDULED',
        league,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    console.error('Error generating random match:', error);
    throw error;
  }
}

/**
 * Generates multiple random matches
 */
export async function generateRandomMatches(count: number) {
  const matches = [];
  for (let i = 0; i < count; i++) {
    const match = await generateRandomMatch();
    matches.push(match);
  }
  return matches;
}

/**
 * Updates a match to LIVE status
 */
export async function startMatch(matchId: string) {
  try {
    return await prisma.match.update({
      where: { id: matchId },
      data: { status: 'LIVE' },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
  } catch (error) {
    console.error(`Error starting match ${matchId}:`, error);
    throw error;
  }
}

/**
 * Updates a match to FINISHED status with final scores
 */
export async function finishMatch(matchId: string, homeScore: number, awayScore: number) {
  try {
    return await prisma.match.update({
      where: { id: matchId },
      data: { 
        status: 'FINISHED',
        homeScore,
        awayScore
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
  } catch (error) {
    console.error(`Error finishing match ${matchId}:`, error);
    throw error;
  }
}

/**
 * Checks for upcoming matches, starts them, and generates new ones if needed
 */
export async function manageMatches() {
  try {
    // Get all SCHEDULED matches
    const scheduledMatches = await prisma.match.findMany({
      where: { status: 'SCHEDULED' },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { kickoffTime: 'asc' },
    });
    
    // Get all LIVE matches
    const liveMatches = await prisma.match.findMany({
      where: { status: 'LIVE' },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    
    // Start scheduled matches if their kickoff time has passed
    const now = new Date();
    for (const match of scheduledMatches) {
      if (new Date(match.kickoffTime) <= now) {
        await startMatch(match.id);
      }
    }
    
    // Finish LIVE matches if they've been running for MATCH_DURATION seconds
    for (const match of liveMatches) {
      const matchStartTime = new Date(match.updatedAt);
      const elapsedSeconds = (now.getTime() - matchStartTime.getTime()) / 1000;
      
      if (elapsedSeconds >= MATCH_DURATION) {
        // Generate random scores (0-5 goals per team is reasonable)
        const homeScore = Math.floor(Math.random() * 6);
        const awayScore = Math.floor(Math.random() * 6);
        
        await finishMatch(match.id, homeScore, awayScore);
        
        // Generate a new match to replace this one
        await generateRandomMatch();
      }
    }
    
    // Make sure we always have at least 5 upcoming matches
    const totalActiveMatches = scheduledMatches.length + liveMatches.length;
    if (totalActiveMatches < 5) {
      const matchesToGenerate = 5 - totalActiveMatches;
      await generateRandomMatches(matchesToGenerate);
    }
    
    return { 
      scheduled: scheduledMatches.length,
      live: liveMatches.length,
      generated: totalActiveMatches < 5 ? 5 - totalActiveMatches : 0
    };
  } catch (error) {
    console.error('Error managing matches:', error);
    throw error;
  }
} 