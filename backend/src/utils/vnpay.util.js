import crypto from "crypto";
import querystring from "querystring";
import moment from "moment";

// Sort object by key
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
};

// Create VNPay payment URL
const createPaymentUrl = (orderId, amount, orderInfo, ipAddr, returnUrl) => {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;

  if (!tmnCode || !secretKey || !vnpUrl) {
    throw new Error("VNPay configuration is missing in environment variables");
  }

  const createDate = moment().format("YYYYMMDDHHmmss");
  const expireDate = moment().add(15, "minutes").format("YYYYMMDDHHmmss");

  let vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: Math.round(amount) * 100, // Ensure integer, VNPay requires amount in smallest currency unit
    vnp_ReturnUrl: returnUrl || process.env.VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // Sort parameters
  vnpParams = sortObject(vnpParams);

  console.log("VNPay params before signing:", vnpParams);

  // Create signature - use RAW values (no encoding) for signature
  const signData = Object.keys(vnpParams)
    .map(key => `${key}=${vnpParams[key]}`)
    .join('&');
  
  console.log("Sign data:", signData);
  
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnpParams.vnp_SecureHash = signed;

  // Build payment URL - encode for URL
  const paymentUrl = vnpUrl + "?" + Object.keys(vnpParams)
    .map(key => `${key}=${encodeURIComponent(vnpParams[key])}`)
    .join('&');
  
  console.log("Final payment URL:", paymentUrl);

  return paymentUrl;
};

// Verify VNPay return URL
const verifyReturnUrl = (vnpParams) => {
  const secureHash = vnpParams.vnp_SecureHash;
  const secretKey = process.env.VNPAY_HASH_SECRET;

  if (!secretKey) {
    throw new Error("VNPay secret key is missing");
  }

  // Remove hash params
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  // Sort parameters
  const sortedParams = sortObject(vnpParams);

  // Create signature
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // Verify signature
  return secureHash === signed;
};

// Parse VNPay response
const parseVNPayResponse = (vnpParams) => {
  return {
    orderId: vnpParams.vnp_TxnRef,
    amount: parseInt(vnpParams.vnp_Amount) / 100,
    orderInfo: vnpParams.vnp_OrderInfo,
    responseCode: vnpParams.vnp_ResponseCode,
    transactionNo: vnpParams.vnp_TransactionNo,
    bankCode: vnpParams.vnp_BankCode,
    payDate: vnpParams.vnp_PayDate,
    transactionStatus: vnpParams.vnp_TransactionStatus,
  };
};

// Get response message from code
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

export {
  createPaymentUrl,
  verifyReturnUrl,
  parseVNPayResponse,
  getResponseMessage,
  sortObject,
};
