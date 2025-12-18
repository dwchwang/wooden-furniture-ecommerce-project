import api from './api';

const blogService = {
  // Get all blogs (public - only published)
  getBlogs: async (params = {}) => {
    const response = await api.get('/blogs', { params });
    return response.data;
  },

  // Get all blogs for admin (including unpublished)
  getAllBlogsForAdmin: async (params = {}) => {
    const response = await api.get('/blogs/admin/all', { params });
    return response.data;
  },

  // Get single blog by slug
  getBlogBySlug: async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  // Toggle like on blog (requires auth)
  toggleLike: async (blogId) => {
    const response = await api.post(`/blogs/${blogId}/like`);
    return response.data;
  },

  // Create blog (admin/staff only)
  createBlog: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  // Update blog (admin/staff only)
  updateBlog: async (blogId, blogData) => {
    const response = await api.put(`/blogs/${blogId}`, blogData);
    return response.data;
  },

  // Delete blog (admin/staff only)
  deleteBlog: async (blogId) => {
    const response = await api.delete(`/blogs/${blogId}`);
    return response.data;
  }
};

export default blogService;
