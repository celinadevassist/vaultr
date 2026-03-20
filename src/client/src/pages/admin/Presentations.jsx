import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import CategoryBadge from '../../components/CategoryBadge';

const initialForm = {
  title: '', slug: '', description: '', category: '', visibility: 'public',
  allowedGroups: [], type: 'static', tags: '', featured: false, entryFile: 'index.html'
};

export default function Presentations() {
  const api = useApi();
  const [presentations, setPresentations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadId, setUploadId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [presData, catData, grpData] = await Promise.all([
        api.get('/api/presentations'),
        api.get('/api/categories'),
        api.get('/api/groups')
      ]);
      const presList = Array.isArray(presData) ? presData : presData.presentations || [];
      const catList = Array.isArray(catData) ? catData : catData.categories || [];
      const grpList = Array.isArray(grpData) ? grpData : grpData.groups || [];
      setPresentations(presList);
      setCategories(catList);
      setGroups(grpList);
      const map = {};
      catList.forEach((c) => { map[c._id] = c; });
      setCategoriesMap(map);
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

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      description: p.description || '',
      category: p.category || '',
      visibility: p.visibility || 'public',
      allowedGroups: p.allowedGroups || [],
      type: p.type || 'static',
      tags: (p.tags || []).join(', '),
      featured: p.featured || false,
      entryFile: p.entryFile || 'index.html'
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    };
    try {
      if (editId) {
        await api.put(`/api/presentations/${editId}`, payload);
      } else {
        await api.post('/api/presentations', payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this presentation? This cannot be undone.')) return;
    try {
      await api.del(`/api/presentations/${id}`);
      await loadData();
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (files) => {
    if (!uploadId || !files.length) return;
    setUploading(true);
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    try {
      await api.post(`/api/presentations/${uploadId}/upload`, formData);
      setUploadId(null);
      await loadData();
    } catch {
      // ignore
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleGroup = (gid) => {
    setForm((prev) => ({
      ...prev,
      allowedGroups: prev.allowedGroups.includes(gid)
        ? prev.allowedGroups.filter((g) => g !== gid)
        : [...prev.allowedGroups, gid]
    }));
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page animate-fade-in">
      <div className="page-header">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Presentations</h1>
        <button className="btn btn-primary" onClick={openCreate}>Create Presentation</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Visibility</th>
              <th>Type</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {presentations.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No presentations yet</td></tr>
            ) : (
              presentations.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 500 }}>{p.title}</td>
                  <td>{categoriesMap[p.category] ? <CategoryBadge category={categoriesMap[p.category]} /> : <span style={{ color: 'var(--text-muted)' }}>--</span>}</td>
                  <td><span className={`badge ${p.visibility === 'public' ? 'badge-success' : p.visibility === 'private' ? 'badge-error' : 'badge-warning'}`}>{p.visibility}</span></td>
                  <td><span className={`badge ${p.type === 'dynamic' ? 'badge-accent' : 'badge-muted'}`}>{p.type}</span></td>
                  <td>{p.featured ? <span className="badge badge-accent">Yes</span> : <span style={{ color: 'var(--text-muted)' }}>No</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setUploadId(uploadId === p._id ? null : p._id)}>Files</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* File upload area */}
      {uploadId && (
        <div style={{ marginTop: '1.5rem' }} className="animate-slide-up">
          <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
            Upload files for: {presentations.find((p) => p._id === uploadId)?.title}
          </h4>
          <div
            className={`dropzone ${dragOver ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <div className="spinner" /> Uploading...
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{'\u{1F4C1}'}</p>
                <p>Drag and drop files here, or click to browse</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Supports HTML, CSS, JS, images, and more</p>
              </div>
            )}
          </div>
          <input
            id="file-upload-input"
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Presentation' : 'Create Presentation'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Presentation title" />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="url-friendly-slug" />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Brief description" rows={3} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                  <option value="">-- Select --</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => updateField('type', e.target.value)}>
                  <option value="static">Static</option>
                  <option value="dynamic">Dynamic</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Visibility</label>
                <select value={form.visibility} onChange={(e) => updateField('visibility', e.target.value)}>
                  <option value="public">Public</option>
                  <option value="authenticated">Authenticated</option>
                  <option value="group">Group</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="form-group">
                <label>Entry File</label>
                <input value={form.entryFile} onChange={(e) => updateField('entryFile', e.target.value)} placeholder="index.html" />
              </div>
            </div>

            {form.visibility === 'group' && groups.length > 0 && (
              <div className="form-group">
                <label>Allowed Groups</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {groups.map((g) => (
                    <label key={g._id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={form.allowedGroups.includes(g._id)} onChange={() => toggleGroup(g._id)} style={{ width: 'auto' }} />
                      {g.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="analytics, profit, marketing" />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} style={{ width: 'auto' }} />
                Featured presentation
              </label>
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
