import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/product-variant.model.js";
import Voucher from "../models/voucher.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { validateRequiredFields } from "../validations/common.validation.js";
import { generateOrderNumber } from "../utils/order-number.util.js";
import mongoose from "mongoose";

// Create new order
const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    voucherCode,
    shippingFee = 0,
    paymentMethod,
    notes,
  } = req.body;

  // Validate required fields
  validateRequiredFields(["items", "shippingAddress", "paymentMethod"], req.body);
  validateRequiredFields(
    ["fullName", "phone", "street", "ward", "district", "city"],
    shippingAddress
  );

  if (!items || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate and calculate order
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const variant = await ProductVariant.findById(item.variant).session(session);
      
      if (!variant) {
        throw new ApiError(404, `Variant ${item.variant} not found`);
      }

      if (!variant.isActive) {
        throw new ApiError(400, `Variant ${variant.sku} is not available`);
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${variant.sku}. Available: ${variant.stock}`
        );
      }

      // Deduct stock
      variant.stock -= item.quantity;
      await variant.save({ session });

      const itemTotal = variant.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: variant.product,
        variant: variant._id,
        quantity: item.quantity,
        price: variant.price,
      });
    }

    // Apply voucher if provided
    let discountAmount = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({
        code: voucherCode.toUpperCase(),
      }).session(session);

      if (!voucher) {
        throw new ApiError(404, "Không tìm thấy mã giảm giá");
      }

      if (!voucher.isActive) {
        throw new ApiError(400, "Mã giảm giá không còn hiệu lực");
      }

      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new ApiError(400, "Mã giảm giá không hợp lệ vào thời điểm này");
      }

      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        throw new ApiError(400, "Mã giảm giá đã hết lượt sử dụng");
      }

      if (subtotal < voucher.minOrderValue) {
        throw new ApiError(
          400,
          `Minimum order value for this voucher is ${voucher.minOrderValue}`
        );
      }

      // Calculate discount
      if (voucher.discountType === "percentage") {
        discountAmount = (subtotal * voucher.discountValue) / 100;
        if (
          voucher.maxDiscountAmount &&
          discountAmount > voucher.maxDiscountAmount
        ) {
          discountAmount = voucher.maxDiscountAmount;
        }
      } else {
        discountAmount = voucher.discountValue;
      }

      // Increment voucher usage
      voucher.usedCount += 1;
      await voucher.save({ session });
    }

    // Calculate total
    const total = subtotal - discountAmount + shippingFee;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await Order.create(
      [
        {
          user: req.user._id,
          orderNumber,
          items: orderItems,
          shippingAddress,
          subtotal,
          discount: discountAmount,
          shippingFee,
          total,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "pending" : "pending",
          notes,
        },
      ],
      { session }
    );

    // Update soldCount for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { soldCount: item.quantity } },
        { session }
      );
    }

    // Commit transaction
    await session.commitTransaction();

    // Populate order
    const populatedOrder = await Order.findById(order[0]._id)
      .populate("user", "fullName email phone")
      .populate({
        path: "items.product",
        select: "name slug images",
      })
      .populate({
        path: "items.variant",
        select: "sku color size",
      });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { order: populatedOrder }, "Order created successfully")
      );
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Get user's orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { user: req.user._id };
  if (status) {
    filter.orderStatus = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(filter)
    .populate({
      path: "items.product",
      select: "name slug images",
    })
    .populate({
      path: "items.variant",
      select: "sku color size",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Orders fetched successfully"
    )
  );
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate("user", "fullName email phone")
    .populate({
      path: "items.product",
      select: "name slug images",
    })
    .populate({
      path: "items.variant",
      select: "sku color size",
    });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check authorization (user can only view their own orders, admin/staff can view all)
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "staff"
  ) {
    throw new ApiError(403, "Not authorized to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, "Order fetched successfully"));
});

// Get all orders (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    orderStatus,
    paymentStatus,
    paymentMethod,
    search,
  } = req.query;

  const filter = {};
  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  
  // Add search functionality
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(filter)
    .populate("user", "fullName email phone")
    .populate({
      path: "items.product",
      select: "name slug category",
      populate: {
        path: "category",
        select: "name"
      }
    })
    .populate({
      path: "items.variant",
      select: "sku color size",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Orders fetched successfully"
    )
  );
});

// Update order status (Admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (orderStatus !== undefined) {
    // Validate status transition
    if (order.orderStatus === "cancelled") {
      throw new ApiError(400, "Cannot update status of cancelled order");
    }
    if (order.orderStatus === "delivered") {
      throw new ApiError(400, "Cannot update status of delivered order");
    }
    order.orderStatus = orderStatus;
  }

  if (paymentStatus !== undefined) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  const updatedOrder = await Order.findById(id)
    .populate("user", "fullName email phone")
    .populate({
      path: "items.product",
      select: "name slug images",
    })
    .populate({
      path: "items.variant",
      select: "sku color size",
    });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { order: updatedOrder }, "Order status updated successfully")
    );
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check authorization
  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "staff"
  ) {
    throw new ApiError(403, "Not authorized to cancel this order");
  }

  // Can only cancel pending orders
  if (order.orderStatus !== "pending") {
    throw new ApiError(400, "Can only cancel pending orders");
  }

  // Start session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Restore stock
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.variant).session(session);
      if (variant) {
        variant.stock += item.quantity;
        await variant.save({ session });
      }
    }

    // Restore voucher usage if applicable
    if (order.voucher && order.voucher.code) {
      const voucher = await Voucher.findOne({
        code: order.voucher.code,
      }).session(session);
      if (voucher && voucher.usedCount > 0) {
        voucher.usedCount -= 1;
        await voucher.save({ session });
      }
    }

    // Decrease soldCount for each product
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { soldCount: -item.quantity } },
        { session }
      );
    }

    // Update order status
    order.orderStatus = "cancelled";
    await order.save({ session });

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, { order }, "Order cancelled successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Get order statistics (Admin only)
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] },
        },
        shippingOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "shipping"] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
        },
        paidOrders: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
        },
        averageOrderValue: { $avg: "$total" },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { stats: stats[0] || {} },
        "Order statistics fetched successfully"
      )
    );
});

export {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
};
