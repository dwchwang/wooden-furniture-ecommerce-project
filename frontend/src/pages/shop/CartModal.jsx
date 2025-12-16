import React from "react";
import { useNavigate } from "react-router-dom";
import OrderSummary from "./OrderSummary";
import { useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
} from "../../redux/features/cart/cartSlice";

const CartModal = ({ products, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuantityChange = (type, id) => {
    const payload = { type, _id: id };
    dispatch(updateQuantity(payload));
  };

  const handleRemoveItem = (e, id) => {
    e.preventDefault();
    const payload = { _id: id };
    dispatch(removeFromCart(payload));
  };

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div
      className={`fixed z-[1000] inset-0 bg-black/50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      style={{ transition: "opacity 0.3s ease-in-out" }}
    >
      <div
        className={`fixed right-0 top-0 md:w-2/5 w-full bg-white h-full overflow-y-auto transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{
          transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div className="p-4 mt-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-semibold text-primary">Your Cart</h4>
            <button
              className="text-gray-600 hover:text-gray-900 cursor-pointer "
              onClick={() => onClose()}
            >
              <i className="ri-close-line bg-primary p-1 text-white hover:bg-primary-dark"></i>
            </button>
          </div>

          {/* cart details */}
          <div className="cart-items">
            {products.length === 0 ? (
              <div>Your cart is empty</div>
            ) : (
              products.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center md:justify-between md:p-5 p-2 mb-4 shadow-md "
                >
                  <div className="flex items-center">
                    <div className="w-[300px] flex items-center">
                      <span className="mr-4 px-1 bg-primary text-white rounded-full">
                        0{index + 1}
                      </span>
                      <img
                        src={item.image}
                        alt=""
                        className="h-14 !w-14 object-cover block mr-4"
                      />
                      <div>
                        <h5 className="text-lg font-medium text-primary-dark">
                          {item.name}
                        </h5>
                        <p className="text-gray-600 text-sm">
                          {item.price} VND
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row md:justify-start justify-end items-center mt-2">
                      <button
                        className="!size-6 flex items-center justify-center px-1.5 rounded-full bg-gray-200 text-gray-700 hover:bg-primary hover:text-white ml-4"
                        onClick={() =>
                          handleQuantityChange("decrement", item._id)
                        }
                      >
                        -
                      </button>
                      <span className="px-2 text-center mx-1">
                        {item.quantity}
                      </span>
                      <button
                        className="!size-6 flex items-center justify-center px-1.5 rounded-full bg-gray-200 text-gray-700 hover:bg-primary hover:text-white"
                        onClick={() =>
                          handleQuantityChange("increment", item._id)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="ml-4">
                      <button
                        className="text-red-500 hover:text-red-800 mr-2 cursor-pointer"
                        onClick={(e) => handleRemoveItem(e, item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* calculation */}
          {products.length > 0 && (
            <>
              <OrderSummary />
              <button
                onClick={handleCheckout}
                className="w-full mt-4 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] font-semibold transition-colors"
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
