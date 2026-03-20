import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navStyles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-color)',
    height: '64px'
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%'
  },
  logo: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  logoIcon: {
    width: '28px',
    height: '28px',
    background: 'var(--accent-gradient)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  link: {
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 200ms ease'
  },
  linkActive: {
    color: 'var(--text-primary)',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  userName: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  dropdown: {
    position: 'relative'
  },
  dropdownBtn: {
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 200ms ease'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '0.35rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-glow)',
    borderRadius: 'var(--radius)',
    padding: '0.4rem',
    minWidth: '200px',
    boxShadow: 'var(--shadow-glow-strong)',
    animation: 'slideDown 200ms ease',
    zIndex: 200
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '0.55rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    textDecoration: 'none',
    transition: 'all 150ms ease',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  mobileMenu: {
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--bg-primary)',
    padding: '1.5rem',
    zIndex: 99,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    overflowY: 'auto',
    animation: 'fadeIn 200ms ease'
  },
  mobileLink: {
    display: 'block',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    fontWeight: 500,
    textDecoration: 'none'
  },
  mobileDivider: {
    height: '1px',
    background: 'var(--border-color)',
    margin: '0.5rem 0'
  },
  glowBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
    opacity: 0.5
  }
};

const adminLinks = [
  { to: '/admin/presentations', label: 'Presentations' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/groups', label: 'Groups' },
  { to: '/admin/prds', label: 'PRDs' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/analytics', label: 'Analytics' }
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAdminOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const linkStyle = (path) => ({
    ...navStyles.link,
    ...(isActive(path) ? navStyles.linkActive : {})
  });

  return (
    <nav style={navStyles.nav}>
      <div style={navStyles.inner}>
        <Link to="/" style={navStyles.logo}>
          <span style={navStyles.logoIcon}>P</span>
          Presentation Hub
        </Link>

        {/* Desktop links */}
        <div style={navStyles.links} className="nav-desktop">
          <Link to="/" style={linkStyle('/__home__')}>Home</Link>
          <Link to="/dashboard" style={linkStyle('/dashboard')}>
            {isAuthenticated ? 'Dashboard' : 'Browse'}
          </Link>

          {isAuthenticated && (
            <Link to="/account" style={linkStyle('/account')}>Account</Link>
          )}

          {isAdmin && (
            <div style={navStyles.dropdown} ref={dropdownRef}>
              <button
                style={{
                  ...navStyles.dropdownBtn,
                  ...(location.pathname.startsWith('/admin') ? { color: 'var(--text-primary)', background: 'rgba(99, 102, 241, 0.1)' } : {})
                }}
                onClick={() => setAdminOpen(!adminOpen)}
              >
                Admin
                <span style={{ fontSize: '0.7rem', transform: adminOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>&#9662;</span>
              </button>
              {adminOpen && (
                <div style={navStyles.dropdownMenu}>
                  {adminLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      style={{
                        ...navStyles.dropdownItem,
                        ...(isActive(to) ? { color: 'var(--accent-secondary)', background: 'rgba(99, 102, 241, 0.1)' } : {})
                      }}
                      onMouseEnter={(e) => { e.target.style.background = 'rgba(99, 102, 241, 0.08)'; e.target.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => {
                        if (!isActive(to)) { e.target.style.background = 'none'; e.target.style.color = 'var(--text-secondary)'; }
                        else { e.target.style.background = 'rgba(99, 102, 241, 0.1)'; e.target.style.color = 'var(--accent-secondary)'; }
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={navStyles.right} className="nav-desktop">
          {isAuthenticated ? (
            <>
              <span style={navStyles.userName}>{user?.displayName || user?.username}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}
        </div>

        {/* Hamburger */}
        <button
          style={navStyles.hamburger}
          className="nav-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? '\u2715' : '\u2630'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={navStyles.mobileMenu}>
          <Link to="/" style={navStyles.mobileLink}>Home</Link>
          <Link to="/dashboard" style={navStyles.mobileLink}>
            {isAuthenticated ? 'Dashboard' : 'Browse'}
          </Link>
          {isAuthenticated && (
            <Link to="/account" style={navStyles.mobileLink}>Account</Link>
          )}
          {isAdmin && (
            <>
              <div style={navStyles.mobileDivider} />
              <span style={{ ...navStyles.mobileLink, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</span>
              {adminLinks.map(({ to, label }) => (
                <Link key={to} to={to} style={{ ...navStyles.mobileLink, paddingLeft: '1.5rem' }}>{label}</Link>
              ))}
            </>
          )}
          <div style={navStyles.mobileDivider} />
          {isAuthenticated ? (
            <button
              style={{ ...navStyles.mobileLink, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--error)' }}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" style={{ ...navStyles.mobileLink, color: 'var(--accent-secondary)' }}>Sign In</Link>
          )}
        </div>
      )}

      <div style={navStyles.glowBar} />

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
