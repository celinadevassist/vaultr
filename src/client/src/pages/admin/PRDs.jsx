import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

const statusColors = {
  draft: 'badge-muted',
  'in-review': 'badge-warning',
  approved: 'badge-success',
  archived: 'badge-error'
};

const statusTabs = ['All', 'Draft', 'In Review', 'Approved', 'Archived'];
const statusValues = { 'All': '', 'Draft': 'draft', 'In Review': 'in-review', 'Approved': 'approved', 'Archived': 'archived' };

export default function PRDs() {
  const api = useApi();
  const navigate = useNavigate();
  const [prds, setPrds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      const status = statusValues[statusFilter];
      if (status) params.set('status', status);
      const data = await api.get(`/api/prds?${params}`);
      setPrds(Array.isArray(data) ? data : data.prds || []);
    } catch {
      setPrds([]);
    }
    setLoading(false);
  }, [api, statusFilter]);

  useEffect(() => { loadData(); }, [statusFilter]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this PRD?')) return;
    try {
      await api.del(`/api/prds/${id}`);
      await loadData();
    } catch {
      // ignore
    }
  };

  const formatDate = (d) => {
    if (!d) return '--';
    try { return new Date(d).toLocaleDateString(); } catch { return '--'; }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page animate-fade-in">
      <div className="page-header">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>PRDs</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/prds/new')}>Create New PRD</button>
      </div>

      <div className="tabs">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Version</th>
              <th>Status</th>
              <th>Category</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prds.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No PRDs found</td></tr>
            ) : (
              prds.map((prd) => (
                <tr
                  key={prd._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/prds/${prd._id}`)}
                >
                  <td style={{ fontWeight: 500 }}>{prd.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{prd.version || '1.0'}</td>
                  <td>
                    <span className={`badge ${statusColors[prd.status] || 'badge-muted'}`}>
                      {prd.status || 'draft'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{prd.category || '--'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(prd.updatedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/admin/prds/${prd._id}`); }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(e, prd._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
