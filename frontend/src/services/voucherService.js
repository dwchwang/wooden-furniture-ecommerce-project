import api from './api';

export const voucherService = {
  // Get active vouchers
  getActiveVouchers: async () => {
    return await api.get('/vouchers/active');
  },

  // Validate voucher
  validateVoucher: async (code, orderValue) => {
    return await api.post('/vouchers/validate', { code, orderValue });
  },
};

export default voucherService;
