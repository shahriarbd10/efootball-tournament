'use client';

import Link from "next/link";
import { IoCalendar, IoStatsChart, IoTrophy, IoSettings, IoFootball, IoPeople, IoTime, IoFlash, IoRibbon, IoHandLeft, IoCloseCircle, IoChevronForward, IoGrid } from 'react-icons/io5';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <IoFlash style={{ fontSize: '0.9rem' }} />
          Live Tournament &middot; 2026
        </div>

        <h1 className="hero-title">
          <span className="hero-title-main">eFootball</span>
          <span className="hero-title-sub">Tournament Cup 2026</span>
        </h1>

        <p className="hero-description">
          6 players. 9 matches. 1 champion. Track every goal, every upset,
          and every triumph in real-time as the best eFootball players battle
          for ultimate glory.
        </p>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">6</div>
            <div className="hero-stat-label">Players</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">9</div>
            <div className="hero-stat-label">Matches</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">90</div>
            <div className="hero-stat-label">Minutes</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">2</div>
            <div className="hero-stat-label">Groups</div>
          </div>
        </div>

        <div className="hero-actions">
          <Link href="/fixtures" className="btn btn-primary">
            <IoCalendar /> View Fixtures
          </Link>
          <Link href="/standings" className="btn btn-secondary">
            <IoStatsChart /> Standings
          </Link>
          <Link href="/bracket" className="btn btn-secondary">
            <IoTrophy /> Bracket
          </Link>
        </div>
      </section>

      {/* Quick Nav Cards */}
      <div className="container">
        <div className="nav-cards-grid">
          <Link href="/fixtures" className="nav-card">
            <div className="nav-card-icon"><IoCalendar /></div>
            <div className="nav-card-title">Fixtures</div>
            <div className="nav-card-desc">
              View all 9 matches with live scores, timings, and match status updates
            </div>
          </Link>

          <Link href="/standings" className="nav-card">
            <div className="nav-card-icon"><IoStatsChart /></div>
            <div className="nav-card-title">Standings</div>
            <div className="nav-card-desc">
              Group A &amp; B standings with points, goal difference, and qualification status
            </div>
          </Link>

          <Link href="/bracket" className="nav-card">
            <div className="nav-card-icon"><IoTrophy /></div>
            <div className="nav-card-title">Knockout Bracket</div>
            <div className="nav-card-desc">
              Semifinals and Final bracket view — who will lift the trophy?
            </div>
          </Link>

          <Link href="/admin" className="nav-card">
            <div className="nav-card-icon"><IoSettings /></div>
            <div className="nav-card-title">Admin Panel</div>
            <div className="nav-card-desc">
              Manage scores, match status, and tournament data in real-time
            </div>
          </Link>
        </div>

        {/* Scoring Info */}
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

          <div className="card" style={{ marginTop: '1rem', padding: '1.25rem 1.5rem' }}>
            <div className="card-label" style={{ marginBottom: '0.5rem' }}>
              Tiebreakers
            </div>
            <div style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: '500' }}>
              <span style={{ color: 'var(--accent-primary)' }}>1.</span> Goal Difference <IoChevronForward style={{ verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-muted)' }} /> <span style={{ color: 'var(--accent-primary)' }}>2.</span> Goals Scored <IoChevronForward style={{ verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-muted)' }} /> <span style={{ color: 'var(--accent-primary)' }}>3.</span> Head-to-Head
            </div>
          </div>
        </div>

        {/* Players */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <span className="section-icon"><IoPeople /></span>
            <span className="section-title">Players</span>
            <div className="section-divider"></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {/* Group A */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-group-a">Group A</span>
              </div>
              {['Sadique', 'Nehal', 'Mynul'].map((player, i) => (
                <div key={player} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0',
                  borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: '700', width: '20px' }}>{i + 1}</span>
                  <IoFootball style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-primary)' }}>{player}</span>
                </div>
              ))}
            </div>

            {/* Group B */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-group-b">Group B</span>
              </div>
              {['Arif', 'Shahriar', 'Rifat'].map((player, i) => (
                <div key={player} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0',
                  borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: 'var(--accent-tertiary)', fontWeight: '700', width: '20px' }}>{i + 1}</span>
                  <IoFootball style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-primary)' }}>{player}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <span className="section-icon"><IoTime /></span>
            <span className="section-title">Schedule</span>
            <div className="section-divider"></div>
          </div>

          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {[
                { match: 1, time: '0:00 – 0:10' },
                { match: 2, time: '0:10 – 0:20' },
                { match: 3, time: '0:20 – 0:30' },
                { match: 4, time: '0:30 – 0:40' },
                { match: 5, time: '0:40 – 0:50' },
                { match: 6, time: '0:50 – 1:00' },
                { match: 7, time: '1:00 – 1:10' },
                { match: 8, time: '1:10 – 1:20' },
                { match: 9, time: '1:20 – 1:30' },
              ].map(({ match, time }) => (
                <div key={match} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700' }}>M{match}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{time}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              <IoTime /> Total Duration: 1 Hour 30 Minutes
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
