import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const blogService = {
  // Get all blogs (public)
  getBlogs: async (params = {}) => {
    const response = await axios.get(`${API_URL}/blogs`, { params });
    return response.data;
  },

  // Get single blog by slug
  getBlogBySlug: async (slug) => {
    const response = await axios.get(`${API_URL}/blogs/${slug}`);
    return response.data;
  },

  // Toggle like on blog (requires auth)
  toggleLike: async (blogId) => {
    const response = await axios.post(`${API_URL}/blogs/${blogId}/like`);
    return response.data;
  },

  // Create blog (admin/staff only)
  createBlog: async (blogData) => {
    const response = await axios.post(`${API_URL}/blogs`, blogData);
    return response.data;
  },

  // Update blog (admin/staff only)
  updateBlog: async (blogId, blogData) => {
    const response = await axios.put(`${API_URL}/blogs/${blogId}`, blogData);
    return response.data;
  },

  // Delete blog (admin/staff only)
  deleteBlog: async (blogId) => {
    const response = await axios.delete(`${API_URL}/blogs/${blogId}`);
    return response.data;
  }
};

export default blogService;
