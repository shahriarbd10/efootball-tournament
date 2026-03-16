import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET() {
  try {
    await dbConnect();
    const matches = await Match.find({ stage: 'group', status: 'completed' });

    const groups = { A: {}, B: {} };

    // Initialize players
    const allGroupMatches = await Match.find({ stage: 'group' });
    allGroupMatches.forEach(m => {
      const g = m.group;
      if (!groups[g][m.player1]) {
        groups[g][m.player1] = { player: m.player1, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      }
      if (!groups[g][m.player2]) {
        groups[g][m.player2] = { player: m.player2, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      }
    });

    // Calculate standings from completed matches
    matches.forEach(m => {
      const g = m.group;
      const p1 = groups[g][m.player1];
      const p2 = groups[g][m.player2];

      p1.played++;
      p2.played++;
      p1.gf += m.score1;
      p1.ga += m.score2;
      p2.gf += m.score2;
      p2.ga += m.score1;

      if (m.score1 > m.score2) {
        p1.won++;
        p1.points += 3;
        p2.lost++;
      } else if (m.score1 < m.score2) {
        p2.won++;
        p2.points += 3;
        p1.lost++;
      } else {
        p1.drawn++;
        p2.drawn++;
        p1.points += 1;
        p2.points += 1;
      }

      p1.gd = p1.gf - p1.ga;
      p2.gd = p2.gf - p2.ga;
    });

    // Sort standings
    const sortStandings = (standings) => {
      return Object.values(standings).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });
    };

    return NextResponse.json({
      success: true,
      data: {
        A: sortStandings(groups.A),
        B: sortStandings(groups.B),
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
