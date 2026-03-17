import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    const filter = {
      stage: { $in: ['quarterfinal', 'semifinal', 'final', 'round16'] }
    };
    if (tournamentId) filter.tournamentId = tournamentId;

    const knockoutMatches = await Match.find(filter).sort({ matchNumber: 1 });

    return NextResponse.json({ success: true, data: knockoutMatches });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
