import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice.js";
import authReducer from "./features/auth/authSlice.js";
import productsReducer from "./features/products/productsSlice.js";
import categoriesReducer from "./features/categories/categoriesSlice.js";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
  },
});
