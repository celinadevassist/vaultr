import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 64px)',
    padding: '2rem 1rem'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glow)',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem 2rem',
    boxShadow: 'var(--shadow-glow)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'var(--accent-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 200ms ease',
    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
    marginTop: '0.5rem'
  }
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} className="animate-scale-in">
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading}
            onMouseEnter={(e) => { if (!loading) { e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.5)'; e.target.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { e.target.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.3)'; e.target.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
