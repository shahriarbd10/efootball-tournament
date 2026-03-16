'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoLockClosed, IoMail, IoKey, IoLogIn } from 'react-icons/io5';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.push('/admin/dashboard');
      return null;
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        router.push('/admin/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-icon"><IoLockClosed /></div>
        <h1 className="admin-login-title">Admin Access</h1>
        <p className="admin-login-subtitle">
          Enter your credentials to manage the tournament
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label"><IoMail style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@efootball.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label"><IoKey style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              color: 'var(--accent-danger)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: '600',
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            <IoLogIn /> {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
