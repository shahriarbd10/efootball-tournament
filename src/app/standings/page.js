'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { IoStatsChart, IoCheckmarkCircle, IoShield, IoTrendingUp } from 'react-icons/io5';

export default function StandingsPage() {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const searchParams = useSearchParams();
  const tId = searchParams.get('t');

  const fetchStandings = async () => {
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
        const tRes = await fetch(`/api/tournaments/${activeId}?t=${ts}`);
        const tData = await tRes.json();
        if (tData.success) {
          const t = tData.data;
          setTournament(t);
          if (t.format === 'group+knockout') {
            const res = await fetch(`/api/standings?tournamentId=${activeId}&t=${ts}`);
            const data = await res.json();
            if (data.success) setStandings(data.data);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch standings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
    const interval = setInterval(fetchStandings, 10000);
    return () => clearInterval(interval);
  }, [tId]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Standings...</div>
        </div>
      </div>
    );
  }

  if (tournament && tournament.format === 'knockout') {
    return (
      <div className="container">
        <div className="page-header">
          <h1 className="page-title"><IoStatsChart style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Standings</h1>
          <p className="page-subtitle">
            This tournament uses knockout-only format — no group standings
          </p>
        </div>
      </div>
    );
  }

  const groupNames = standings ? Object.keys(standings).sort() : [];

  const renderTable = (groupData, groupLabel, groupClass) => (
    <div style={{ marginBottom: '2rem' }} key={groupLabel}>
      <div className="section-header">
        <span className="section-icon"><IoShield /></span>
        <span className="section-title">{groupLabel}</span>
        <span className={`badge ${groupClass}`} style={{ marginLeft: '0.5rem' }}>{groupLabel}</span>
        <div className="section-divider"></div>
      </div>

      <div className="standings-wrapper">
        <table className="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {groupData && groupData.map((row, i) => (
              <tr key={row.player} className={i < (tournament?.qualifyPerGroup || 2) ? 'standings-row-qualified' : ''}>
                <td>
                  <span className={`standings-rank ${i < (tournament?.qualifyPerGroup || 2) ? 'qualified' : ''}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="player-name" style={i < (tournament?.qualifyPerGroup || 2) ? { color: 'var(--accent-primary)' } : {}}>
                  {row.player}
                  {i < (tournament?.qualifyPerGroup || 2) && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}><IoCheckmarkCircle style={{ verticalAlign: 'middle' }} /></span>}
                </td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.gf}</td>
                <td>{row.ga}</td>
                <td style={{ color: row.gd > 0 ? 'var(--accent-primary)' : row.gd < 0 ? 'var(--accent-danger)' : 'var(--text-secondary)' }}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="points-cell">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const badgeClasses = { A: 'badge-group-a', B: 'badge-group-b' };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoStatsChart style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Group Standings</h1>
        <p className="page-subtitle">
          {tournament?.name || 'Tournament'} — Top {tournament?.qualifyPerGroup || 2} from each group qualify
        </p>
      </div>

      {standings && groupNames.length > 0 ? (
        <>
          {groupNames.map(g => renderTable(
            standings[g],
            `Group ${g}`,
            badgeClasses[g] || 'badge-knockout'
          ))}

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div className="card-label" style={{ marginBottom: '0.5rem' }}>
              Qualification Rule
            </div>
            <div style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <IoTrendingUp style={{ color: 'var(--accent-primary)' }} /> Top {tournament?.qualifyPerGroup || 2} from each group advance · Tiebreakers: GD → GF → H2H
            </div>
          </div>
        </>
      ) : (
        <div className="error-message">No standings data available</div>
      )}
    </div>
  );
}
