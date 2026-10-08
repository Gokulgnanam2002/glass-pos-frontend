import React from 'react';
import { 
  LayoutGrid, 
  Search, 
  Package, 
  Car, 
  ShoppingCart, 
  Users, 
  Activity, 
  Sun, 
  Moon, 
  LogOut,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ 
  activeTab, 
  onSelectTab, 
  theme, 
  onToggleTheme, 
  isOpen, 
  onClose,
  quoteCount = 0,
  onOpenLogoutModal
}) {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', sublabel: 'Dashboard & Metrics', icon: LayoutGrid },
    { id: 'finder', label: 'Compatibility Finder', sublabel: '4-Tier Glass Search', icon: Search },
    { id: 'inventory', label: 'Products & Stock', sublabel: 'Inventory & Alerts', icon: Package },
    { id: 'vehicle_master', label: 'Vehicle Hierarchy', sublabel: 'Cat / Brand / Model / Var', icon: Car },
    { id: 'pos', label: 'POS Counter Ticket', sublabel: 'Quotes & Checkout', icon: ShoppingCart, count: quoteCount },
    { id: 'users', label: 'Staff & Roles', sublabel: isAdmin ? 'Admin Controlled' : 'Team Directory', icon: Users, badge: isAdmin ? 'ADMIN' : null },
    { id: 'diagnostics', label: 'System Health', sublabel: 'API & PostgreSQL', icon: Activity }
  ];

  const handleNavClick = (tabId) => {
    onSelectTab(tabId);
    if (onClose) onClose(); // Auto-close drawer on mobile
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
        />
      )}

      <aside className={`saas-sidebar-expanded ${isOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header: Logo & Mobile Close */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => handleNavClick('overview')}>
            <div className="sidebar-logo-icon">
              <ShieldCheck size={22} color="#ffffff" strokeWidth={2.4} />
            </div>
            <div>
              <div className="sidebar-brand-name">
                AutoGlass <span style={{ color: '#10b981' }}>PRO</span>
              </div>
              <div className="sidebar-brand-sub">POS &amp; Inventory Engine</div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            className="sidebar-mobile-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-nav-container">
          <div className="sidebar-section-title">Navigation Menu</div>
          <nav className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-item-icon">
                    <Icon size={19} />
                  </div>

                  <div className="nav-item-text">
                    <div className="nav-item-title">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="nav-item-badge">{item.badge}</span>
                      )}
                      {item.count > 0 && (
                        <span className="nav-item-count">{item.count}</span>
                      )}
                    </div>
                    <div className="nav-item-sub">{item.sublabel}</div>
                  </div>

                  {isActive && <ChevronRight size={15} className="nav-item-chevron" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Theme Toggle & Logout Modal Trigger */}
        <div className="sidebar-footer">
          {/* Day / Night Theme Pill */}
          <div className="sidebar-theme-toggle" onClick={onToggleTheme}>
            <div className="theme-toggle-label">
              {theme === 'light' ? (
                <>
                  <Sun size={15} color="#d97706" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={15} color="#38bdf8" />
                  <span>Dark Mode</span>
                </>
              )}
            </div>
            <button className="theme-toggle-btn" aria-label="Toggle theme">
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </button>
          </div>

          {/* User Profile Card with SweetAlert Modal Trigger */}
          {user && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-info">
                <div className="sidebar-avatar">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
                </div>
                <div className="sidebar-user-details">
                  <div className="sidebar-username">{user.name || user.email}</div>
                  <div className="sidebar-userrole">
                    <span className={`status-pill ${isAdmin ? 'status-pill-blue' : 'status-pill-green'}`} style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                      {isAdmin ? 'ADMIN' : 'STAFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dedicated SweetAlert-style Logout Button */}
              <button 
                type="button"
                onClick={onOpenLogoutModal}
                className="sidebar-logout-btn"
                title="Sign out of AutoGlass Pro"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
