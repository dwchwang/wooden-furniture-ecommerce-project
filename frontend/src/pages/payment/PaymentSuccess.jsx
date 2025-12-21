import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentService } from "../../services/paymentService";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const orderId = searchParams.get("orderId");
  const transactionNo = searchParams.get("transactionNo");

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Navigate when countdown reaches 0
  useEffect(() => {
    if (countdown <= 0) {
      navigate(`/orders/${orderId}`);
    }
  }, [countdown, orderId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-5xl text-green-600"></i>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Thanh Toán Thành Công!
        </h2>
        <p className="text-gray-600 mb-6">
          Đơn hàng của bạn đã được thanh toán thành công qua VNPay
        </p>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Mã giao dịch:</span>
            <span className="text-sm font-semibold">{transactionNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Mã đơn hàng:</span>
            <span className="text-sm font-semibold">{orderId}</span>
          </div>
        </div>

        {/* Countdown */}
        <p className="text-sm text-gray-500 mb-6">
          Tự động chuyển đến trang đơn hàng trong {countdown} giây...
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="w-full px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] font-semibold"
          >
            Xem Chi Tiết Đơn Hàng
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Tiếp Tục Mua Sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
