import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/users/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    return await api.get('/users/me');
  },

  // Update profile
  updateProfile: async (userData) => {
    return await api.patch('/users/update-profile', userData);
  },

  // Change password
  changePassword: async (passwords) => {
    return await api.patch('/users/change-password', passwords);
  },
};

export default authService;
