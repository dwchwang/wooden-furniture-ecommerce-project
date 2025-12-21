import api from './api';

export const chatService = {
  // Get or create conversation (customer)
  getOrCreateConversation: async () => {
    return await api.get('/chat/conversation');
  },

  // Get all conversations (admin/staff)
  getAllConversations: async (params = {}) => {
    return await api.get('/chat/conversations', { params });
  },

  // Get conversation by ID
  getConversationById: async (id) => {
    return await api.get(`/chat/conversations/${id}`);
  },

  // Get messages
  getMessages: async (conversationId, params = {}) => {
    return await api.get(`/chat/conversations/${conversationId}/messages`, { params });
  },

  // Send message
  sendMessage: async (conversationId, content) => {
    return await api.post(`/chat/conversations/${conversationId}/messages`, { content });
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    return await api.patch(`/chat/conversations/${conversationId}/read`);
  },

  // Assign conversation
  assignConversation: async (conversationId, staffId) => {
    return await api.patch(`/chat/conversations/${conversationId}/assign`, { staffId });
  },

  // Update conversation status
  updateStatus: async (conversationId, status) => {
    return await api.patch(`/chat/conversations/${conversationId}/status`, { status });
  },
};

export default chatService;
