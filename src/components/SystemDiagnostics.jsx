import React, { useState } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  RefreshCw, 
  Key, 
  Code2,
  Check,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SystemDiagnostics() {
  const { backendStatus, checkHealth } = useAuth();
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [rawHealth, setRawHealth] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const runDetailedHealth = async () => {
    setTestingEndpoint(true);
    try {
      const res = await fetch('http://localhost:5000/api/health');
      const data = await res.json();
      setRawHealth(data);
    } catch (e) {
      setRawHealth({ error: e.message });
    } finally {
      await checkHealth();
      setTestingEndpoint(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const endpoints = [
    { method: 'GET', path: '/api/health', desc: 'PostgreSQL connection and server heartbeat' },
    { method: 'POST', path: '/api/auth/login', desc: 'JWT user authentication' },
    { method: 'GET', path: '/api/auth/me', desc: 'Current profile from Bearer token' },
    { method: 'POST', path: '/api/auth/register', desc: 'Admin staff account registration' },
    { method: 'GET', path: '/api/vehicles/categories', desc: 'Vehicle Category Master' },
    { method: 'GET', path: '/api/vehicles/brands', desc: 'Vehicle Brand Master' },
    { method: 'GET', path: '/api/vehicles/models', desc: 'Vehicle Model Master' },
    { method: 'GET', path: '/api/vehicles/variants', desc: 'Vehicle Trim & Variant Master' },
    { method: 'GET', path: '/api/products?search=', desc: 'Deep Compatibility & Stock Search Engine' },
    { method: 'POST', path: '/api/products', desc: 'Create Glass Product & Log Opening Stock' },
    { method: 'GET', path: '/api/users', desc: 'Staff directory & role assignment' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: '1.75rem', margin: 0 }}>
            System Diagnostics &amp; API Monitor
          </h1>
          <p className="greeting-subtitle">
            Backend connectivity verification, PostgreSQL health inspection, and test credentials.
          </p>
        </div>

        <button onClick={runDetailedHealth} className="btn-saas btn-lime">
          <RefreshCw size={15} className={testingEndpoint ? 'animate-spin' : ''} />
          <span>Ping /api/health</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">Backend API Status</span>
            <div className="metric-icon-bubble">
              <Server size={18} />
            </div>
          </div>
          <div className="metric-value-huge" style={{ fontSize: '1.4rem' }}>
            {backendStatus.isLive ? 'Online & Ready' : 'Standby / Offline'}
          </div>
          <div className="metric-trend-pill">
            <span>http://localhost:5000/api</span>
          </div>
        </div>

        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">PostgreSQL Database</span>
            <div className="metric-icon-bubble">
              <Database size={18} />
            </div>
          </div>
          <div className="metric-value-huge" style={{ fontSize: '1.4rem' }}>
            {backendStatus.isLive ? 'PostgreSQL Live' : 'Seed Cache Mode'}
          </div>
          <div className="metric-trend-pill metric-trend-up">
            <span>Prisma Schema Ready</span>
          </div>
        </div>

        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">Ping Latency</span>
            <div className="metric-icon-bubble">
              <Activity size={18} />
            </div>
          </div>
          <div className="metric-value-huge" style={{ fontSize: '1.4rem' }}>
            {backendStatus.latency ? `${backendStatus.latency} ms` : 'Local Instant'}
          </div>
          <div className="metric-trend-pill">
            <span>Round-Trip Response</span>
          </div>
        </div>

        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">Auto Poller</span>
            <span className="status-pill status-pill-green">Every 15s</span>
          </div>
          <div className="metric-value-huge" style={{ fontSize: '1.4rem' }}>Active</div>
          <div className="metric-trend-pill">
            <span>Heartbeat Monitor</span>
          </div>
        </div>
      </div>

      {rawHealth && (
        <div className="saas-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
            <Code2 size={16} color="#2563eb" />
            <span>Latest /api/health Response:</span>
          </div>
          <pre style={{
            background: 'var(--bg-surface-subtle)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            overflowX: 'auto',
            margin: 0
          }}>
            {JSON.stringify(rawHealth, null, 2)}
          </pre>
        </div>
      )}

      {/* Test Credentials Reference Card (No direct login buttons) */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} color="#d97706" /> Database Seed Test Credentials
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
          Use these credentials on the sign-in screen to authenticate:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="status-pill status-pill-blue">ADMINISTRATOR</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Full Access</span>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Email:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--text-title)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  admin@glasspos.com
                </strong>
                <button 
                  onClick={() => copyToClipboard('admin@glasspos.com', 'admin_email')}
                  className="btn-saas btn-outline-white"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  {copiedKey === 'admin_email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedKey === 'admin_email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Password:</div>
              <strong style={{ color: 'var(--text-title)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                password123
              </strong>
            </div>
          </div>

          <div style={{
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="status-pill status-pill-green">STAFF MEMBER</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>POS &amp; Inventory</span>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Email:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--text-title)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  staff1@glasspos.com
                </strong>
                <button 
                  onClick={() => copyToClipboard('staff1@glasspos.com', 'staff_email')}
                  className="btn-saas btn-outline-white"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  {copiedKey === 'staff_email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedKey === 'staff_email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Password:</div>
              <strong style={{ color: 'var(--text-title)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                password123 (also staff2 - staff9)
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints Matrix */}
      <div className="saas-table-card">
        <div className="table-card-header">
          <h3 className="table-card-title">Backend API Endpoints Matrix</h3>
        </div>
        <table className="saas-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Endpoint Path</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep, idx) => (
              <tr key={idx}>
                <td>
                  <span className={`status-pill ${ep.method === 'GET' ? 'status-pill-blue' : ep.method === 'POST' ? 'status-pill-green' : 'status-pill-amber'}`}>
                    {ep.method}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-title)' }}>{ep.path}</td>
                <td style={{ color: 'var(--text-muted)' }}>{ep.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
