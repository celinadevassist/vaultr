import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import PresentationCard from '../components/PresentationCard';

const styles = {
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.25rem'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem'
  },
  filterBar: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchWrap: {
    flex: 1,
    minWidth: '200px',
    position: 'relative'
  },
  pills: {
    display: 'flex',
    gap: '0.4rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
    flexWrap: 'nowrap'
  },
  pill: {
    padding: '0.4rem 0.9rem',
    borderRadius: '9999px',
    border: '1px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 200ms ease'
  },
  pillActive: {
    background: 'var(--accent-primary)',
    borderColor: 'var(--accent-primary)',
    color: 'white'
  }
};

export default function Dashboard() {
  const api = useApi();
  const [presentations, setPresentations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const data = await api.get('/api/categories');
        const list = Array.isArray(data) ? data : data.categories || [];
        setCategories(list);
        const map = {};
        list.forEach((c) => { map[c._id] = c; });
        setCategoriesMap(map);
      } catch {
        // ignore
      }
    };
    loadCats();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (catFilter) params.set('category', catFilter);
        const data = await api.get(`/api/presentations?${params}`);
        const list = Array.isArray(data) ? data : data.presentations || [];
        setPresentations(list);
      } catch {
        setPresentations([]);
      }
      setLoading(false);
    };
    load();
  }, [search, catFilter]);

  return (
    <div className="container page animate-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Your accessible presentations</p>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchWrap} className="search-input">
          <input
            type="text"
            placeholder="Search presentations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div style={styles.pills}>
          <button
            style={{ ...styles.pill, ...(!catFilter ? styles.pillActive : {}) }}
            onClick={() => setCatFilter('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              style={{ ...styles.pill, ...(catFilter === cat._id ? styles.pillActive : {}) }}
              onClick={() => setCatFilter(catFilter === cat._id ? '' : cat._id)}
            >
              {cat.icon || ''} {cat.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : presentations.length > 0 ? (
          <div className="grid-3 stagger-children">
            {presentations.map((p) => (
              <PresentationCard key={p._id} presentation={p} category={categoriesMap[p.category]} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'\u{1F4AD}'}</p>
            <p>No presentations available</p>
          </div>
        )}
      </div>
    </div>
  );
}
