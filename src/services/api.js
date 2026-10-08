import { 
  MOCK_CATEGORIES, 
  MOCK_BRANDS, 
  MOCK_MODELS, 
  MOCK_VARIANTS, 
  MOCK_PRODUCTS, 
  MOCK_USERS 
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to reliably extract arrays from various backend response shapes
// e.g. res, res.data, res.categories, res.data.categories
function extractList(res, key) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (key && Array.isArray(res[key])) return res[key];
  if (key && res.data && Array.isArray(res.data[key])) return res.data[key];
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.products)) return res.products;
  if (Array.isArray(res.users)) return res.users;
  return [];
}

// Normalizer for products returning from Prisma ORM with relations
function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    id: p.id,
    sku: p.sku || p.code || 'SKU-000',
    partNumber: p.partNumber || p.partNo || p.oemNumber || 'OEM-000',
    name: p.name || p.title || 'Vehicle Glass',
    brandName: p.brandName || p.brand?.name || p.variant?.model?.brand?.name || p.vehicleModel?.brand?.name || 'Compatible',
    modelName: p.modelName || p.model?.name || p.variant?.model?.name || p.vehicleModel?.name || 'All Models',
    variantName: p.variantName || p.variant?.name || p.vehicleVariant?.name || 'Universal',
    brandId: p.brandId || p.brand?.id || p.variant?.model?.brandId || '',
    modelId: p.modelId || p.model?.id || p.variant?.modelId || '',
    variantId: p.variantId || p.variant?.id || '',
    glassPosition: p.glassPosition || p.position || 'front_windshield',
    unitPrice: Number(p.unitPrice || p.price || 0),
    costPrice: Number(p.costPrice || p.cost || 0),
    stockCount: p.stockCount !== undefined ? p.stockCount : 
                (p.inventory !== undefined ? (typeof p.inventory === 'number' ? p.inventory : (p.inventory?.quantity || 0)) : 
                (p.stock !== undefined ? p.stock : 0)),
    minThreshold: p.minThreshold || p.minStock || 3,
    tintColor: p.tintColor || p.tint || 'Standard Solar Tint',
    features: p.features || (p.specifications ? (Array.isArray(p.specifications) ? p.specifications : [p.specifications]) : ['OEM Standard']),
    oemSupplier: p.oemSupplier || p.supplier || 'OEM Direct'
  };
}

// In-memory cache & fallback store for offline development
let localStore = {
  categories: [...MOCK_CATEGORIES],
  brands: [...MOCK_BRANDS],
  models: [...MOCK_MODELS],
  variants: [...MOCK_VARIANTS],
  products: [...MOCK_PRODUCTS],
  users: [...MOCK_USERS]
};

const LOCAL_STORAGE_KEY = 'glass_pos_local_data';
try {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    localStore = { ...localStore, ...parsed };
  }
} catch (e) {
  console.warn('Could not read cached data', e);
}

function saveLocalStore() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localStore));
  } catch (e) {
    console.warn('Could not persist data', e);
  }
}

// Token helper
export const getToken = () => localStorage.getItem('glass_pos_token');
export const setToken = (token) => {
  if (token) localStorage.setItem('glass_pos_token', token);
  else localStorage.removeItem('glass_pos_token');
};

