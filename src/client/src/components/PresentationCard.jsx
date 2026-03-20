import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';

const cardStyles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    display: 'flex',
    flexDirection: 'column'
  },
  thumbnail: {
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    position: 'relative',
    overflow: 'hidden'
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3))'
  },
  body: {
    padding: '1rem 1.15rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  description: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem'
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    marginTop: '0.25rem'
  }
};

const gradients = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #6366f1)',
  'linear-gradient(135deg, #f97316, #ef4444)'
];

function getGradient(category) {
  if (category?.primaryColor && category?.accentColor) {
    return `linear-gradient(135deg, ${category.primaryColor}, ${category.accentColor})`;
  }
  const hash = (category?.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export default function PresentationCard({ presentation, category }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/p/${presentation.slug}`);
  };

  const typeColor = presentation.type === 'dynamic'
    ? { background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }
    : { background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-muted)' };

  return (
    <div
      style={cardStyles.card}
      className="glow-hover"
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-glow)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ ...cardStyles.thumbnail, background: getGradient(category) }}>
        <div style={cardStyles.overlay} />
        <span style={{ position: 'relative', zIndex: 1, opacity: 0.8 }}>
          {category?.icon || '\u{1F4CA}'}
        </span>
      </div>
      <div style={cardStyles.body}>
        <div style={cardStyles.title}>{presentation.title}</div>
        <div style={cardStyles.description}>{presentation.description}</div>
        <div style={cardStyles.meta}>
          {category && <CategoryBadge category={category} />}
          <span style={{ ...cardStyles.typeBadge, ...typeColor }}>
            {presentation.type || 'static'}
          </span>
        </div>
        {presentation.tags && presentation.tags.length > 0 && (
          <div style={cardStyles.tags}>
            {presentation.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
