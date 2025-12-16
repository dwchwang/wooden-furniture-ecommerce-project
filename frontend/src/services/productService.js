import api from './api';

export const productService = {
  // Get all products with filters
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.material) params.append('material', filters.material);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured);
    if (filters.sort) params.append('sort', filters.sort);
    
    return await api.get(`/products?${params.toString()}`);
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return await api.get('/products/featured');
  },

  // Search products
  searchProducts: async (query) => {
    return await api.get(`/products/search?q=${encodeURIComponent(query)}`);
  },

  // Get product by ID
  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // Get product by slug
  getProductBySlug: async (slug) => {
    return await api.get(`/products/slug/${slug}`);
  },

  // Get product variants
  getProductVariants: async (productId) => {
    return await api.get(`/products/${productId}/variants`);
  },

  // Get variant by ID
  getVariantById: async (variantId) => {
    return await api.get(`/products/variants/${variantId}`);
  },

  // Check stock availability
  checkStock: async (variantId, quantity) => {
    return await api.get(`/products/variants/${variantId}/check-stock?quantity=${quantity}`);
  },
};

export default productService;
