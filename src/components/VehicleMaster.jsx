import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Layers
} from 'lucide-react';
import { vehiclesAPI } from '../services/api';

export function VehicleMaster() {
  const [activeTier, setActiveTier] = useState('categories');

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');

  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [modalForm, setModalForm] = useState({});

  const loadData = async () => {
    try {
      const [c, b, m, v] = await Promise.all([
        vehiclesAPI.getCategories(),
        vehiclesAPI.getBrands(),
        vehiclesAPI.getModels(),
        vehiclesAPI.getVariants()
      ]);
      setCategories(c || []);
      setBrands(b || []);
      setModels(m || []);
      setVariants(v || []);
    } catch (err) {
      console.error('Error loading vehicle hierarchy', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = (tier) => {
    setModalType(tier);
    setEditingItem(null);
    if (tier === 'category') {
      setModalForm({ name: '', code: '', description: '' });
    } else if (tier === 'brand') {
      setModalForm({ name: '', categoryId: filterCategory || (categories[0]?.id || ''), country: 'Japan', code: '' });
    } else if (tier === 'model') {
      setModalForm({ name: '', brandId: filterBrand || (brands[0]?.id || ''), yearStart: 2020, yearEnd: 2025, bodyType: 'Sedan' });
    } else if (tier === 'variant') {
      setModalForm({ name: '', modelId: filterModel || (models[0]?.id || ''), year: '2020-2025', trim: 'Standard ADAS' });
    }
  };

  const openEditModal = (tier, item) => {
    setModalType(tier);
    setEditingItem(item);
    setModalForm({ ...item });
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'category') {
        if (editingItem) {
          const res = await vehiclesAPI.updateCategory(editingItem.id, modalForm);
          setCategories(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...res } : c));
        } else {
          const res = await vehiclesAPI.createCategory(modalForm);
          setCategories(prev => [...prev, res]);
        }
      } else if (modalType === 'brand') {
        if (editingItem) {
          const res = await vehiclesAPI.updateBrand(editingItem.id, modalForm);
          setBrands(prev => prev.map(b => b.id === editingItem.id ? { ...b, ...res } : b));
        } else {
          const res = await vehiclesAPI.createBrand(modalForm);
          setBrands(prev => [...prev, res]);
        }
      } else if (modalType === 'model') {
        if (editingItem) {
          const res = await vehiclesAPI.updateModel(editingItem.id, modalForm);
          setModels(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...res } : m));
        } else {
          const res = await vehiclesAPI.createModel(modalForm);
          setModels(prev => [...prev, res]);
        }
      } else if (modalType === 'variant') {
        if (editingItem) {
          const res = await vehiclesAPI.updateVariant(editingItem.id, modalForm);
          setVariants(prev => prev.map(v => v.id === editingItem.id ? { ...v, ...res } : v));
        } else {
          const res = await vehiclesAPI.createVariant(modalForm);
          setVariants(prev => [...prev, res]);
        }
      }
      setModalType(null);
    } catch (err) {
      alert('Error saving hierarchy item: ' + err.message);
    }
  };

  const handleDelete = async (tier, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${tier}?`)) return;
    try {
      if (tier === 'category') {
        await vehiclesAPI.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
      } else if (tier === 'brand') {
        await vehiclesAPI.deleteBrand(id);
        setBrands(prev => prev.filter(b => b.id !== id));
      } else if (tier === 'model') {
        await vehiclesAPI.deleteModel(id);
        setModels(prev => prev.filter(m => m.id !== id));
      } else if (tier === 'variant') {
        await vehiclesAPI.deleteVariant(id);
        setVariants(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Generic';
  const getBrandName = (id) => brands.find(b => b.id === id)?.name || 'Generic';
  const getModelName = (id) => models.find(m => m.id === id)?.name || 'Generic';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: '1.75rem', margin: 0 }}>
            Vehicle Master Hierarchy
          </h1>
          <p className="greeting-subtitle">
            Configure the 4-level vehicle cascade: Categories &rarr; Brands &rarr; Models &rarr; Variants.
          </p>
        </div>

        <button 
          onClick={() => openAddModal(activeTier.slice(0, -1))}
          className="btn-saas btn-dark"
        >
          <Plus size={16} />
          <span>Add {activeTier === 'categories' ? 'Category' : activeTier === 'brands' ? 'Brand' : activeTier === 'models' ? 'Model' : 'Variant'}</span>
        </button>
      </div>

      {/* Pill Tabs for Tiers (Finexy Style) */}
      <div className="nav-pill-group" style={{ width: 'fit-content' }}>
        {[
          { id: 'categories', label: '1. Categories', count: categories.length },
          { id: 'brands', label: '2. Brands', count: brands.length },
          { id: 'models', label: '3. Models', count: models.length },
          { id: 'variants', label: '4. Variants', count: variants.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTier(tab.id);
              setSearch('');
            }}
            className={`nav-pill ${activeTier === tab.id ? 'active' : ''}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="saas-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="saas-search-input" style={{ flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={`Filter ${activeTier}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {activeTier === 'brands' && (
          <select 
            className="saas-select" 
            style={{ width: '220px' }}
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        {activeTier === 'models' && (
          <select 
            className="saas-select" 
            style={{ width: '220px' }}
            value={filterBrand} 
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}

        {activeTier === 'variants' && (
          <select 
            className="saas-select" 
            style={{ width: '220px' }}
            value={filterModel} 
            onChange={(e) => setFilterModel(e.target.value)}
          >
            <option value="">All Models</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
      </div>

      {/* Tables Card */}
      <div className="saas-table-card">
        {activeTier === 'categories' && (
          <table className="saas-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Linked Brands</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                .map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-title)' }}>{cat.name}</td>
                    <td><span className="status-pill status-pill-blue">{cat.code || 'N/A'}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{cat.description || 'General passenger vehicles'}</td>
                    <td><span className="status-pill status-pill-green">{brands.filter(b => b.categoryId === cat.id).length} Brands</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEditModal('category', cat)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', marginRight: '6px' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete('category', cat.id)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', color: '#f43f5e' }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTier === 'brands' && (
          <table className="saas-table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Parent Category</th>
                <th>Country</th>
                <th>Models Count</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands
                .filter(b => !filterCategory || b.categoryId === filterCategory)
                .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
                .map(brand => (
                  <tr key={brand.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-title)' }}>{brand.name}</td>
                    <td><span className="status-pill status-pill-blue">{getCategoryName(brand.categoryId)}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{brand.country || 'Global'}</td>
                    <td><span className="status-pill status-pill-green">{models.filter(m => m.brandId === brand.id).length} Models</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEditModal('brand', brand)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', marginRight: '6px' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete('brand', brand.id)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', color: '#f43f5e' }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTier === 'models' && (
          <table className="saas-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Parent Brand</th>
                <th>Years Active</th>
                <th>Body Type</th>
                <th>Variants Count</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {models
                .filter(m => !filterBrand || m.brandId === filterBrand)
                .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
                .map(model => (
                  <tr key={model.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-title)' }}>{model.name}</td>
                    <td><span className="status-pill status-pill-blue">{getBrandName(model.brandId)}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{model.yearStart} - {model.yearEnd || 'Present'}</td>
                    <td><span className="status-pill" style={{ background: 'var(--bg-surface-subtle)' }}>{model.bodyType || 'Sedan'}</span></td>
                    <td><span className="status-pill status-pill-green">{variants.filter(v => v.modelId === model.id).length} Variants</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEditModal('model', model)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', marginRight: '6px' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete('model', model.id)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', color: '#f43f5e' }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTier === 'variants' && (
          <table className="saas-table">
            <thead>
              <tr>
                <th>Variant / Trim Name</th>
                <th>Model</th>
                <th>Model Years</th>
                <th>ADAS &amp; Sensor Calibration Spec</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants
                .filter(v => !filterModel || v.modelId === filterModel)
                .filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
                .map(variant => (
                  <tr key={variant.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-title)' }}>{variant.name}</td>
                    <td><span className="status-pill status-pill-blue">{getModelName(variant.modelId)}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{variant.year || 'All'}</td>
                    <td><span className="status-pill status-pill-green">{variant.trim || 'Standard'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEditModal('variant', variant)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', marginRight: '6px' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete('variant', variant.id)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', color: '#f43f5e' }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Universal Modal */}
      {modalType && (
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
        }} onClick={() => setModalType(null)}>
          <div className="saas-card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}</h3>
              <button onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Name *</label>
                <input type="text" className="saas-input" required value={modalForm.name || ''} onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })} />
              </div>

              {modalType === 'category' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Code / Slug</label>
                  <input type="text" className="saas-input" value={modalForm.code || ''} onChange={(e) => setModalForm({ ...modalForm, code: e.target.value })} />
                </div>
              )}

              {modalType === 'brand' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category *</label>
                  <select className="saas-select" value={modalForm.categoryId || ''} onChange={(e) => setModalForm({ ...modalForm, categoryId: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {modalType === 'model' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Brand *</label>
                  <select className="saas-select" value={modalForm.brandId || ''} onChange={(e) => setModalForm({ ...modalForm, brandId: e.target.value })}>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}

              {modalType === 'variant' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Model *</label>
                  <select className="saas-select" value={modalForm.modelId || ''} onChange={(e) => setModalForm({ ...modalForm, modelId: e.target.value })}>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalType(null)} className="btn-saas btn-outline-white">Cancel</button>
                <button type="submit" className="btn-saas btn-dark">{editingItem ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
