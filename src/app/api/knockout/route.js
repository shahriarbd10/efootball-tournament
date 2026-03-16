import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET() {
  try {
    await dbConnect();
    const knockoutMatches = await Match.find({
      stage: { $in: ['semifinal', 'final'] }
    }).sort({ matchNumber: 1 });

    return NextResponse.json({ success: true, data: knockoutMatches });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
