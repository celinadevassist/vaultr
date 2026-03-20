import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PresentationCard from '../components/PresentationCard';

const s = {
  hero: {
    position: 'relative',
    padding: '5rem 0 4rem',
    textAlign: 'center',
    overflow: 'hidden'
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(129, 140, 248, 0.08) 0%, transparent 50%)',
    zIndex: 0
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 1.5rem'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.25rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    color: 'var(--text-primary)',
    marginBottom: '1.25rem',
    letterSpacing: '-0.02em'
  },
  heroSub: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
    lineHeight: 1.6
  },
  heroCtas: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 2rem',
    background: 'var(--accent-gradient)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    fontWeight: 600,
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
    transition: 'all 200ms ease',
    border: 'none',
    cursor: 'pointer'
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 2rem',
    background: 'transparent',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    fontWeight: 500,
    textDecoration: 'none',
    border: '1px solid var(--border-color)',
    transition: 'all 200ms ease',
    cursor: 'pointer'
  },
  section: {
    padding: '3.5rem 0'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  },
  sectionSub: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    maxWidth: '500px',
    margin: '0 auto'
  },
  catCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    textAlign: 'center',
    transition: 'all 200ms ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  catIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    display: 'block'
  },
  catName: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.4rem'
  },
  catDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
    lineHeight: 1.5
  },
  catCount: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 500
  },
  catAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px'
  },
  howCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    transition: 'all 200ms ease'
  },
  howIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    margin: '0 auto 1rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)'
  },
  howStep: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.5rem'
  },
  howTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  },
  howDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5
  },
  featuredScroll: {
    display: 'flex',
    gap: '1.25rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    scrollSnapType: 'x mandatory'
  },
  featuredItem: {
    minWidth: '280px',
    maxWidth: '320px',
    scrollSnapAlign: 'start',
    flex: '0 0 auto'
  },
  filterBar: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchWrap: {
    flex: 1,
    minWidth: '200px',
    position: 'relative'
  },
  filterSelect: {
    width: 'auto',
    minWidth: '160px',
    padding: '0.6rem 2.2rem 0.6rem 0.85rem'
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    padding: '2rem 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '2rem'
  },
  pageBtn: {
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  },
  pageBtnActive: {
    background: 'var(--accent-primary)',
    borderColor: 'var(--accent-primary)',
    color: 'white'
  }
};

const defaultIcons = {
  marketing: '\u{1F4E3}',
  business: '\u{1F4BC}',
  sales: '\u{1F4B0}',
  pricing: '\u{1F3F7}\uFE0F',
  'time-management': '\u{23F0}',
  default: '\u{1F4CA}'
};

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function AnimatedSection({ children, className }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 600ms ease' }}
      className={className}
    >
      {children}
    </div>
  );
}

const PAGE_SIZE = 12;

