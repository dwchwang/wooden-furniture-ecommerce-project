import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  // Admin stats
  const adminStats = [
    {
      title: 'Tổng đơn hàng',
      value: '0',
      icon: 'ri-shopping-bag-line',
      color: 'bg-blue-500',
      change: '+0%'
    },
    {
      title: 'Doanh thu',
      value: '0đ',
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-green-500',
      change: '+0%'
    },
    {
      title: 'Khách hàng',
      value: '0',
      icon: 'ri-user-line',
      color: 'bg-purple-500',
      change: '+0%'
    },
    {
      title: 'Sản phẩm',
      value: '0',
      icon: 'ri-product-hunt-line',
      color: 'bg-orange-500',
      change: '+0%'
    }
  ];

  // Staff stats (order-focused)
  const staffStats = [
    {
      title: 'Đơn chờ xử lý',
      value: '0',
      icon: 'ri-time-line',
      color: 'bg-yellow-500',
      badge: 'Cần xử lý'
    },
    {
      title: 'Đơn đang giao',
      value: '0',
      icon: 'ri-truck-line',
      color: 'bg-blue-500',
      badge: 'Đang vận chuyển'
    },
    {
      title: 'Tin nhắn mới',
      value: '0',
      icon: 'ri-message-3-line',
      color: 'bg-green-500',
      badge: 'Chưa đọc'
    },
    {
      title: 'Đơn hoàn thành',
      value: '0',
      icon: 'ri-checkbox-circle-line',
      color: 'bg-purple-500',
      badge: 'Hôm nay'
    }
  ];

  const stats = isAdmin ? adminStats : staffStats;

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
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
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
          </div>
        ))}
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
