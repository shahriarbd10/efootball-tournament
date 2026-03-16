import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

const TOURNAMENT_DATA = [
  { matchNumber: 1, stage: 'group', group: 'A', player1: 'Mynul', player2: 'Rifat', timeSlot: '0:00 – 0:10' },
  { matchNumber: 2, stage: 'group', group: 'A', player1: 'Rifat', player2: 'Sadique', timeSlot: '0:10 – 0:20' },
  { matchNumber: 3, stage: 'group', group: 'A', player1: 'Mynul', player2: 'Sadique', timeSlot: '0:20 – 0:30' },
  { matchNumber: 4, stage: 'group', group: 'B', player1: 'Arif', player2: 'Shahriar', timeSlot: '0:30 – 0:40' },
  { matchNumber: 5, stage: 'group', group: 'B', player1: 'Shahriar', player2: 'Nehal', timeSlot: '0:40 – 0:50' },
  { matchNumber: 6, stage: 'group', group: 'B', player1: 'Arif', player2: 'Nehal', timeSlot: '0:50 – 1:00' },
  { matchNumber: 7, stage: 'semifinal', group: null, player1: 'A1', player2: 'B2', timeSlot: '1:00 – 1:10' },
  { matchNumber: 8, stage: 'semifinal', group: null, player1: 'B1', player2: 'A2', timeSlot: '1:10 – 1:20' },
  { matchNumber: 9, stage: 'final', group: null, player1: 'SF1 Winner', player2: 'SF2 Winner', timeSlot: '1:20 – 1:30' },
];

export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Match.deleteMany({});

    // Seed matches
    await Match.insertMany(TOURNAMENT_DATA);

    return NextResponse.json({
      success: true,
      message: 'Tournament data seeded successfully',
      matchesCreated: TOURNAMENT_DATA.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Make sure MONGODB_URI is set in Vercel project Environment Variables',
    }, { status: 500 });
  }
}
