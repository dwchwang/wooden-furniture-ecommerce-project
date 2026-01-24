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
        <h2 className="text-xl font-bold text-text-dark">Tóm tắt đơn hàng</h2>
        <p className="text-text-dark mt-2 mb-2">
          Sản phẩm đã chọn: {selectedItems}
        </p>
        <p className="mb-2">Tổng giá: {totalPrice}</p>
        <p className="mb-2">
          Thuế ({taxRate * 100}%): {tax}
        </p>
        <h3 className="font-bold mb-1.5">Tổng cộng: {grandTotal}</h3>
        <div className="px-4 mb-6">
          <button
            className="bg-red-500 px-3 py-1.5 text-white mt-2 rounded-md flex justify-center items-center mb-4"
            onClick={clearCartItem}
          >
            <span className="mr-2">Xóa giỏ hàng</span>
            <i className="ri-delete-bin-6-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
