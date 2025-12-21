import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../redux/features/auth/authSlice";
import CartModal from "../pages/shop/CartModal";
import { toast } from "react-toastify";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const products = useSelector((state) => state.cart.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleCartToggle = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Đăng xuất thành công");
    navigate("/");
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed-nav-bar w-nav">
        <nav className="max-w-screen-2xl mx-auto px-4 flex justify-between items-center">
          <ul className="nav__links flex gap-8" style={{ fontFamily: 'inherit' }}>
            <li className="link">
              <Link
                to="/"
                className={`font-medium hover:text-[#a67c52] transition-colors ${location.pathname === '/' ? 'text-[#a67c52] border-b-2 border-[#a67c52]' : ''
                  }`}
                style={{
                  color: location.pathname === '/' ? '#a67c52' : '#374151',
                  fontWeight: '500',
                  fontSize: '15px',
                  paddingBottom: '4px'
                }}
              >
                Trang chủ
              </Link>
            </li>
            <li className="link">
              <Link
                to="/shop"
                className={`font-medium hover:text-[#a67c52] transition-colors ${location.pathname === '/shop' ? 'text-[#a67c52] border-b-2 border-[#a67c52]' : ''
                  }`}
                style={{
                  color: location.pathname === '/shop' ? '#a67c52' : '#374151',
                  fontWeight: '500',
                  fontSize: '15px',
                  paddingBottom: '4px'
                }}
              >
                Cửa hàng
              </Link>
            </li>
            <li className="link">
              <Link
                to="/blogs"
                className={`font-medium hover:text-[#a67c52] transition-colors ${location.pathname === '/blogs' ? 'text-[#a67c52] border-b-2 border-[#a67c52]' : ''
                  }`}
                style={{
                  color: location.pathname === '/blogs' ? '#a67c52' : '#374151',
                  fontWeight: '500',
                  fontSize: '15px',
                  paddingBottom: '4px'
                }}
              >
                Bài viết
              </Link>
            </li>
            <li className="link">
              <Link
                to="/contact"
                className={`font-medium hover:text-[#a67c52] transition-colors ${location.pathname === '/contact' ? 'text-[#a67c52] border-b-2 border-[#a67c52]' : ''
                  }`}
                style={{
                  color: location.pathname === '/contact' ? '#a67c52' : '#374151',
                  fontWeight: '500',
                  fontSize: '15px',
                  paddingBottom: '4px'
                }}
              >
                Liên hệ
              </Link>
            </li>
          </ul>

          {/* logo */}
          <div className="nav__logo">
            <Link to="/">
              Wooden Furniture<span>.</span>
            </Link>
          </div>

          {/* nav icons */}
          <div className="nav__icons relative flex items-center gap-4">
            <span>
              <Link to="/search">
                <i className="ri-search-line"></i>
              </Link>
            </span>

            {/* Cart - only for customers */}
            {(!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'staff')) && (
              <span>
                <button
                  className="cursor-pointer hover:text-primary"
                  onClick={handleCartToggle}
                >
                  <i className="ri-shopping-bag-line"></i>
                  <sup className="text-sm inline-block w-[20px] h-[20px] text-white rounded-full bg-primary text-center">
                    {products.length}
                  </sup>
                </button>
              </span>
            )}

            {/* Dashboard icon for admin/staff only */}
            {isAuthenticated && user && (user.role === 'admin' || user.role === 'staff') && (
              <span>
                <Link to="/admin" className="hover:text-primary" title="Dashboard">
                  <i className="ri-dashboard-line"></i>
                </Link>
              </span>
            )}

            {/* User section */}
            {isAuthenticated && user ? (
              <div className="relative flex items-center gap-2">
                {/* User Avatar */}
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user.avatar ? (
                    <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#a67c52]">
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                        style={{ aspectRatio: '1 / 1' }}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = "/user.png"; // Fallback to default avatar
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#a67c52]">
                      <img
                        src="/user.png"
                        alt="Default Avatar"
                        className="w-full h-full object-cover"
                        style={{ aspectRatio: '1 / 1' }}
                      />
                    </div>
                  )}
                  <span className="hidden md:block text-sm whitespace-nowrap">
                    Xin chào, <span className="font-semibold">{user.fullName}</span>
                  </span>
                </Link>

                {/* Dropdown button */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hover:text-primary cursor-pointer"
                >
                  <i className="ri-arrow-down-s-line"></i>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="ri-user-line mr-2"></i>
                      Hồ sơ
                    </Link>

                    {/* Show Dashboard for admin/staff, Orders for customers */}
                    {user.role === 'admin' || user.role === 'staff' ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="ri-dashboard-line mr-2"></i>
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="ri-shopping-bag-line mr-2"></i>
                        Đơn hàng
                      </Link>
                    )}

                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      <i className="ri-logout-box-line mr-2"></i>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <span>
                <Link to="/login">
                  <i className="ri-user-3-line"></i>
                </Link>
              </span>
            )}
          </div>
        </nav>

        {isCartOpen && (
          <CartModal
            products={products}
            isOpen={isCartOpen}
            onClose={handleCartToggle}
          />
        )}
      </header>
    </>
  );
};

export default Navbar;
