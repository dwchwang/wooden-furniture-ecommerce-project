import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const VoucherFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    if (isEdit) {
      fetchVoucher();
    }
  }, [id]);

  const fetchVoucher = async () => {
    try {
      console.log('Fetching voucher with ID:', id);
      const response = await api.get(`/vouchers/${id}`);
      console.log('Voucher response:', response);
      const voucher = response.data?.voucher || response.data;
      console.log('Extracted voucher:', voucher);

      setFormData({
        code: voucher.code || '',
        description: voucher.description || '',
        discountType: voucher.discountType || 'percentage',
        discountValue: voucher.discountValue || '',
        minOrderValue: voucher.minOrderValue || '',
        maxDiscountAmount: voucher.maxDiscountAmount || '',
        usageLimit: voucher.usageLimit || '',
        startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().slice(0, 16) : '',
        endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().slice(0, 16) : '',
        isActive: voucher.isActive ?? true
      });
    } catch (error) {
      console.error('Error fetching voucher:', error);
      toast.error('Lỗi khi tải voucher');
      navigate('/admin/vouchers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      };

      if (isEdit) {
        await api.patch(`/vouchers/${id}`, submitData);
        toast.success('Cập nhật voucher thành công');
      } else {
        await api.post('/vouchers', submitData);
        toast.success('Tạo voucher thành công');
      }

      navigate('/admin/vouchers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Chỉnh sửa Voucher' : 'Tạo Voucher Mới'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Cập nhật thông tin voucher' : 'Điền thông tin để tạo mã giảm giá mới'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-information-line text-[#a67c52]"></i>
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent uppercase"
                placeholder="VD: SUMMER2024"
              />
              <p className="text-xs text-gray-500 mt-1">Mã sẽ tự động chuyển thành chữ in hoa</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                placeholder="Mô tả về voucher..."
              />
            </div>
          </div>
        </div>

        {/* Discount Settings Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-percent-line text-[#a67c52]"></i>
            Cài đặt giảm giá
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                  placeholder={formData.discountType === 'percentage' ? '10' : '50000'}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {formData.discountType === 'percentage' ? '%' : 'đ'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị đơn hàng tối thiểu
              </label>
              <input
                type="number"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                placeholder="0"
              />
            </div>

            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm tối đa
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                  placeholder="Không giới hạn"
                />
              </div>
            )}
          </div>
        </div>

        {/* Usage & Duration Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-time-line text-[#a67c52]"></i>
            Thời gian & Giới hạn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới hạn số lần sử dụng
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                placeholder="Không giới hạn"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#a67c52] border-gray-300 rounded focus:ring-[#a67c52]"
                />
                <span className="text-sm font-medium text-gray-700">Kích hoạt voucher</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        {formData.code && formData.discountValue && (
          <div className="bg-gradient-to-r from-[#a67c52] to-[#8b653d] rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-white text-opacity-80 mb-3">Xem trước voucher</h3>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-black">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-2xl font-bold tracking-wider">{formData.code}</p>
                  {formData.description && (
                    <p className="text-sm text-black text-opacity-90 mt-1">{formData.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-black text-opacity-80">Giảm</p>
                  <p className="text-3xl font-bold">
                    {formData.discountType === 'percentage'
                      ? `${formData.discountValue}%`
                      : `${parseFloat(formData.discountValue || 0).toLocaleString('vi-VN')}đ`
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-black">
                {formData.minOrderValue && (
                  <div>
                    <p className="text-black text-opacity-70">Đơn tối thiểu</p>
                    <p className="font-medium">{parseFloat(formData.minOrderValue).toLocaleString('vi-VN')}đ</p>
                  </div>
                )}
                {formData.maxDiscountAmount && formData.discountType === 'percentage' && (
                  <div>
                    <p className="text-black text-opacity-70">Giảm tối đa</p>
                    <p className="font-medium">{parseFloat(formData.maxDiscountAmount).toLocaleString('vi-VN')}đ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/vouchers')}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="ri-save-line"></i>
                {isEdit ? 'Cập nhật' : 'Tạo voucher'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherFormPage;
