import api from './api';

export const voucherService = {
  // Get active vouchers
  getActiveVouchers: async () => {
    return await api.get('/vouchers/active');
  },

  // Validate voucher
  validateVoucher: async (code, orderTotal) => {
    return await api.post('/vouchers/validate', { code, orderTotal });
  },
};

export default voucherService;
