import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import { toast } from 'react-toastify';

const CustomerChatModal = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      socketService.joinConversation(conversation._id);
      socketService.markAsRead(conversation._id);

      // Listen for new messages
      socketService.onNewMessage(handleNewMessage);
      socketService.onUserTyping(handleUserTyping);
      socketService.onUserStoppedTyping(handleUserStoppedTyping);

      return () => {
        socketService.leaveConversation(conversation._id);
      };
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await chatService.getOrCreateConversation();
      setConversation(response.data.conversation);
    } catch (error) {
      toast.error('Không thể tải cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await chatService.getMessages(conversation._id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === conversation?._id) {
      setMessages(prev => [...prev, data.message]);
      socketService.markAsRead(conversation._id);
    }
  };

  const handleUserTyping = (data) => {
    if (data.conversationId === conversation?._id && data.userId !== user._id) {
      setIsTyping(true);
    }
  };

  const handleUserStoppedTyping = (data) => {
    if (data.conversationId === conversation?._id) {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversation) return;

    try {
      setSending(true);
      socketService.sendMessage(conversation._id, newMessage.trim());
      setNewMessage('');
      socketService.stopTyping(conversation._id);
    } catch (error) {
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Typing indicator
    if (conversation) {
      socketService.typing(conversation._id);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(conversation._id);
      }, 1000);
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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#a67c52] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i className="ri-customer-service-2-line text-xl"></i>
          </div>
          <div>
            <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
            <p className="text-xs opacity-90">
              {conversation?.assignedTo ? 'Đang kết nối...' : 'Chúng tôi sẵn sàng hỗ trợ'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a67c52]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <i className="ri-chat-3-line text-5xl mb-2"></i>
            <p>Bắt đầu cuộc trò chuyện</p>
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
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <i className="ri-user-line text-xs"></i>
                        </div>
                        <span className="text-xs text-gray-600">
                          {message.sender.role === 'admin' ? 'Admin' : 'Nhân viên'}
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

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
            <span>Đang nhập...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 bg-[#a67c52] hover:bg-[#8b653d] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <i className="ri-send-plane-fill"></i>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerChatModal;
