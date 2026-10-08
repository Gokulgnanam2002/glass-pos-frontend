import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Car, 
  Layers, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  RotateCcw,
  Zap,
  Info,
  Tag,
  ArrowRight
} from 'lucide-react';
import { vehiclesAPI, productsAPI } from '../services/api';
import { GLASS_POSITIONS } from '../services/mockData';

export function GlassFinder({ onAddToQuote }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          vehiclesAPI.getCategories(),
          vehiclesAPI.getBrands()
        ]);
        setCategories(cats || []);
        setBrands(brs || []);
      } catch (err) {
        console.error('Failed to load initial vehicle data', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await vehiclesAPI.getBrands(selectedCategory);
        setBrands(res || []);
        if (selectedBrand && res && !res.some(b => b.id === selectedBrand)) {
          setSelectedBrand('');
          setSelectedModel('');
          setSelectedVariant('');
        }
      } catch (err) {
        console.error('Failed to load brands', err);
      }
    };
    fetchBrands();
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel('');
      setVariants([]);
      setSelectedVariant('');
      return;
    }
    const fetchModels = async () => {
      try {
        const res = await vehiclesAPI.getModels(selectedBrand);
        setModels(res || []);
        if (selectedModel && res && !res.some(m => m.id === selectedModel)) {
          setSelectedModel('');
          setSelectedVariant('');
        }
      } catch (err) {
        console.error('Failed to load models', err);
      }
    };
    fetchModels();
  }, [selectedBrand]);

  useEffect(() => {
    if (!selectedModel) {
      setVariants([]);
      setSelectedVariant('');
      return;
    }
    const fetchVariants = async () => {
      try {
        const res = await vehiclesAPI.getVariants(selectedModel);
        setVariants(res || []);
        if (selectedVariant && res && !res.some(v => v.id === selectedVariant)) {
          setSelectedVariant('');
        }
      } catch (err) {
        console.error('Failed to load variants', err);
      }
    };
    fetchVariants();
  }, [selectedModel]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productsAPI.getProducts({
        search: searchQuery,
        brandId: selectedBrand,
        modelId: selectedModel,
        variantId: selectedVariant,
        glassPosition: selectedPosition
      });
      setProducts(res || []);
    } catch (err) {
      console.error('Failed to fetch matched products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 200);
    return () => clearTimeout(timeout);
  }, [selectedBrand, selectedModel, selectedVariant, selectedPosition, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedVariant('');
    setSelectedPosition('');
    setSearchQuery('');
  };

  const getStockPill = (count, min) => {
    if (count <= 0) {
      return (
        <span className="status-pill status-pill-rose">
          <span className="status-dot" />
          <span>Out of Stock (0)</span>
        </span>
      );
    }
    if (count <= (min || 2)) {
      return (
        <span className="status-pill status-pill-amber">
          <span className="status-dot" />
          <span>Low Stock ({count} left)</span>
        </span>
      );
    }
    return (
      <span className="status-pill status-pill-green">
        <span className="status-dot" />
        <span>In Stock ({count})</span>
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: '1.75rem', margin: 0 }}>
            Glass Compatibility Finder
          </h1>
          <p className="greeting-subtitle">
            Filter by 4-level vehicle hierarchy &amp; glass position to discover 100% matched OEM &amp; aftermarket glass.
          </p>
        </div>

        <button onClick={resetFilters} className="btn-saas btn-outline-white" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      </div>

      {/* 4-Tier Cascading Selector Card (Finexy Style) */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-title)' }}>
          <Car size={18} color="#2563eb" />
          <span>Select Vehicle Hierarchy (4 Levels)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              1. Category
            </label>
            <select
              className="saas-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              2. Vehicle Brand
            </label>
            <select
              className="saas-select"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              3. Model
            </label>
            <select
              className="saas-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand && models.length === 0}
            >
              <option value="">{selectedBrand ? `All Models (${models.length})` : 'Select Brand First'}</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.yearStart}-{m.yearEnd || 'Present'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              4. Variant / Trim
            </label>
            <select
              className="saas-select"
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              disabled={!selectedModel && variants.length === 0}
            >
              <option value="">{selectedModel ? `All Variants (${variants.length})` : 'Select Model First'}</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(selectedBrand || selectedModel || selectedVariant) && (
          <div style={{
            marginTop: '16px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Active Filter:</span>
            {selectedBrand && <span className="status-pill status-pill-blue">{brands.find(b => b.id === selectedBrand)?.name}</span>}
            {selectedModel && (
              <>
                <ArrowRight size={12} color="var(--text-muted)" />
                <span className="status-pill status-pill-green">{models.find(m => m.id === selectedModel)?.name}</span>
              </>
            )}
            {selectedVariant && (
              <>
                <ArrowRight size={12} color="var(--text-muted)" />
                <span className="status-pill status-pill-amber">{variants.find(v => v.id === selectedVariant)?.name}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Glass Position Pill Bar */}
      <div className="saas-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-title)' }}>
            <Layers size={17} color="#10b981" />
            <span>5. Glass Position on Vehicle</span>
          </div>

          {selectedPosition && (
            <button onClick={() => setSelectedPosition('')} className="btn-saas btn-outline-white" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              Clear Position
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setSelectedPosition('')}
            className={`btn-saas ${!selectedPosition ? 'btn-dark' : 'btn-outline-white'}`}
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            All Positions
          </button>
          {GLASS_POSITIONS.map((pos) => {
            const isSelected = selectedPosition === pos.id;
            return (
              <button
                key={pos.id}
                onClick={() => setSelectedPosition(isSelected ? '' : pos.id)}
                className={`btn-saas ${isSelected ? 'btn-lime' : 'btn-outline-white'}`}
                style={{ padding: '7px 14px', fontSize: '0.8rem' }}
              >
                {pos.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep Search Input */}
      <div className="saas-search-input" style={{ width: '100%', padding: '12px 18px', background: 'var(--bg-surface)' }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Deep Search across Glass Name, SKU, Part #, OEM Supplier, or Model (e.g. Camry, FW04892, Sekurit)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', fontSize: '0.9rem' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            &times;
          </button>
        )}
      </div>

      {/* Matched Products Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-title)' }}>{products.length}</strong> matching automotive glass items
        </div>
      </div>

      {products.length === 0 ? (
        <div className="saas-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Shield size={44} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Glass Products Match Filters</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
            Try resetting vehicle filters or searching by a different part code.
          </p>
          <button onClick={resetFilters} className="btn-saas btn-dark">Reset Filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {products.map((product) => {
            const positionMeta = GLASS_POSITIONS.find(p => p.id === product.glassPosition);
            return (
              <div 
                key={product.id} 
                className="saas-card saas-card-hover" 
                style={{ 
                  padding: '22px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <span className="status-pill status-pill-blue" style={{ fontSize: '0.72rem' }}>
                      {positionMeta ? positionMeta.label : product.glassPosition}
                    </span>
                    {getStockPill(product.stockCount, product.minThreshold)}
                  </div>

                  <h3 style={{ fontSize: '1.05rem', lineHeight: 1.35, marginBottom: '6px', color: 'var(--text-title)' }}>
                    {product.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span>SKU: {product.sku}</span>
                    <span>&bull;</span>
                    <span>OEM #{product.partNumber}</span>
                  </div>

                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.78rem',
                    color: 'var(--text-body)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Car size={14} color="#2563eb" />
                    <span>{product.brandName} {product.modelName} ({product.variantName || 'All Trims'})</span>
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {product.features.map((feat, idx) => (
                        <span key={idx} className="status-pill" style={{ background: 'var(--bg-surface-subtle)', color: 'var(--text-body)', fontSize: '0.68rem' }}>
                          <Zap size={10} color="#10b981" /> {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Retail Unit Price
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-title)', fontFamily: 'var(--font-heading)' }}>
                      ${Number(product.unitPrice).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setActiveModalProduct(product)}
                      className="btn-saas btn-outline-white"
                      style={{ padding: '8px 12px' }}
                      title="View Details"
                    >
                      <Info size={15} />
                    </button>
                    <button
                      onClick={() => onAddToQuote && onAddToQuote(product)}
                      className="btn-saas btn-lime"
                      disabled={product.stockCount <= 0}
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      <Plus size={15} />
                      <span>{product.stockCount <= 0 ? 'Out of Stock' : 'Add to Ticket'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {activeModalProduct && (
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
        }} onClick={() => setActiveModalProduct(null)}>
          <div className="saas-card" style={{ maxWidth: '560px', width: '100%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Glass Compatibility Specifications</h3>
              <button onClick={() => setActiveModalProduct(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div>
              <h4>{activeModalProduct.name}</h4>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                SKU: {activeModalProduct.sku} | OEM: {activeModalProduct.partNumber}
              </p>

              <div style={{ background: 'var(--bg-surface-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div style={{ marginBottom: '6px' }}><strong>Vehicle:</strong> {activeModalProduct.brandName} {activeModalProduct.modelName}</div>
                <div style={{ marginBottom: '6px' }}><strong>Trim / Variant:</strong> {activeModalProduct.variantName}</div>
                <div style={{ marginBottom: '6px' }}><strong>Position:</strong> {activeModalProduct.glassPosition}</div>
                <div style={{ marginBottom: '6px' }}><strong>Stock Count:</strong> {activeModalProduct.stockCount} units</div>
                <div><strong>Supplier:</strong> {activeModalProduct.oemSupplier || 'OEM Direct'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveModalProduct(null)} className="btn-saas btn-outline-white">Close</button>
              <button 
                onClick={() => {
                  onAddToQuote(activeModalProduct);
                  setActiveModalProduct(null);
                }} 
                className="btn-saas btn-lime"
              >
                Add to Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
