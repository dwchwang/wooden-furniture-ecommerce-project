import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import api from '../../../services/api';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data?.order || response.data);
    } catch (error) {
      toast.error('Không tìm thấy đơn hàng');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Xác nhận cập nhật trạng thái đơn hàng?`)) return;

    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { orderStatus: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchOrder();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const statusFlow = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.orderStatus);
  const nextStatus = statusFlow[currentIndex + 1];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.orderNumber}</h1>
          <p className="text-gray-600 mt-1">
            Đặt {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: vi })}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Sản phẩm ({order.items.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn giá
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={item.product?.images?.[0] || '/placeholder.png'}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                              {item.product?.name}
                            </p>
                            {item.variant && (
                              <p className="text-xs text-gray-500">
                                {item.variant.color} - {item.variant.size}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 whitespace-nowrap">
                          {item.price.toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-900">x{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200 mx-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium text-gray-900">{order.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-gray-900">{order.shippingFee.toLocaleString('vi-VN')}đ</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="font-medium text-green-600">-{order.discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="py-3 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-xl font-bold text-[#a67c52]">{order.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Địa chỉ giao hàng</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-gray-600">{order.shippingAddress.email}</p>
              <p className="text-gray-600">
                {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
              </p>
              {order.shippingAddress.note && (
                <p className="text-gray-600 italic">Ghi chú: {order.shippingAddress.note}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Trạng thái đơn hàng</h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                  {order.orderStatus === 'pending' && 'Chờ xử lý'}
                  {order.orderStatus === 'confirmed' && 'Đã xác nhận'}
                  {order.orderStatus === 'processing' && 'Đang xử lý'}
                  {order.orderStatus === 'shipping' && 'Đang giao'}
                  {order.orderStatus === 'delivered' && 'Đã giao'}
                  {order.orderStatus === 'cancelled' && 'Đã hủy'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Thanh toán:</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${(order.paymentStatus === 'paid' || (order.orderStatus === 'delivered' && order.paymentMethod === 'COD')) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {(order.paymentStatus === 'paid' || (order.orderStatus === 'delivered' && order.paymentMethod === 'COD')) ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>

            {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && nextStatus && (
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={updating}
                className="w-full px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors disabled:opacity-50"
              >
                {updating ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : (
                  <>
                    Chuyển sang: {
                      nextStatus === 'confirmed' && 'Đã xác nhận' ||
                      nextStatus === 'processing' && 'Đang xử lý' ||
                      nextStatus === 'shipping' && 'Đang giao' ||
                      nextStatus === 'delivered' && 'Đã giao'
                    }
                  </>
                )}
              </button>
            )}

            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={updating}
                className="w-full mt-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin thanh toán</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'COD' && 'Thanh toán khi nhận hàng (COD)'}
                  {order.paymentMethod === 'VNPay' && 'Thanh toán VNPay'}
                </span>
              </div>
              {order.paymentInfo && (
                <>
                  {order.paymentInfo.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã GD:</span>
                      <span className="text-gray-900 font-mono text-xs">{order.paymentInfo.transactionId}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
