import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const styles = {
  wrapper: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '2rem',
    marginBottom: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border-color)'
  }
};

export default function AccountSettings() {
  const api = useApi();
  const [user, setUser] = useState({ displayName: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [message, setMessage] = useState('');
  const [passMessage, setPassMessage] = useState('');
  const [error, setError] = useState('');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/api/users/me');
        setUser({ displayName: data.displayName || '', email: data.email || '' });
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await api.put('/api/users/me', {
        displayName: user.displayName,
        email: user.email
      });
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassMessage('');
    if (passwords.newPass !== passwords.confirm) {
      setPassError('New passwords do not match');
      return;
    }
    if (passwords.newPass.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }
    setSavingPass(true);
    try {
      await api.put('/api/users/me', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      });
      setPassMessage('Password changed successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPassError(err.message);
    }
    setSavingPass(false);
  };

  if (loading) {
    return (
      <div className="loading-center"><div className="spinner" /></div>
    );
  }

  return (
    <div className="container page animate-fade-in">
      <div style={styles.wrapper}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Account Settings</h1>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Profile Information</h3>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={user.displayName}
                onChange={(e) => setUser({ ...user, displayName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Change Password</h3>
          {passError && <div className="alert alert-error">{passError}</div>}
          {passMessage && <div className="alert alert-success">{passMessage}</div>}
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingPass}>
              {savingPass ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
