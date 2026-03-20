import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import CategoryBadge from '../components/CategoryBadge';
import ProfileSelector from '../components/ProfileSelector';

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1.5rem',
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap'
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    whiteSpace: 'nowrap'
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  iframeWrap: {
    position: 'relative',
    flex: 1,
    background: 'var(--bg-primary)'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block'
  },
  fullPage: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px)',
    overflow: 'hidden'
  },
  embedPage: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden'
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    textAlign: 'center',
    color: 'var(--text-muted)'
  }
};

export default function PresentationView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const api = useApi();
  const iframeRef = useRef(null);
  const [presentation, setPresentation] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isEmbed = searchParams.get('embed') === 'true';

  useEffect(() => {
    const load = async () => {
      try {
        const fetchFn = isAuthenticated ? api.get : (url) => fetch(url).then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); });
        const data = await fetchFn(`/api/presentations/by-slug/${slug}`);
        setPresentation(data);
        if (data.category) {
          try {
            const cats = await fetch('/api/categories').then((r) => r.json());
            const list = Array.isArray(cats) ? cats : cats.categories || [];
            const cat = list.find((c) => c._id === data.category);
            setCategory(cat || null);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        setError(err.message || 'Presentation not found');
      }
      setLoading(false);
    };
    load();
  }, [slug, isAuthenticated]);

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div style={styles.error}>
        <div>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{'\u{1F50D}'}</p>
          <h3 style={{ marginBottom: '0.5rem' }}>Presentation Not Found</h3>
          <p style={{ marginBottom: '1.5rem' }}>{error || 'The requested presentation could not be loaded.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const iframeSrc = `/presentation-files/${presentation.slug}/${presentation.entryFile || 'index.html'}`;
  const isDynamic = presentation.type === 'dynamic';
  const showProfiles = isAuthenticated && isDynamic;

  if (isEmbed) {
    return (
      <div style={styles.embedPage}>
        <iframe ref={iframeRef} src={iframeSrc} style={styles.iframe} title={presentation.title} />
      </div>
    );
  }

  return (
    <div style={styles.fullPage}>
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => { e.target.style.borderColor = 'var(--border-glow)'; e.target.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
        >
          &#8592; Back
        </button>
        <span style={styles.title}>{presentation.title}</span>
        {category && <CategoryBadge category={category} />}
      </div>

      {showProfiles && (
        <ProfileSelector presentationId={presentation._id} iframeRef={iframeRef} />
      )}

      <div style={styles.iframeWrap}>
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          style={styles.iframe}
          title={presentation.title}
        />
      </div>
    </div>
  );
}
