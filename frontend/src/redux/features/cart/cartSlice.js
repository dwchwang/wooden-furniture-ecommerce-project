import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedItems: [],
  totalPrice: 0,
  tax: 0,
  taxRate: 0.05,
  grandTotal: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const isExit = state.products.find(
        (product) => product._id === action.payload._id
      );

      if (!isExit) {
        state.products.push({ ...action.payload, quantity: 1 });
      } else {
        console.log("Items already in the cart");
      }

      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      state.tax = setTax(state);
      state.grandTotal = setGrandTotal(state);
    },

    updateQuantity: (state, action) => {
      state.products.map((product) => {
        if (product._id === action.payload._id) {
          if (action.payload.type === "increment") {
            product.quantity += 1;
          } else if (
            action.payload.type === "decrement" &&
            product.quantity > 1
          ) {
            product.quantity -= 1;
          }
        }
        return product;
      });
      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      state.tax = setTax(state);
      state.grandTotal = setGrandTotal(state);
    },

    removeFromCart: (state, action) => {
      state.products = state.products.filter(
        (product) => product._id !== action.payload._id
      );
      state.selectedItems = setSelectedItems(state);
      state.totalPrice = setTotalPrice(state);
      state.tax = setTax(state);
      state.grandTotal = setGrandTotal(state);
    },

    clearCart: (state) => {
      state.products = [];
      state.selectedItems = 0;
      state.totalPrice = 0;
      state.tax = 0;
      state.grandTotal = 0;
    },
  },
});

// utilities function
export const setSelectedItems = (state) =>
  state.products.reduce((total, product) => {
    return Number(total + product.quantity);
  }, 0);
// export const setTotalPrice = (state) => {
//   const total = state.products.reduce((sum, product) => {
//     const numericPrice = Number(String(product.price).replace(/\D/g, ""));
//     return sum + numericPrice * product.quantity;
//   }, 0);

//   // Trả về chuỗi định dạng dễ nhìn
//   return total.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
// };

// export const setTax = (state) => setTotalPrice(state) * state.taxRate;

// export const setGrandTotal = (state) => setTotalPrice(state) + setTax(state);
// 1️⃣ Tính tổng tiền sản phẩm
export const setTotalPrice = (state) => {
  const total = state.products.reduce((sum, product) => {
    const numericPrice = Number(String(product.price).replace(/\D/g, ""));
    return sum + numericPrice * product.quantity;
  }, 0);

  // Trả về dạng hiển thị đẹp (VD: "12.000.000 ₫")
  return total.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

// 2️⃣ Tính thuế dựa trên tổng tiền
export const setTax = (state) => {
  const total = state.products.reduce((sum, product) => {
    const numericPrice = Number(String(product.price).replace(/\D/g, ""));
    return sum + numericPrice * product.quantity;
  }, 0);

  const tax = total * state.taxRate;

  return tax.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

// 3️⃣ Tính tổng cộng (giá + thuế)
export const setGrandTotal = (state) => {
  const total = state.products.reduce((sum, product) => {
    const numericPrice = Number(String(product.price).replace(/\D/g, ""));
    return sum + numericPrice * product.quantity;
  }, 0);

  const tax = total * state.taxRate;
  const grandTotal = total + tax;

  return grandTotal.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

// Action creators are generated for each case reducer function
export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
