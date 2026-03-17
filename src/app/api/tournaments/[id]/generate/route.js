import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';
import mongoose from 'mongoose';

// Fisher-Yates shuffle with explicit array conversion
function shuffle(arr) {
  const a = Array.from(arr); // Ensure we have a real array
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate time slots starting from a base time
function generateTimeSlots(startTime, slotDuration, count) {
  const slots = [];
  console.log(`Generating ${count} slots from ${startTime} with ${slotDuration}min duration`);
  
  // Parse startTime like "10:00 AM" or "2:30 PM" or "10:00"
  const match = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  
  let hours = 10;
  let minutes = 0;
  let period = 'AM';

  if (match) {
    hours = parseInt(match[1]);
    minutes = parseInt(match[2]);
    period = match[3];
  }

  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }

  let totalMinutes = hours * 60 + minutes;

  for (let i = 0; i < count; i++) {
    const startH = Math.floor(totalMinutes / 60);
    const startM = totalMinutes % 60;
    const endTotal = totalMinutes + slotDuration;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    const fmt = (h, m) => {
      const hr = h % 24;
      return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    slots.push(`${fmt(startH, startM)} – ${fmt(endH, endM)}`);
    totalMinutes = endTotal;
  }

  return slots;
}

// Round-robin fixture generation for a group
function generateRoundRobin(players) {
  const fixtures = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      fixtures.push({ player1: players[i], player2: players[j] });
    }
  }
  return fixtures;
}

// Determine knockout structure based on number of qualifiers
function getKnockoutStructure(qualifierCount) {
  if (qualifierCount <= 2) return { stages: ['final'], matchCounts: [1] };
  if (qualifierCount <= 4) return { stages: ['semifinal', 'final'], matchCounts: [2, 1] };
  if (qualifierCount <= 8) return { stages: ['quarterfinal', 'semifinal', 'final'], matchCounts: [4, 2, 1] };
  return { stages: ['round16', 'quarterfinal', 'semifinal', 'final'], matchCounts: [8, 4, 2, 1] };
}

// Generate placeholder names for knockout stage
function getKnockoutPlaceholders(format, groups, qualifyPerGroup, knockoutStages) {
  const placeholders = [];

  if (format === 'group+knockout') {
    const groupNames = Object.keys(groups).sort();
    if (groupNames.length === 2) {
      const [g1, g2] = groupNames;
      for (let i = 0; i < qualifyPerGroup; i++) {
        const oppIdx = (qualifyPerGroup - 1 - i);
        placeholders.push({
          player1: `${g1}${i + 1}`,
          player2: `${g2}${oppIdx + 1}`
        });
      }
    } else {
      for (let i = 0; i < qualifyPerGroup; i++) {
        for (let g = 0; g < groupNames.length; g += 2) {
          if (g + 1 < groupNames.length) {
            placeholders.push({
              player1: `${groupNames[g]}${i + 1}`,
              player2: `${groupNames[g + 1]}${qualifyPerGroup - i}`
            });
          }
        }
      }
    }
  }
  return placeholders;
}

