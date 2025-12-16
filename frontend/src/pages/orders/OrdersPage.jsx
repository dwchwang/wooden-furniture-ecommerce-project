import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { formatPrice, formatDate } from "../../utils/helpers";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.data.orders);
    } catch (error) {
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
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

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ Xác Nhận",
      confirmed: "Đã Xác Nhận",
      processing: "Đang Xử Lý",
      shipping: "Đang Giao Hàng",
      delivered: "Đã Giao Hàng",
      cancelled: "Đã Hủy",
    };
    return labels[status] || status;
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      return;
    }

    try {
      await orderService.cancelOrder(orderId);
      toast.success("Đơn hàng đã được hủy thành công");
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error(error.message || "Không thể hủy đơn hàng");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Vui lòng đăng nhập để xem đơn hàng</h2>
          <Link
            to="/login"
            className="px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d]"
          >
            Đăng Nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a67c52]"></div>
      </div>
    );
  }

  return (
    <div className="section__container mt-20 min-h-screen">
      <h2 className="text-3xl font-bold mb-8">Đơn Hàng Của Tôi</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-shopping-bag-line text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-600 mb-6">Bắt đầu mua sắm để tạo đơn hàng đầu tiên!</p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d]"
          >
            Xem Sản Phẩm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Đơn Hàng #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Đặt ngày {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusLabel(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Sản Phẩm</p>
                    <p className="font-semibold">{order.items.length} sản phẩm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thanh Toán</p>
                    <p className="font-semibold">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng Tiền</p>
                    <p className="font-semibold text-[#a67c52]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] text-sm"
                  >
                    Xem Chi Tiết
                  </Link>
                  {order.orderStatus === "pending" && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      Hủy Đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
