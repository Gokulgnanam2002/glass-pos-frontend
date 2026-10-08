import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Car, 
  Edit2, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  DollarSign
} from 'lucide-react';
import { productsAPI, vehiclesAPI } from '../services/api';
import { GLASS_POSITIONS } from '../services/mockData';

export function ProductsDashboard({ onAddToQuote }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    partNumber: '',
    brandId: '',
    modelId: '',
    variantId: '',
    glassPosition: 'front_windshield',
    unitPrice: '',
    costPrice: '',
    openingStock: 5,
    minThreshold: 3,
    tintColor: 'Green Solar Tint',
    oemSupplier: 'Pilkington',
    features: ['Acoustic Interlayer', 'ADAS Bracket']
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productsAPI.getProducts({
        search: searchQuery,
        glassPosition: positionFilter
      });
      setProducts(res || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery, positionFilter]);

  useEffect(() => {
    const loadHierarchies = async () => {
      try {
        const [cats, brs] = await Promise.all([
          vehiclesAPI.getCategories(),
          vehiclesAPI.getBrands()
        ]);
        setCategories(cats || []);
        setBrands(brs || []);
      } catch (e) {
        console.error('Error loading vehicle options', e);
      }
    };
    loadHierarchies();
  }, []);

  const handleBrandChange = async (brandId) => {
    setFormData(prev => ({ ...prev, brandId, modelId: '', variantId: '' }));
    if (brandId) {
      const res = await vehiclesAPI.getModels(brandId);
      setModels(res || []);
    } else {
      setModels([]);
      setVariants([]);
    }
  };

  const handleModelChange = async (modelId) => {
    setFormData(prev => ({ ...prev, modelId, variantId: '' }));
    if (modelId) {
      const res = await vehiclesAPI.getVariants(modelId);
      setVariants(res || []);
    } else {
      setVariants([]);
    }
  };

  const handleAdjustStock = async (id, delta) => {
    try {
      await productsAPI.adjustStock(id, delta);
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          const newCount = Math.max(0, p.stockCount + delta);
          return { ...p, stockCount: newCount };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error adjusting stock', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this glass product from inventory?')) return;
    try {
      await productsAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const updated = await productsAPI.updateProduct(editingProduct.id, {
          ...formData,
          unitPrice: Number(formData.unitPrice),
          costPrice: Number(formData.costPrice),
          stockCount: Number(formData.openingStock)
        });
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
        setEditingProduct(null);
      } else {
        const created = await productsAPI.createProduct(formData);
        setProducts(prev => [created, ...prev]);
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      partNumber: '',
      brandId: '',
      modelId: '',
      variantId: '',
      glassPosition: 'front_windshield',
      unitPrice: '',
      costPrice: '',
      openingStock: 5,
      minThreshold: 3,
      tintColor: 'Green Solar Tint',
      oemSupplier: 'Pilkington',
      features: ['Acoustic Interlayer', 'ADAS Bracket']
    });
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      partNumber: p.partNumber,
      brandId: p.brandId || '',
      modelId: p.modelId || '',
      variantId: p.variantId || '',
      glassPosition: p.glassPosition || 'front_windshield',
      unitPrice: p.unitPrice,
      costPrice: p.costPrice || '',
      openingStock: p.stockCount,
      minThreshold: p.minThreshold || 3,
      tintColor: p.tintColor || 'Green Solar Tint',
      oemSupplier: p.oemSupplier || 'OEM Direct',
      features: p.features || []
    });
    if (p.brandId) vehiclesAPI.getModels(p.brandId).then(setModels);
    if (p.modelId) vehiclesAPI.getVariants(p.modelId).then(setVariants);
    setIsAddModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (stockFilter === 'LOW_STOCK') return p.stockCount > 0 && p.stockCount <= (p.minThreshold || 3);
      if (stockFilter === 'OUT_OF_STOCK') return p.stockCount <= 0;
      if (stockFilter === 'IN_STOCK') return p.stockCount > (p.minThreshold || 3);
      return true;
    });
  }, [products, stockFilter]);

  const kpis = useMemo(() => {
    const totalSKUs = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
    const lowStock = products.filter(p => p.stockCount > 0 && p.stockCount <= (p.minThreshold || 3)).length;
    const totalValuation = products.reduce((acc, p) => acc + ((p.stockCount || 0) * (p.unitPrice || 0)), 0);
    return { totalSKUs, totalUnits, lowStock, totalValuation };
  }, [products]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: '1.75rem', margin: 0 }}>
            Products &amp; Inventory Management
          </h1>
          <p className="greeting-subtitle">
            Real-time stock counts, vehicle variant compatibility linkages, and automated reorder alerts.
          </p>
        </div>

        <button 
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="btn-saas btn-dark"
        >
          <Plus size={16} />
          <span>Add Glass Product</span>
        </button>
      </div>

      {/* Metrics Row (Finexy Grid) */}
      <div className="metrics-row">
        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">Total Inventory Valuation</span>
            <div className="metric-icon-bubble">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-value-huge">
            ${kpis.totalValuation.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="metric-trend-pill metric-trend-up">
            <span>&uarr; Active Stock Value</span>
          </div>
        </div>

        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">Total Glass SKUs</span>
            <div className="metric-icon-bubble">
              <Package size={18} />
            </div>
          </div>
          <div className="metric-value-huge">{kpis.totalSKUs}</div>
          <div className="metric-trend-pill">
            <span>Catalog Items</span>
          </div>
        </div>

        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">Physical Units in Stock</span>
            <div className="metric-icon-bubble">
              <Layers size={18} />
            </div>
          </div>
          <div className="metric-value-huge">{kpis.totalUnits}</div>
          <div className="metric-trend-pill metric-trend-up">
            <span>Available for Sale</span>
          </div>
        </div>

        <div className="saas-card metric-card-white">
          <div className="metric-top">
            <span className="metric-label">Low Stock Alerts (&le; 3)</span>
            <div className="metric-icon-bubble" style={{ color: '#d97706', background: 'var(--amber-pill-bg)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value-huge" style={{ color: kpis.lowStock > 0 ? '#d97706' : 'var(--text-title)' }}>
            {kpis.lowStock}
          </div>
          <div className="metric-trend-pill" style={{ color: '#d97706' }}>
            <span>Need replenishment</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="saas-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
          <div className="saas-search-input" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search glass name, SKU, part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <select
            className="saas-select"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Glass Positions</option>
            {GLASS_POSITIONS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="nav-pill-group" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          {[
            { id: 'ALL', label: 'All Stock' },
            { id: 'IN_STOCK', label: 'In Stock' },
            { id: 'LOW_STOCK', label: 'Low Stock' },
            { id: 'OUT_OF_STOCK', label: 'Out of Stock' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStockFilter(tab.id)}
              className={`nav-pill ${stockFilter === tab.id ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table (Finexy Style) */}
      <div className="saas-table-card">
        <table className="saas-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}><input type="checkbox" /></th>
              <th>SKU / Part #</th>
              <th>Glass Product Name</th>
              <th>Vehicle Compatibility</th>
              <th>Position</th>
              <th>Price</th>
              <th>Inventory Count</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const posMeta = GLASS_POSITIONS.find(g => g.id === p.glassPosition);
              return (
                <tr key={p.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-title)', fontSize: '0.8rem' }}>
                      {p.sku}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {p.partNumber}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-title)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {p.oemSupplier || 'OEM Direct'}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                      <Car size={13} color="#2563eb" />
                      <span>{p.brandName} {p.modelName}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '19px' }}>
                      {p.variantName}
                    </div>
                  </td>

                  <td>
                    <span className="status-pill status-pill-blue" style={{ fontSize: '0.7rem' }}>
                      {posMeta ? posMeta.short : p.glassPosition}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-title)' }}>
                      ${Number(p.unitPrice).toFixed(2)}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleAdjustStock(p.id, -1)}
                        disabled={p.stockCount <= 0}
                        style={{ background: 'none', border: 'none', cursor: p.stockCount <= 0 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)' }}
                      >
                        <MinusCircle size={16} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', color: 'var(--text-title)' }}>
                        {p.stockCount}
                      </span>
                      <button
                        onClick={() => handleAdjustStock(p.id, 1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </td>

                  <td>
                    {p.stockCount <= 0 ? (
                      <span className="status-pill status-pill-rose">
                        <span className="status-dot" /> Out of Stock
                      </span>
                    ) : p.stockCount <= (p.minThreshold || 3) ? (
                      <span className="status-pill status-pill-amber">
                        <span className="status-dot" /> Low Stock
                      </span>
                    ) : (
                      <span className="status-pill status-pill-green">
                        <span className="status-dot" /> Available
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => onAddToQuote && onAddToQuote(p)}
                        className="btn-saas btn-lime"
                        disabled={p.stockCount <= 0}
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="Add to Quote"
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn-saas btn-outline-white"
                        style={{ padding: '4px 8px' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="btn-saas btn-outline-white"
                        style={{ padding: '4px 8px', color: '#f43f5e' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setIsAddModalOpen(false)}>
          <div className="saas-card" style={{ maxWidth: '640px', width: '100%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editingProduct ? 'Edit Glass Product' : 'Add New Automotive Glass to Inventory'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>SKU *</label>
                  <input
                    type="text"
                    className="saas-input"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>OEM Part # *</label>
                  <input
                    type="text"
                    className="saas-input"
                    required
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Glass Name *</label>
                <input
                  type="text"
                  className="saas-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Brand</label>
                  <select className="saas-select" value={formData.brandId} onChange={(e) => handleBrandChange(e.target.value)}>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Model</label>
                  <select className="saas-select" value={formData.modelId} onChange={(e) => handleModelChange(e.target.value)}>
                    <option value="">Select Model</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Variant</label>
                  <select className="saas-select" value={formData.variantId} onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}>
                    <option value="">Select Variant</option>
                    {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Position</label>
                  <select className="saas-select" value={formData.glassPosition} onChange={(e) => setFormData({ ...formData, glassPosition: e.target.value })}>
                    {GLASS_POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Selling Price ($)</label>
                  <input type="number" step="0.01" className="saas-input" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Opening Stock</label>
                  <input type="number" className="saas-input" value={formData.openingStock} onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-saas btn-outline-white">Cancel</button>
                <button type="submit" className="btn-saas btn-dark">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
