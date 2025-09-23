import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/Home";
import App from "../App";
import CategoryPage from "../pages/categories/CategoryPage";
import Search from "../pages/search/Search";

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
    ],
  },
]);

export default router;
