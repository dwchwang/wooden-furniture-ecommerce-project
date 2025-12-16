import api from "./api";

const paymentService = {
  // Create VNPay payment URL
  createVNPayPayment: async (orderId) => {
    const response = await api.post("/payments/vnpay/create", { orderId });
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },
};

export { paymentService };
