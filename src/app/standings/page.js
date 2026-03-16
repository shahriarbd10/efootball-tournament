'use client';

import { useState, useEffect } from 'react';
import { IoStatsChart, IoCheckmarkCircle, IoShield, IoTrendingUp, IoTrendingDown } from 'react-icons/io5';

export default function StandingsPage() {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStandings = async () => {
    try {
      const res = await fetch('/api/standings');
      const data = await res.json();
      if (data.success) {
        setStandings(data.data);
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
  }, []);

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

  const renderTable = (groupData, groupLabel, groupClass) => (
    <div style={{ marginBottom: '2rem' }}>
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
              <tr key={row.player} className={i < 2 ? 'standings-row-qualified' : ''}>
                <td>
                  <span className={`standings-rank ${i < 2 ? 'qualified' : ''}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="player-name" style={i < 2 ? { color: 'var(--accent-primary)' } : {}}>
                  {row.player}
                  {i < 2 && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}><IoCheckmarkCircle style={{ verticalAlign: 'middle' }} /></span>}
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

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoStatsChart style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Group Standings</h1>
        <p className="page-subtitle">
          Top 2 from each group qualify for the knockout stage
        </p>
      </div>

      {standings ? (
        <>
          {renderTable(standings.A, 'Group A', 'badge-group-a')}
          {renderTable(standings.B, 'Group B', 'badge-group-b')}

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div className="card-label" style={{ marginBottom: '0.5rem' }}>
              Qualification Rule
            </div>
            <div style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <IoTrendingUp style={{ color: 'var(--accent-primary)' }} /> Top 2 from each group advance &middot; Tiebreakers: Goal Difference → Goals Scored → Head-to-Head
            </div>
          </div>
        </>
      ) : (
        <div className="error-message">Failed to load standings data</div>
      )}
    </div>
  );
}
