import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';

const initialForm = {
  name: '', description: '', primaryColor: '#6366f1', accentColor: '#818cf8',
  icon: '', chartStyle: 'gradient', sortOrder: 0
};

export default function Categories() {
  const api = useApi();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await api.get('/api/categories');
      setCategories(Array.isArray(data) ? data : data.categories || []);
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

  const openEdit = (cat) => {
    setEditId(cat._id);
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      primaryColor: cat.primaryColor || '#6366f1',
      accentColor: cat.accentColor || '#818cf8',
      icon: cat.icon || '',
      chartStyle: cat.chartStyle || 'gradient',
      sortOrder: cat.sortOrder || 0
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
        await api.put(`/api/categories/${editId}`, form);
      } else {
        await api.post('/api/categories', form);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.del(`/api/categories/${id}`);
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}>Create Category</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Colors</th>
              <th>Icon</th>
              <th>Chart Style</th>
              <th>Sort Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No categories yet</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className="color-swatch" style={{ backgroundColor: cat.primaryColor }} />
                      <span className="color-swatch" style={{ backgroundColor: cat.accentColor }} />
                    </div>
                  </td>
                  <td>{cat.icon || '--'}</td>
                  <td><span className="badge badge-muted">{cat.chartStyle || 'gradient'}</span></td>
                  <td>{cat.sortOrder || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat._id)}>Delete</button>
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
              <h3>{editId ? 'Edit Category' : 'Create Category'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Category name" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Brief description" rows={2} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Primary Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    style={{ width: '40px', height: '36px', padding: '2px', cursor: 'pointer' }}
                  />
                  <input value={form.primaryColor} onChange={(e) => updateField('primaryColor', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Accent Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    style={{ width: '40px', height: '36px', padding: '2px', cursor: 'pointer' }}
                  />
                  <input value={form.accentColor} onChange={(e) => updateField('accentColor', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Icon (emoji or text)</label>
                <input value={form.icon} onChange={(e) => updateField('icon', e.target.value)} placeholder="e.g. megaphone or emoji" />
              </div>
              <div className="form-group">
                <label>Chart Style</label>
                <select value={form.chartStyle} onChange={(e) => updateField('chartStyle', e.target.value)}>
                  <option value="gradient">Gradient</option>
                  <option value="clean">Clean</option>
                  <option value="bold">Bold</option>
                  <option value="comparison">Comparison</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)} />
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
