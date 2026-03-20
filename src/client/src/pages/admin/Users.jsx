import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';

const initialForm = {
  username: '', email: '', displayName: '', password: '', role: 'viewer', groups: []
};

export default function Users() {
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const groupsMap = {};
  groups.forEach((g) => { groupsMap[g._id] = g; });

  const loadData = useCallback(async () => {
    try {
      const [userData, grpData] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/groups')
      ]);
      setUsers(Array.isArray(userData) ? userData : userData.users || []);
      setGroups(Array.isArray(grpData) ? grpData : grpData.groups || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [api]);

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditId(u._id);
    setForm({
      username: u.username || '',
      email: u.email || '',
      displayName: u.displayName || '',
      password: '',
      role: u.role || 'viewer',
      groups: u.groups || []
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.username.trim()) { setError('Username is required'); return; }
    if (!editId && !form.password.trim()) { setError('Password is required for new users'); return; }
    setSaving(true);
    setError('');
    const payload = { ...form };
    if (editId && !payload.password) delete payload.password;
    try {
      if (editId) {
        await api.put(`/api/users/${editId}`, payload);
      } else {
        await api.post('/api/users', payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.del(`/api/users/${id}`);
      await loadData();
    } catch {
      // ignore
    }
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleGroup = (gid) => {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.includes(gid) ? prev.groups.filter((g) => g !== gid) : [...prev.groups, gid]
    }));
  };

  const formatDate = (d) => {
    if (!d) return '--';
    try { return new Date(d).toLocaleDateString(); } catch { return '--'; }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page animate-fade-in">
      <div className="page-header">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Users</h1>
        <button className="btn btn-primary" onClick={openCreate}>Create User</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Display Name</th>
              <th>Role</th>
              <th>Groups</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.username}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email || '--'}</td>
                  <td>{u.displayName || '--'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-muted'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div className="tag-list">
                      {(u.groups || []).map((gid) => (
                        <span key={gid} className="tag">{groupsMap[gid]?.name || gid}</span>
                      ))}
                      {(!u.groups || u.groups.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>--</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(u.lastLogin)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit User' : 'Create User'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input value={form.username} onChange={(e) => updateField('username', e.target.value)} placeholder="username" disabled={!!editId} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="user@email.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Name</label>
                <input value={form.displayName} onChange={(e) => updateField('displayName', e.target.value)} placeholder="Display name" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => updateField('role', e.target.value)}>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>{editId ? 'New Password (leave blank to keep current)' : 'Password'}</label>
              <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder={editId ? 'Leave blank to keep current' : 'Enter password'} autoComplete="new-password" />
            </div>

            {groups.length > 0 && (
              <div className="form-group">
                <label>Groups</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
                  {groups.map((g) => (
                    <label key={g._id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={form.groups.includes(g._id)} onChange={() => toggleGroup(g._id)} style={{ width: 'auto' }} />
                      {g.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
