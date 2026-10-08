import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { GlassFinder } from './components/GlassFinder';
import { ProductsDashboard } from './components/ProductsDashboard';
import { VehicleMaster } from './components/VehicleMaster';
import { POSQuote } from './components/POSQuote';
import { UserManagement } from './components/UserManagement';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { LoginPage } from './pages/LoginPage';
import { LogoutModal } from './components/LogoutModal';
import { SearchResults } from './components/SearchResults';
import { productsAPI } from './services/api';
import { Check } from 'lucide-react';

function DashboardApp() {
  const { isAuthenticated, user, isLoading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteItems, setQuoteItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [products, setProducts] = useState([]);

  // Load products for overview dashboard metrics
  useEffect(() => {
    if (isAuthenticated) {
      productsAPI.getProducts().then(res => setProducts(res || [])).catch(() => {});
    }
  }, [activeTab, isAuthenticated]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAddToQuote = (product) => {
    setQuoteItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setToastMessage(`Added "${product.name.slice(0, 30)}..." to quote!`);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setQuoteItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (id) => {
    setQuoteItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearQuote = () => {
    setQuoteItems([]);
  };

  const handleQuickLoginFromDiagnostics = async (email, password) => {
    await login(email, password);
    setToastMessage(`Switched session to ${email}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // If initial auth check is loading, show clean loader
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-title)',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.9rem'
      }}>
        Initializing AutoGlass Pro...
      </div>
    );
  }

  // If not authenticated, show separate, dedicated Login Page
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <div className="saas-container">
      {/* Sidebar (Single Source of Navigation) */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        quoteCount={quoteItems.length}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* Main SaaS Canvas */}
      <div className="saas-main">
        {/* Top Clean Header with Universal Search */}
        <Navbar 
          activeTab={activeTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          onNavigateToTab={setActiveTab}
          onSearch={(query) => {
            setSearchQuery(query);
            setActiveTab('search_results');
          }}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
          initialSearchQuery={searchQuery}
        />

        <main className="saas-content">
          {activeTab === 'search_results' && (
            <SearchResults 
              query={searchQuery}
              onAddToQuote={handleAddToQuote}
              onNavigateToFinder={(brandId, modelId, variantId) => {
                setActiveTab('finder');
              }}
              onNavigateToInventory={() => setActiveTab('inventory')}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewDashboard 
              onNavigateToTab={setActiveTab}
              onAddToQuote={handleAddToQuote}
              products={products}
            />
          )}

          {activeTab === 'finder' && (
            <GlassFinder 
              onAddToQuote={handleAddToQuote} 
            />
          )}

          {activeTab === 'inventory' && (
            <ProductsDashboard 
              onAddToQuote={handleAddToQuote} 
            />
          )}

          {activeTab === 'vehicle_master' && (
            <VehicleMaster />
          )}

          {activeTab === 'pos' && (
            <POSQuote 
              quoteItems={quoteItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearQuote={handleClearQuote}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {activeTab === 'diagnostics' && (
            <SystemDiagnostics 
              onQuickLogin={handleQuickLoginFromDiagnostics}
            />
          )}
        </main>
      </div>

      {/* Modern SaaS Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-pill)',
          padding: '12px 20px',
          color: 'var(--text-title)',
          boxShadow: 'var(--popover-shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem',
          fontWeight: 600,
          zIndex: 9999,
          animation: 'slideUp 0.2s ease-out'
        }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'var(--emerald-pill-bg)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Check size={14} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setActiveTab('pos')}
            style={{
              marginLeft: '6px',
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            Open Ticket ({quoteItems.length}) &rarr;
          </button>
        </div>
      )}

      {/* Custom SweetAlert Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}
