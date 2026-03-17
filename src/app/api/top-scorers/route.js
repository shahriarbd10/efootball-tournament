import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Tournament from '@/models/Tournament';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ success: false, error: 'Tournament ID is required' }, { status: 400 });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    }

    // Get all completed matches for this tournament
    const matches = await Match.find({ 
      tournamentId, 
      status: 'completed' 
    });

    const scores = {};

    matches.forEach(match => {
      // Add goals for player 1
      if (!scores[match.player1]) scores[match.player1] = 0;
      scores[match.player1] += (match.score1 || 0);

      // Add goals for player 2
      if (!scores[match.player2]) scores[match.player2] = 0;
      scores[match.player2] += (match.score2 || 0);
    });

    // Convert to sorted array
    const leaderboard = Object.entries(scores)
      .map(([name, goals]) => ({ name, goals }))
      .sort((a, b) => b.goals - a.goals);

    return NextResponse.json({
      success: true,
      data: leaderboard,
      tournamentName: tournament.name
    });

  } catch (error) {
    console.error('Top Scorers API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