// Generic fetch wrapper with timeout
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message = (data && data.message) || (data && data.error) || `HTTP Error ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// System Health API
export const systemAPI = {
  async checkHealth() {
    try {
      const res = await apiRequest('/health');
      return { isLive: true, data: res };
    } catch (err) {
      return { isLive: false, error: err.message };
    }
  }
};

// Auth API
export const authAPI = {
  async login(email, password) {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const payload = res.data || res;
      if (payload.token) {
        setToken(payload.token);
      }
      return payload;
    } catch (err) {
      // If server unreachable, permit test accounts locally so development never blocks
      if (email === 'admin@glasspos.com' && password === 'password123') {
        const dummyToken = 'mock-jwt-admin-token-glasspos';
        setToken(dummyToken);
        const user = { id: 'usr-1', email, name: 'System Admin', role: 'ADMIN' };
        localStorage.setItem('glass_pos_user', JSON.stringify(user));
        return { token: dummyToken, user, isMockAuth: true };
      }

      if (email.startsWith('staff') && password === 'password123') {
        const dummyToken = `mock-jwt-staff-token-${email}`;
        setToken(dummyToken);
        const user = { id: 'usr-2', email, name: `Staff Member (${email.split('@')[0]})`, role: 'STAFF' };
        localStorage.setItem('glass_pos_user', JSON.stringify(user));
        return { token: dummyToken, user, isMockAuth: true };
      }

      throw err;
    }
  },

  async getProfile() {
    try {
      const res = await apiRequest('/auth/me');
      return res.data || res.user || res;
    } catch (err) {
      const saved = localStorage.getItem('glass_pos_user');
      if (saved) return JSON.parse(saved);
      throw err;
    }
  },

  async register(userData) {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'STAFF',
        status: 'ACTIVE',
        lastLogin: 'Never'
      };
      localStore.users.push(newUser);
      saveLocalStore();
      return { message: 'User registered in local store', user: newUser };
    }
  },

  async forgotPassword(email) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(data) {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Users API
export const usersAPI = {
  async getUsers() {
    try {
      const res = await apiRequest('/users');
      const list = extractList(res, 'users');
      return list.length > 0 ? list : (res.data || res);
    } catch (err) {
      return localStore.users;
    }
  },
  async getUser(id) {
    try {
      const res = await apiRequest(`/users/${id}`);
      return res.data || res.user || res;
    } catch (err) {
      return localStore.users.find(u => u.id === id);
    }
  },
  async updateUser(id, data) {
    try {
      const res = await apiRequest(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      localStore.users = localStore.users.map(u => u.id === id ? { ...u, ...data } : u);
      saveLocalStore();
      return localStore.users.find(u => u.id === id);
    }
  },
  async deleteUser(id) {
    try {
      return await apiRequest(`/users/${id}`, { method: 'DELETE' });
    } catch (err) {
      localStore.users = localStore.users.filter(u => u.id !== id);
      saveLocalStore();
      return { success: true };
    }
  }
};

// Vehicle Hierarchy APIs
export const vehiclesAPI = {
  // Categories
  async getCategories() {
    try {
      const res = await apiRequest('/vehicles/categories');
      const list = extractList(res, 'categories');
      return list.length > 0 ? list : (res.data || res || localStore.categories);
    } catch (err) {
      return localStore.categories;
    }
  },
  async createCategory(data) {
    try {
      const res = await apiRequest('/vehicles/categories', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      const newItem = { id: `cat-${Date.now()}`, ...data };
      localStore.categories.push(newItem);
      saveLocalStore();
      return newItem;
    }
  },
  async updateCategory(id, data) {
    try {
      const res = await apiRequest(`/vehicles/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      localStore.categories = localStore.categories.map(c => c.id === id ? { ...c, ...data } : c);
      saveLocalStore();
      return localStore.categories.find(c => c.id === id);
    }
  },
  async deleteCategory(id) {
    try {
      return await apiRequest(`/vehicles/categories/${id}`, { method: 'DELETE' });
    } catch (err) {
      localStore.categories = localStore.categories.filter(c => c.id !== id);
      saveLocalStore();
      return { success: true };
    }
  },

  // Brands
  async getBrands(categoryId = '') {
    try {
      const query = categoryId ? `?categoryId=${categoryId}` : '';
      const res = await apiRequest(`/vehicles/brands${query}`);
      const list = extractList(res, 'brands');
      return list.length > 0 ? list : (res.data || res);
    } catch (err) {
      if (categoryId) return localStore.brands.filter(b => b.categoryId === categoryId);
      return localStore.brands;
    }
  },
  async createBrand(data) {
    try {
      const res = await apiRequest('/vehicles/brands', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      const newItem = { id: `b-${Date.now()}`, ...data };
      localStore.brands.push(newItem);
      saveLocalStore();
      return newItem;
    }
  },
  async updateBrand(id, data) {
    try {
      const res = await apiRequest(`/vehicles/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      localStore.brands = localStore.brands.map(b => b.id === id ? { ...b, ...data } : b);
      saveLocalStore();
      return localStore.brands.find(b => b.id === id);
    }
  },
  async deleteBrand(id) {
    try {
      return await apiRequest(`/vehicles/brands/${id}`, { method: 'DELETE' });
    } catch (err) {
      localStore.brands = localStore.brands.filter(b => b.id !== id);
      saveLocalStore();
      return { success: true };
    }
  },

  // Models
  async getModels(brandId = '') {
    try {
      const query = brandId ? `?brandId=${brandId}` : '';
      const res = await apiRequest(`/vehicles/models${query}`);
      const list = extractList(res, 'models');
      return list.length > 0 ? list : (res.data || res);
    } catch (err) {
      if (brandId) return localStore.models.filter(m => m.brandId === brandId);
      return localStore.models;
    }
  },
  async createModel(data) {
    try {
      const res = await apiRequest('/vehicles/models', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      const newItem = { id: `m-${Date.now()}`, ...data };
      localStore.models.push(newItem);
      saveLocalStore();
      return newItem;
    }
  },
  async updateModel(id, data) {
    try {
      const res = await apiRequest(`/vehicles/models/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      localStore.models = localStore.models.map(m => m.id === id ? { ...m, ...data } : m);
      saveLocalStore();
      return localStore.models.find(m => m.id === id);
    }
  },
  async deleteModel(id) {
    try {
      return await apiRequest(`/vehicles/models/${id}`, { method: 'DELETE' });
    } catch (err) {
      localStore.models = localStore.models.filter(m => m.id !== id);
      saveLocalStore();
      return { success: true };
    }
  },

  // Variants
  async getVariants(modelId = '') {
    try {
      const query = modelId ? `?modelId=${modelId}` : '';
      const res = await apiRequest(`/vehicles/variants${query}`);
      const list = extractList(res, 'variants');
      return list.length > 0 ? list : (res.data || res);
    } catch (err) {
      if (modelId) return localStore.variants.filter(v => v.modelId === modelId);
      return localStore.variants;
    }
  },
  async createVariant(data) {
    try {
      const res = await apiRequest('/vehicles/variants', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      const newItem = { id: `v-${Date.now()}`, ...data };
      localStore.variants.push(newItem);
      saveLocalStore();
      return newItem;
    }
  },
  async updateVariant(id, data) {
    try {
      const res = await apiRequest(`/vehicles/variants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return res.data || res;
    } catch (err) {
      localStore.variants = localStore.variants.map(v => v.id === id ? { ...v, ...data } : v);
      saveLocalStore();
      return localStore.variants.find(v => v.id === id);
    }
  },
  async deleteVariant(id) {
    try {
      return await apiRequest(`/vehicles/variants/${id}`, { method: 'DELETE' });
    } catch (err) {
      localStore.variants = localStore.variants.filter(v => v.id !== id);
      saveLocalStore();
      return { success: true };
    }
  }
};

// Products & Compatibility Engine API
export const productsAPI = {
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.glassPosition) queryParams.append('glassPosition', params.glassPosition);
      if (params.brandId) queryParams.append('brandId', params.brandId);
      if (params.modelId) queryParams.append('modelId', params.modelId);
      if (params.variantId) queryParams.append('variantId', params.variantId);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await apiRequest(`/products${qs}`);
      const rawList = extractList(res, 'products');
      const list = rawList.length > 0 ? rawList : (Array.isArray(res) ? res : (res.data || []));
      return list.map(normalizeProduct);
    } catch (err) {
      // In-memory search fallback across glass name, SKU, brand, model, and variant
      let list = [...localStore.products];
      
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.partNumber && p.partNumber.toLowerCase().includes(q)) ||
          (p.brandName && p.brandName.toLowerCase().includes(q)) ||
          (p.modelName && p.modelName.toLowerCase().includes(q)) ||
          (p.variantName && p.variantName.toLowerCase().includes(q))
        );
      }

      if (params.glassPosition) {
        list = list.filter(p => p.glassPosition === params.glassPosition);
      }
      if (params.brandId) {
        list = list.filter(p => p.brandId === params.brandId);
      }
      if (params.modelId) {
        list = list.filter(p => p.modelId === params.modelId);
      }
      if (params.variantId) {
        list = list.filter(p => p.variantId === params.variantId);
      }

      return list.map(normalizeProduct);
    }
  },

  async getProductById(id) {
    try {
      const res = await apiRequest(`/products/${id}`);
      return normalizeProduct(res.data || res.product || res);
    } catch (err) {
      return normalizeProduct(localStore.products.find(p => p.id === id));
    }
  },

  async createProduct(productData) {
    try {
      const res = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      return normalizeProduct(res.data || res.product || res);
    } catch (err) {
      const brand = localStore.brands.find(b => b.id === productData.brandId);
      const model = localStore.models.find(m => m.id === productData.modelId);
      const variant = localStore.variants.find(v => v.id === productData.variantId);

      const newProduct = {
        id: `prod-${Date.now()}`,
        sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        partNumber: productData.partNumber || `PN-${Math.floor(10000 + Math.random() * 90000)}`,
        name: productData.name,
        brandName: brand ? brand.name : 'Generic',
        modelName: model ? model.name : 'All Models',
        variantName: variant ? variant.name : 'Universal',
        brandId: productData.brandId,
        modelId: productData.modelId,
        variantId: productData.variantId,
        glassPosition: productData.glassPosition || 'front_windshield',
        unitPrice: Number(productData.unitPrice || 0),
        costPrice: Number(productData.costPrice || 0),
        stockCount: Number(productData.openingStock || productData.stockCount || 0),
        minThreshold: Number(productData.minThreshold || 2),
        tintColor: productData.tintColor || 'Standard Solar Tint',
        features: productData.features || ['Standard Tempered/Laminated'],
        oemSupplier: productData.oemSupplier || 'OEM Direct',
        lastRestocked: new Date().toISOString().split('T')[0]
      };
      localStore.products.unshift(newProduct);
      saveLocalStore();
      return normalizeProduct(newProduct);
    }
  },

  async updateProduct(id, productData) {
    try {
      const res = await apiRequest(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(productData)
      });
      return normalizeProduct(res.data || res.product || res);
    } catch (err) {
      localStore.products = localStore.products.map(p => 
        p.id === id ? { ...p, ...productData } : p
      );
      saveLocalStore();
      return normalizeProduct(localStore.products.find(p => p.id === id));
    }
  },

  async deleteProduct(id) {
    try {
      return await apiRequest(`/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      localStore.products = localStore.products.filter(p => p.id !== id);
      saveLocalStore();
      return { success: true };
    }
  },

  async adjustStock(id, delta) {
    try {
      const prod = localStore.products.find(p => p.id === id);
      const newStock = Math.max(0, (prod ? prod.stockCount : 0) + delta);
      return await this.updateProduct(id, { stockCount: newStock });
    } catch (err) {
      console.error('Failed to adjust stock', err);
    }
  }
};
