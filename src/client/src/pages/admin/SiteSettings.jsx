import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';

export default function SiteSettings() {
  const api = useApi();
  const [form, setForm] = useState({
    siteName: '',
    heroTitle: '',
    heroSubtitle: '',
    ctaPrimary: '',
    ctaSecondary: '',
    logoUrl: '',
    footerText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/api/settings');
        setForm({
          siteName: data.siteName || '',
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          ctaPrimary: data.ctaPrimary || '',
          ctaSecondary: data.ctaSecondary || '',
          logoUrl: data.logoUrl || '',
          footerText: data.footerText || ''
        });
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.put('/api/settings', form);
      setMessage('Settings saved successfully');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Site Settings</h1>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '320px' }}>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Site Name</label>
              <input value={form.siteName} onChange={(e) => updateField('siteName', e.target.value)} placeholder="Presentation Hub" />
            </div>

            <div className="form-group">
              <label>Hero Title</label>
              <textarea value={form.heroTitle} onChange={(e) => updateField('heroTitle', e.target.value)} placeholder="Main headline" rows={2} />
            </div>

            <div className="form-group">
              <label>Hero Subtitle</label>
              <textarea value={form.heroSubtitle} onChange={(e) => updateField('heroSubtitle', e.target.value)} placeholder="Supporting text" rows={2} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Primary CTA Text</label>
                <input value={form.ctaPrimary} onChange={(e) => updateField('ctaPrimary', e.target.value)} placeholder="Browse Presentations" />
              </div>
              <div className="form-group">
                <label>Secondary CTA Text</label>
                <input value={form.ctaSecondary} onChange={(e) => updateField('ctaSecondary', e.target.value)} placeholder="Sign In" />
              </div>
            </div>

            <div className="form-group">
              <label>Logo URL</label>
              <input value={form.logoUrl} onChange={(e) => updateField('logoUrl', e.target.value)} placeholder="https://example.com/logo.png" />
            </div>

            <div className="form-group">
              <label>Footer Text</label>
              <input value={form.footerText} onChange={(e) => updateField('footerText', e.target.value)} placeholder="Presentation Hub 2026" />
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Hero Preview */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Hero Preview</h4>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                lineHeight: 1.3
              }}>
                {form.heroTitle || 'Hero Title'}
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
                lineHeight: 1.5
              }}>
                {form.heroSubtitle || 'Hero subtitle text'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '0.4rem 1rem',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}>
                  {form.ctaPrimary || 'Primary CTA'}
                </span>
                <span style={{
                  padding: '0.4rem 1rem',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}>
                  {form.ctaSecondary || 'Secondary CTA'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {form.footerText || 'Footer Text'}
          </div>
        </div>
      </div>
    </div>
  );
}
