'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { IoCalendar, IoTime, IoEllipse, IoCheckmarkCircle, IoHourglass, IoFlame, IoTrophy, IoFunnel } from 'react-icons/io5';

export default function FixturesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [tournament, setTournament] = useState(null);
  const searchParams = useSearchParams();
  const tId = searchParams.get('t');

  const fetchData = async () => {
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
        const [tRes, mRes] = await Promise.all([
          fetch(`/api/tournaments/${activeId}?t=${ts}`),
          fetch(`/api/matches?tournamentId=${activeId}&t=${ts}`)
        ]);
        const tData = await tRes.json();
        const mData = await mRes.json();
        
        if (tData.success) setTournament(tData.data);
        if (mData.success) setMatches(mData.data);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [tId]);

  // Extract group names dynamically
  const groupNames = [...new Set(matches.filter(m => m.stage === 'group').map(m => m.group).filter(Boolean))].sort();
  const hasKnockout = matches.some(m => m.stage !== 'group');

  const filteredMatches = matches.filter(m => {
    if (activeTab === 'all') return true;
    if (activeTab === 'knockout') return m.stage !== 'group';
    return m.stage === 'group' && m.group === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="badge badge-live"><IoEllipse style={{ fontSize: '6px' }} /> Live</span>;
      case 'completed':
        return <span className="badge badge-completed"><IoCheckmarkCircle style={{ fontSize: '10px' }} /> Completed</span>;
      default:
        return <span className="badge badge-upcoming"><IoHourglass style={{ fontSize: '10px' }} /> Upcoming</span>;
    }
  };

  const getStageBadge = (match) => {
    if (match.stage === 'group') {
      const colors = { A: 'badge-group-a', B: 'badge-group-b' };
      return <span className={`badge ${colors[match.group] || 'badge-group-a'}`}>Group {match.group}</span>;
    }
    const labels = { round16: 'R16', quarterfinal: 'QF', semifinal: 'Semifinal', final: 'Final' };
    return (
      <span className="badge badge-knockout">
        {match.stage === 'final' ? <IoTrophy style={{ fontSize: '10px' }} /> : <IoFlame style={{ fontSize: '10px' }} />}
        {' '}{labels[match.stage] || match.stage}
      </span>
    );
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
        <h1 className="page-title"><IoCalendar style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Match Fixtures</h1>
        <p className="page-subtitle">
          {tournament?.name || 'Tournament'} — {matches.length} matches — auto-refreshing every 10s
        </p>
        {hasLive && (
          <div className="live-indicator" style={{ justifyContent: 'center', marginTop: '0.75rem' }}>
            <div className="live-dot"></div>
            <span>Live matches in progress</span>
          </div>
        )}
      </div>

      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          <IoFunnel style={{ fontSize: '0.8rem' }} /> All Matches
        </button>
        {groupNames.map(g => (
          <button key={g} className={`tab-btn ${activeTab === g ? 'active' : ''}`} onClick={() => setActiveTab(g)}>
            Group {g}
          </button>
        ))}
        {hasKnockout && (
          <button className={`tab-btn ${activeTab === 'knockout' ? 'active' : ''}`} onClick={() => setActiveTab('knockout')}>
            <IoFlame style={{ fontSize: '0.8rem' }} /> Knockout
          </button>
        )}
      </div>

      <div className="matches-grid">
        {filteredMatches.map((match) => (
          <div key={match._id} className="match-card"
            style={match.status === 'live' ? { borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' } : {}}>
            <div className="match-card-header">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="match-number">M{match.matchNumber}</span>
                {getStageBadge(match)}
              </div>
              <span className="match-time"><IoTime style={{ fontSize: '0.75rem', verticalAlign: 'middle' }} /> {match.timeSlot}</span>
            </div>

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
