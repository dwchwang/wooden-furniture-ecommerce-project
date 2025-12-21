import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const VouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    isActive: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
  });

  useEffect(() => {
    fetchVouchers();
  }, [filters.page, filters.isActive]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchVouchers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          cleanFilters[key] = filters[key];
        }
      });

      const response = await api.get('/vouchers', { params: cleanFilters });
      const vouchersData = response.data?.vouchers || [];

      setVouchers(vouchersData);
      setPagination(response.data?.pagination || pagination);

      // Calculate stats
      const now = new Date();
      const total = vouchersData.length;
      const active = vouchersData.filter(v =>
        v.isActive && new Date(v.startDate) <= now && new Date(v.endDate) >= now
      ).length;
      const expired = vouchersData.filter(v => new Date(v.endDate) < now).length;
      const upcoming = vouchersData.filter(v => new Date(v.startDate) > now).length;

      setStats({ total, active, expired, upcoming });
    } catch (error) {
      toast.error('Lỗi khi tải voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa voucher này?')) return;

    try {
      await api.delete(`/vouchers/${id}`);
      toast.success('Xóa voucher thành công');
      fetchVouchers();
    } catch (error) {
      toast.error('Lỗi khi xóa voucher');
    }
  };

  const toggleStatus = async (voucher) => {
    try {
      await api.patch(`/vouchers/${voucher._id}`, {
        isActive: !voucher.isActive
      });
      toast.success(`${voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} voucher thành công`);
      fetchVouchers();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const getVoucherStatus = (voucher) => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);

    if (!voucher.isActive) {
      return { text: 'Vô hiệu', color: 'bg-gray-100 text-gray-700', icon: 'ri-close-circle-line' };
    }
    if (now < start) {
      return { text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700', icon: 'ri-time-line' };
    }
    if (now > end) {
      return { text: 'Hết hạn', color: 'bg-red-100 text-red-700', icon: 'ri-error-warning-line' };
    }
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { text: 'Đã hết lượt', color: 'bg-orange-100 text-orange-700', icon: 'ri-forbid-line' };
    }
    return { text: 'Đang hoạt động', color: 'bg-green-100 text-green-700', icon: 'ri-check-line' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDiscountDisplay = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    }
    return `${voucher.discountValue.toLocaleString('vi-VN')}đ`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Voucher</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý mã giảm giá</p>
        </div>
        <Link
          to="/admin/vouchers/new"
          className="px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Tạo voucher mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Tổng voucher</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-coupon-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đang hoạt động</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-check-double-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Sắp diễn ra</p>
              <p className="text-3xl font-bold mt-2">{stats.upcoming}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-time-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Hết hạn</p>
              <p className="text-3xl font-bold mt-2">{stats.expired}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-error-warning-line text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Tìm kiếm mã voucher, mô tả..."
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-circle-fill text-xl"></i>
                </button>
              )}
            </div>
          </div>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
          >
            <option value="">🎫 Tất cả trạng thái</option>
            <option value="true">✅ Đang kích hoạt</option>
            <option value="false">❌ Vô hiệu hóa</option>
          </select>
        </div>

        {/* Search Results Indicator */}
        {filters.search && (
          <div className="mt-4 text-sm text-gray-600">
            Tìm thấy <span className="font-medium text-gray-900">{vouchers.length}</span> kết quả cho "{filters.search}"
          </div>
        )}
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md text-center py-16">
          <i className="ri-coupon-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg mb-4">Chưa có voucher nào</p>
          <Link
            to="/admin/vouchers/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors"
          >
            <i className="ri-add-line"></i>
            Tạo voucher đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vouchers.map((voucher) => {
            const status = getVoucherStatus(voucher);
            const usagePercent = voucher.usageLimit
              ? (voucher.usedCount / voucher.usageLimit) * 100
              : 0;

            return (
              <div
                key={voucher._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Header with Code */}
                <div className="bg-gradient-to-r from-[#a67c52] to-[#8b653d] p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-coupon-3-line text-2xl"></i>
                        <h3 className="text-2xl font-bold tracking-wider">{voucher.code}</h3>
                      </div>
                      {voucher.description && (
                        <p className="text-sm text-white text-opacity-90 line-clamp-2">
                          {voucher.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Discount Badge */}
                  <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-xs text-black text-opacity-80 mb-1">Giảm giá</p>
                    <p className="text-3xl font-bold text-black">{getDiscountDisplay(voucher)}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                      <i className={status.icon}></i>
                      {status.text}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStatus(voucher)}
                        className={`p-2 rounded-lg transition-colors ${voucher.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        title={voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        <i className={`ri-toggle-${voucher.isActive ? 'fill' : 'line'} text-xl`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <i className="ri-calendar-line"></i>
                        Bắt đầu
                      </span>
                      <span className="font-medium text-gray-900">{formatDate(voucher.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <i className="ri-calendar-check-line"></i>
                        Kết thúc
                      </span>
                      <span className="font-medium text-gray-900">{formatDate(voucher.endDate)}</span>
                    </div>
                    {voucher.minOrderValue > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <i className="ri-shopping-cart-line"></i>
                          Đơn tối thiểu
                        </span>
                        <span className="font-medium text-gray-900">
                          {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    {voucher.maxDiscountAmount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <i className="ri-price-tag-3-line"></i>
                          Giảm tối đa
                        </span>
                        <span className="font-medium text-gray-900">
                          {voucher.maxDiscountAmount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Usage Progress */}
                  {voucher.usageLimit && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Đã sử dụng</span>
                        <span className="font-medium text-gray-900">
                          {voucher.usedCount} / {voucher.usageLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${usagePercent >= 100 ? 'bg-red-500' :
                            usagePercent >= 80 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      to={`/admin/vouchers/edit/${voucher._id}`}
                      className="flex-1 py-2 px-4 border border-[#a67c52] text-[#a67c52] rounded-lg hover:bg-[#a67c52] hover:text-white transition-colors text-center font-medium flex items-center justify-center gap-2"
                    >
                      <i className="ri-edit-line"></i>
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(voucher._id)}
                      className="flex-1 py-2 px-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <i className="ri-delete-bin-line"></i>
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VouchersPage;
