import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Package, 
  AlertTriangle, 
  Car, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Wallet, 
  Plus, 
  Send, 
  MoreHorizontal,
  Layers,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function OverviewDashboard({ onNavigateToTab, onAddToQuote, products = [] }) {
  const { user } = useAuth();

  const totalSKUs = products.length || 8;
  const totalUnits = products.reduce((acc, p) => acc + (p.stockCount || 0), 0) || 48;
  const lowStockCount = products.filter(p => p.stockCount > 0 && p.stockCount <= (p.minThreshold || 3)).length || 3;
  const totalValuation = products.reduce((acc, p) => acc + ((p.stockCount || 0) * (p.unitPrice || 0)), 0) || 689372;

  // Recent simulated POS activities
  const recentActivities = [
    {
      id: 'INV_000076',
      productName: 'Acoustic Solar Windshield w/ ADAS Camera',
      vehicle: 'Toyota Camry (2021-2025)',
      price: '$420.00',
      status: 'Completed',
      statusType: 'green',
      date: '17 Apr, 2026 03:45 PM'
    },
    {
      id: 'INV_000075',
      productName: 'Climate Comfort Windshield w/ HUD & KAFAS',
      vehicle: 'BMW 3 Series (G20)',
      price: '$690.00',
      status: 'In Progress',
      statusType: 'blue',
      date: '16 Apr, 2026 11:30 AM'
    },
    {
      id: 'INV_000074',
      productName: 'Heated Rear Backlite Defroster Grid',
      vehicle: 'Toyota Camry (2018-2024)',
      price: '$280.00',
      status: 'Pending',
      statusType: 'amber',
      date: '15 Apr, 2026 04:20 PM'
    },
    {
      id: 'INV_000073',
      productName: 'Acoustic Windshield w/ Honda Sensing',
      vehicle: 'Honda Civic (2022-2025)',
      price: '$385.00',
      status: 'Completed',
      statusType: 'green',
      date: '14 Apr, 2026 09:15 AM'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Greeting Section (Finexy Style) */}
      <div className="saas-greeting-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="greeting-title">
            Good morning, {user?.name ? user.name.split(' ')[0] : 'Admin'}
          </h1>
          <p className="greeting-subtitle">
            Stay on top of vehicle glass inventory, monitor stock alerts, and track counter sales.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onNavigateToTab('finder')}
            className="btn-saas btn-lime"
          >
            <Shield size={16} />
            <span>Compatibility Finder</span>
          </button>
          <button 
            onClick={() => onNavigateToTab('pos')}
            className="btn-saas btn-dark"
          >
            <Plus size={16} />
            <span>New POS Quote</span>
          </button>
        </div>
      </div>

      {/* Main SaaS Metrics Row (Finexy Grid) */}
      <div className="metrics-row">
        {/* Card 1: Total Valuation / Balance Card */}
        <div className="saas-card metric-card-white">
          <div>
            <div className="metric-top">
              <span className="metric-label">Total Inventory Valuation</span>
              <span className="status-pill status-pill-blue" style={{ fontSize: '0.7rem' }}>
                USD
              </span>
            </div>
            <div className="metric-value-huge">
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="metric-trend-pill metric-trend-up">
              <TrendingUp size={14} />
              <span>&uarr; 5.4% than last month</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={() => onNavigateToTab('inventory')}
              className="btn-saas btn-lime"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
            >
              <Package size={15} /> Manage Stock
            </button>
            <button 
              onClick={() => onNavigateToTab('finder')}
              className="btn-saas btn-outline-white"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
            >
              Find Glass
            </button>
          </div>
        </div>

        {/* Card 2: Vibrant Emerald Card (Like Finexy Total Earnings) */}
        <div className="card-emerald-gradient">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>
              Total Month Revenue
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={18} color="#ffffff" />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              $24,950
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', opacity: 0.95, marginTop: '6px' }}>
              <TrendingUp size={14} />
              <span>&uarr; 12% this month</span>
            </div>
          </div>

          <div style={{ marginTop: '24px', fontSize: '0.75rem', opacity: 0.85 }}>
            Counter POS &bull; 64 Installations Completed
          </div>
        </div>

        {/* Card 3: Total Stock Units */}
        <div className="saas-card metric-card-white">
          <div>
            <div className="metric-top">
              <span className="metric-label">Glass Units in Stock</span>
              <div className="metric-icon-bubble">
                <Layers size={18} />
              </div>
            </div>
            <div className="metric-value-huge">
              {totalUnits} Units
            </div>
            <div className="metric-trend-pill metric-trend-up">
              <span>{totalSKUs} Distinct OEM SKUs</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Stock Threshold Limit</span>
              <span style={{ fontWeight: 600, color: 'var(--text-title)' }}>84% Capacity</span>
            </div>
            <div style={{
              height: '6px',
              borderRadius: '4px',
              background: 'var(--bg-surface-subtle)',
              overflow: 'hidden',
              marginTop: '6px'
            }}>
              <div style={{ width: '84%', height: '100%', background: '#10b981', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Card 4: Critical Low Stock Alerts */}
        <div className="saas-card metric-card-white">
          <div>
            <div className="metric-top">
              <span className="metric-label">Low Stock Alerts</span>
              <div className="metric-icon-bubble" style={{ color: '#d97706', background: 'var(--amber-pill-bg)' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="metric-value-huge" style={{ color: lowStockCount > 0 ? '#d97706' : 'var(--text-title)' }}>
              {lowStockCount} SKUs
            </div>
            <div className="metric-trend-pill" style={{ color: '#d97706' }}>
              <span>Requires replenishment</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('inventory')}
            className="btn-saas btn-outline-white"
            style={{ width: '100%', marginTop: '16px', fontSize: '0.8rem', padding: '8px' }}
          >
            Review Low Stock
          </button>
        </div>
      </div>

      {/* Split Cards: Chart + Category Breakdown */}
      <div className="grid-cards-split">
        {/* Left: Finexy-Style Total Income / Installations Bar Chart */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Weekly Glass Installations</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Counter retail vs insurance replacement volume
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#a3e635' }} />
                <span>Windshields</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#18181b' }} />
                <span>Side/Rear Glass</span>
              </div>
            </div>
          </div>

          {/* Pure CSS SVG Stacked Bar Chart */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px', padding: '10px 10px 0' }}>
            {[
              { month: 'Mon', h1: 65, h2: 30 },
              { month: 'Tue', h1: 85, h2: 40 },
              { month: 'Wed', h1: 45, h2: 25 },
              { month: 'Thu', h1: 95, h2: 50 },
              { month: 'Fri', h1: 110, h2: 60 },
              { month: 'Sat', h1: 125, h2: 70 },
              { month: 'Sun', h1: 40, h2: 15 }
            ].map((col, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '28px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                  {/* Top bar (Lime) */}
                  <div style={{
                    width: '100%',
                    height: `${col.h1}px`,
                    background: '#a3e635',
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'all 0.25s ease'
                  }} />
                  {/* Bottom bar (Dark Charcoal) */}
                  <div style={{
                    width: '100%',
                    height: `${col.h2}px`,
                    background: '#18181b',
                    borderRadius: '2px 2px 6px 6px',
                    transition: 'all 0.25s ease'
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {col.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Compatibility Finder Widget */}
        <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Shield size={18} color="#2563eb" />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Fast Compatibility Lookup</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Quickly find windshields by manufacturer &amp; ADAS specs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Toyota Camry (2021-2025)', glass: 'Acoustic HUD Windshield', count: '8 in stock' },
                { name: 'Tesla Model 3 (2021-2025)', glass: 'Electro-Tint UV Panoramic', count: '3 in stock' },
                { name: 'BMW 3 Series (G20)', glass: 'Climate Comfort w/ KAFAS', count: '4 in stock' }
              ].map((item, i) => (
                <div 
                  key={i}
                  onClick={() => onNavigateToTab('finder')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-title)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {item.glass}
                    </div>
                  </div>
                  <span className="status-pill status-pill-green" style={{ fontSize: '0.68rem' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onNavigateToTab('finder')}
            className="btn-saas btn-outline-white"
            style={{ width: '100%', marginTop: '16px', fontSize: '0.825rem' }}
          >
            Launch Full 4-Tier Finder &rarr;
          </button>
        </div>
      </div>

      {/* Recent Activities Table (Like Finexy Table) */}
      <div className="saas-table-card">
        <div className="table-card-header">
          <h3 className="table-card-title">Recent Glass POS Activities</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="saas-search-input">
              <input type="text" placeholder="Search order ID or part..." />
            </div>
            <button className="btn-saas btn-outline-white" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              Filter
            </button>
          </div>
        </div>

        <table className="saas-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>Order ID</th>
              <th>Automotive Glass Part</th>
              <th>Vehicle Model</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date &amp; Time</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((act) => (
              <tr key={act.id}>
                <td><input type="checkbox" /></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-title)' }}>
                  {act.id}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb'
                    }}>
                      <Shield size={16} />
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-title)' }}>
                      {act.productName}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {act.vehicle}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--text-title)' }}>
                  {act.price}
                </td>
                <td>
                  <span className={`status-pill status-pill-${act.statusType}`}>
                    <span className="status-dot" />
                    <span>{act.status}</span>
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {act.date}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
