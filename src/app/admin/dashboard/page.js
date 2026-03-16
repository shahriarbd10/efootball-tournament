'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoSettings, IoLogOut, IoSave, IoRefresh, IoTime, IoFlame, IoTrophy, IoWarning, IoPeople, IoSwapHorizontal, IoFootball } from 'react-icons/io5';

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [groupA, setGroupA] = useState([]);
  const [groupB, setGroupB] = useState([]);
  const [savingGroups, setSavingGroups] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchMatches();
    fetchGroups();
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

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (data.success) {
        setGroupA(data.data.A);
        setGroupB(data.data.B);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
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
        fetchGroups();
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

  // --- Group Management ---
  const swapPlayer = (playerName, fromGroup) => {
    if (fromGroup === 'A') {
      if (groupB.length >= 3) {
        showToast('Group B already has 3 players. Swap one out first.', 'error');
        return;
      }
      setGroupA(prev => prev.filter(p => p !== playerName));
      setGroupB(prev => [...prev, playerName]);
    } else {
      if (groupA.length >= 3) {
        showToast('Group A already has 3 players. Swap one out first.', 'error');
        return;
      }
      setGroupB(prev => prev.filter(p => p !== playerName));
      setGroupA(prev => [...prev, playerName]);
    }
  };

  const handleGroupPlayerNameChange = (group, index, newName) => {
    if (group === 'A') {
      setGroupA(prev => prev.map((p, i) => i === index ? newName : p));
    } else {
      setGroupB(prev => prev.map((p, i) => i === index ? newName : p));
    }
  };

  const saveGroups = async () => {
    if (groupA.length !== 3 || groupB.length !== 3) {
      showToast('Each group must have exactly 3 players', 'error');
      return;
    }

    setSavingGroups(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupA, groupB }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('Groups updated & fixtures regenerated!');
        fetchMatches();
      } else {
        showToast(data.error || 'Failed to update groups', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setSavingGroups(false);
    }
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
          Manage groups, match scores, status, and player names
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
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Seed/reset tournament data with default groups. This will delete existing data.</span>
        </div>
        <button
          onClick={handleSeed}
          className="btn btn-danger"
          disabled={seeding}
        >
          <IoRefresh /> {seeding ? 'Seeding...' : 'Seed Tournament Data'}
        </button>
      </div>

      {/* ===== GROUP MANAGEMENT ===== */}
      {(groupA.length > 0 || groupB.length > 0) && (
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-header">
            <span className="section-icon"><IoPeople /></span>
            <span className="section-title">Group Management</span>
            <div className="section-divider"></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Group A */}
            <div className="admin-match-card" style={{ borderTop: '3px solid var(--accent-secondary)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-group-a" style={{ fontSize: '0.8rem', padding: '0.3rem 1rem' }}>Group A</span>
              </div>
              {groupA.map((player, i) => (
                <div key={`a-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0',
                  borderBottom: i < groupA.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <IoFootball style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', flexShrink: 0 }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.95rem', padding: '0.4rem 0.6rem' }}
                    value={player}
                    onChange={(e) => handleGroupPlayerNameChange('A', i, e.target.value)}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    onClick={() => swapPlayer(player, 'A')}
                    title="Move to Group B"
                  >
                    <IoSwapHorizontal /> → B
                  </button>
                </div>
              ))}
            </div>

            {/* Group B */}
            <div className="admin-match-card" style={{ borderTop: '3px solid var(--accent-tertiary)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-group-b" style={{ fontSize: '0.8rem', padding: '0.3rem 1rem' }}>Group B</span>
              </div>
              {groupB.map((player, i) => (
                <div key={`b-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0',
                  borderBottom: i < groupB.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <IoFootball style={{ color: 'var(--accent-tertiary)', fontSize: '0.9rem', flexShrink: 0 }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.95rem', padding: '0.4rem 0.6rem' }}
                    value={player}
                    onChange={(e) => handleGroupPlayerNameChange('B', i, e.target.value)}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    onClick={() => swapPlayer(player, 'B')}
                    title="Move to Group A"
                  >
                    <IoSwapHorizontal /> → A
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: '500' }}>
              Saving will reset all matches & scores with the new group assignments
            </div>
            <button
              onClick={saveGroups}
              className="btn btn-primary"
              disabled={savingGroups || groupA.length !== 3 || groupB.length !== 3}
            >
              <IoSave /> {savingGroups ? 'Saving...' : 'Save Groups & Regenerate Fixtures'}
            </button>
          </div>
        </div>
      )}

      {/* ===== MATCH EDITOR ===== */}
      <div className="section-header" style={{ marginTop: '1rem' }}>
        <span className="section-icon"><IoTrophy /></span>
        <span className="section-title">Match Editor</span>
        <div className="section-divider"></div>
      </div>

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