export default function Landing() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [featured, setFeatured] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [catCounts, setCatCounts] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, catsRes, featuredRes] = await Promise.all([
          fetch('/api/settings').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
          fetch('/api/presentations/featured').then((r) => r.json())
        ]);
        setSettings(settingsRes);
        const catList = Array.isArray(catsRes) ? catsRes : catsRes.categories || [];
        setCategories(catList);
        const map = {};
        catList.forEach((c) => { map[c._id] = c; });
        setCategoriesMap(map);
        setFeatured(Array.isArray(featuredRes) ? featuredRes : featuredRes.presentations || []);
      } catch {
        // use defaults
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadPublic = async () => {
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() });
        if (search) params.set('search', search);
        if (catFilter) params.set('category', catFilter);
        const res = await fetch(`/api/presentations/public?${params}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPresentations(data);
          setTotalPages(1);
        } else {
          setPresentations(data.presentations || []);
          setTotalPages(Math.ceil((data.total || data.presentations?.length || 0) / PAGE_SIZE) || 1);
        }
      } catch {
        setPresentations([]);
      }
    };
    loadPublic();
  }, [search, catFilter, page]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const res = await fetch('/api/presentations/public?limit=1000');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.presentations || [];
        const counts = {};
        list.forEach((p) => {
          const cid = p.category;
          counts[cid] = (counts[cid] || 0) + 1;
        });
        setCatCounts(counts);
      } catch {
        // ignore
      }
    };
    loadCounts();
  }, []);

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const heroTitle = settings?.heroTitle || 'Master Business Topics Through Interactive Presentations';
  const heroSub = settings?.heroSubtitle || 'Curated, interactive presentations for marketing, sales, business, and more';
  const ctaPrimary = settings?.ctaPrimary || 'Browse Presentations';
  const ctaSecondary = settings?.ctaSecondary || 'Sign In';
  const footerText = settings?.footerText || 'Presentation Hub 2026';

  return (
    <div>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent} className="animate-fade-in">
          <h1 style={s.heroTitle}>{heroTitle}</h1>
          <p style={s.heroSub}>{heroSub}</p>
          <div style={s.heroCtas}>
            <a
              href="#presentations"
              style={s.ctaPrimary}
              onMouseEnter={(e) => { e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.5)'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.35)'; e.target.style.transform = 'translateY(0)'; }}
            >
              {ctaPrimary}
            </a>
            <Link
              to="/login"
              style={s.ctaSecondary}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--border-glow)'; e.target.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
            >
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Categories */}
        {categories.length > 0 && (
          <AnimatedSection>
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Explore Categories</h2>
                <p style={s.sectionSub}>Browse presentations by topic area</p>
              </div>
              <div className="grid-3 stagger-children">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    style={s.catCard}
                    onClick={() => { setCatFilter(cat._id); document.getElementById('presentations')?.scrollIntoView({ behavior: 'smooth' }); }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = (cat.primaryColor || '#6366f1') + '60'; e.currentTarget.style.boxShadow = `0 0 20px ${cat.primaryColor || '#6366f1'}20`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ ...s.catAccent, background: `linear-gradient(90deg, ${cat.primaryColor || '#6366f1'}, ${cat.accentColor || '#818cf8'})` }} />
                    <span style={s.catIcon}>{cat.icon || defaultIcons[cat.slug] || defaultIcons.default}</span>
                    <div style={s.catName}>{cat.name}</div>
                    <div style={s.catDesc}>{cat.description || ''}</div>
                    <div style={s.catCount}>{catCounts[cat._id] || 0} presentations</div>
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <AnimatedSection>
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Featured</h2>
                <p style={s.sectionSub}>Hand-picked interactive experiences</p>
              </div>
              <div style={s.featuredScroll}>
                {featured.map((p) => (
                  <div key={p._id} style={s.featuredItem}>
                    <PresentationCard presentation={p} category={categoriesMap[p.category]} />
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        {/* How it works */}
        <AnimatedSection>
          <section style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>How It Works</h2>
              <p style={s.sectionSub}>Get started in three simple steps</p>
            </div>
            <div className="grid-3 stagger-children">
              {[
                { icon: '\u{1F50D}', step: 'Step 1', title: 'Browse', desc: 'Explore presentations across multiple business categories and topics.' },
                { icon: '\u{1F3AF}', step: 'Step 2', title: 'Select', desc: 'Choose an interactive presentation that matches your learning goals.' },
                { icon: '\u{1F680}', step: 'Step 3', title: 'Learn', desc: 'Interact with dynamic data, save your profiles, and gain insights.' }
              ].map((item) => (
                <div
                  key={item.step}
                  style={s.howCard}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={s.howIcon}>{item.icon}</div>
                  <div style={s.howStep}>{item.step}</div>
                  <div style={s.howTitle}>{item.title}</div>
                  <div style={s.howDesc}>{item.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Public Presentations */}
        <AnimatedSection>
          <section style={s.section} id="presentations">
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>All Presentations</h2>
              <p style={s.sectionSub}>Search and filter our complete library</p>
            </div>
            <div style={s.filterBar}>
              <div style={s.searchWrap} className="search-input">
                <input
                  type="text"
                  placeholder="Search presentations..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <select
                style={s.filterSelect}
                value={catFilter}
                onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {presentations.length > 0 ? (
              <>
                <div className="grid-3 stagger-children">
                  {presentations.map((p) => (
                    <PresentationCard key={p._id} presentation={p} category={categoriesMap[p.category]} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div style={s.pagination}>
                    {page > 1 && (
                      <button style={s.pageBtn} onClick={() => setPage(page - 1)}>Prev</button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        style={{ ...s.pageBtn, ...(p === page ? s.pageBtnActive : {}) }}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    {page < totalPages && (
                      <button style={s.pageBtn} onClick={() => setPage(page + 1)}>Next</button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'\u{1F4AD}'}</p>
                <p>No presentations found</p>
              </div>
            )}
          </section>
        </AnimatedSection>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <div className="container">{footerText}</div>
      </footer>
    </div>
  );
}
