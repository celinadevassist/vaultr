import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap'
  },
  select: {
    width: 'auto',
    minWidth: '180px',
    padding: '0.4rem 2rem 0.4rem 0.7rem',
    fontSize: '0.85rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)'
  },
  autoSaveWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginLeft: 'auto',
    cursor: 'pointer'
  },
  autoSaveLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  }
};

export default function ProfileSelector({ presentationId, iframeRef }) {
  const api = useApi();
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [autoSave, setAutoSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newName, setNewName] = useState('');

  const loadProfiles = useCallback(async () => {
    if (!presentationId) return;
    try {
      const data = await api.get(`/api/user-data/${presentationId}`);
      const list = Array.isArray(data) ? data : data.profiles || [];
      setProfiles(list);
      const def = list.find((p) => p.isDefault);
      if (def) setSelectedId(def._id);
    } catch {
      setProfiles([]);
    }
  }, [presentationId, api]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const sendToIframe = (data) => {
    if (iframeRef?.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'PROFILE_LOAD',
        data
      }, '*');
    }
  };

  const getStateFromIframe = () => {
    return new Promise((resolve) => {
      const handler = (e) => {
        if (e.data?.type === 'PROFILE_STATE') {
          window.removeEventListener('message', handler);
          resolve(e.data.data);
        }
      };
      window.addEventListener('message', handler);
      if (iframeRef?.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'PROFILE_GET_STATE' }, '*');
      }
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(null);
      }, 2000);
    });
  };

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const profile = profiles.find((p) => p._id === id);
    if (profile) {
      sendToIframe(profile.data);
    }
  };

  const handleSave = async () => {
    if (showNameInput) {
      if (!newName.trim()) return;
      setSaving(true);
      try {
        const stateData = await getStateFromIframe();
        await api.post(`/api/user-data/${presentationId}`, {
          profileName: newName.trim(),
          data: stateData || {}
        });
        setNewName('');
        setShowNameInput(false);
        await loadProfiles();
      } catch {
        // fail silently
      }
      setSaving(false);
    } else {
      if (selectedId) {
        setSaving(true);
        try {
          const stateData = await getStateFromIframe();
          await api.put(`/api/user-data/${selectedId}`, {
            data: stateData || {}
          });
          await loadProfiles();
        } catch {
          // fail silently
        }
        setSaving(false);
      } else {
        setShowNameInput(true);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('Delete this profile?')) return;
    try {
      await api.del(`/api/user-data/${selectedId}`);
      setSelectedId('');
      await loadProfiles();
    } catch {
      // fail silently
    }
  };

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>Profile</span>
      <select
        style={styles.select}
        value={selectedId}
        onChange={handleSelect}
      >
        <option value="">-- Select Profile --</option>
        {profiles.map((p) => (
          <option key={p._id} value={p._id}>{p.profileName}</option>
        ))}
      </select>

      {showNameInput && (
        <input
          style={{ width: '160px', padding: '0.4rem 0.7rem', fontSize: '0.85rem' }}
          placeholder="Profile name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
      )}

      <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : showNameInput ? 'Create' : selectedId ? 'Update' : 'Save New'}
      </button>

      {showNameInput && (
        <button className="btn btn-secondary btn-sm" onClick={() => setShowNameInput(false)}>
          Cancel
        </button>
      )}

      {selectedId && !showNameInput && (
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      )}

      <div style={styles.autoSaveWrap} onClick={() => setAutoSave(!autoSave)}>
        <div className={`toggle ${autoSave ? 'active' : ''}`} style={{ width: '32px', height: '18px' }}>
          <style>{`.toggle::after { width: 12px !important; height: 12px !important; }`}</style>
        </div>
        <span style={styles.autoSaveLabel}>Auto-save</span>
      </div>

      {profiles.length === 0 && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No profiles saved
        </span>
      )}
    </div>
  );
}
