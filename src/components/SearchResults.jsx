import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Car, 
  Shield, 
  Package, 
  Layers, 
  Zap, 
  Plus, 
  ArrowRight, 
  Tag, 
  Info,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { productsAPI, vehiclesAPI } from '../services/api';
import { GLASS_POSITIONS } from '../services/mockData';

export function SearchResults({ query, onAddToQuote, onNavigateToFinder, onNavigateToInventory }) {
  const [products, setProducts] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PRODUCTS' | 'VEHICLES'

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const [allProds, allBrands, allModels, allVariants] = await Promise.all([
          productsAPI.getProducts({ search: query }),
          vehiclesAPI.getBrands(),
          vehiclesAPI.getModels(),
          vehiclesAPI.getVariants()
        ]);

        const q = (query || '').toLowerCase().trim();

        // Filter products matching query
        const matchedProds = (allProds || []).filter(p => {
          if (!q) return true;
          return (
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.partNumber && p.partNumber.toLowerCase().includes(q)) ||
            (p.brandName && p.brandName.toLowerCase().includes(q)) ||
            (p.modelName && p.modelName.toLowerCase().includes(q)) ||
            (p.variantName && p.variantName.toLowerCase().includes(q)) ||
            (p.glassPosition && p.glassPosition.toLowerCase().includes(q)) ||
            (p.oemSupplier && p.oemSupplier.toLowerCase().includes(q))
          );
        });

        // Filter vehicles matching query
        const matchedModels = (allModels || []).filter(m => {
          if (!q) return true;
          const brand = allBrands.find(b => b.id === m.brandId);
          return (
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.bodyType && m.bodyType.toLowerCase().includes(q)) ||
            (brand && brand.name.toLowerCase().includes(q))
          );
        });

        const matchedVariants = (allVariants || []).filter(v => {
          if (!q) return true;
          const model = allModels.find(m => m.id === v.modelId);
          return (
            (v.name && v.name.toLowerCase().includes(q)) ||
            (v.trim && v.trim.toLowerCase().includes(q)) ||
            (model && model.name.toLowerCase().includes(q))
          );
        });

        setProducts(matchedProds);
        setBrands(allBrands || []);
        setModels(matchedModels);
        setVariants(matchedVariants);
      } catch (err) {
        console.error('Search query failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalResultsCount = products.length + models.length + variants.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Search Header Banner */}
      <div className="saas-card" style={{ padding: '24px 28px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="status-pill status-pill-blue" style={{ fontSize: '0.75rem' }}>
                Universal Search Results
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {totalResultsCount} total records found
              </span>
            </div>

            <h1 className="greeting-title" style={{ fontSize: '1.8rem', margin: 0 }}>
              Search for &ldquo;<span style={{ color: '#10b981' }}>{query || 'All Records'}</span>&rdquo;
            </h1>
            <p className="greeting-subtitle" style={{ marginTop: '4px' }}>
              Displaying all matching vehicle models, trims, automotive glass parts, and stock records.
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div className="nav-pill-group" style={{ background: 'var(--bg-surface-subtle)' }}>
            {[
              { id: 'ALL', label: `All (${totalResultsCount})` },
              { id: 'PRODUCTS', label: `Glass Parts (${products.length})` },
              { id: 'VEHICLES', label: `Vehicles (${models.length + variants.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`nav-pill ${activeFilter === tab.id ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="saas-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Search size={36} className="animate-spin" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <div>Scanning vehicles and inventory database...</div>
        </div>
      ) : totalResultsCount === 0 ? (
        <div className="saas-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Search size={44} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>No records found for &ldquo;{query}&rdquo;</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 20px' }}>
            We could not find any vehicle brand, model, variant, or automotive glass part matching your search query.
          </p>
          <button onClick={() => onNavigateToFinder && onNavigateToFinder()} className="btn-saas btn-dark">
            Open Compatibility Finder
          </button>
        </div>
      ) : (
        <>
          {/* SECTION 1: MATCHING VEHICLES & TRIMS */}
          {(activeFilter === 'ALL' || activeFilter === 'VEHICLES') && (models.length > 0 || variants.length > 0) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Car size={20} color="#2563eb" />
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-title)' }}>
                  Matching Vehicle Models &amp; Trims ({models.length + variants.length})
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {models.map(m => {
                  const brand = brands.find(b => b.id === m.brandId);
                  const linkedVariants = variants.filter(v => v.modelId === m.id);
                  return (
                    <div key={m.id} className="saas-card saas-card-hover" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span className="status-pill status-pill-blue" style={{ fontSize: '0.72rem' }}>
                          {brand ? brand.name : 'Vehicle'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {m.yearStart} - {m.yearEnd || 'Present'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-title)' }}>
                        {brand?.name} {m.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Body Type: <strong>{m.bodyType || 'Sedan'}</strong> &bull; {linkedVariants.length} Trims linked
                      </div>

                      <button
                        onClick={() => onNavigateToFinder && onNavigateToFinder(m.brandId, m.id)}
                        className="btn-saas btn-outline-white"
                        style={{ width: '100%', padding: '8px', fontSize: '0.78rem' }}
                      >
                        Find Glass for this Model &rarr;
                      </button>
                    </div>
                  );
                })}

                {variants.map(v => {
                  const model = models.find(m => m.id === v.modelId);
                  const brand = model ? brands.find(b => b.id === model.brandId) : null;
                  return (
                    <div key={v.id} className="saas-card saas-card-hover" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span className="status-pill status-pill-green" style={{ fontSize: '0.72rem' }}>
                          Variant / Trim
                        </span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {v.year || 'All Years'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px 0', color: 'var(--text-title)' }}>
                        {brand?.name} {model?.name} — {v.name}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Trim Spec: <strong>{v.trim || 'Standard ADAS Optic'}</strong>
                      </div>

                      <button
                        onClick={() => onNavigateToFinder && onNavigateToFinder(brand?.id, model?.id, v.id)}
                        className="btn-saas btn-lime"
                        style={{ width: '100%', padding: '8px', fontSize: '0.78rem' }}
                      >
                        Inspect Compatible Glass &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: MATCHING GLASS PARTS & INVENTORY */}
          {(activeFilter === 'ALL' || activeFilter === 'PRODUCTS') && products.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Shield size={20} color="#10b981" />
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-title)' }}>
                  Matching Automotive Glass &amp; Stock Parts ({products.length})
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {products.map(p => {
                  const posMeta = GLASS_POSITIONS.find(g => g.id === p.glassPosition);
                  return (
                    <div key={p.id} className="saas-card saas-card-hover" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <span className="status-pill status-pill-blue" style={{ fontSize: '0.72rem' }}>
                            {posMeta ? posMeta.label : p.glassPosition}
                          </span>
                          {p.stockCount <= 0 ? (
                            <span className="status-pill status-pill-rose">Out of Stock (0)</span>
                          ) : p.stockCount <= (p.minThreshold || 3) ? (
                            <span className="status-pill status-pill-amber">Low Stock ({p.stockCount})</span>
                          ) : (
                            <span className="status-pill status-pill-green">In Stock ({p.stockCount})</span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-title)', lineHeight: 1.35, marginBottom: '6px' }}>
                          {p.name}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          <span>SKU: {p.sku}</span>
                          <span>&bull;</span>
                          <span>OEM #{p.partNumber}</span>
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
                          <span>{p.brandName} {p.modelName} ({p.variantName || 'All Trims'})</span>
                        </div>

                        {p.features && p.features.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {p.features.map((feat, idx) => (
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
                            Unit Price
                          </div>
                          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-title)', fontFamily: 'var(--font-heading)' }}>
                            ${Number(p.unitPrice).toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => onAddToQuote && onAddToQuote(p)}
                          className="btn-saas btn-lime"
                          disabled={p.stockCount <= 0}
                          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                          <Plus size={15} />
                          <span>{p.stockCount <= 0 ? 'Out of Stock' : 'Add to Ticket'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
