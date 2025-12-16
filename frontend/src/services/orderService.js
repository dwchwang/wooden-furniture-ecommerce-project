import api from './api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  // Get user's orders
  getMyOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    
    return await api.get(`/orders/my-orders?${params.toString()}`);
  },

  // Get order by ID
  getOrderById: async (id) => {
    return await api.get(`/orders/${id}`);
  },

  // Cancel order
  cancelOrder: async (id) => {
    return await api.patch(`/orders/${id}/cancel`);
  },
};

export default orderService;
