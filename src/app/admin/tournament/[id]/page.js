'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IoSettings, IoArrowBack, IoSave, IoShuffle, IoTime, IoFlame, IoTrophy,
  IoWarning, IoPeople, IoFootball, IoCalendar, IoCheckmarkCircle, IoFlash,
  IoRefresh, IoStatsChart } from 'react-icons/io5';

export default function TournamentManage() {
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [shuffling, setShuffling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id;

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ts = Date.now();
      const [tRes, mRes] = await Promise.all([
        fetch(`/api/tournaments/${tournamentId}?t=${ts}`),
        fetch(`/api/matches?tournamentId=${tournamentId}&t=${ts}`)
      ]);
      const tData = await tRes.json();
      const mData = await mRes.json();
      if (tData.success) setTournament(tData.data);
      if (mData.success) setMatches(mData.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const isStartedMatch = (match) => {
    const isBye = match.player1 === 'BYE' || match.player2 === 'BYE';
    if (isBye) return false;
    return match.status === 'live' || match.status === 'completed';
  };

  const startedMatchesCount = matches.filter(isStartedMatch).length;

  const handleScoreChange = (matchNumber, field, value) => {
    setMatches(prev =>
      prev.map(m => m.matchNumber === matchNumber ? { ...m, [field]: parseInt(value) || 0 } : m)
    );
  };

  const handleStatusChange = (matchNumber, status) => {
    setMatches(prev =>
      prev.map(m => m.matchNumber === matchNumber ? { ...m, status } : m)
    );
  };

  const handlePlayerChange = (matchNumber, field, value) => {
    setMatches(prev =>
      prev.map(m => m.matchNumber === matchNumber ? { ...m, [field]: value } : m)
    );
  };

  const saveMatch = async (match) => {
    try {
      const res = await fetch('/api/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match._id,
          score1: match.score1,
          score2: match.score2,
          status: match.status,
          player1: match.player1,
          player2: match.player2,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Match ${match.matchNumber} updated!`);
      } else {
        showToast('Failed to update', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    }
  };

  const closeModal = () => setModal(null);

  const executeReshuffle = async () => {
    setShuffling(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/generate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Reshuffled! ${data.matchesCreated} matches generated`);
        await fetchData();
      } else {
        showToast('Failed: ' + data.error, 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setShuffling(false);
    }
  };

  const handleReshuffle = () => {
    if (tournament?.status === 'completed') {
      showToast('Tournament already completed. Re-shuffle is disabled.', 'error');
      return;
    }

    if (startedMatchesCount > 0) {
      setModal({
        title: 'Match Already Started',
        message: 'Re-shuffle is only allowed when all matches are upcoming.',
        confirmLabel: 'OK',
        hideCancel: true,
        variant: 'danger',
        onConfirm: closeModal,
      });
      return;
    }

    setModal({
      title: 'Confirm Re-shuffle',
      message: 'This will regenerate all fixtures and reset current scores. Do you want to continue?',
      confirmLabel: 'Re-shuffle Now',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: async () => {
        closeModal();
        await executeReshuffle();
      },
    });
  };

  const executeComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Tournament marked as completed!');
        setTournament(data.data);
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleComplete = () => {
    setModal({
      title: 'Finalize Tournament',
      message: 'Mark this tournament as completed? You can still view all results, but management actions will be limited.',
      confirmLabel: 'Yes, Finalize',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: async () => {
        closeModal();
        await executeComplete();
      },
    });
  };

  const getStageBadge = (match) => {
    if (match.stage === 'group') {
      const colors = { A: 'badge-group-a', B: 'badge-group-b' };
      return <span className={`badge ${colors[match.group] || 'badge-group-a'}`}>Group {match.group}</span>;
    }
    const labels = {
      round16: 'Round of 16', quarterfinal: 'Quarterfinal',
      semifinal: 'Semifinal', final: 'Final'
    };
    return (
      <span className="badge badge-knockout">
        {match.stage === 'final' ? <IoTrophy style={{ fontSize: '10px' }} /> : <IoFlame style={{ fontSize: '10px' }} />}
        {' '}{labels[match.stage] || match.stage}
      </span>
    );
  };

  // Determine available tabs from matches
  const getGroupNames = () => {
    return [...new Set(matches.filter(m => m.stage === 'group').map(m => m.group).filter(Boolean))].sort();
  };

  const hasKnockout = matches.some(m => m.stage !== 'group');

  const filteredMatches = matches.filter(m => {
    if (activeTab === 'all') return true;
    if (activeTab === 'knockout') return m.stage !== 'group';
    return m.stage === 'group' && m.group === activeTab;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Tournament...</div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container">
        <div className="loading-container" style={{ minHeight: '300px' }}>
          <div className="loading-text">Tournament not found</div>
          <Link href="/admin/dashboard" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
            <IoArrowBack /> Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const groups = tournament.groups ? Object.fromEntries(
    typeof tournament.groups.entries === 'function'
      ? tournament.groups.entries()
      : Object.entries(tournament.groups)
  ) : {};

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoSettings style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />{tournament.name}</h1>
        <p className="page-subtitle">
          {new Date(tournament.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}{tournament.playerCount} players · {tournament.format === 'group+knockout' ? 'Group + Knockout' : 'Knockout'}
        </p>
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin/dashboard" className="btn btn-secondary btn-sm">
            <IoArrowBack /> Dashboard
          </Link>
          <div className="info-reshuffle-container">
            <div className="info-icon-trigger" title="Tournament Info & Actions">
              <IoSettings style={{ color: 'var(--text-muted)' }} />
              <div className="info-dropdown">
                <div className="info-dropdown-header">Advanced Actions</div>
                <div className="info-dropdown-body">
                  <p className="info-text">You can reshuffle players and regenerate the match schedule, but only if no matches have started yet.</p>
                  <button 
                    onClick={handleReshuffle} 
                    className="btn btn-danger btn-sm" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={shuffling || tournament.status === 'completed'}
                  >
                    <IoShuffle /> {shuffling ? 'Shuffling...' : 'Re-shuffle Tournament'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .info-reshuffle-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .info-icon-trigger {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .info-icon-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--accent-primary);
        }
        .info-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          z-index: 1000;
          text-align: left;
        }
        .info-icon-trigger:hover .info-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .info-dropdown-header {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        .info-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 2100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          width: 100%;
          max-width: 440px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
          padding: 1.2rem;
        }
        .modal-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.6rem;
          color: var(--text-primary);
        }
        .modal-title.warning {
          color: var(--accent-warning);
        }
        .modal-title.danger {
          color: var(--accent-danger);
        }
        .modal-message {
          color: var(--text-secondary);
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.6rem;
        }
      `}</style>

      {/* Groups or Players Display */}
      {(Object.keys(groups).length > 0 || (tournament.players && tournament.players.length > 0)) && (
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-header">
            <span className="section-icon"><IoPeople /></span>
            <span className="section-title">{Object.keys(groups).length > 0 ? 'Groups' : 'Participants'}</span>
            <div className="section-divider"></div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: Object.keys(groups).length > 0 
              ? `repeat(${Math.min(Object.keys(groups).length, 4)}, 1fr)`
              : 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '0.75rem' 
          }}>
            {Object.keys(groups).length > 0 ? (
              Object.entries(groups).map(([groupName, players]) => (
                <div key={groupName} className="card" style={{ padding: '1rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                    <span className={`badge ${groupName === 'A' ? 'badge-group-a' : groupName === 'B' ? 'badge-group-b' : 'badge-knockout'}`}>
                      Group {groupName}
                    </span>
                  </div>
                  {(players || []).map((player, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.4rem 0',
                      borderBottom: i < (players || []).length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}>
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-primary)', width: '16px' }}>{i + 1}</span>
                      <IoFootball style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{player}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '1rem', gridColumn: '1 / -1' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {(tournament.players || []).map((player, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-primary)', width: '16px' }}>{i + 1}</span>
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{player}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All ({matches.length})
        </button>
        {getGroupNames().map(g => (
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

      {/* Match Editor */}
      <div className="admin-match-list">
        {filteredMatches.map((match) => (
          <div key={match._id} className="admin-match-card">
            <div className="admin-match-header">
              <div className="admin-match-info">
                <span className="match-number">M{match.matchNumber}</span>
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
              <button onClick={() => saveMatch(match)} className="btn btn-primary btn-sm">
                <IoSave /> Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-text">No matches. Click the gear icon <IoSettings style={{ fontSize: '0.8rem' }} /> to "Re-shuffle".</div>
        </div>
      )}

      {/* Footer Actions */}
      {tournament.status === 'active' && (
        <div style={{ 
          marginTop: '3rem', 
          padding: '2rem 1rem', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div className="section-header" style={{ width: '100%', maxWidth: '400px', justifyContent: 'center' }}>
            <span className="section-icon"><IoTrophy /></span>
            <span className="section-title">Finalize Tournament</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '450px', margin: '0 0 0.5rem 0' }}>
            Once all matches are finished and all scores have been saved, click below to mark the tournament as completed.
          </p>
          <button 
            onClick={handleComplete} 
            className="btn btn-primary" 
            disabled={completing}
            style={{ padding: '0.85rem 3rem', fontSize: '1.1rem', height: 'auto', borderRadius: '50px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
          >
            <IoCheckmarkCircle style={{ fontSize: '1.3rem' }} /> {completing ? 'Finalizing...' : 'Finalize & Complete'}
          </button>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="action-modal-title">
          <div className="modal-card">
            <div id="action-modal-title" className={`modal-title ${modal.variant || ''}`}>
              {modal.title}
            </div>
            <div className="modal-message">{modal.message}</div>
            <div className="modal-actions">
              {!modal.hideCancel && (
                <button className="btn btn-secondary btn-sm" onClick={closeModal}>
                  {modal.cancelLabel || 'Cancel'}
                </button>
              )}
              <button
                className={`btn btn-sm ${modal.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={modal.onConfirm}
                disabled={shuffling || completing}
              >
                {modal.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
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
