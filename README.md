# 🪵 Wooden Furniture E-commerce

Hệ thống thương mại điện tử bán đồ gỗ nội thất với đầy đủ tính năng quản lý và thanh toán online.

## ✨ Tính năng

### Khách hàng
- 🛍️ Xem sản phẩm theo danh mục
- 🔍 Tìm kiếm và lọc sản phẩm
- 🛒 Giỏ hàng
- 💳 Thanh toán VNPay
- 🎫 Áp dụng voucher giảm giá
- 📦 Theo dõi đơn hàng
- 💬 Chat hỗ trợ real-time
- ⭐ Đánh giá sản phẩm
- 👤 Quản lý tài khoản

### Admin/Staff
- 📊 Dashboard thống kê
- 📦 Quản lý sản phẩm
- 📂 Quản lý danh mục
- 🎫 Quản lý voucher
- 📋 Quản lý đơn hàng
- 👥 Quản lý người dùng
- 📝 Quản lý blog
- 💬 Chat hỗ trợ khách hàng (auto-assign)
- 📊 Báo cáo doanh thu

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (Real-time chat)
- JWT Authentication
- VNPay Payment Gateway
- Cloudinary (Image storage)

### Frontend
- React 18
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Socket.IO Client
- Axios

## 📁 Cấu trúc dự án

```
wooden-furniture-ecommerce-project/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── routers/
│   │   └── App.jsx
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
└── DEPLOYMENT.md
```

## 🚀 Cài đặt & Chạy local

### 1. Clone repository
```bash
git clone https://github.com/your-username/wooden-furniture-ecommerce.git
cd wooden-furniture-ecommerce
```

### 2. Setup Backend
```bash
cd backend
npm install

# Copy .env.example to .env và điền thông tin
cp .env.example .env

# Chạy backend
npm run dev
```

Backend chạy tại: http://localhost:8000

### 3. Setup Frontend
```bash
cd frontend
npm install

# Copy .env.example to .env
cp .env.example .env

# Chạy frontend
npm run dev
```

Frontend chạy tại: http://localhost:5173

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
VNPAY_TMN_CODE=your_vnpay_code
VNPAY_HASH_SECRET=your_vnpay_secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 📦 Deploy

Xem hướng dẫn chi tiết trong [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy (Free tier)
1. **Database**: MongoDB Atlas
2. **Backend**: Render.com
3. **Frontend**: Vercel
4. **Storage**: Cloudinary

## 🧪 Test Accounts

### Admin
- Email: admin@furniture.com
- Password: admin123

### Staff
- Email: staff@furniture.com
- Password: staff123

### Customer
- Email: customer@furniture.com
- Password: customer123

### VNPay Test (Sandbox)
- Ngân hàng: NCB
- Số thẻ: 9704198526191432198
- Tên: NGUYEN VAN A
- Ngày phát hành: 07/15
- OTP: 123456

## 📝 API Documentation

### Authentication
- `POST /api/v1/users/register` - Đăng ký
- `POST /api/v1/users/login` - Đăng nhập
- `POST /api/v1/users/logout` - Đăng xuất
- `POST /api/v1/users/refresh-token` - Refresh token

### Products
- `GET /api/v1/products` - Lấy danh sách sản phẩm
- `GET /api/v1/products/:id` - Chi tiết sản phẩm
- `POST /api/v1/products` - Tạo sản phẩm (Admin)
- `PATCH /api/v1/products/:id` - Cập nhật (Admin)
- `DELETE /api/v1/products/:id` - Xóa (Admin)

### Orders
- `GET /api/v1/orders` - Lấy đơn hàng
- `POST /api/v1/orders` - Tạo đơn hàng
- `GET /api/v1/orders/:id` - Chi tiết đơn hàng
- `PATCH /api/v1/orders/:id/status` - Cập nhật trạng thái (Admin)

### Chat
- `GET /api/v1/chat/conversation` - Lấy/tạo conversation (Customer)
- `GET /api/v1/chat/conversations` - Danh sách conversations (Staff)
- `GET /api/v1/chat/conversations/:id/messages` - Lấy tin nhắn
- `POST /api/v1/chat/conversations/:id/messages` - Gửi tin nhắn

## 🎨 Features Highlight

### 1. Real-time Chat với Auto-assign
- Khách hàng gửi tin nhắn → Tất cả staff online nhìn thấy
- Staff đầu tiên reply → Tự động assign conversation
- Staff khác không thấy conversation đã assigned
- Admin xem tất cả conversations

### 2. Voucher System
- Giảm giá theo % hoặc số tiền cố định
- Giới hạn số lần sử dụng
- Giá trị đơn hàng tối thiểu
- Thời gian có hiệu lực

### 3. VNPay Integration
- QR Code payment
- Callback handling
- Transaction verification
- Auto update order status

## 🤝 Contributing

1. Fork repository
2. Tạo branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## 📄 License

MIT License

## 👨‍💻 Author

Đức Hoàng - [GitHub](https://github.com/dwchwang)

## 📞 Support

- Email: support@furniture.com
- Chat: Sử dụng tính năng chat trên website

---

Made with ❤️ by Đức Hoàng
