'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoSettings, IoLogOut, IoSave, IoRefresh, IoTime, IoFlame, IoTrophy, IoWarning } from 'react-icons/io5';

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchMatches();
  }, []);

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

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleScoreChange = (matchNumber, field, value) => {
    setMatches(prev =>
      prev.map(m =>
        m.matchNumber === matchNumber
          ? { ...m, [field]: parseInt(value) || 0 }
          : m
      )
    );
  };

  const handleStatusChange = (matchNumber, status) => {
    setMatches(prev =>
      prev.map(m =>
        m.matchNumber === matchNumber ? { ...m, status } : m
      )
    );
  };

  const handlePlayerChange = (matchNumber, field, value) => {
    setMatches(prev =>
      prev.map(m =>
        m.matchNumber === matchNumber ? { ...m, [field]: value } : m
      )
    );
  };

  const saveMatch = async (match) => {
    try {
      const res = await fetch('/api/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchNumber: match.matchNumber,
          score1: match.score1,
          score2: match.score2,
          status: match.status,
          player1: match.player1,
          player2: match.player2,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast(`Match ${match.matchNumber} updated successfully!`);
      } else {
        showToast(`Failed to update match ${match.matchNumber}`, 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        showToast('Tournament data seeded successfully!');
        fetchMatches();
      } else {
        showToast('Failed to seed data', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const getStageBadge = (match) => {
    if (match.stage === 'group') {
      return match.group === 'A'
        ? <span className="badge badge-group-a">Group A</span>
        : <span className="badge badge-group-b">Group B</span>;
    }
    if (match.stage === 'semifinal') return <span className="badge badge-knockout"><IoFlame style={{ fontSize: '10px' }} /> Semifinal</span>;
    return <span className="badge badge-knockout"><IoTrophy style={{ fontSize: '10px' }} /> Final</span>;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Admin Panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoSettings style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Admin Dashboard</h1>
        <p className="page-subtitle">
          Manage match scores, status, and player names
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <IoLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Seed Section */}
      <div className="seed-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <IoWarning style={{ color: 'var(--accent-warning)', fontSize: '1.1rem' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click below to seed/reset all tournament data. This will delete existing data and create fresh matches.</span>
        </div>
        <button
          onClick={handleSeed}
          className="btn btn-danger"
          disabled={seeding}
        >
          <IoRefresh /> {seeding ? 'Seeding...' : 'Seed Tournament Data'}
        </button>
      </div>

      {/* Match Editor */}
      <div className="admin-match-list">
        {matches.map((match) => (
          <div key={match._id} className="admin-match-card">
            <div className="admin-match-header">
              <div className="admin-match-info">
                <span className="match-number">Match {match.matchNumber}</span>
                {getStageBadge(match)}
              </div>
              <span className="match-time" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <IoTime style={{ fontSize: '0.75rem' }} /> {match.timeSlot}
              </span>
            </div>

            <div className="admin-match-body">
              <div className="admin-player-section">
                <input
                  type="text"
                  className="form-input"
                  style={{ maxWidth: '140px', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase' }}
                  value={match.player1}
                  onChange={(e) => handlePlayerChange(match.matchNumber, 'player1', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  className="form-input form-input-score"
                  min="0"
                  value={match.score1}
                  onChange={(e) => handleScoreChange(match.matchNumber, 'score1', e.target.value)}
                />
                <span className="admin-vs">VS</span>
                <input
                  type="number"
                  className="form-input form-input-score"
                  min="0"
                  value={match.score2}
                  onChange={(e) => handleScoreChange(match.matchNumber, 'score2', e.target.value)}
                />
              </div>

              <div className="admin-player-section">
                <input
                  type="text"
                  className="form-input"
                  style={{ maxWidth: '140px', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase' }}
                  value={match.player2}
                  onChange={(e) => handlePlayerChange(match.matchNumber, 'player2', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-match-actions">
              <select
                className="form-input admin-status-select"
                value={match.status}
                onChange={(e) => handleStatusChange(match.matchNumber, e.target.value)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => saveMatch(match)}
                className="btn btn-primary btn-sm"
              >
                <IoSave /> Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-text">No matches found. Click &quot;Seed Tournament Data&quot; to populate.</div>
        </div>
      )}

      {/* Toasts */}
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
