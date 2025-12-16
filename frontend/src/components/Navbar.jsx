import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/features/auth/authSlice";
import CartModal from "../pages/shop/CartModal";
import { toast } from "react-toastify";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector((state) => state.cart.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleCartToggle = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed-nav-bar w-nav">
        <nav className="max-w-screen-2xl mx-auto px-4 flex justify-between items-center">
          <ul className="nav__links ">
            <li className="link">
              <Link to="/">Home</Link>
            </li>
            <li className="link">
              <Link to="/shop">Shop</Link>
            </li>
            <li className="link">
              <Link to="/pages">Pages</Link>
            </li>
            <li className="link">
              <Link to="/contact">Contact</Link>
            </li>
          </ul>

          {/* logo */}
          <div className="nav__logo">
            <Link to="/">
              Wooden Furniture<span>.</span>
            </Link>
          </div>

          {/* nav icons */}
          <div className="nav__icons relative">
            <span>
              <Link to="/search">
                <i className="ri-search-line"></i>
              </Link>
            </span>
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

            {/* User section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-primary cursor-pointer"
                >
                  <span className="text-sm font-medium">
                    Welcome, {user.fullName}
                  </span>
                  <i className="ri-arrow-down-s-line"></i>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="ri-user-line mr-2"></i>
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="ri-shopping-bag-line mr-2"></i>
                      My Orders
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      <i className="ri-logout-box-line mr-2"></i>
                      Logout
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
          ></CartModal>
        )}
      </header>
    </>
  );
};

export default Navbar;
