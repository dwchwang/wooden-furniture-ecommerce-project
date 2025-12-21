import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import chatService from '../../../services/chatService';
import socketService from '../../../services/socketService';
import { toast } from 'react-toastify';

const AdminChatPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      socketService.connect(user._id);
      fetchConversations();

      // Listen for new messages
      socketService.onNewMessage(handleNewMessage);

      // Listen for assignment events
      const socket = socketService.getSocket();
      if (socket) {
        socket.on('chat:conversationAssigned', handleConversationAssigned);
      }
    }

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }

      // Remove assignment listener
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('chat:conversationAssigned', handleConversationAssigned);
      }
    };
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      socketService.joinConversation(selectedConversation._id);
      socketService.markAsRead(selectedConversation._id);

      return () => {
        socketService.leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAllConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    try {
      const response = await chatService.getMessages(selectedConversation._id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (data) => {
    // Update conversation list
    fetchConversations();

    // If message is for selected conversation, add it
    if (data.conversationId === selectedConversation?._id) {
      setMessages(prev => [...prev, data.message]);
      socketService.markAsRead(selectedConversation._id);
    }
  };

  const handleConversationAssigned = (data) => {
    // Refresh conversations list
    fetchConversations();

    // Update selected conversation if it's the one that was assigned
    if (data.conversationId === selectedConversation?._id) {
      setSelectedConversation(prev => ({
        ...prev,
        assignedTo: data.conversation?.assignedTo,
        status: 'assigned'
      }));

      // Show toast notification
      if (data.staffId === user._id) {
        toast.success('Cuộc trò chuyện đã được assign cho bạn');
      } else {
        toast.info(`Cuộc trò chuyện đã được assign cho ${data.conversation?.assignedTo?.fullName}`);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      socketService.sendMessage(selectedConversation._id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Tin nhắn hỗ trợ</h2>
          <p className="text-sm text-gray-600">{conversations.length} cuộc trò chuyện</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a67c52]"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <i className="ri-chat-3-line text-5xl mb-2"></i>
            <p>Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?._id === conv._id ? 'bg-blue-50' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-line"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{conv.customer?.fullName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conv.status)}`}>
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                  </p>
                  {conv.unreadCount?.staff > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {conv.unreadCount.staff} tin nhắn mới
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <i className="ri-user-line"></i>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.customer?.fullName}</h3>
                  <p className="text-sm text-gray-600">{selectedConversation.customer?.email}</p>
                  {selectedConversation.assignedTo && (
                    <p className="text-xs text-[#a67c52] mt-1">
                      <i className="ri-user-star-line"></i> Assigned to: {selectedConversation.assignedTo.fullName}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedConversation.status)}`}>
                {selectedConversation.status}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Chưa có tin nhắn</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isOwn = message.sender._id === user._id;
                    return (
                      <div
                        key={message._id}
                        className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%]`}>
                          {!isOwn && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-600">
                                {message.sender.fullName}
                              </span>
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${isOwn
                              ? 'bg-[#a67c52] text-white'
                              : 'bg-white text-gray-800'
                              }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-[#a67c52] hover:bg-[#8b653d] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  {sending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <i className="ri-chat-3-line text-6xl mb-4"></i>
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPage;
