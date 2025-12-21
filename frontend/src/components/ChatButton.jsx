import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import CustomerChatModal from './CustomerChatModal';
import socketService from '../services/socketService';

const ChatButton = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Only show for customers
  if (!isAuthenticated || !user || user.role === 'admin' || user.role === 'staff') {
    return null;
  }

  useEffect(() => {
    // Connect socket when component mounts
    if (user?._id) {
      socketService.connect(user._id);
    }

    // Listen for new messages
    socketService.onNewMessage((data) => {
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [user, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#a67c52] hover:bg-[#8b653d] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        style={{
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <i className="ri-message-3-line text-2xl"></i>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat hỗ trợ
        </span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <CustomerChatModal
          isOpen={isOpen}
          onClose={handleClose}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
};

export default ChatButton;
