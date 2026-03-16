import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

// GET current group assignments (derived from group-stage matches)
export async function GET() {
  try {
    await dbConnect();
    const groupMatches = await Match.find({ stage: 'group' }).sort({ matchNumber: 1 });

    const groups = { A: new Set(), B: new Set() };
    groupMatches.forEach(m => {
      if (m.group) {
        groups[m.group].add(m.player1);
        groups[m.group].add(m.player2);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        A: Array.from(groups.A),
        B: Array.from(groups.B),
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST to update groups and regenerate fixtures
export async function POST(request) {
  try {
    await dbConnect();
    const { groupA, groupB } = await request.json();

    if (!groupA || !groupB || groupA.length !== 3 || groupB.length !== 3) {
      return NextResponse.json({ success: false, error: 'Each group must have exactly 3 players' }, { status: 400 });
    }

    // Generate new fixtures
    const newMatches = [
      { matchNumber: 1, stage: 'group', group: 'A', player1: groupA[0], player2: groupA[1], score1: 0, score2: 0, status: 'upcoming', timeSlot: '0:00 – 0:10' },
      { matchNumber: 2, stage: 'group', group: 'A', player1: groupA[1], player2: groupA[2], score1: 0, score2: 0, status: 'upcoming', timeSlot: '0:10 – 0:20' },
      { matchNumber: 3, stage: 'group', group: 'A', player1: groupA[0], player2: groupA[2], score1: 0, score2: 0, status: 'upcoming', timeSlot: '0:20 – 0:30' },
      { matchNumber: 4, stage: 'group', group: 'B', player1: groupB[0], player2: groupB[1], score1: 0, score2: 0, status: 'upcoming', timeSlot: '0:30 – 0:40' },
      { matchNumber: 5, stage: 'group', group: 'B', player1: groupB[1], player2: groupB[2], score1: 0, score2: 0, status: 'upcoming', timeSlot: '0:40 – 0:50' },
      { matchNumber: 6, stage: 'group', group: 'B', player1: groupB[0], player2: groupB[2], score1: 0, score2: 0, status: 'upcoming', timeSlot: '0:50 – 1:00' },
      { matchNumber: 7, stage: 'semifinal', group: null, player1: 'A1', player2: 'B2', score1: 0, score2: 0, status: 'upcoming', timeSlot: '1:00 – 1:10' },
      { matchNumber: 8, stage: 'semifinal', group: null, player1: 'B1', player2: 'A2', score1: 0, score2: 0, status: 'upcoming', timeSlot: '1:10 – 1:20' },
      { matchNumber: 9, stage: 'final', group: null, player1: 'SF1 Winner', player2: 'SF2 Winner', score1: 0, score2: 0, status: 'upcoming', timeSlot: '1:20 – 1:30' },
    ];

    await Match.deleteMany({});
    await Match.insertMany(newMatches);

    return NextResponse.json({
      success: true,
      message: 'Groups updated and fixtures regenerated',
      groupA,
      groupB,
    });
  } catch (error) {
    console.error('Group update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
