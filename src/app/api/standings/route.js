import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    const filter = { stage: 'group' };
    if (tournamentId) filter.tournamentId = tournamentId;

    // Get all group matches (including non-completed for player init)
    const allGroupMatches = await Match.find(filter);

    // Get only completed for standings calculation
    const completedMatches = allGroupMatches.filter(m => m.status === 'completed');

    // Auto-detect groups from matches
    const groupNames = [...new Set(allGroupMatches.map(m => m.group).filter(Boolean))].sort();

    const groups = {};
    groupNames.forEach(g => { groups[g] = {}; });

    // Initialize players from all group matches
    allGroupMatches.forEach(m => {
      const g = m.group;
      if (!g || !groups[g]) return;
      if (!groups[g][m.player1]) {
        groups[g][m.player1] = { player: m.player1, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      }
      if (!groups[g][m.player2]) {
        groups[g][m.player2] = { player: m.player2, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      }
    });

    // Calculate standings from completed matches
    completedMatches.forEach(m => {
      const g = m.group;
      if (!g || !groups[g]) return;
      const p1 = groups[g][m.player1];
      const p2 = groups[g][m.player2];

      if (!p1 || !p2) return;

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

    const result = {};
    groupNames.forEach(g => {
      result[g] = sortStandings(groups[g]);
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
