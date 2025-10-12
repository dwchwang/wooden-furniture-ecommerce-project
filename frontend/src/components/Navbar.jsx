import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartModal from "../pages/shop/CartModal";

const Navbar = () => {
  const products = useSelector((state) => state.cart.products);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const handleCartToggle = () => {
    setIsCartOpen(!isCartOpen);
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
            <span>
              <Link to="/login">
                <i className="ri-user-3-line"></i>
              </Link>
            </span>
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
