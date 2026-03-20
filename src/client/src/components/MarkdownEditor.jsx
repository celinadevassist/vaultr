import React, { useMemo } from 'react';
import { marked } from 'marked';

const styles = {
  wrapper: {
    display: 'flex',
    gap: '1rem',
    minHeight: '300px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    background: 'var(--bg-primary)'
  },
  editor: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    background: 'rgba(99, 102, 241, 0.05)',
    borderBottom: '1px solid var(--border-color)'
  },
  textarea: {
    flex: 1,
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '0.9rem',
    lineHeight: 1.6,
    padding: '0.85rem',
    resize: 'none',
    outline: 'none',
    minHeight: '250px'
  },
  divider: {
    width: '1px',
    background: 'var(--border-color)'
  },
  preview: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  previewContent: {
    flex: 1,
    padding: '0.85rem',
    overflow: 'auto',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: 'var(--text-secondary)'
  }
};

const previewCss = `
  .md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4 { color: var(--text-primary); margin: 1rem 0 0.5rem; }
  .md-preview h1 { font-size: 1.5rem; }
  .md-preview h2 { font-size: 1.25rem; }
  .md-preview h3 { font-size: 1.1rem; }
  .md-preview p { margin: 0.5rem 0; }
  .md-preview ul, .md-preview ol { padding-left: 1.5rem; margin: 0.5rem 0; }
  .md-preview code { background: rgba(99,102,241,0.1); padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.85em; }
  .md-preview pre { background: var(--bg-secondary); padding: 0.85rem; border-radius: var(--radius-sm); overflow-x: auto; margin: 0.75rem 0; }
  .md-preview pre code { background: none; padding: 0; }
  .md-preview blockquote { border-left: 3px solid var(--accent-primary); padding-left: 0.85rem; margin: 0.75rem 0; color: var(--text-muted); }
  .md-preview a { color: var(--accent-secondary); }
  .md-preview table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
  .md-preview th, .md-preview td { border: 1px solid var(--border-color); padding: 0.4rem 0.6rem; text-align: left; }
  .md-preview th { background: rgba(99,102,241,0.05); }
  .md-preview hr { border: none; border-top: 1px solid var(--border-color); margin: 1rem 0; }
`;

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const html = useMemo(() => {
    try {
      return marked(value || '', { breaks: true, gfm: true });
    } catch {
      return '';
    }
  }, [value]);

  return (
    <div style={styles.wrapper}>
      <style>{previewCss}</style>
      <div style={styles.editor}>
        <div style={styles.label}>Markdown</div>
        <textarea
          style={styles.textarea}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write markdown here...'}
          spellCheck={false}
        />
      </div>
      <div style={styles.divider} />
      <div style={styles.preview}>
        <div style={styles.label}>Preview</div>
        <div
          style={styles.previewContent}
          className="md-preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
