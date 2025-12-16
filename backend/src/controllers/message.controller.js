import Message from "../models/message.model.js";
import User from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { validateRequiredFields } from "../validations/common.validation.js";

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, content } = req.body;

  // Validate required fields
  validateRequiredFields(["content"], req.body);

  // If receiver not specified, send to admin (first admin user)
  let receiverId = receiver;
  if (!receiverId) {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      throw new ApiError(404, "No admin available to receive messages");
    }
    receiverId = admin._id;
  } else {
    // Check if receiver exists
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      throw new ApiError(404, "Receiver not found");
    }
  }

  // Create message
  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "fullName avatar")
    .populate("receiver", "fullName avatar");

  // TODO: Emit socket event for real-time messaging
  // io.to(receiverId).emit("newMessage", populatedMessage);

  return res
    .status(201)
    .json(
      new ApiResponse(201, { message: populatedMessage }, "Message sent successfully")
    );
});

// Get conversation between two users
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  // Get messages between current user and specified user
  const filter = {
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const messages = await Message.find(filter)
    .populate("sender", "fullName avatar")
    .populate("receiver", "fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Message.countDocuments(filter);

  // Mark messages as read if they are sent to current user
  await Message.updateMany(
    {
      sender: userId,
      receiver: req.user._id,
      isRead: false,
    },
    { isRead: true }
  );

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
      "Conversation fetched successfully"
    )
  );
});

// Get all conversations (Admin only - list all users with messages)
const getAllConversations = asyncHandler(async (req, res) => {
  // Get all unique users who have sent messages
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", req.user._id] },
            "$receiver",
            "$sender",
          ],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiver", req.user._id] },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        user: {
          _id: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
        },
        lastMessage: {
          content: 1,
          createdAt: 1,
          isRead: 1,
        },
        unreadCount: 1,
      },
    },
    {
      $sort: { "lastMessage.createdAt": -1 },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { conversations },
        "Conversations fetched successfully"
      )
    );
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Only receiver can mark as read
  if (message.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to mark this message as read");
  }

  message.isRead = true;
  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { message }, "Message marked as read"));
});

// Get unread message count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    isRead: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { unreadCount: count }, "Unread count fetched successfully")
    );
});

export {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  getUnreadCount,
};
