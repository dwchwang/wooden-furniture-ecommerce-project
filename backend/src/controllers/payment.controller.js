import Order from "../models/order.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  createPaymentUrl,
  verifyReturnUrl,
  parseVNPayResponse,
  getResponseMessage,
} from "../utils/vnpay.util.js";

// Create VNPay payment
const createVNPayPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required");
  }

  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to pay for this order");
  }

  // Check if order is already paid
  if (order.paymentStatus === "paid") {
    throw new ApiError(400, "Order is already paid");
  }

  // Check if payment method is VNPay
  if (order.paymentMethod !== "VNPay") {
    throw new ApiError(400, "Order payment method is not VNPay");
  }

  // Get client IP
  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  // Create payment URL
  const orderInfo = `Thanh toan don hang ${order.orderNumber}`;
  const paymentUrl = createPaymentUrl(
    order.orderNumber,
    order.total,
    orderInfo,
    ipAddr
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { paymentUrl }, "Payment URL created successfully")
    );
});

// Handle VNPay return
const vnpayReturn = asyncHandler(async (req, res) => {
  const vnpParams = req.query;

  // Verify signature
  const isValid = verifyReturnUrl(vnpParams);
  if (!isValid) {
    throw new ApiError(400, "Invalid signature");
  }

  // Parse response
  const paymentData = parseVNPayResponse(vnpParams);
  const message = getResponseMessage(paymentData.responseCode);

  // Find order
  const order = await Order.findOne({ orderNumber: paymentData.orderId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Update order based on response code
  if (paymentData.responseCode === "00") {
    // Payment successful
    order.paymentStatus = "paid";
    order.vnpayTransactionId = paymentData.transactionNo;
    order.orderStatus = "processing";
    await order.save();

    // Redirect to success page (frontend will handle this)
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?orderId=${order._id}&transactionNo=${paymentData.transactionNo}`
    );
  } else {
    // Payment failed
    order.paymentStatus = "failed";
    await order.save();

    // Redirect to failure page
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?orderId=${order._id}&message=${encodeURIComponent(message)}`
    );
  }
});

// Handle VNPay IPN (Instant Payment Notification)
const vnpayIPN = asyncHandler(async (req, res) => {
  const vnpParams = req.query;

  // Verify signature
  const isValid = verifyReturnUrl(vnpParams);
  if (!isValid) {
    return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
  }

  // Parse response
  const paymentData = parseVNPayResponse(vnpParams);

  // Find order
  const order = await Order.findOne({ orderNumber: paymentData.orderId });
  if (!order) {
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }

  // Check if order is already updated
  if (order.paymentStatus === "paid") {
    return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
  }

  // Update order based on response code
  if (paymentData.responseCode === "00") {
    order.paymentStatus = "paid";
    order.vnpayTransactionId = paymentData.transactionNo;
    order.orderStatus = "processing";
    await order.save();

    return res.status(200).json({ RspCode: "00", Message: "Success" });
  } else {
    order.paymentStatus = "failed";
    await order.save();

    return res.status(200).json({ RspCode: "00", Message: "Success" });
  }
});

// Check payment status
const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check authorization
  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not authorized to view this order");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        vnpayTransactionId: order.vnpayTransactionId,
      },
      "Payment status fetched successfully"
    )
  );
});

export { createVNPayPayment, vnpayReturn, vnpayIPN, checkPaymentStatus };
