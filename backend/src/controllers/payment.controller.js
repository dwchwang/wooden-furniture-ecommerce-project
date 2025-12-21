import Order from "../models/order.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { VNPay, ProductCode, VnpLocale } from "vnpay";

// Helper function to get VNPay instance
const getVNPayInstance = () => {
  // Validate VNPay credentials
  if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET) {
    throw new ApiError(500, "VNPay credentials are missing in environment variables");
  }

  return new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: "SHA512",
  });
};

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
  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "127.0.0.1";
  
  // Convert IPv6 localhost to IPv4
  if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
    ipAddr = "127.0.0.1";
  }

  // Get VNPay instance
  const vnpay = getVNPayInstance();

  // Create payment URL using vnpay package
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const returnUrl = `${backendUrl}/api/v1/payments/vnpay/return`;
  
  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: order.total,
    vnp_IpAddr: ipAddr,
    vnp_TxnRef: order.orderNumber,
    vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: returnUrl,
    vnp_Locale: VnpLocale.VN,
  });

  console.log("VNPay payment URL created:", paymentUrl);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { paymentUrl }, "Payment URL created successfully")
    );
});

// Helper function to verify VNPay return URL
const verifyReturnUrl = (vnpParams) => {
  try {
    const vnpay = getVNPayInstance();
    const secureHash = vnpParams.vnp_SecureHash;
    
    // Remove hash params
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;
    
    // Verify
    return vnpay.verifyReturnUrl(vnpParams, secureHash);
  } catch (error) {
    console.error("Error verifying VNPay return URL:", error);
    return false;
  }
};

// Helper function to parse VNPay response
const parseVNPayResponse = (vnpParams) => {
  return {
    orderId: vnpParams.vnp_TxnRef,
    amount: parseInt(vnpParams.vnp_Amount) / 100,
    responseCode: vnpParams.vnp_ResponseCode,
    transactionNo: vnpParams.vnp_TransactionNo,
    bankCode: vnpParams.vnp_BankCode,
    payDate: vnpParams.vnp_PayDate,
  };
};

// Helper function to get response message
const getResponseMessage = (responseCode) => {
  const messages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
    "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    "75": "Ngân hàng thanh toán đang bảo trì.",
    "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
    "99": "Các lỗi khác",
  };
  return messages[responseCode] || "Lỗi không xác định";
};

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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/payment/success?orderId=${order._id}&transactionNo=${paymentData.transactionNo}`
    );
  } else {
    // Payment failed
    order.paymentStatus = "failed";
    await order.save();

    // Redirect to failure page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/payment/failed?orderId=${order._id}&message=${encodeURIComponent(message)}`
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
