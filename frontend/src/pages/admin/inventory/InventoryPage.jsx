import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const InventoryPage = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    stockStatus: '',
    page: 1,
    limit: 20
  });
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    operation: 'increase',
    quantity: '',
    reason: ''
  });
  const [stats, setStats] = useState({
    totalVariants: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchInventory();
  }, [filters]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: { limit: 100, isActive: undefined }
      });

      const products = response.data?.products || [];

      let allVariants = [];
      products.forEach(product => {
        if (product.variants && product.variants.length > 0) {
          const variantsWithProduct = product.variants.map(v => ({
            ...v,
            productName: product.name,
            productId: product._id,
            productImage: product.images?.[0]
          }));
          allVariants = [...allVariants, ...variantsWithProduct];
        }
      });

      let filteredVariants = allVariants;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredVariants = filteredVariants.filter(v =>
          v.sku?.toLowerCase().includes(searchLower) ||
          v.productName?.toLowerCase().includes(searchLower) ||
          v.color?.toLowerCase().includes(searchLower) ||
          v.size?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.stockStatus === 'low') {
        filteredVariants = filteredVariants.filter(v => v.stock > 0 && v.stock <= 10);
      } else if (filters.stockStatus === 'out') {
        filteredVariants = filteredVariants.filter(v => v.stock === 0);
      }

      const totalVariants = allVariants.length;
      const lowStock = allVariants.filter(v => v.stock > 0 && v.stock <= 10).length;
      const outOfStock = allVariants.filter(v => v.stock === 0).length;
      const totalValue = allVariants.reduce((sum, v) => sum + (v.price * v.stock), 0);

      setStats({ totalVariants, lowStock, outOfStock, totalValue });
      setVariants(filteredVariants);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (variant) => {
    setSelectedVariant(variant);
    setAdjustmentData({
      operation: 'increase',
      quantity: '',
      reason: ''
    });
    setShowAdjustModal(true);
  };

  const submitStockAdjustment = async () => {
    if (!adjustmentData.quantity || adjustmentData.quantity <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    try {
      await api.patch(`/products/variants/${selectedVariant._id}/stock`, {
        quantity: parseInt(adjustmentData.quantity),
        operation: adjustmentData.operation
      });

      toast.success('Cập nhật tồn kho thành công');
      setShowAdjustModal(false);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật tồn kho');
    }
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockBg = (stock) => {
    if (stock === 0) return 'bg-red-50 border-red-200';
    if (stock <= 10) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho hàng</h1>
        <p className="text-gray-600 mt-1">Theo dõi và quản lý tồn kho sản phẩm</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng biến thể</p>
              <p className="text-3xl font-bold mt-2">{stats.totalVariants}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-archive-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Sắp hết hàng</p>
              <p className="text-3xl font-bold mt-2">{stats.lowStock}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-alert-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Hết hàng</p>
              <p className="text-3xl font-bold mt-2">{stats.outOfStock}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-close-circle-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Giá trị kho</p>
              <p className="text-3xl font-bold mt-2">{(stats.totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-3xl"></i>
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
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Tìm kiếm SKU, sản phẩm, màu sắc, kích thước..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filters.stockStatus}
            onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
          >
            <option value="">📦 Tất cả trạng thái</option>
            <option value="low">⚠️ Sắp hết hàng</option>
            <option value="out">❌ Hết hàng</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
        </div>
      ) : variants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md text-center py-16">
          <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">Không tìm thấy biến thể nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {variants.map((variant) => (
            <div
              key={variant._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Product Image & Name */}
              <div className="relative h-48 bg-gray-100">
                {variant.productImage ? (
                  <img
                    src={variant.productImage}
                    alt={variant.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-image-line text-6xl text-gray-300"></i>
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border ${getStockBg(variant.stock)}`}>
                  <span className={`text-sm font-bold ${getStockColor(variant.stock)}`}>
                    {variant.stock === 0 ? 'Hết hàng' : variant.stock <= 10 ? 'Sắp hết' : 'Còn hàng'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{variant.productName}</h3>

                {/* SKU */}
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-barcode-line text-gray-400"></i>
                  <span className="text-sm font-mono text-gray-600">{variant.sku}</span>
                </div>

                {/* Color & Size */}
                <div className="flex items-center gap-3 mb-4">
                  {variant.color && (
                    <div className="flex items-center gap-1">
                      <i className="ri-palette-line text-gray-400 text-sm"></i>
                      <span className="text-sm text-gray-700">{variant.color}</span>
                    </div>
                  )}
                  {variant.size && (
                    <div className="flex items-center gap-1">
                      <i className="ri-ruler-line text-gray-400 text-sm"></i>
                      <span className="text-sm text-gray-700">{variant.size}</span>
                    </div>
                  )}
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Giá bán</p>
                    <p className="text-lg font-bold text-[#a67c52]">
                      {variant.price?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tồn kho</p>
                    <p className={`text-2xl font-bold ${getStockColor(variant.stock)}`}>
                      {variant.stock}
                    </p>
                  </div>
                </div>

                {/* Inventory Value */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Giá trị tồn kho</span>
                  <span className="text-sm font-bold text-gray-900">
                    {(variant.price * variant.stock).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAdjustStock(variant)}
                  className="w-full py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <i className="ri-edit-line"></i>
                  Điều chỉnh tồn kho
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedVariant && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Điều chỉnh tồn kho</h3>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {selectedVariant.productImage && (
                  <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={selectedVariant.productImage}
                      alt={selectedVariant.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 line-clamp-1">{selectedVariant.productName}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedVariant.sku}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Current Stock */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 mb-1">Tồn kho hiện tại</p>
                <p className="text-3xl font-bold text-blue-900">{selectedVariant.stock}</p>
              </div>

              {/* Operation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại điều chỉnh</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustmentData({ ...adjustmentData, operation: 'increase' })}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${adjustmentData.operation === 'increase'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <i className="ri-add-line mr-2"></i>
                    Nhập kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentData({ ...adjustmentData, operation: 'decrease' })}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${adjustmentData.operation === 'decrease'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <i className="ri-subtract-line mr-2"></i>
                    Xuất kho
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent text-lg"
                  placeholder="Nhập số lượng"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lý do (tùy chọn)</label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                  placeholder="Nhập lý do điều chỉnh..."
                />
              </div>

              {/* Preview Result */}
              {adjustmentData.quantity && (
                <div className={`rounded-xl p-4 border-2 ${adjustmentData.operation === 'increase'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                  }`}>
                  <p className={`text-sm font-medium ${adjustmentData.operation === 'increase' ? 'text-green-800' : 'text-red-800'
                    }`}>
                    Tồn kho sau điều chỉnh
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${adjustmentData.operation === 'increase' ? 'text-green-900' : 'text-red-900'
                    }`}>
                    {adjustmentData.operation === 'increase'
                      ? selectedVariant.stock + parseInt(adjustmentData.quantity)
                      : selectedVariant.stock - parseInt(adjustmentData.quantity)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitStockAdjustment}
                className="flex-1 px-4 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors font-medium"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
