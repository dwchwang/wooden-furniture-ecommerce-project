import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const response = await api.get('/orders/stats/overview');
      const stats = response.data?.stats || {};
      setOrderStats({
        totalOrders: stats.totalOrders || 0,
        pendingOrders: stats.pendingOrders || 0,
        shippingOrders: (stats.processingOrders || 0) + (stats.shippingOrders || 0),
        deliveredOrders: stats.deliveredOrders || 0,
        totalRevenue: stats.totalRevenue || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Admin stats
  const adminStats = [
    {
      title: 'Tổng đơn hàng',
      value: orderStats.totalOrders.toLocaleString(),
      icon: 'ri-shopping-bag-line',
      color: 'bg-blue-500',
    },
    {
      title: 'Doanh thu',
      value: `${orderStats.totalRevenue.toLocaleString('vi-VN')} đ`,
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-green-500',
    },
    {
      title: 'Khách hàng',
      value: '0',
      icon: 'ri-user-line',
      color: 'bg-purple-500',
    },
    {
      title: 'Sản phẩm',
      value: '0',
      icon: 'ri-product-hunt-line',
      color: 'bg-orange-500',
    }
  ];

  // Staff stats (order-focused)
  const staffStats = [
    {
      title: 'Đơn chờ xử lý',
      value: orderStats.pendingOrders.toLocaleString(),
      icon: 'ri-time-line',
      color: 'bg-yellow-500',
      badge: 'Cần xử lý',
      filterStatus: 'pending'
    },
    {
      title: 'Đơn đang giao',
      value: orderStats.shippingOrders.toLocaleString(),
      icon: 'ri-truck-line',
      color: 'bg-blue-500',
      badge: 'Đang vận chuyển',
      filterStatus: 'shipping'
    },
    {
      title: 'Tin nhắn mới',
      value: '0',
      icon: 'ri-message-3-line',
      color: 'bg-green-500',
      badge: 'Chưa đọc',
      filterStatus: null
    },
    {
      title: 'Đơn hoàn thành',
      value: orderStats.deliveredOrders.toLocaleString(),
      icon: 'ri-checkbox-circle-line',
      color: 'bg-purple-500',
      badge: 'Hôm nay',
      filterStatus: 'delivered'
    }
  ];

  const stats = isAdmin ? adminStats : staffStats;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {user?.fullName}!
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdmin
            ? 'Đây là tổng quan về hoạt động kinh doanh của bạn'
            : 'Đây là tổng quan công việc của bạn hôm nay'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const CardWrapper = stat.filterStatus ? Link : 'div';
          const cardProps = stat.filterStatus
            ? { to: `/admin/orders?status=${stat.filterStatus}` }
            : {};

          return (
            <CardWrapper
              key={index}
              {...cardProps}
              className={`bg-white rounded-xl shadow-md p-6 transition-all ${stat.filterStatus ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : 'hover:shadow-lg'
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} text-white text-2xl`}></i>
                </div>
                {stat.change && (
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                )}
                {stat.badge && (
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {stat.badge}
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardWrapper>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin && (
            <>
              <Link
                to="/admin/products/new"
                className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#a67c52] hover:bg-gray-50 transition-all"
              >
                <i className="ri-add-circle-line text-2xl text-[#a67c52]"></i>
                <span className="font-medium text-gray-700">Thêm sản phẩm mới</span>
              </Link>
              <Link
                to="/admin/vouchers/new"
                className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#a67c52] hover:bg-gray-50 transition-all"
              >
                <i className="ri-coupon-line text-2xl text-[#a67c52]"></i>
                <span className="font-medium text-gray-700">Tạo voucher</span>
              </Link>
            </>
          )}

          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#a67c52] hover:bg-gray-50 transition-all"
          >
            <i className="ri-shopping-bag-line text-2xl text-[#a67c52]"></i>
            <span className="font-medium text-gray-700">Xem đơn hàng</span>
          </Link>

          <Link
            to="/admin/blogs/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#a67c52] hover:bg-gray-50 transition-all"
          >
            <i className="ri-article-line text-2xl text-[#a67c52]"></i>
            <span className="font-medium text-gray-700">Viết blog mới</span>
          </Link>

          <Link
            to="/admin/chat"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#a67c52] hover:bg-gray-50 transition-all"
          >
            <i className="ri-message-3-line text-2xl text-[#a67c52]"></i>
            <span className="font-medium text-gray-700">Chat hỗ trợ</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity / Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isStaff ? 'Đơn hàng cần xử lý' : 'Đơn hàng gần đây'}
            </h2>
            <Link to="/admin/orders" className="text-[#a67c52] hover:underline text-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <i className="ri-shopping-bag-line text-4xl mb-2"></i>
            <p>Chưa có đơn hàng nào</p>
          </div>
        </div>

        {/* Recent Messages / Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isStaff ? 'Tin nhắn mới' : 'Hoạt động gần đây'}
            </h2>
            <Link to="/admin/chat" className="text-[#a67c52] hover:underline text-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <i className="ri-message-3-line text-4xl mb-2"></i>
            <p>Chưa có tin nhắn nào</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
