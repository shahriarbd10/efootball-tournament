'use client';

import { useState, useEffect } from 'react';

export default function FixturesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter(m => {
    if (activeTab === 'all') return true;
    if (activeTab === 'groupA') return m.stage === 'group' && m.group === 'A';
    if (activeTab === 'groupB') return m.stage === 'group' && m.group === 'B';
    if (activeTab === 'knockout') return m.stage !== 'group';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="badge badge-live">🔴 Live</span>;
      case 'completed':
        return <span className="badge badge-completed">✅ Completed</span>;
      default:
        return <span className="badge badge-upcoming">⏳ Upcoming</span>;
    }
  };

  const getStageBadge = (match) => {
    if (match.stage === 'group') {
      return match.group === 'A'
        ? <span className="badge badge-group-a">Group A</span>
        : <span className="badge badge-group-b">Group B</span>;
    }
    if (match.stage === 'semifinal') return <span className="badge badge-knockout">🔥 Semifinal</span>;
    return <span className="badge badge-knockout">🏆 Final</span>;
  };

  const getScoreClass = (match, playerNum) => {
    if (match.status !== 'completed') return '';
    if (playerNum === 1) {
      return match.score1 > match.score2 ? 'winner-highlight' : match.score1 < match.score2 ? 'loser-dim' : '';
    }
    return match.score2 > match.score1 ? 'winner-highlight' : match.score2 < match.score1 ? 'loser-dim' : '';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Fixtures...</div>
        </div>
      </div>
    );
  }

  const hasLive = matches.some(m => m.status === 'live');

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">📋 Match Fixtures</h1>
        <p className="page-subtitle">
          All 9 tournament matches — auto-refreshing every 10 seconds
        </p>
        {hasLive && (
          <div className="live-indicator" style={{ justifyContent: 'center', marginTop: '0.75rem' }}>
            <div className="live-dot"></div>
            <span>Live matches in progress</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Matches
        </button>
        <button className={`tab-btn ${activeTab === 'groupA' ? 'active' : ''}`} onClick={() => setActiveTab('groupA')}>
          Group A
        </button>
        <button className={`tab-btn ${activeTab === 'groupB' ? 'active' : ''}`} onClick={() => setActiveTab('groupB')}>
          Group B
        </button>
        <button className={`tab-btn ${activeTab === 'knockout' ? 'active' : ''}`} onClick={() => setActiveTab('knockout')}>
          Knockout
        </button>
      </div>

      {/* Match Cards */}
      <div className="matches-grid">
        {filteredMatches.map((match) => (
          <div key={match._id} className={`match-card ${match.status === 'live' ? 'match-card-live' : ''}`}
            style={match.status === 'live' ? { borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' } : {}}>
            {/* Header */}
            <div className="match-card-header">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="match-number">Match {match.matchNumber}</span>
                {getStageBadge(match)}
              </div>
              <span className="match-time">⏱ {match.timeSlot}</span>
            </div>

            {/* Body */}
            <div className="match-body">
              <div className="match-player">
                <div className={`match-player-name ${getScoreClass(match, 1)}`}>
                  {match.player1}
                </div>
              </div>

              <div className="match-score-container">
                <span className={`match-score ${getScoreClass(match, 1)}`}>
                  {match.status === 'upcoming' ? '-' : match.score1}
                </span>
                <span className="match-score-divider">:</span>
                <span className={`match-score ${getScoreClass(match, 2)}`}>
                  {match.status === 'upcoming' ? '-' : match.score2}
                </span>
              </div>

              <div className="match-player">
                <div className={`match-player-name ${getScoreClass(match, 2)}`}>
                  {match.player2}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="match-card-footer">
              {getStatusBadge(match.status)}
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-text">No matches found for this filter</div>
        </div>
      )}
    </div>
  );
}
