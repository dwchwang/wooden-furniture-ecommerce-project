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
      toast.success("Đăng ký thành công! Chào mừng bạn!");
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
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
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
          Tạo tài khoản ✨
        </h2>
        <p className="text-sm text-center text-[#6b5b4d] mb-8">
          Tham gia cùng chúng tôi và khám phá bộ sưu tập nội thất cao cấp.
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
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
              placeholder="Địa chỉ Email"
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
              Số điện thoại (Tùy chọn)
            </label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-[#cbbda9] bg-[#fdfaf5] focus:outline-none focus:ring-2 focus:ring-[#a67c52] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a3b2c] mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
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
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-[#6b5b4d] mt-6 italic">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="relative text-[#a67c52] font-semibold after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-0 after:h-[1px] after:bg-[#a67c52] hover:after:w-full after:transition-all after:duration-300 "
          >
            Đăng nhập ngay
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;