function isAutoByeMatch(match) {
  return match?.player1 === 'BYE' || match?.player2 === 'BYE';
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const tournamentObjectId = new mongoose.Types.ObjectId(id);

    const tournament = await Tournament.findById(tournamentObjectId);
    if (!tournament) {
      return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    }

    // Safety Guard: Don't reshuffle completed tournaments
    if (tournament.status === 'completed') {
      return NextResponse.json({ success: false, error: 'Cannot reshuffle a completed tournament' }, { status: 400 });
    }

    // Safety Guard: Don't reshuffle if any real match has started.
    // Auto-completed BYE fixtures should not block reshuffling.
    const startedMatches = await Match.find({ 
      tournamentId: tournamentObjectId, 
      status: { $in: ['live', 'completed'] } 
    }).select('player1 player2 status').lean();

    const startedPlayableMatches = startedMatches.filter((m) => !isAutoByeMatch(m));
    if (startedPlayableMatches.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Match already started. Cannot reshuffle after ${startedPlayableMatches.length} match(es) are live/completed.` 
      }, { status: 400 });
    }

    // Explicitly delete existing matches for this tournament
    const deleteResult = await Match.deleteMany({ tournamentId: tournamentObjectId });
    console.log(`[Reshuffle] Deleted ${deleteResult.deletedCount} existing matches for tournament ${id}`);

    console.log(`--- Reshuffle START: ${tournament.name} (${tournament.format}) ---`);
    
    // Ensure we are working with a fresh, plain array of players
    // tournament.players is a Mongoose array, we clone it to ensure true shuffling
    const sourcePlayers = Array.from(tournament.players || []);
    console.log(`[Reshuffle] Source Players (${sourcePlayers.length}):`, sourcePlayers.join(', '));
    
    // Perform shuffles for randomness
    let shuffledPlayers = shuffle([...sourcePlayers]);
    // Second pass for good measure
    shuffledPlayers = shuffle(shuffledPlayers);
    
    console.log(`[Reshuffle] Shuffled Players:`, shuffledPlayers.join(', '));

    const matches = [];
    let matchNumber = 1;

    if (tournament.format === 'group+knockout') {
      // Group+Knockout Logic
      let groupCount = 2;
      let playersPerGroup = Math.floor(shuffledPlayers.length / groupCount);

      if (shuffledPlayers.length > 8) {
        groupCount = Math.ceil(shuffledPlayers.length / 4);
        playersPerGroup = Math.floor(shuffledPlayers.length / groupCount);
      }

      const groups = {};
      const groupNames = 'ABCDEFGHIJKLMNOP'.split('');

      let playerIdx = 0;
      for (let g = 0; g < groupCount; g++) {
        const groupName = groupNames[g];
        const size = g < (shuffledPlayers.length % groupCount)
          ? playersPerGroup + 1
          : playersPerGroup;
        groups[groupName] = shuffledPlayers.slice(playerIdx, playerIdx + size);
        playerIdx += size;
      }

      const groupMatches = [];
      for (const [groupName, players] of Object.entries(groups)) {
        const roundRobin = generateRoundRobin(players);
        roundRobin.forEach(fixture => {
          groupMatches.push({
            stage: 'group',
            group: groupName,
            player1: fixture.player1,
            player2: fixture.player2,
          });
        });
      }

      const qualifyPerGroup = Math.min(tournament.qualifyPerGroup || 2, Math.min(...Object.values(groups).map(g => g.length)));
      const totalQualifiers = qualifyPerGroup * groupCount;
      const knockout = getKnockoutStructure(totalQualifiers);
      const totalKnockoutMatches = knockout.matchCounts.reduce((a, b) => a + b, 0);
      const totalMatches = groupMatches.length + totalKnockoutMatches;

      const timeSlots = generateTimeSlots(
        tournament.startTime || '10:00 AM',
        tournament.slotDuration || 10,
        totalMatches
      );

      groupMatches.forEach((gm, i) => {
        matches.push({
          tournamentId: tournamentObjectId,
          matchNumber: matchNumber++,
          stage: gm.stage,
          group: gm.group,
          player1: gm.player1,
          player2: gm.player2,
          timeSlot: timeSlots[matches.length] || 'TBD',
          matchDate: tournament.date,
        });
      });

      const knockoutPlaceholders = getKnockoutPlaceholders(
        'group+knockout', groups, qualifyPerGroup, knockout.stages
      );

      for (let s = 0; s < knockout.stages.length; s++) {
        const stage = knockout.stages[s];
        const count = knockout.matchCounts[s];

        for (let m = 0; m < count; m++) {
          let player1 = 'TBD', player2 = 'TBD';
          if (s === 0 && m < knockoutPlaceholders.length) {
            player1 = knockoutPlaceholders[m].player1;
            player2 = knockoutPlaceholders[m].player2;
          } else if (s > 0) {
            const prevStage = knockout.stages[s - 1];
            const prevStageName = prevStage === 'quarterfinal' ? 'QF'
              : prevStage === 'semifinal' ? 'SF'
              : prevStage === 'round16' ? 'R16' : prevStage;
            player1 = `${prevStageName}${m * 2 + 1} Winner`;
            player2 = `${prevStageName}${m * 2 + 2} Winner`;
          }

          matches.push({
            tournamentId: tournamentObjectId,
            matchNumber: matchNumber++,
            stage,
            group: null,
            round: stage,
            player1,
            player2,
            timeSlot: timeSlots[matches.length] || 'TBD',
            matchDate: tournament.date,
          });
        }
      }

      tournament.groups = groups;
      tournament.status = 'active';
      tournament.markModified('groups');
      await tournament.save();

    } else {
      // KNOCKOUT ONLY format
      const playerCount = shuffledPlayers.length;
      let bracketSize = 2;
      while (bracketSize < playerCount) bracketSize *= 2;

      const knockout = getKnockoutStructure(bracketSize);
      const totalKnockoutMatches = knockout.matchCounts.reduce((a, b) => a + b, 0);

      const timeSlots = generateTimeSlots(
        tournament.startTime || '10:00 AM',
        tournament.slotDuration || 10,
        totalKnockoutMatches
      );

      const bracketSlots = [...shuffledPlayers];
      while (bracketSlots.length < bracketSize) {
        bracketSlots.push('BYE');
      }
      
      const finalBracket = shuffle(bracketSlots);

      // First round matches
      const firstRoundMatchCount = knockout.matchCounts[0];
      for (let m = 0; m < firstRoundMatchCount; m++) {
        const player1 = finalBracket[m * 2];
        const player2 = finalBracket[m * 2 + 1];

        matches.push({
          tournamentId: tournamentObjectId,
          matchNumber: matchNumber++,
          stage: knockout.stages[0],
          group: null,
          round: knockout.stages[0],
          player1,
          player2,
          status: (player1 === 'BYE' || player2 === 'BYE') ? 'completed' : 'upcoming',
          score1: player1 === 'BYE' ? 0 : 0,
          score2: player2 === 'BYE' ? 0 : 0,
          timeSlot: timeSlots[matches.length] || 'TBD',
          matchDate: tournament.date,
        });
      }

      // Remaining knockout rounds
      for (let s = 1; s < knockout.stages.length; s++) {
        const stage = knockout.stages[s];
        const count = knockout.matchCounts[s];

        for (let m = 0; m < count; m++) {
          const prevStage = knockout.stages[s - 1];
          const prevStageName = prevStage === 'quarterfinal' ? 'QF'
            : prevStage === 'semifinal' ? 'SF'
            : prevStage === 'round16' ? 'R16' : prevStage;

          matches.push({
            tournamentId: tournamentObjectId,
            matchNumber: matchNumber++,
            stage,
            group: null,
            round: stage,
            player1: `${prevStageName}${m * 2 + 1} Winner`,
            player2: `${prevStageName}${m * 2 + 2} Winner`,
            timeSlot: timeSlots[matches.length] || 'TBD',
            matchDate: tournament.date,
          });
        }
      }

      tournament.groups = {};
      tournament.status = 'active';
      tournament.markModified('groups');
      await tournament.save();
    }

    // Insert all matches
    if (matches.length > 0) {
      await Match.insertMany(matches);
      console.log(`[Reshuffle] Inserted ${matches.length} new matches for tournament ${id}`);
    }

    console.log(`--- Reshuffle COMPLETE: ${tournament.name} ---`);

    return NextResponse.json({
      success: true,
      message: 'Tournament fixtures regenerated successfully',
      matchesCreated: matches.length,
      groups: tournament.groups,
    });
  } catch (error) {
    console.error('API Error in shuffle/generate:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
