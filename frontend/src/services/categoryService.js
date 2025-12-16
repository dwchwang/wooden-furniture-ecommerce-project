import api from './api';

export const categoryService = {
  // Get all categories
  getCategories: async (isActive) => {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return await api.get(`/categories${params}`);
  },

  // Get category tree
  getCategoryTree: async () => {
    return await api.get('/categories/tree');
  },

  // Get category by ID
  getCategoryById: async (id) => {
    return await api.get(`/categories/${id}`);
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    return await api.get(`/categories/slug/${slug}`);
  },
};

export default categoryService;
