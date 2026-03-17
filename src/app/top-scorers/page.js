'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { IoStatsChart, IoFootball, IoPerson, IoTrophy, IoRibbon } from 'react-icons/io5';

function TopScorersPageContent() {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentName, setTournamentName] = useState('');
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
        const res = await fetch(`/api/top-scorers?tournamentId=${activeId}`);
        const data = await res.json();
        if (data.success) {
          setScorers(data.data);
          setTournamentName(data.tournamentName);
        }
      }
    } catch (error) {
      console.error('Failed to fetch top scorers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [tId]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Top Scorers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoTrophy style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--accent-gold)' }} />Golden Boot</h1>
        <p className="page-subtitle">
          {tournamentName || 'Tournament'} — Goal Leaderboard
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Top 3 Podium */}
        {scorers.length > 0 && (
          <div className="podium-container" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', padding: '1rem' }}>
            {/* 2nd Place */}
            {scorers[1] && (
              <div className="podium-item second" style={{ flex: 1, textAlign: 'center' }}>
                <div className="podium-avatar"><IoPerson /></div>
                <div className="podium-name">{scorers[1].name}</div>
                <div className="podium-step" style={{ background: 'linear-gradient(to top, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.4))', height: '100px', borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="podium-goals">{scorers[1].goals}</div>
                  <div className="podium-label">Goals</div>
                </div>
              </div>
            )}
            
            {/* 1st Place */}
            {scorers[0] && (
              <div className="podium-item first" style={{ flex: 1.2, textAlign: 'center' }}>
                <div className="podium-avatar gold"><IoPerson /></div>
                <div className="podium-name gold-text">{scorers[0].name}</div>
                <div className="podium-step" style={{ background: 'linear-gradient(to top, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.5))', height: '140px', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                  <IoTrophy style={{ fontSize: '1.5rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }} />
                  <div className="podium-goals">{scorers[0].goals}</div>
                  <div className="podium-label">Goals</div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {scorers[2] && (
              <div className="podium-item third" style={{ flex: 1, textAlign: 'center' }}>
                <div className="podium-avatar"><IoPerson /></div>
                <div className="podium-name">{scorers[2].name}</div>
                <div className="podium-step" style={{ background: 'linear-gradient(to top, rgba(180, 83, 9, 0.2), rgba(180, 83, 9, 0.4))', height: '80px', borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="podium-goals">{scorers[2].goals}</div>
                  <div className="podium-label">Goals</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="standings-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Player Name</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Total Goals</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((scorer, i) => (
                <tr key={scorer.name} style={i === 0 ? { borderLeft: '4px solid var(--accent-gold)' } : {}}>
                  <td>
                    <span className={`standings-rank ${i === 0 ? 'qualified' : ''}`} style={i === 0 ? { background: 'var(--accent-gold)', color: '#000' } : {}}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', color: i === 0 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                    {scorer.name}
                    {i === 0 && <IoRibbon style={{ marginLeft: '0.5rem', color: 'var(--accent-gold)' }} />}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{scorer.goals}</span>
                      <IoFootball style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {scorers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No goals recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .podium-avatar {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
          font-size: 1.5rem;
          color: var(--text-muted);
        }
        .podium-avatar.gold {
          background: rgba(234, 179, 8, 0.2);
          color: var(--accent-gold);
          border: 1px solid rgba(234, 179, 8, 0.3);
        }
        .podium-name {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        .gold-text {
          color: var(--accent-gold);
        }
        .podium-goals {
          font-family: 'Orbitron', monospace;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }
        .podium-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          opacity: 0.7;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}

export default function TopScorersPage() {
  return (
    <Suspense fallback={
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Top Scorers...</div>
        </div>
      </div>
    }>
      <TopScorersPageContent />
    </Suspense>
  );
}
