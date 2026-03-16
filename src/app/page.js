import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          🎮 Live Tournament • 2026
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
            ⚡ View Fixtures
          </Link>
          <Link href="/standings" className="btn btn-secondary">
            📊 Standings
          </Link>
          <Link href="/bracket" className="btn btn-secondary">
            🏆 Bracket
          </Link>
        </div>
      </section>

      {/* Quick Nav Cards */}
      <div className="container">
        <div className="nav-cards-grid">
          <Link href="/fixtures" className="nav-card">
            <div className="nav-card-icon">📋</div>
            <div className="nav-card-title">Fixtures</div>
            <div className="nav-card-desc">
              View all 9 matches with live scores, timings, and match status updates
            </div>
          </Link>

          <Link href="/standings" className="nav-card">
            <div className="nav-card-icon">📊</div>
            <div className="nav-card-title">Standings</div>
            <div className="nav-card-desc">
              Group A & B standings with points, goal difference, and qualification status
            </div>
          </Link>

          <Link href="/bracket" className="nav-card">
            <div className="nav-card-icon">🏆</div>
            <div className="nav-card-title">Knockout Bracket</div>
            <div className="nav-card-desc">
              Semifinals and Final bracket view — who will lift the trophy?
            </div>
          </Link>

          <Link href="/admin" className="nav-card">
            <div className="nav-card-icon">⚙️</div>
            <div className="nav-card-title">Admin Panel</div>
            <div className="nav-card-desc">
              Manage scores, match status, and tournament data in real-time
            </div>
          </Link>
        </div>

        {/* Scoring Info */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <span className="section-icon">✅</span>
            <span className="section-title">Scoring System</span>
            <div className="section-divider"></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏅</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-primary)' }}>3</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Win Points</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-warning)' }}>1</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Draw Points</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-danger)' }}>0</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Loss Points</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1rem', padding: '1.25rem 1.5rem' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              Tiebreakers
            </div>
            <div style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: '500' }}>
              ① Goal Difference → ② Goals Scored → ③ Head-to-Head
            </div>
          </div>
        </div>

        {/* Players */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <span className="section-icon">👥</span>
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
                  padding: '0.5rem 0',
                  borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', width: '20px' }}>{i + 1}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{player}</span>
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
                  padding: '0.5rem 0',
                  borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', width: '20px' }}>{i + 1}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{player}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <span className="section-icon">⏱️</span>
            <span className="section-title">Schedule</span>
            <div className="section-divider"></div>
          </div>

          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {[
                { match: 1, time: '0:00 – 0:10', players: 'Sadique vs Nehal' },
                { match: 2, time: '0:10 – 0:20', players: 'Nehal vs Mynul' },
                { match: 3, time: '0:20 – 0:30', players: 'Sadique vs Mynul' },
                { match: 4, time: '0:30 – 0:40', players: 'Arif vs Shahriar' },
                { match: 5, time: '0:40 – 0:50', players: 'Shahriar vs Rifat' },
                { match: 6, time: '0:50 – 1:00', players: 'Arif vs Rifat' },
                { match: 7, time: '1:00 – 1:10', players: 'Semifinal 1' },
                { match: 8, time: '1:10 – 1:20', players: 'Semifinal 2' },
                { match: 9, time: '1:20 – 1:30', players: 'Final' },
              ].map(({ match, time, players }) => (
                <div key={match} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700' }}>M{match}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{time}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              ⏱️ Total Duration: 1 Hour 30 Minutes
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
