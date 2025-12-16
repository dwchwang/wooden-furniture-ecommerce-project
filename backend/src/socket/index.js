import { Server } from "socket.io";
import Message from "../models/message.model.js";
import User from "../models/user.models.js";

let io;

// Initialize Socket.io
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Store online users
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their ID
    socket.on("join", async (userId) => {
      try {
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        // Store user socket
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;

        // Join user's personal room
        socket.join(userId);

        // Notify user they're connected
        socket.emit("connected", {
          message: "Connected to chat",
          userId: userId,
        });

        // Notify admins if user is customer
        if (user.role === "customer") {
          const admins = await User.find({ role: "admin" });
          admins.forEach((admin) => {
            const adminSocketId = onlineUsers.get(admin._id.toString());
            if (adminSocketId) {
              io.to(adminSocketId).emit("userOnline", {
                userId: userId,
                userName: user.fullName,
              });
            }
          });
        }

        console.log(`User ${userId} joined chat`);
      } catch (error) {
        console.error("Join error:", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // Send message
    socket.on("sendMessage", async (data) => {
      try {
        const { receiverId, content } = data;
        const senderId = socket.userId;

        if (!senderId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        if (!content || content.trim() === "") {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        // Determine receiver (if not specified, send to admin)
        let finalReceiverId = receiverId;
        if (!finalReceiverId) {
          const admin = await User.findOne({ role: "admin" });
          if (!admin) {
            socket.emit("error", { message: "No admin available" });
            return;
          }
          finalReceiverId = admin._id.toString();
        }

        // Save message to database
        const message = await Message.create({
          sender: senderId,
          receiver: finalReceiverId,
          content: content.trim(),
        });

        // Populate message
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "fullName avatar")
          .populate("receiver", "fullName avatar");

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(finalReceiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", populatedMessage);
        }

        // Send confirmation to sender
        socket.emit("messageSent", populatedMessage);

        console.log(`Message sent from ${senderId} to ${finalReceiverId}`);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Mark message as read
    socket.on("markAsRead", async (messageId) => {
      try {
        const userId = socket.userId;
        if (!userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Only receiver can mark as read
        if (message.receiver.toString() !== userId) {
          socket.emit("error", { message: "Not authorized" });
          return;
        }

        message.isRead = true;
        await message.save();

        // Notify sender
        const senderSocketId = onlineUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageRead", {
            messageId: messageId,
            readBy: userId,
          });
        }

        socket.emit("markedAsRead", { messageId: messageId });
      } catch (error) {
        console.error("Mark as read error:", error);
        socket.emit("error", { message: "Failed to mark as read" });
      }
    });

    // User is typing
    socket.on("typing", (receiverId) => {
      const senderId = socket.userId;
      if (!senderId) return;

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { userId: senderId });
      }
    });

    // User stopped typing
    socket.on("stopTyping", (receiverId) => {
      const senderId = socket.userId;
      if (!senderId) return;

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { userId: senderId });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);

        // Notify admins if user was customer
        try {
          const user = await User.findById(userId);
          if (user && user.role === "customer") {
            const admins = await User.find({ role: "admin" });
            admins.forEach((admin) => {
              const adminSocketId = onlineUsers.get(admin._id.toString());
              if (adminSocketId) {
                io.to(adminSocketId).emit("userOffline", {
                  userId: userId,
                  userName: user.fullName,
                });
              }
            });
          }
        } catch (error) {
          console.error("Disconnect notification error:", error);
        }

        console.log(`User ${userId} disconnected`);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Get Socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Emit event to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};
