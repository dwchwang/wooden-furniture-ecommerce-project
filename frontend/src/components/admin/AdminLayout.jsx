import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/features/auth/authSlice';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  // Check if user is admin or staff
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  // Navigation items based on role
  const navItems = [
    // Common for both admin and staff
    {
      title: 'Quản lý đơn hàng',
      icon: 'ri-shopping-bag-line',
      path: '/admin/orders',
      roles: ['admin', 'staff']
    },
    {
      title: 'Chat hỗ trợ',
      icon: 'ri-message-3-line',
      path: '/admin/chat',
      roles: ['admin', 'staff']
    },
    {
      title: 'Quản lý Blog',
      icon: 'ri-article-line',
      path: '/admin/blogs',
      roles: ['admin', 'staff']
    },
    // Admin only
    {
      title: 'Tổng quan',
      icon: 'ri-dashboard-line',
      path: '/admin/dashboard',
      roles: ['admin']
    },
    {
      title: 'Báo cáo doanh thu',
      icon: 'ri-line-chart-line',
      path: '/admin/revenue',
      roles: ['admin']
    },
    {
      title: 'Quản lý sản phẩm',
      icon: 'ri-product-hunt-line',
      path: '/admin/products',
      roles: ['admin']
    },
    {
      title: 'Quản lý kho',
      icon: 'ri-archive-line',
      path: '/admin/inventory',
      roles: ['admin']
    },
    {
      title: 'Quản lý Voucher',
      icon: 'ri-coupon-line',
      path: '/admin/vouchers',
      roles: ['admin']
    },
    {
      title: 'Quản lý người dùng',
      icon: 'ri-user-settings-line',
      path: '/admin/users',
      roles: ['admin']
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#a67c52] to-[#8b653d] rounded-lg flex items-center justify-center">
                <i className="ri-admin-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'Staff'}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-[#a67c52] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <i className={`${item.icon} text-xl`}></i>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a67c52] to-[#8b653d] flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <i className="ri-logout-box-line"></i>
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredNavItems.find(item => location.pathname.startsWith(item.path))?.title || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Chào mừng trở lại, {user?.fullName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <i className="ri-notification-3-line text-2xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Back to site */}
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-home-line"></i>
                <span>Về trang chủ</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
