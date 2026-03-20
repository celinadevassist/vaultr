import React from 'react';

export default function CategoryBadge({ category }) {
  if (!category) return null;

  const color = category.primaryColor || '#6366f1';
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.2rem 0.65rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    background: `${color}20`,
    color: color,
    border: `1px solid ${color}30`,
    whiteSpace: 'nowrap'
  };

  return (
    <span style={style}>
      {category.icon && <span style={{ fontSize: '0.7rem' }}>{category.icon}</span>}
      {category.name}
    </span>
  );
}
