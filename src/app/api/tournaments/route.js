import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';

// GET — List all tournaments
export async function GET() {
  try {
    await dbConnect();
    const tournaments = await Tournament.find({}).sort({ date: -1 }).lean();
    
    // Enrich with match counts for progress indicators
    const enriched = await Promise.all(tournaments.map(async (t) => {
      const [total, completed] = await Promise.all([
        Match.countDocuments({ tournamentId: t._id }),
        Match.countDocuments({ tournamentId: t._id, status: 'completed' })
      ]);
      return { ...t, totalMatches: total, completedMatches: completed };
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — Create a new tournament
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, date, format, playerCount, players, startTime, slotDuration } = body;

    if (!name || !date || !format || !playerCount || !players || players.length !== playerCount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields or player count mismatch'
      }, { status: 400 });
    }

    // Validate format-specific constraints
    if (format === 'group+knockout' && playerCount < 4) {
      return NextResponse.json({
        success: false,
        error: 'Group+Knockout format requires at least 4 players'
      }, { status: 400 });
    }

    if (format === 'knockout' && playerCount < 2) {
      return NextResponse.json({
        success: false,
        error: 'Knockout format requires at least 2 players'
      }, { status: 400 });
    }

    const tournament = await Tournament.create({
      name,
      date,
      format,
      playerCount,
      players,
      startTime: startTime || '10:00 AM',
      slotDuration: slotDuration || 10,
      status: 'draft',
    });

    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
