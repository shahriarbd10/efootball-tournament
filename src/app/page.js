'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { IoCalendar, IoStatsChart, IoTrophy, IoSettings, IoFootball, IoPeople, IoTime, IoFlash, IoRibbon, IoHandLeft, IoCloseCircle, IoChevronForward, IoGrid } from 'react-icons/io5';

function HomeContent() {
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tId = searchParams.get('t');

  useEffect(() => {
    fetchData();
  }, [tId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let activeId = tId;
      
      // If no ID in URL, find latest active or latest created
      if (!activeId) {
        const tRes = await fetch('/api/tournaments');
        const tData = await tRes.json();
        if (tData.success && tData.data.length > 0) {
          const latest = tData.data.find(t => t.status === 'active') || tData.data[0];
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

  const groups = tournament?.groups
    ? (typeof tournament.groups.entries === 'function'
      ? Object.fromEntries(tournament.groups.entries())
      : tournament.groups)
    : {};

  const groupNames = Object.keys(groups).sort();
  const groupMatches = matches.filter(m => m.stage === 'group');
  const knockoutMatches = matches.filter(m => m.stage !== 'group');
  const totalDuration = matches.length * (tournament?.slotDuration || 10);
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <IoFlash style={{ fontSize: '0.9rem' }} />
          {tournament?.status === 'active' ? 'Live Tournament' : 'Tournament'} · {new Date().getFullYear()}
        </div>

        <h1 className="hero-title">
          <span className="hero-title-main">eFootball</span>
          <span className="hero-title-sub">{tournament?.name || 'Tournament Cup'}</span>
        </h1>

        <p className="hero-description">
          {tournament
            ? `${tournament.playerCount} players. ${matches.length} matches. 1 champion. Track every goal, every upset, and every triumph in real-time.`
            : 'Create a tournament from the admin panel to get started!'
          }
        </p>

        {tournament && matches.length > 0 && (
          <div className="progress-container-hero">
            <div className="progress-info">
              <span>Tournament Progress</span>
              <span>{Math.round((matches.filter(m => m.status === 'completed').length / matches.length) * 100)}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(matches.filter(m => m.status === 'completed').length / matches.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {tournament && (
          <>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">{tournament.playerCount}</div>
                <div className="hero-stat-label">Players</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{matches.length}</div>
                <div className="hero-stat-label">Matches</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins}m`}</div>
                <div className="hero-stat-label">Duration</div>
              </div>
              {groupNames.length > 0 && (
                <div className="hero-stat">
                  <div className="hero-stat-value">{groupNames.length}</div>
                  <div className="hero-stat-label">Groups</div>
                </div>
              )}
            </div>

            <div style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: '600', fontSize: '0.9rem',
              color: 'var(--text-muted)', marginTop: '0.5rem'
            }}>
              <IoCalendar style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              {new Date(tournament.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </>
        )}

        <div className="hero-actions">
          <Link href="/fixtures" className="btn btn-primary">
            <IoCalendar /> View Fixtures
          </Link>
          {groupNames.length > 0 && (
            <Link href="/standings" className="btn btn-secondary">
              <IoStatsChart /> Standings
            </Link>
          )}
          <Link href="/bracket" className="btn btn-secondary">
            <IoTrophy /> Bracket
          </Link>
        </div>
      </section>

      <style jsx>{`
        .progress-container-hero {
          width: 100%;
          max-width: 400px;
          margin: 1.5rem auto;
          background: rgba(255, 255, 255, 0.03);
          padding: 1rem;
          border-radius: 12px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .progress-info {
          display: flex;
          justify-content: space-between;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 1px;
        }
        .progress-bar-wrap {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 0 10px var(--accent-primary);
          transition: width 1s ease-out;
        }
      `}</style>

      {/* Quick Nav Cards */}
      <div className="container">
        <div className="nav-cards-grid">
          <Link href="/fixtures" className="nav-card">
            <div className="nav-card-icon"><IoCalendar /></div>
            <div className="nav-card-title">Fixtures</div>
            <div className="nav-card-desc">
              View all {matches.length} matches with live scores, timings, and match status
            </div>
          </Link>

          {groupNames.length > 0 && (
            <Link href="/standings" className="nav-card">
              <div className="nav-card-icon"><IoStatsChart /></div>
              <div className="nav-card-title">Standings</div>
              <div className="nav-card-desc">
                Group standings with points, goal difference, and qualification status
              </div>
            </Link>
          )}

          <Link href="/bracket" className="nav-card">
            <div className="nav-card-icon"><IoTrophy /></div>
            <div className="nav-card-title">Knockout Bracket</div>
            <div className="nav-card-desc">
              {knockoutMatches.length > 0 ? `${knockoutMatches.length} knockout matches` : 'Semifinals and Final'} — who lifts the trophy?
            </div>
          </Link>

          <Link href="/admin" className="nav-card">
            <div className="nav-card-icon"><IoSettings /></div>
            <div className="nav-card-title">Admin Panel</div>
            <div className="nav-card-desc">
              Create tournaments, manage scores, and control match status
            </div>
          </Link>
        </div>

        {/* Scoring Info */}
        {tournament && (
          <div style={{ marginTop: '3rem' }}>
            <div className="section-header">
              <span className="section-icon"><IoRibbon /></span>
              <span className="section-title">Scoring System</span>
              <div className="section-divider"></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="card-icon-wrap"><IoTrophy style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }} /></div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>3</div>
                <div className="card-label">Win Points</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="card-icon-wrap"><IoHandLeft style={{ fontSize: '1.6rem', color: 'var(--accent-warning)' }} /></div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-warning)', marginTop: '0.5rem' }}>1</div>
                <div className="card-label">Draw Points</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="card-icon-wrap"><IoCloseCircle style={{ fontSize: '1.6rem', color: 'var(--accent-danger)' }} /></div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-danger)', marginTop: '0.5rem' }}>0</div>
                <div className="card-label">Loss Points</div>
              </div>
            </div>
          </div>
        )}

        {/* Players */}
        {groupNames.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <div className="section-header">
              <span className="section-icon"><IoPeople /></span>
              <span className="section-title">Players</span>
              <div className="section-divider"></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(groupNames.length, 4)}, 1fr)`, gap: '1rem' }}>
              {groupNames.map(groupName => (
                <div key={groupName} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span className={`badge ${groupName === 'A' ? 'badge-group-a' : groupName === 'B' ? 'badge-group-b' : 'badge-knockout'}`}>Group {groupName}</span>
                  </div>
                  {(groups[groupName] || []).map((player, i) => (
                    <div key={player} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.6rem 0',
                      borderBottom: i < (groups[groupName] || []).length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}>
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', width: '20px' }}>{i + 1}</span>
                      <IoFootball style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-primary)' }}>{player}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        {matches.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <div className="section-header">
              <span className="section-icon"><IoTime /></span>
              <span className="section-title">Schedule</span>
              <div className="section-divider"></div>
            </div>

            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {matches.map((m) => (
                  <div key={m.matchNumber} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.75rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700' }}>M{m.matchNumber}</span>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{m.timeSlot}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                <IoTime /> Total Duration: {hours > 0 ? `${hours} Hour${hours > 1 ? 's' : ''}` : ''} {mins > 0 ? `${mins} Minutes` : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Tournament...</div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
