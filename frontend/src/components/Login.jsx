import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Đăng nhập thành công!");

      // Redirect based on role
      if (user.role === 'admin' || user.role === 'staff') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f5efe6] px-4">
      <div className="bg-[#e9dfd0] shadow-xl rounded-2xl p-10 w-full max-w-md border border-[#d8cbb8]">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-center text-[#4a3b2c] mb-6">
          Wooden Furniture.
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-[#4a3b2c] mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-sm text-center text-[#6b5b4d] mb-8">
          Please sign in to your account
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Email Address"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-[#cbbda9] bg-[#fdfaf5] focus:outline-none focus:ring-2 focus:ring-[#a67c52] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-[#cbbda9] bg-[#fdfaf5] focus:outline-none focus:ring-2 focus:ring-[#a67c52] disabled:opacity-50"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-[#6b5b4d]">
              <input type="checkbox" className="accent-[#a67c52]" /> Remember me
            </label>
            <a href="#" className="text-[#a67c52] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a67c52] text-white font-medium py-2 rounded-lg hover:bg-[#8b653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center text-[#6b5b4d] mt-6 italic">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="relative text-[#a67c52] font-semibold after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-0 after:h-[1px] after:bg-[#a67c52] hover:after:w-full after:transition-all after:duration-300 "
          >
            Register here
          </Link>
          .
        </p>
      </div>
    </section>
  );
};

export default Login;
