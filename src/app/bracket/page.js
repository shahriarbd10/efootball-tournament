'use client';

import { useState, useEffect } from 'react';

export default function BracketPage() {
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBracket = async () => {
    try {
      const res = await fetch('/api/knockout');
      const data = await res.json();
      if (data.success) {
        setKnockoutMatches(data.data);
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
  }, []);

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

  const sf1 = knockoutMatches.find(m => m.matchNumber === 7);
  const sf2 = knockoutMatches.find(m => m.matchNumber === 8);
  const final = knockoutMatches.find(m => m.matchNumber === 9);

  const getWinnerClass = (match, playerNum) => {
    if (!match || match.status !== 'completed') return '';
    if (playerNum === 1) {
      return match.score1 > match.score2 ? 'winner-highlight' : 'loser-dim';
    }
    return match.score2 > match.score1 ? 'winner-highlight' : 'loser-dim';
  };

  const renderBracketMatch = (match, label, isFinale = false) => (
    <div className={`bracket-match ${isFinale ? 'final-match' : ''}`}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <span className="match-number">{label}</span>
        {match && (
          <div style={{ marginTop: '0.25rem' }}>
            {match.status === 'live' && <span className="badge badge-live">🔴 Live</span>}
            {match.status === 'completed' && <span className="badge badge-completed">✅ Done</span>}
            {match.status === 'upcoming' && <span className="badge badge-upcoming">⏳ Upcoming</span>}
          </div>
        )}
      </div>
      {match ? (
        <>
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
        </>
      ) : (
        <>
          <div className="bracket-player"><span>TBD</span><span>-</span></div>
          <div className="bracket-player"><span>TBD</span><span>-</span></div>
        </>
      )}
      {match && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span className="match-time">⏱ {match.timeSlot}</span>
        </div>
      )}
    </div>
  );

  // Determine champion
  let champion = null;
  if (final && final.status === 'completed') {
    champion = final.score1 > final.score2 ? final.player1 : final.player2;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">🏆 Knockout Bracket</h1>
        <p className="page-subtitle">
          Semifinals & Final — The road to glory
        </p>
      </div>

      <div className="bracket-container">
        {/* Semifinals */}
        <div className="bracket-round">
          <div className="bracket-round-title">Semifinals</div>
          {renderBracketMatch(sf1, 'Match 7 — SF1')}
          {renderBracketMatch(sf2, 'Match 8 — SF2')}
        </div>

        {/* Connector */}
        <div className="bracket-connector">
          <div className="bracket-line"></div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.5rem' }}>→</div>
          <div className="bracket-line"></div>
        </div>

        {/* Final */}
        <div className="bracket-round">
          <div className="bracket-round-title">Final</div>
          {renderBracketMatch(final, 'Match 9 — Final', true)}
        </div>
      </div>

      {/* Champion Section */}
      {champion ? (
        <div className="bracket-trophy">
          <div className="bracket-trophy-icon">🏆</div>
          <div className="bracket-trophy-text">
            Champion: {champion}
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: '500' }}>
            Congratulations! 🎉
          </div>
        </div>
      ) : (
        <div className="bracket-trophy">
          <div className="bracket-trophy-icon">🏆</div>
          <div className="bracket-trophy-text">
            Champion: TBD
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: '500' }}>
            The battle for glory continues...
          </div>
        </div>
      )}

      {/* Match Info Cards */}
      <div style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <span className="section-icon">ℹ️</span>
          <span className="section-title">Bracket Info</span>
          <div className="section-divider"></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>
              Semifinal 1 (Match 7)
            </div>
            <div style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem' }}>
              Group A 1st 🆚 Group B 2nd
            </div>
          </div>
          <div className="card">
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-tertiary)' }}>
              Semifinal 2 (Match 8)
            </div>
            <div style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem' }}>
              Group B 1st 🆚 Group A 2nd
            </div>
          </div>
          <div className="card">
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>
              Grand Final (Match 9)
            </div>
            <div style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem' }}>
              Winner SF1 🆚 Winner SF2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
