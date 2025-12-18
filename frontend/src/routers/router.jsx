import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/Home";
import App from "../App";
import CategoryPage from "../pages/categories/CategoryPage";
import Search from "../pages/search/Search";
import ShopPage from "../pages/shop/ShopPage";
import SingleProduct from "../pages/shop/shopDetails/SingleProduct";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import OrdersPage from "../pages/orders/OrdersPage";
import OrderDetailPage from "../pages/orders/OrderDetailPage";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
import PaymentFailed from "../pages/payment/PaymentFailed";
import ProfilePage from "../pages/profile/ProfilePage";
import ChangePassword from "../pages/profile/ChangePassword";
import ContactPage from "../pages/contact/ContactPage";
import BlogListPage from "../pages/blogs/BlogListPage";
import BlogDetailPage from "../pages/blogs/BlogDetailPage";
import AdminLayout from "../components/admin/AdminLayout";
import ProtectedRoute from "../components/admin/ProtectedRoute";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import AdminBlogsPage from "../pages/admin/blogs/AdminBlogsPage";
import BlogFormPage from "../pages/admin/blogs/BlogFormPage";
import AdminOrdersPage from "../pages/admin/orders/AdminOrdersPage";
import AdminOrderDetailPage from "../pages/admin/orders/AdminOrderDetailPage";
import AdminProductsPage from "../pages/admin/products/AdminProductsPage";
import ProductFormPage from "../pages/admin/products/ProductFormPage";
import ProductDetailPage from "../pages/admin/products/ProductDetailPage";
import InventoryPage from "../pages/admin/inventory/InventoryPage";
import Login from "../components/Login";
import Register from "../components/Register";

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
        element: <ShopPage></ShopPage>,
      },
      {
        path: "/shop/:id",
        element: <SingleProduct></SingleProduct>,
      },
      {
        path: "/checkout",
        element: <CheckoutPage></CheckoutPage>,
      },
      {
        path: "/orders",
        element: <OrdersPage></OrdersPage>,
      },
      {
        path: "/orders/:id",
        element: <OrderDetailPage></OrderDetailPage>,
      },
      {
        path: "/payment/success",
        element: <PaymentSuccess></PaymentSuccess>,
      },
      {
        path: "/payment/failed",
        element: <PaymentFailed></PaymentFailed>,
      },
      {
        path: "/profile",
        element: <ProfilePage></ProfilePage>,
      },
      {
        path: "/profile/password",
        element: <ChangePassword></ChangePassword>,
      },
      {
        path: "/contact",
        element: <ContactPage></ContactPage>,
      },
      {
        path: "/blogs",
        element: <BlogListPage></BlogListPage>,
      },
      {
        path: "/blogs/:slug",
        element: <BlogDetailPage></BlogDetailPage>,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'staff']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "blogs",
        element: <AdminBlogsPage />,
      },
      {
        path: "blogs/new",
        element: <BlogFormPage />,
      },
      {
        path: "blogs/edit/:id",
        element: <BlogFormPage />,
      },
      {
        path: "orders",
        element: <AdminOrdersPage />,
      },
      {
        path: "orders/:id",
        element: <AdminOrderDetailPage />,
      },
      {
        path: "products",
        element: <AdminProductsPage />,
      },
      {
        path: "products/new",
        element: <ProductFormPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "products/edit/:id",
        element: <ProductFormPage />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
  {
    path: "/register",
    element: <Register></Register>,
  },
]);

export default router;
