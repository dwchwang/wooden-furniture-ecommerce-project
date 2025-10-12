import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/Home";
import App from "../App";
import CategoryPage from "../pages/categories/CategoryPage";
import Search from "../pages/search/Search";
import ShopPage from "../pages/shop/ShopPage";
import SingleProduct from "../pages/shop/shopDetails/SingleProduct";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/categories/:categoryName",
        element: <CategoryPage></CategoryPage>,
      },
      {
        path: "/search",
        element: <Search></Search>,
      },
      {
        path: "/shop",
        element: <ShopPage></ShopPage>
      },
      {
        path: "/shop/:id",
        element: <SingleProduct></SingleProduct>
      }
    ],
  },
]);

export default router;
