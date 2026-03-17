'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoAdd, IoArrowBack, IoCalendar, IoPeople, IoFootball, IoShuffle, IoTime, IoChevronForward, IoFlash, IoTrophy, IoClose } from 'react-icons/io5';

export default function CreateTournament() {
  const [step, setStep] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form data
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [format, setFormat] = useState('group+knockout');
  const [playerCount, setPlayerCount] = useState(6);
  const [players, setPlayers] = useState([]);
  const [startTime, setStartTime] = useState('10:00');
  const [slotDuration, setSlotDuration] = useState(10);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
  }, []);

  // Update player name fields when count changes
  useEffect(() => {
    setPlayers(prev => {
      const newPlayers = Array.from({ length: playerCount }, (_, i) => prev[i] || '');
      return newPlayers;
    });
  }, [playerCount]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getMinPlayers = () => format === 'group+knockout' ? 4 : 2;
  const getMaxPlayers = () => 16;

  const getValidPlayerCounts = () => {
    if (format === 'knockout') {
      return [2, 4, 8, 16];
    }
    // Group+knockout: 4, 6, 8, 9, 10, 12, 16
    return [4, 6, 8, 9, 10, 12, 16];
  };

  const calculateMatches = () => {
    if (format === 'group+knockout') {
      const groupCount = playerCount > 8 ? Math.ceil(playerCount / 4) : 2;
      const ppg = Math.floor(playerCount / groupCount);
      // Round-robin per group: n*(n-1)/2
      let groupMatches = 0;
      let remaining = playerCount;
      for (let g = 0; g < groupCount; g++) {
        const size = g < (playerCount % groupCount) ? ppg + 1 : ppg;
        remaining -= size;
        groupMatches += (size * (size - 1)) / 2;
      }
      // Knockout matches
      const qualifiers = Math.min(2, ppg) * groupCount;
      let ko = 0;
      let n = qualifiers;
      while (n > 1) { ko += Math.floor(n / 2); n = Math.ceil(n / 2); }
      return groupMatches + ko;
    } else {
      // Knockout only: n - 1 matches total
      return playerCount - 1;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) { showToast('Enter a tournament name', 'error'); return; }
      if (!date) { showToast('Select a date', 'error'); return; }
      setStep(2);
    } else if (step === 2) {
      const empty = players.filter(p => !p.trim());
      if (empty.length > 0) { showToast(`Fill in all ${playerCount} player names`, 'error'); return; }
      const unique = new Set(players.map(p => p.trim().toLowerCase()));
      if (unique.size !== players.length) { showToast('Player names must be unique', 'error'); return; }
      setStep(3);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      // Parse time
      const timeParts = startTime.split(':');
      let hours = parseInt(timeParts[0]);
      const mins = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const formattedTime = `${displayHours}:${mins} ${ampm}`;

      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          date,
          format,
          playerCount,
          players: players.map(p => p.trim()),
          startTime: formattedTime,
          slotDuration,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Now generate fixtures
        setGenerating(true);
        const genRes = await fetch(`/api/tournaments/${data.data._id}/generate`, { method: 'POST' });
        const genData = await genRes.json();

        if (genData.success) {
          showToast(`Tournament created with ${genData.matchesCreated} matches!`);
          setTimeout(() => router.push(`/admin/tournament/${data.data._id}`), 1000);
        } else {
          showToast('Created but failed to generate fixtures: ' + genData.error, 'error');
          setTimeout(() => router.push('/admin/dashboard'), 1500);
        }
      } else {
        showToast(data.error || 'Failed to create tournament', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setCreating(false);
      setGenerating(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><IoAdd style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Create Tournament</h1>
        <p className="page-subtitle">Step {step} of 3</p>
        <div style={{ marginTop: '0.75rem' }}>
          <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/admin/dashboard')} className="btn btn-secondary btn-sm">
            <IoArrowBack /> {step > 1 ? 'Back' : 'Dashboard'}
          </button>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem'
      }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            width: s === step ? '2.5rem' : '0.5rem', height: '0.5rem',
            borderRadius: '1rem',
            background: s <= step ? 'var(--accent-primary)' : 'var(--border-color)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <div className="admin-match-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ padding: '1.5rem' }}>
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <span className="section-icon"><IoTrophy /></span>
              <span className="section-title">Tournament Details</span>
              <div className="section-divider"></div>
            </div>

            <div className="form-group">
              <label className="form-label"><IoTrophy style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Tournament Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. eFootball Cup March 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label"><IoCalendar style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Tournament Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><IoFootball style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={`btn ${format === 'group+knockout' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setFormat('group+knockout'); if (playerCount < 4) setPlayerCount(4); }}
                  style={{ justifyContent: 'center', padding: '1rem', flexDirection: 'column', gap: '0.3rem' }}
                >
                  <IoFlash style={{ fontSize: '1.2rem' }} />
                  <span style={{ fontSize: '0.85rem' }}>Group + Knockout</span>
                </button>
                <button
                  type="button"
                  className={`btn ${format === 'knockout' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setFormat('knockout'); setPlayerCount(4); }}
                  style={{ justifyContent: 'center', padding: '1rem', flexDirection: 'column', gap: '0.3rem' }}
                >
                  <IoTrophy style={{ fontSize: '1.2rem' }} />
                  <span style={{ fontSize: '0.85rem' }}>Knockout Only</span>
                </button>
              </div>
            </div>

            <button onClick={handleNext} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Next <IoChevronForward />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Players & Slots */}
      {step === 2 && (
        <div className="admin-match-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ padding: '1.5rem' }}>
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <span className="section-icon"><IoPeople /></span>
              <span className="section-title">Players & Schedule</span>
              <div className="section-divider"></div>
            </div>

            <div className="form-group">
              <label className="form-label"><IoPeople style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Number of Players</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {getValidPlayerCounts().map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-sm ${playerCount === c ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPlayerCount(c)}
                    style={{ minWidth: '3rem', justifyContent: 'center' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><IoFootball style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Player Names</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {players.map((p, i) => (
                  <input
                    key={i}
                    type="text"
                    className="form-input"
                    placeholder={`Player ${i + 1}`}
                    value={p}
                    onChange={(e) => {
                      const newPlayers = [...players];
                      newPlayers[i] = e.target.value;
                      setPlayers(newPlayers);
                    }}
                    style={{
                      fontFamily: 'Rajdhani, sans-serif', fontWeight: '700',
                      textTransform: 'uppercase', fontSize: '0.9rem'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label"><IoTime style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Start Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label"><IoTime style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Slot (mins)</label>
                <input
                  type="number"
                  className="form-input"
                  min="5"
                  max="30"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>

            <button onClick={handleNext} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Next <IoChevronForward />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Generate */}
      {step === 3 && (
        <div className="admin-match-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ padding: '1.5rem' }}>
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <span className="section-icon"><IoShuffle /></span>
              <span className="section-title">Review & Generate</span>
              <div className="section-divider"></div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <div className="card-label">Tournament</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{name}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="card-label">Date</div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                    {new Date(date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="card-label">Format</div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: '700', fontSize: '0.75rem', color: 'var(--accent-secondary)', marginTop: '0.25rem' }}>
                    {format === 'group+knockout' ? 'GRP+KO' : 'KO'}
                  </div>
                </div>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="card-label">Matches</div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: '700', fontSize: '1rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                    {calculateMatches()}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <div className="card-label" style={{ marginBottom: '0.5rem' }}>Players ({playerCount})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {players.map((p, i) => (
                    <span key={i} className="badge badge-group-a" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontWeight: '500', fontSize: '0.9rem' }}>
                  <IoShuffle style={{ color: 'var(--accent-warning)' }} />
                  Players will be randomly shuffled into {format === 'group+knockout' ? 'groups' : 'bracket positions'}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="btn btn-primary"
              disabled={creating || generating}
              style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.85rem' }}
            >
              <IoShuffle /> {generating ? 'Generating Fixtures...' : creating ? 'Creating...' : 'Shuffle & Generate Tournament'}
            </button>
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
