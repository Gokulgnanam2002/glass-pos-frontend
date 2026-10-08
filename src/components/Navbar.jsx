import React, { useState } from 'react';
import { 
  Menu, 
  RefreshCw, 
  LogOut, 
  ShieldCheck, 
  Search, 
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ 
  activeTab, 
  onToggleMobileMenu, 
  onNavigateToTab, 
  onSearch, 
  onOpenLogoutModal,
  initialSearchQuery = '' 
}) {
  const { user, backendStatus, checkHealth } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (activeTab === 'search_results') {
      onNavigateToTab('overview');
    }
  };

  return (
    <header className="saas-header-clean">
      {/* Left: Mobile Hamburger & Logo/Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="mobile-brand-display" onClick={() => onNavigateToTab('overview')}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <ShieldCheck size={16} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-title)' }}>
            AutoGlass <span style={{ color: '#10b981' }}>PRO</span>
          </span>
        </div>
      </div>

      {/* Center: Universal Search Bar */}
      <div className="topbar-search-container">
        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
          <div className="topbar-search-wrapper">
            <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search any vehicle (e.g. Camry, Tesla, Civic), SKU, or glass part..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="topbar-search-input"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={handleClear} 
                style={{ padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
            <button 
              type="submit" 
              className="topbar-search-btn"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Right Controls: Live Backend Status, Ping & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => onNavigateToTab('diagnostics')}
          title="Click to check backend status & ping /api/health"
          className={`status-pill ${backendStatus.isLive ? 'status-pill-green' : 'status-pill-amber'}`}
          style={{ cursor: 'pointer', border: 'none', padding: '6px 12px' }}
        >
          <span className="status-dot" />
          <span className="status-text-desktop">
            {backendStatus.isLive ? `Live :5000 (${backendStatus.latency || 24}ms)` : 'Seed Demo Mode'}
          </span>
          <span className="status-text-mobile">
            {backendStatus.isLive ? 'Live' : 'Demo'}
          </span>
        </button>

        <button
          className="icon-btn-round"
          onClick={() => checkHealth()}
          title="Refresh server status"
          style={{ width: '34px', height: '34px' }}
        >
          <RefreshCw size={14} className={backendStatus.checking ? 'animate-spin' : ''} />
        </button>

        {user && (
          <button
            onClick={onOpenLogoutModal}
            className="navbar-logout-btn"
            title="Sign out of AutoGlass Pro"
          >
            <LogOut size={15} />
            <span className="logout-text">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
