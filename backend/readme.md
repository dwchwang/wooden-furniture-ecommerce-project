# 🛋️ Furniture E-commerce Web Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![Status](https://img.shields.io/badge/Status-Completed-success)

> **Đồ án Tốt nghiệp / Capstone Project**
> Một hệ thống thương mại điện tử chuyên biệt cho đồ nội thất, hỗ trợ quản lý biến thể sản phẩm phức tạp, thanh toán trực tuyến VNPay và Chat hỗ trợ khách hàng Real-time.

---

## 📖 Mục lục
- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc Cơ sở dữ liệu](#-cấu-trúc-cơ-sở-dữ-liệu)
- [Hướng dẫn Cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu hình Môi trường (.env)](#-cấu-hình-môi-trường-env)
- [Hình ảnh Demo](#-hình-ảnh-demo)
- [Tác giả](#-tác-giả)

---

## 🚀 Giới thiệu

Dự án này là một website bán đồ nội thất Full-stack. Khác với các trang thương mại điện tử cơ bản, hệ thống này tập trung vào giải quyết bài toán **Quản lý biến thể (Variants)** của đồ nội thất (Màu sắc, Kích thước, Chất liệu) và tích hợp các công nghệ hiện đại như **Socket.io** để chăm sóc khách hàng.

---

## ✨ Tính năng chính

### 👤 Khách hàng (End-User)
- **Đăng ký/Đăng nhập:** Xác thực bảo mật với JWT.
- **Tìm kiếm & Lọc:** Tìm theo tên, lọc theo khoảng giá, danh mục, loại gỗ.
- **Chi tiết sản phẩm:** Xem ảnh gallery, chọn biến thể (Màu/Size) để xem giá và tồn kho tương ứng.
- **Giỏ hàng:** Thêm/Sửa/Xóa sản phẩm, tự động kiểm tra tồn kho.
- **Thanh toán:**
  - COD (Thanh toán khi nhận hàng).
  - **VNPay** (Cổng thanh toán trực tuyến - Môi trường Sandbox).
- **Đơn hàng:** Theo dõi trạng thái đơn hàng (Chờ xử lý -> Đang giao -> Hoàn thành).
- **Đánh giá:** Chỉ được đánh giá khi đã mua và nhận hàng thành công.
- **Chat Support:** Chat trực tiếp với nhân viên qua Widget (Real-time).

### 🛡️ Quản trị viên (Admin)
- **Dashboard:** Thống kê doanh thu, số đơn hàng, top sản phẩm bán chạy (Biểu đồ trực quan).
- **Quản lý Sản phẩm:**
  - Thêm/Sửa/Xóa sản phẩm.
  - Quản lý biến thể (SKU, Giá, Kho cho từng màu/size).
  - Upload ảnh lên **Cloudinary**.
- **Quản lý Đơn hàng:** Duyệt đơn, cập nhật trạng thái vận chuyển.
- **Quản lý Voucher:** Tạo mã giảm giá (Theo % hoặc số tiền).
- **Chat Dashboard:** Nhận và trả lời tin nhắn của khách hàng ngay lập tức.

---

## 🛠 Công nghệ sử dụng

### Backend (Server)
- **Node.js** & **Express.js**: RESTful API.
- **MongoDB** & **Mongoose**: Cơ sở dữ liệu NoSQL & ODM.
- **JWT (JSON Web Token)**: Xác thực người dùng.
- **Socket.io**: Xử lý Chat Real-time.
- **Cloudinary**: Lưu trữ hình ảnh sản phẩm.
- **Nodemailer**: Gửi email thông báo.

### Frontend (Client)
- **React.js**: Thư viện xây dựng giao diện.
- **Redux Toolkit**: Quản lý trạng thái (State Management).
- **Tailwind CSS**: Framework CSS để thiết kế giao diện.
- **Axios**: Gọi API.
- **Socket.io-client**: Kết nối Chat.

---

## 💾 Cấu trúc Cơ sở dữ liệu

Hệ thống bao gồm các Collection chính trong MongoDB:
1. **Users**: Lưu thông tin khách hàng, admin.
2. **Products**: Thông tin chung của sản phẩm.
3. **ProductVariants**: Lưu biến thể (Màu, Size, Kho, Giá).
4. **Orders**: Lưu đơn hàng và chi tiết các biến thể đã mua.
5. **Categories**: Danh mục phân cấp.
6. **Vouchers**: Mã giảm giá.
7. **Reviews**: Đánh giá sản phẩm.
8. **Messages**: Lịch sử tin nhắn chat.

---

## ⚙️ Hướng dẫn Cài đặt

Làm theo các bước sau để chạy dự án trên máy cục bộ (Localhost):

### 1. Yêu cầu tiên quyết
- Node.js (v14 trở lên)
- MongoDB (Cài sẵn hoặc dùng MongoDB Atlas)
- Tài khoản Cloudinary (Để upload ảnh)
- Tài khoản VNPay Sandbox (Để test thanh toán)

### 2. Clone dự án
```bash
git clone [https://github.com/username/furniture-project.git](https://github.com/username/furniture-project.git)
cd furniture-project