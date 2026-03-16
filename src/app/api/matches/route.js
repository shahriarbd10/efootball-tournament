import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET() {
  try {
    await dbConnect();
    const matches = await Match.find({}).sort({ matchNumber: 1 });
    return NextResponse.json({ success: true, data: matches });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { matchNumber, score1, score2, status, player1, player2 } = body;

    const updateData = {};
    if (score1 !== undefined) updateData.score1 = score1;
    if (score2 !== undefined) updateData.score2 = score2;
    if (status) updateData.status = status;
    if (player1) updateData.player1 = player1;
    if (player2) updateData.player2 = player2;

    const match = await Match.findOneAndUpdate(
      { matchNumber },
      updateData,
      { new: true }
    );

    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: match });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
