import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import MarkdownEditor from '../../components/MarkdownEditor';
import { marked } from 'marked';

const DEFAULT_SECTIONS = [
  { heading: 'Overview', content: 'Provide a high-level overview of this product/feature.' },
  { heading: 'Problem Statement', content: 'Describe the problem this addresses.' },
  { heading: 'Goals', content: 'List the key goals and objectives.' },
  { heading: 'User Stories', content: 'As a [user], I want [feature] so that [benefit].' },
  { heading: 'Technical Requirements', content: 'Outline the technical requirements and constraints.' },
  { heading: 'Success Metrics', content: 'Define how success will be measured.' },
  { heading: 'Timeline', content: 'Outline the expected timeline and milestones.' }
];

const styles = {
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  },
  sectionWrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
    marginBottom: '1.25rem'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  sectionNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    color: 'var(--accent-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 600,
    flexShrink: 0
  },
  previewWrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '2rem',
    lineHeight: 1.7,
    color: 'var(--text-secondary)'
  },
  changelog: {
    marginTop: '2rem',
    padding: '1.25rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)'
  }
};

const previewCss = `
  .prd-preview h1 { font-size: 1.75rem; color: var(--text-primary); margin: 1.5rem 0 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
  .prd-preview h2 { font-size: 1.35rem; color: var(--text-primary); margin: 1.25rem 0 0.5rem; }
  .prd-preview h3 { font-size: 1.1rem; color: var(--text-primary); margin: 1rem 0 0.5rem; }
  .prd-preview p { margin: 0.5rem 0; }
  .prd-preview ul, .prd-preview ol { padding-left: 1.5rem; margin: 0.5rem 0; }
  .prd-preview code { background: rgba(99,102,241,0.1); padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.85em; }
  .prd-preview pre { background: var(--bg-primary); padding: 0.85rem; border-radius: var(--radius-sm); overflow-x: auto; }
  .prd-preview blockquote { border-left: 3px solid var(--accent-primary); padding-left: 0.85rem; margin: 0.75rem 0; color: var(--text-muted); }
`;

export default function PRDEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('1.0');
  const [status, setStatus] = useState('draft');
  const [category, setCategory] = useState('platform');
  const [sections, setSections] = useState(DEFAULT_SECTIONS.map((s) => ({ ...s })));
  const [changelog, setChangelog] = useState([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      const load = async () => {
        try {
          const data = await api.get(`/api/prds/${id}`);
          setTitle(data.title || '');
          setVersion(data.version || '1.0');
          setStatus(data.status || 'draft');
          setCategory(data.category || 'platform');
          setSections(data.sections || DEFAULT_SECTIONS.map((s) => ({ ...s })));
          setChangelog(data.changelog || []);
        } catch (err) {
          setError(err.message);
        }
        setLoading(false);
      };
      load();
    }
  }, [id, isNew]);

  const updateSection = (index, field, value) => {
    setSections((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addSection = () => {
    setSections((prev) => [...prev, { heading: 'New Section', content: '' }]);
  };

  const removeSection = (index) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSection = (index, dir) => {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    setSections((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      return arr;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    const payload = { title, version, status, category, sections };
    try {
      if (isNew) {
        const data = await api.post('/api/prds', payload);
        navigate(`/admin/prds/${data._id}`, { replace: true });
      } else {
        await api.put(`/api/prds/${id}`, payload);
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const renderPreviewHtml = () => {
    let md = `# ${title}\n\n`;
    md += `**Version:** ${version} | **Status:** ${status} | **Category:** ${category}\n\n---\n\n`;
    sections.forEach((s) => {
      md += `## ${s.heading}\n\n${s.content}\n\n`;
    });
    return marked(md, { breaks: true, gfm: true });
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="container page animate-fade-in">
      <style>{previewCss}</style>

      <div style={styles.topBar}>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/prds')}>
          &#8592; Back to PRDs
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, flex: 1 }}>
          {isNew ? 'New PRD' : 'Edit PRD'}
        </h1>
        <button
          className={`btn ${preview ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setPreview(!preview)}
        >
          {preview ? 'Edit Mode' : 'Preview'}
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {preview ? (
        <div style={styles.previewWrap} className="prd-preview" dangerouslySetInnerHTML={{ __html: renderPreviewHtml() }} />
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="PRD Title" />
            </div>
            <div className="form-group" style={{ flex: '0 0 100px' }}>
              <label>Version</label>
              <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0" />
            </div>
            <div className="form-group" style={{ flex: '0 0 150px' }}>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: '0 0 150px' }}>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="platform">Platform</option>
                <option value="feature">Feature</option>
                <option value="integration">Integration</option>
              </select>
            </div>
          </div>

          {sections.map((section, idx) => (
            <div key={idx} style={styles.sectionWrap}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionNum}>{idx + 1}</div>
                <input
                  value={section.heading}
                  onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                  style={{ flex: 1, fontWeight: 600, fontSize: '1rem' }}
                  placeholder="Section heading"
                />
                <button className="btn btn-secondary btn-sm" onClick={() => moveSection(idx, -1)} disabled={idx === 0} title="Move up">&#8593;</button>
                <button className="btn btn-secondary btn-sm" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} title="Move down">&#8595;</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeSection(idx)} disabled={sections.length <= 1} title="Remove section">&times;</button>
              </div>
              <MarkdownEditor
                value={section.content}
                onChange={(val) => updateSection(idx, 'content', val)}
                placeholder={`Content for "${section.heading}"...`}
              />
            </div>
          ))}

          <button className="btn btn-secondary" onClick={addSection} style={{ marginTop: '0.5rem' }}>
            + Add Section
          </button>

          {changelog.length > 0 && (
            <div style={styles.changelog}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Changelog</h4>
              {changelog.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: idx < changelog.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {entry.date ? new Date(entry.date).toLocaleDateString() : '--'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.summary}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
