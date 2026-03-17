'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoChevronDown, IoCalendar, IoCheckmarkCircle, IoFlash } from 'react-icons/io5';

export default function TournamentSelector() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = searchParams.get('t');

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
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('t', id);
    router.push(`?${params.toString()}`);
  };

  const currentTournament = tournaments.find(t => t._id === currentId) || tournaments[0];

  if (loading) return <div className="selector-skeleton"></div>;

  return (
    <div className="tournament-selector-container">
      <div className="selector-dropdown">
        <div className="selector-header">
          <IoCalendar className="selector-icon" />
          <div className="selector-info">
            <span className="selector-label">Select Tournament</span>
            <span className="selector-current">{currentTournament?.name || 'Loading...'}</span>
          </div>
          <IoChevronDown className="selector-arrow" />
        </div>
        
        <div className="selector-options">
          {tournaments.map(t => (
            <div 
              key={t._id} 
              className={`selector-option ${t._id === currentId ? 'active' : ''}`}
              onClick={() => handleSelect(t._id)}
            >
              <div className="option-info">
                <span className="option-name">{t.name}</span>
                <span className="option-date">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {t.status === 'active' ? (
                <span className="status-badge live"><IoFlash /> Live</span>
              ) : (
                <span className="status-badge completed"><IoCheckmarkCircle /> Past</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .tournament-selector-container {
          position: relative;
          min-width: 180px;
          max-width: 240px;
          margin: 0 1rem;
          z-index: 100;
        }

        .selector-dropdown {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .selector-dropdown:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--accent-primary);
        }

        .selector-header {
          display: flex;
          align-items: center;
          padding: 0.4rem 0.75rem;
          gap: 0.5rem;
        }

        .selector-icon {
          color: var(--accent-primary);
          font-size: 1rem;
        }

        .selector-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .selector-label {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 700;
          line-height: 1;
        }

        .selector-current {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .selector-arrow {
          color: var(--text-muted);
          font-size: 0.8rem;
          transition: transform 0.3s ease;
        }

        .selector-options {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          width: 260px;
        }

        .selector-dropdown:hover .selector-options {
          max-height: 400px;
          opacity: 1;
          padding: 0.5rem 0;
        }

        .selector-dropdown:hover .selector-arrow {
          transform: rotate(180deg);
          color: var(--accent-primary);
        }

        .selector-option {
          padding: 0.6rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.2s ease;
        }

        .selector-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .selector-option.active {
          background: rgba(0, 255, 135, 0.08);
          border-left: 2px solid var(--accent-primary);
        }

        .option-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .option-name {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .option-date {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .status-badge {
          font-size: 0.55rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .status-badge.live {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .status-badge.completed {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .selector-skeleton {
          width: 280px;
          height: 54px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          animate: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
