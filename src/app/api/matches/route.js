import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    const filter = {};
    if (tournamentId) filter.tournamentId = tournamentId;

    const matches = await Match.find(filter).sort({ matchNumber: 1 });
    return NextResponse.json({ success: true, data: matches });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { matchId, matchNumber, tournamentId, score1, score2, status, player1, player2 } = body;

    const updateData = {};
    if (score1 !== undefined) updateData.score1 = score1;
    if (score2 !== undefined) updateData.score2 = score2;
    if (status) updateData.status = status;
    if (player1) updateData.player1 = player1;
    if (player2) updateData.player2 = player2;

    let match;
    if (matchId) {
      match = await Match.findByIdAndUpdate(matchId, updateData, { new: true });
    } else if (tournamentId && matchNumber) {
      match = await Match.findOneAndUpdate(
        { tournamentId, matchNumber },
        updateData,
        { new: true }
      );
    } else {
      match = await Match.findOneAndUpdate(
        { matchNumber },
        updateData,
        { new: true }
      );
    }

    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: match });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
