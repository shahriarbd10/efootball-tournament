import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';

// GET — Single tournament
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — Update tournament
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const tournament = await Tournament.findByIdAndUpdate(id, body, { new: true });
    if (!tournament) {
      return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — Delete tournament + its matches
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    await Match.deleteMany({ tournamentId: id });
    await Tournament.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Tournament deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
