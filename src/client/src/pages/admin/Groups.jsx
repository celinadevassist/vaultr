import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';

const initialForm = { name: '', slug: '', description: '' };

export default function Groups() {
  const api = useApi();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await api.get('/api/groups');
      setGroups(Array.isArray(data) ? data : data.groups || []);
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

  const openEdit = (g) => {
    setEditId(g._id);
    setForm({
      name: g.name || '',
      slug: g.slug || '',
      description: g.description || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/api/groups/${editId}`, form);
      } else {
        await api.post('/api/groups', form);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await api.del(`/api/groups/${id}`);
      await loadData();
    } catch {
      // ignore
    }
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page animate-fade-in">
      <div className="page-header">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Groups</h1>
        <button className="btn btn-primary" onClick={openCreate}>Create Group</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No groups yet</td></tr>
            ) : (
              groups.map((g) => (
                <tr key={g._id}>
                  <td style={{ fontWeight: 500 }}>{g.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{g.slug || '--'}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description || '--'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(g)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g._id)}>Delete</button>
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
              <h3>{editId ? 'Edit Group' : 'Create Group'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Group name" />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="url-friendly-slug" />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Group description" rows={3} />
            </div>

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
