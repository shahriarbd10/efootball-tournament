'use client';

import { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { IoCalendar, IoChevronForward, IoTime, IoPeople, IoFlash, IoCheckmarkCircle, IoSearch, IoFilter } from 'react-icons/io5';

export default function TournamentArchive() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by Month Year
  const grouped = filteredTournaments.reduce((acc, t) => {
    const date = new Date(t.date);
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Archive...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoCalendar style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Tournament Archive</h1>
        <p className="page-subtitle">Browse all past and current eFootball tournaments</p>
        
        <div style={{ marginTop: '1.5rem', maxWidth: '400px', margin: '1.5rem auto 0' }}>
          <div style={{ position: 'relative' }}>
            <IoSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="archive-timeline">
        {Object.entries(grouped).map(([monthYear, items]) => (
          <div key={monthYear} className="timeline-group">
            <div className="timeline-label">
              <span className="timeline-dot"></span>
              {monthYear}
            </div>
            
            <div className="archive-grid">
              {items.map(t => (
                <div key={t._id} className="card archive-card">
                  <div className="archive-card-status">
                    {t.status === 'active' ? (
                      <span className="status-badge live"><IoFlash /> Live</span>
                    ) : t.status === 'completed' ? (
                      <span className="status-badge completed"><IoCheckmarkCircle /> Completed</span>
                    ) : (
                      <span className="status-badge upcoming">Draft</span>
                    )}
                  </div>
                  
                  <h3 className="archive-card-title">{t.name}</h3>
                  
                  <div className="archive-card-meta">
                    <span><IoCalendar /> {new Date(t.date).toLocaleDateString()}</span>
                    <span><IoPeople /> {t.playerCount} Players</span>
                  </div>

                  {t.totalMatches > 0 && (
                    <div className="card-progress">
                      <div className="card-progress-info">
                        <span>Progress</span>
                        <span>{Math.round((t.completedMatches / t.totalMatches) * 100)}%</span>
                      </div>
                      <div className="card-progress-bar">
                        <div 
                          className="card-progress-fill" 
                          style={{ width: `${(t.completedMatches / t.totalMatches) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="archive-card-actions">
                    <a href={`/?t=${t._id}`} className="btn btn-secondary btn-sm">
                      Overview
                    </a>
                    <a href={`/fixtures?t=${t._id}`} className="btn btn-primary btn-sm">
                      Results <IoChevronForward />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <div className="loading-text">No tournaments found matching your search</div>
        </div>
      )}

      <style jsx>{`
        .archive-timeline {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          padding-left: 1.5rem;
          border-left: 2px solid rgba(255, 255, 255, 0.05);
        }

        .timeline-group {
          margin-bottom: 3rem;
          position: relative;
        }

        .timeline-label {
          font-family: 'Orbitron', monospace;
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .timeline-dot {
          position: absolute;
          left: -1.5rem;
          top: 0.4rem;
          width: 12px;
          height: 12px;
          background: var(--accent-primary);
          border-radius: 50%;
          border: 3px solid #0f172a;
          transform: translateX(-50%);
          box-shadow: 0 0 10px var(--accent-primary);
        }

        .archive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .archive-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.3s ease;
        }

        .archive-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
        }

        .archive-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-primary);
          margin: 0;
        }

        .archive-card-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .archive-card-meta span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .card-progress { margin-top: 0.5rem; }
        .card-progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.3rem;
        }
        .card-progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .card-progress-fill {
          height: 100%;
          background: var(--accent-primary);
          box-shadow: 0 0 5px var(--accent-primary);
        }

        .archive-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .status-badge {
          font-size: 0.6rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          text-transform: uppercase;
        }

        .status-badge.live { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .status-badge.completed { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .status-badge.upcoming { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
