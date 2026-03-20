import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter' }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(148,163,184,0.06)' }
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(148,163,184,0.06)' }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 12 },
        padding: 16
      }
    }
  }
};

const categoryColors = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'
];

export default function Analytics() {
  const api = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/analytics');
        setData(res);
      } catch (err) {
        setError(err.message);
        setData({
          totalPresentations: 0,
          totalUsers: 0,
          totalProfiles: 0,
          activeUsers30d: 0,
          popularPresentations: [],
          categoryDistribution: [],
          recentActivity: []
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const stats = [
    { label: 'Total Presentations', value: data?.totalPresentations ?? 0, color: '#6366f1' },
    { label: 'Total Users', value: data?.totalUsers ?? 0, color: '#06b6d4' },
    { label: 'Profiles Saved', value: data?.totalProfiles ?? 0, color: '#10b981' },
    { label: 'Active Users (30d)', value: data?.activeUsers30d ?? 0, color: '#f59e0b' }
  ];

  const popularPres = data?.popularPresentations || [];
  const catDist = data?.categoryDistribution || [];
  const recentActivity = data?.recentActivity || [];

  const barData = {
    labels: popularPres.slice(0, 10).map((p) => p.title || p.name || 'Unknown'),
    datasets: [{
      label: 'Profiles Saved',
      data: popularPres.slice(0, 10).map((p) => p.count || 0),
      backgroundColor: popularPres.slice(0, 10).map((_, i) => `${categoryColors[i % categoryColors.length]}CC`),
      borderColor: popularPres.slice(0, 10).map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const doughnutData = {
    labels: catDist.map((c) => c.name || 'Unknown'),
    datasets: [{
      data: catDist.map((c) => c.count || 0),
      backgroundColor: catDist.map((_, i) => `${categoryColors[i % categoryColors.length]}CC`),
      borderColor: catDist.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 2
    }]
  };

  const formatDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="container page animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Analytics</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stat Cards */}
      <div className="grid-4 stagger-children" style={{ marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Popular Presentations */}
        <div style={{ flex: 2, minWidth: '300px' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Popular Presentations</h3>
            {popularPres.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Bar data={barData} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Category Distribution</h3>
            {catDist.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentActivity.slice(0, 20).map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0',
                  borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: item.type === 'login' ? 'rgba(6, 182, 212, 0.15)' :
                    item.type === 'profile_save' ? 'rgba(16, 185, 129, 0.15)' :
                    'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  {item.type === 'login' ? '\u{1F464}' : item.type === 'profile_save' ? '\u{1F4BE}' : '\u{1F4CC}'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {item.description || item.action || 'Activity'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.user || item.username || ''} {item.date ? `- ${formatDate(item.date)}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '1.5rem' }}>
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
