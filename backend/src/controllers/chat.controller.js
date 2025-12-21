import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

// Get or create conversation for customer
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  // Find existing open conversation
  let conversation = await Conversation.findOne({
    customer: customerId,
    status: { $in: ["open", "assigned"] },
  })
    .populate("customer", "fullName email avatar")
    .populate("assignedTo", "fullName email avatar")
    .populate("lastMessage");

  // Create new conversation if none exists
  if (!conversation) {
    conversation = await Conversation.create({
      customer: customerId,
      status: "open",
    });

    conversation = await Conversation.findById(conversation._id)
      .populate("customer", "fullName email avatar")
      .populate("assignedTo", "fullName email avatar");

    // Create welcome message
    const welcomeMessage = await Message.create({
      conversation: conversation._id,
      sender: customerId,
      content: "Xin chào! Tôi cần hỗ trợ.",
      type: "system",
      isRead: false,
    });

    conversation.lastMessage = welcomeMessage._id;
    conversation.unreadCount.staff = 1;
    await conversation.save();
  }

  return res.status(200).json(
    new ApiResponse(200, { conversation }, "Conversation retrieved successfully")
  );
});

// Get all conversations (Admin/Staff)
const getAllConversations = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  // Role-based filtering
  if (req.user.role === "staff") {
    // Staff only see:
    // 1. Unassigned conversations (open status, no assignedTo)
    // 2. Conversations assigned to them
    filter.$or = [
      { status: "open", assignedTo: null },
      { assignedTo: req.user._id }
    ];
  }
  // Admin sees all conversations (no additional filter)

  const conversations = await Conversation.find(filter)
    .populate("customer", "fullName email avatar")
    .populate("assignedTo", "fullName email avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { conversations }, "Conversations fetched successfully")
  );
});

// Get conversation by ID
const getConversationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await Conversation.findById(id)
    .populate("customer", "fullName email avatar")
    .populate("assignedTo", "fullName email avatar")
    .populate("lastMessage");

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Check permission
  const isCustomer = req.user._id.toString() === conversation.customer._id.toString();
  const isStaff = req.user.role === "admin" || req.user.role === "staff";

  if (!isCustomer && !isStaff) {
    throw new ApiError(403, "Access denied");
  }

  return res.status(200).json(
    new ApiResponse(200, { conversation }, "Conversation fetched successfully")
  );
});

// Get messages for a conversation
const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Check permission
  const isCustomer = req.user._id.toString() === conversation.customer.toString();
  const isStaff = req.user.role === "admin" || req.user.role === "staff";

  if (!isCustomer && !isStaff) {
    throw new ApiError(403, "Access denied");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const messages = await Message.find({ conversation: id })
    .populate("sender", "fullName avatar role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Message.countDocuments({ conversation: id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Messages fetched successfully"
    )
  );
});

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Check permission
  const isCustomer = req.user._id.toString() === conversation.customer.toString();
  const isAdmin = req.user.role === "admin";
  const isStaff = req.user.role === "staff";

  if (!isCustomer && !isAdmin && !isStaff) {
    throw new ApiError(403, "Access denied");
  }

  // If staff (not admin), check if conversation is assigned
  if (isStaff && !isAdmin) {
    if (conversation.assignedTo && conversation.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "This conversation is assigned to another staff member");
    }

    // Auto-assign if not assigned yet
    if (!conversation.assignedTo) {
      conversation.assignedTo = req.user._id;
      conversation.status = "assigned";
    }
  }

  // Create message
  const message = await Message.create({
    conversation: id,
    sender: req.user._id,
    content: content.trim(),
    type: "text",
  });

  // Update conversation
  conversation.lastMessage = message._id;
  conversation.updatedAt = new Date();

  // Update unread count
  if (isCustomer) {
    conversation.unreadCount.staff += 1;
  } else {
    conversation.unreadCount.customer += 1;
  }

  await conversation.save();

  // Populate message and conversation
  await message.populate("sender", "fullName avatar role");
  await conversation.populate("assignedTo", "fullName email avatar");

  return res.status(201).json(
    new ApiResponse(201, { message, conversation }, "Message sent successfully")
  );
});

// Mark messages as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Check permission
  const isCustomer = req.user._id.toString() === conversation.customer.toString();
  const isStaff = req.user.role === "admin" || req.user.role === "staff";

  if (!isCustomer && !isStaff) {
    throw new ApiError(403, "Access denied");
  }

  // Mark messages as read
  await Message.updateMany(
    {
      conversation: id,
      sender: { $ne: req.user._id },
      isRead: false,
    },
    { isRead: true }
  );

  // Reset unread count
  if (isCustomer) {
    conversation.unreadCount.customer = 0;
  } else {
    conversation.unreadCount.staff = 0;
  }

  await conversation.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Messages marked as read")
  );
});

// Assign conversation to staff
const assignConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { staffId } = req.body;

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  conversation.assignedTo = staffId || req.user._id;
  conversation.status = "assigned";
  await conversation.save();

  await conversation.populate("assignedTo", "fullName email avatar");

  return res.status(200).json(
    new ApiResponse(200, { conversation }, "Conversation assigned successfully")
  );
});

// Update conversation status
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["open", "assigned", "resolved", "closed"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  conversation.status = status;
  await conversation.save();

  return res.status(200).json(
    new ApiResponse(200, { conversation }, "Status updated successfully")
  );
});

export {
  getOrCreateConversation,
  getAllConversations,
  getConversationById,
  getMessages,
  sendMessage,
  markAsRead,
  assignConversation,
  updateStatus,
};
