'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoSettings, IoLogOut, IoAdd, IoCalendar, IoPeople, IoTrophy, IoTrash, IoChevronForward, IoFootball, IoFlash, IoCheckmarkCircle, IoTime } from 'react-icons/io5';

export default function AdminDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      if (data.success) {
        setTournaments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
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

  const openDeleteModal = (tournamentId, name) => {
    setDeleteModal({ tournamentId, name });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal(null);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const { tournamentId } = deleteModal;
    setDeleting(tournamentId);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Tournament deleted');
        setTournaments(prev => prev.filter(t => t._id !== tournamentId));
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setDeleting(null);
      setDeleteModal(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-live"><IoFlash style={{ fontSize: '10px' }} /> Active</span>;
      case 'completed':
        return <span className="badge badge-completed"><IoCheckmarkCircle style={{ fontSize: '10px' }} /> Completed</span>;
      default:
        return <span className="badge badge-upcoming"><IoTime style={{ fontSize: '10px' }} /> Draft</span>;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
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
          Create and manage tournaments
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link href="/admin/tournament/create" className="btn btn-primary btn-sm">
            <IoAdd /> Create Tournament
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <IoLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Tournament List */}
      {tournaments.length === 0 ? (
        <div className="loading-container" style={{ minHeight: '300px' }}>
          <div style={{ textAlign: 'center' }}>
            <IoTrophy style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '1rem', opacity: 0.5 }} />
            <div className="loading-text">No tournaments yet</div>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', marginTop: '0.5rem' }}>
              Click "Create Tournament" to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="admin-match-list">
          {tournaments.map((t) => (
            <div key={t._id} className="admin-match-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
              <div className="admin-match-header" style={{ borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0
                  }}>
                    <IoTrophy />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif', fontWeight: '700',
                      fontSize: '1.1rem', color: 'var(--text-primary)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {t.name}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      fontSize: '0.8rem', color: 'var(--text-muted)',
                      fontFamily: 'Rajdhani, sans-serif', fontWeight: '500', marginTop: '0.15rem'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <IoCalendar style={{ fontSize: '0.7rem' }} /> {formatDate(t.date)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <IoPeople style={{ fontSize: '0.7rem' }} /> {t.playerCount} players
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <IoFootball style={{ fontSize: '0.7rem' }} /> {t.format === 'group+knockout' ? 'Group + KO' : 'Knockout'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getStatusBadge(t.status)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem 0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                <Link
                  href={`/admin/tournament/${t._id}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IoSettings /> Manage <IoChevronForward />
                </Link>
                <button
                  onClick={(e) => { e.stopPropagation(); openDeleteModal(t._id, t.name); }}
                  className="btn btn-danger btn-sm"
                  disabled={deleting === t._id}
                  style={{ padding: '0.4rem 0.75rem' }}
                >
                  <IoTrash /> {deleting === t._id ? '...' : ''}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal-card">
            <div id="delete-modal-title" className="modal-title danger">Delete Tournament</div>
            <div className="modal-message">
              Delete tournament "{deleteModal.name}"? This will remove all matches too.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={closeDeleteModal} disabled={Boolean(deleting)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={Boolean(deleting)}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
          max-width: 420px;
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

      {/* Toasts */}
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
