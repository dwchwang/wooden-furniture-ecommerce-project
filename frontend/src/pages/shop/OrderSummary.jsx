import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../redux/features/cart/cartSlice";

const OrderSummary = () => {
  const dispatch = useDispatch();
  const clearCartItem = () => {
    dispatch(clearCart());
  };
  // const products = useSelector((store) => store.cart.products);
  const { tax, taxRate, totalPrice, grandTotal, selectedItems } = useSelector(
    (store) => store.cart
  );

  return (
    <div className="bg-primary-light mt-5 rounded text-base">
      <div className="px-6 py-4 space-x-5 mb-2">
        <h2 className="text-xl font-bold text-text-dark">Order Summary</h2>
        <p className="text-text-dark mt-2 mb-2">
          Selected Items: {selectedItems}
        </p>
        <p className="mb-2">Total Price: {totalPrice}</p>
        <p className="mb-2">
          Tax ({taxRate * 100}%): {tax}
        </p>
        <h3 className="font-bold mb-1.5">GrandTotal: {grandTotal}</h3>
        <div className="px-4 mb-6">
          <button
            className="bg-red-500 px-3 py-1.5 text-white mt-2 rounded-md flex justify-center items-center mb-4"
            onClick={clearCartItem}
          >
            <span className="mr-2">Clear Cart</span>
            <i className="ri-delete-bin-6-line"></i>
          </button>
          <button className="bg-green-500 px-3 py-1.5 text-white mt-2 rounded-md flex justify-center items-center mb-4">
            <span className="mr-2">Proceed Checkout</span>
            <i className="ri-bank-card-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
