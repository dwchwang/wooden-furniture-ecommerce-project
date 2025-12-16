import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { formatPrice, formatDate } from "../../utils/helpers";
import { toast } from "react-toastify";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      setOrder(response.data.order);
    } catch (error) {
      toast.error(error.message || "Failed to fetch order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await orderService.cancelOrder(id);
      toast.success("Order cancelled successfully");
      fetchOrderDetail(); // Refresh order details
    } catch (error) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipping: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusSteps = () => {
    const steps = [
      { key: "pending", label: "Đã Đặt Hàng" },
      { key: "confirmed", label: "Đã Xác Nhận" },
      { key: "processing", label: "Đang Xử Lý" },
      { key: "shipping", label: "Đang Giao" },
      { key: "delivered", label: "Đã Giao" },
    ];

    const currentIndex = steps.findIndex((s) => s.key === order?.orderStatus);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a67c52]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Không tìm thấy đơn hàng</h2>
          <Link
            to="/orders"
            className="px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d]"
          >
            Quay Lại Danh Sách
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="section__container mt-20 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link to="/orders" className="text-[#a67c52] hover:underline mb-4 inline-block">
          ← Quay Lại Danh Sách
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Đơn Hàng #{order.orderNumber}</h2>
            <p className="text-gray-600">Đặt ngày {formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      {order.orderStatus !== "cancelled" && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-xl font-semibold mb-8">Trạng Thái Đơn Hàng</h3>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-[#a67c52] transition-all duration-500"
                style={{
                  width: `${(statusSteps.filter((s) => s.completed).length / statusSteps.length) * 100
                    }%`,
                }}
              ></div>
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${step.completed
                      ? "bg-[#a67c52] text-white shadow-lg"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                  >
                    {step.completed ? (
                      <i className="ri-check-line text-xl font-bold"></i>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-3 text-center font-medium ${step.completed ? "text-[#a67c52]" : "text-gray-500"
                      }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6">Sản Phẩm Đã Đặt</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="w-28 h-28 flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || "/placeholder.jpg"}
                      alt={item.product?.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/shop/${item.product?._id}`}
                      className="font-semibold text-lg hover:text-[#a67c52] line-clamp-2 mb-2 block"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Màu sắc:</span>
                          <span className="text-sm font-medium">{item.variant.color}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Kích thước:</span>
                          <span className="text-sm font-medium">{item.variant.size}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <span className="text-xs text-gray-500">SKU:</span>
                          <span className="text-sm font-mono">{item.variant.sku}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Số lượng: <span className="font-semibold">{item.quantity}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Đơn giá</p>
                      <p className="font-semibold text-[#a67c52]">{formatPrice(item.price)}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-1">Thành tiền</p>
                      <p className="font-bold text-lg text-[#a67c52]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Địa Chỉ Giao Hàng</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <i className="ri-user-line text-[#a67c52] text-xl mt-0.5"></i>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Người nhận</p>
                  <p className="font-semibold">{order.shippingAddress.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-phone-line text-[#a67c52] text-xl mt-0.5"></i>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-semibold">{order.shippingAddress.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-map-pin-line text-[#a67c52] text-xl mt-0.5"></i>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                  <p className="text-gray-700">
                    {order.shippingAddress.street}, {order.shippingAddress.ward}
                  </p>
                  <p className="text-gray-700">
                    {order.shippingAddress.district}, {order.shippingAddress.city}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Tóm Tắt Đơn Hàng</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-semibold">{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Tổng cộng:</span>
                <span className="font-bold text-[#a67c52]">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <span
                    className={`font-semibold ${order.paymentStatus === "paid"
                      ? "text-green-600"
                      : "text-yellow-600"
                      }`}
                  >
                    {order.paymentStatus === "paid" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                  </span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}

            {order.orderStatus === "pending" && (
              <button
                onClick={handleCancelOrder}
                className="w-full mt-6 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
              >
                Hủy Đơn Hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
