'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { IoTrophy, IoTime, IoCheckmarkCircle, IoHourglass, IoEllipse, IoArrowForward, IoFlame, IoStar } from 'react-icons/io5';

export default function BracketPage() {
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const searchParams = useSearchParams();
  const tId = searchParams.get('t');

  const fetchBracket = async () => {
    try {
      let activeId = tId;
      
      if (!activeId) {
        const tAllRes = await fetch('/api/tournaments');
        const tAllData = await tAllRes.json();
        if (tAllData.success && tAllData.data.length > 0) {
          const latest = tAllData.data.find(t => t.status === 'active') || tAllData.data[0];
          activeId = latest._id;
        }
      }

      if (activeId) {
        const ts = Date.now();
        const [tRes, kRes] = await Promise.all([
          fetch(`/api/tournaments/${activeId}?t=${ts}`),
          fetch(`/api/knockout?tournamentId=${activeId}&t=${ts}`)
        ]);
        const tData = await tRes.json();
        const kData = await kRes.json();
        
        if (tData.success) setTournament(tData.data);
        if (kData.success) setKnockoutMatches(kData.data);
      }
    } catch (error) {
      console.error('Failed to fetch bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracket();
    const interval = setInterval(fetchBracket, 10000);
    return () => clearInterval(interval);
  }, [tId]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Bracket...</div>
        </div>
      </div>
    );
  }

  // Group matches by stage
  const stages = ['round16', 'quarterfinal', 'semifinal', 'final'];
  const stageLabels = { round16: 'Round of 16', quarterfinal: 'Quarterfinals', semifinal: 'Semifinals', final: 'Final' };
  const stageShortLabels = { round16: 'R16', quarterfinal: 'QF', semifinal: 'SF', final: 'Final' };

  const matchesByStage = {};
  stages.forEach(s => {
    const ms = knockoutMatches.filter(m => m.stage === s);
    if (ms.length > 0) matchesByStage[s] = ms;
  });

  const activeStages = stages.filter(s => matchesByStage[s]);

  const getWinnerClass = (match, playerNum) => {
    if (!match || match.status !== 'completed') return '';
    if (playerNum === 1) return match.score1 > match.score2 ? 'winner-highlight' : 'loser-dim';
    return match.score2 > match.score1 ? 'winner-highlight' : 'loser-dim';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live': return <span className="badge badge-live"><IoEllipse style={{ fontSize: '6px' }} /> Live</span>;
      case 'completed': return <span className="badge badge-completed"><IoCheckmarkCircle style={{ fontSize: '10px' }} /> Done</span>;
      default: return <span className="badge badge-upcoming"><IoHourglass style={{ fontSize: '10px' }} /> Upcoming</span>;
    }
  };

  const renderBracketMatch = (match, isFinale = false) => (
    <div key={match._id} className={`bracket-match ${isFinale ? 'final-match' : ''}`}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <span className="match-number">M{match.matchNumber} — {stageShortLabels[match.stage] || match.stage}</span>
        <div style={{ marginTop: '0.25rem' }}>{getStatusIcon(match.status)}</div>
      </div>
      <div className={`bracket-player ${getWinnerClass(match, 1)}`}>
        <span>{match.player1}</span>
        <span className="bracket-player-score">
          {match.status !== 'upcoming' ? match.score1 : '-'}
        </span>
      </div>
      <div className={`bracket-player ${getWinnerClass(match, 2)}`}>
        <span>{match.player2}</span>
        <span className="bracket-player-score">
          {match.status !== 'upcoming' ? match.score2 : '-'}
        </span>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
        <IoTime style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} />
        <span className="match-time">{match.timeSlot}</span>
      </div>
    </div>
  );

  // Find champion
  let champion = null;
  const finalMatch = knockoutMatches.find(m => m.stage === 'final');
  if (finalMatch && finalMatch.status === 'completed') {
    champion = finalMatch.score1 > finalMatch.score2 ? finalMatch.player1 : finalMatch.player2;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoTrophy style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Knockout Bracket</h1>
        <p className="page-subtitle">
          {tournament?.name || 'Tournament'} — The road to glory
        </p>
      </div>

      {activeStages.length > 0 ? (
        <div className="bracket-container">
          {activeStages.map((stage, idx) => (
            <div key={stage} style={{ display: 'contents' }}>
              <div className="bracket-round">
                <div className="bracket-round-title">{stageLabels[stage]}</div>
                {matchesByStage[stage].map(m =>
                  renderBracketMatch(m, stage === 'final')
                )}
              </div>
              {idx < activeStages.length - 1 && (
                <div className="bracket-connector">
                  <div className="bracket-line"></div>
                  <IoArrowForward style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
                  <div className="bracket-line"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-text">No knockout matches yet</div>
        </div>
      )}

      {/* Champion Section */}
      <div className="bracket-trophy">
        <div className="bracket-trophy-icon"><IoTrophy /></div>
        <div className="bracket-trophy-text">
          Champion: {champion || 'TBD'}
        </div>
        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: '500' }}>
          {champion ? 'Congratulations!' : 'The battle for glory continues...'}
        </div>
      </div>

      {/* Bracket Info */}
      {activeStages.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <span className="section-icon"><IoFlame /></span>
            <span className="section-title">Bracket Info</span>
            <div className="section-divider"></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: '1rem' }}>
            {activeStages.map(stage => (
              <div key={stage} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem', color: stage === 'final' ? 'var(--accent-gold)' : 'var(--accent-secondary)' }}>
                  {stage === 'final' ? <IoTrophy /> : <IoStar />} {stageLabels[stage]}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem' }}>
                  {matchesByStage[stage].length} match{matchesByStage[stage].length > 1 ? 'es' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
