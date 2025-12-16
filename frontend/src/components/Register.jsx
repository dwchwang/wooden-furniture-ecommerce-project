import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Registration successful! Welcome!");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    dispatch(registerUser({ fullName, email, password, phone }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5efe6] px-4">
      <div className="bg-[#e9dfd0] shadow-xl rounded-2xl p-10 w-full max-w-md border border-[#d8cbb8]">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-center text-[#4a3b2c] mb-6">
          Wooden Furniture.
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-[#4a3b2c] mb-2">
          Create Your Account ✨
        </h2>
        <p className="text-sm text-center text-[#6b5b4d] mb-8">
          Join us and explore premium furniture collections.
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Your full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-[#cbbda9] bg-[#fdfaf5] focus:outline-none focus:ring-2 focus:ring-[#a67c52] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Email Address"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-[#cbbda9] bg-[#fdfaf5] focus:outline-none focus:ring-2 focus:ring-[#a67c52] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-[#cbbda9] bg-[#fdfaf5] focus:outline-none focus:ring-2 focus:ring-[#a67c52] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-[#cbbda9] bg-[#fdfaf5] focus:outline-none focus:ring-2 focus:ring-[#a67c52] disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a67c52] text-white font-medium py-2 rounded-lg hover:bg-[#8b653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-[#6b5b4d] mt-6 italic">
          Already have an account?{" "}
          <Link
            to="/login"
            className="relative text-[#a67c52] font-semibold after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-0 after:h-[1px] after:bg-[#a67c52] hover:after:w-full after:transition-all after:duration-300 "
          >
            Login here
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;
