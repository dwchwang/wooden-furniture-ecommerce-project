# 🚀 Deployment Guide - Wooden Furniture E-commerce

## 📋 Tổng quan

Dự án gồm 2 phần:
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **Frontend**: React + Vite

## 🎯 Các option deploy

### Option 1: Deploy miễn phí (Khuyến nghị cho demo)
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel (Free tier)
- **Database**: MongoDB Atlas (Free tier)
- **File Storage**: Cloudinary (Free tier)

### Option 2: Deploy VPS (Cho production)
- VPS (DigitalOcean, AWS, Google Cloud)
- Nginx reverse proxy
- PM2 process manager
- SSL certificate (Let's Encrypt)

---

## 🔧 Option 1: Deploy miễn phí

### 1️⃣ Chuẩn bị MongoDB Atlas

1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Tạo tài khoản miễn phí
3. Tạo cluster mới (M0 Free tier)
4. Whitelist IP: `0.0.0.0/0` (Allow all)
5. Tạo Database User
6. Lấy Connection String:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/furniture-db
   ```

### 2️⃣ Chuẩn bị Cloudinary

1. Truy cập: https://cloudinary.com
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard → lấy:
   - Cloud Name
   - API Key
   - API Secret

### 3️⃣ Deploy Backend (Render.com)

#### A. Chuẩn bị code

1. **Tạo file `.gitignore` trong `/backend`**:
```
node_modules/
.env
.env.local
.DS_Store
uploads/
*.log
```

2. **Tạo file `render.yaml` trong root project**:
```yaml
services:
  - type: web
    name: furniture-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 8000
```

3. **Update `backend/package.json`** - thêm script:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

#### B. Deploy lên Render

1. Push code lên GitHub
2. Truy cập: https://render.com
3. Đăng nhập bằng GitHub
4. Click **New** → **Web Service**
5. Connect repository
6. Cấu hình:
   - **Name**: `furniture-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Instance Type**: Free

7. **Environment Variables** - Add các biến:
```
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/furniture-db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
VNPAY_URL=https://sandbox.vnpayment.vn
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

8. Click **Create Web Service**
9. Đợi deploy xong → Lấy URL: `https://furniture-backend.onrender.com`

### 4️⃣ Deploy Frontend (Vercel)

#### A. Chuẩn bị code

1. **Update `frontend/.env.production`**:
```env
VITE_API_URL=https://furniture-backend.onrender.com/api/v1
```

2. **Tạo `vercel.json` trong `/frontend`**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

3. **Update `frontend/package.json`**:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### B. Deploy lên Vercel

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **Add New** → **Project**
4. Import repository
5. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. **Environment Variables**:
```
VITE_API_URL=https://furniture-backend.onrender.com/api/v1
```

7. Click **Deploy**
8. Đợi deploy xong → Lấy URL: `https://your-project.vercel.app`

### 5️⃣ Cập nhật CORS

Quay lại Render.com → Backend → Environment:
```
CORS_ORIGIN=https://your-project.vercel.app
```

Redeploy backend.

---

## 🔧 Option 2: Deploy VPS

### 1️⃣ Chuẩn bị VPS

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install MongoDB (hoặc dùng Atlas)
# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
```

### 2️⃣ Clone & Setup Backend

```bash
# Clone project
cd /var/www
git clone https://github.com/your-username/furniture-project.git
cd furniture-project/backend

# Install dependencies
npm install

# Create .env
nano .env
# Paste environment variables

# Start with PM2
pm2 start src/index.js --name furniture-backend
pm2 save
pm2 startup
```

### 3️⃣ Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/furniture
```

Paste config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/furniture /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4️⃣ Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 5️⃣ Build & Deploy Frontend

```bash
cd /var/www/furniture-project/frontend

# Build
npm install
npm run build

# Copy to Nginx
sudo cp -r dist/* /var/www/html/
```

Setup Nginx for frontend:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ✅ Checklist trước khi deploy

- [ ] MongoDB connection string đã đúng
- [ ] Tất cả environment variables đã set
- [ ] CORS origin đã update
- [ ] VNPay credentials (nếu dùng production)
- [ ] Cloudinary credentials
- [ ] JWT secrets đã đổi (không dùng default)
- [ ] Test local build: `npm run build`
- [ ] Git ignore `.env` files
- [ ] Update API URLs trong frontend

---

## 🐛 Troubleshooting

### Backend không start
```bash
# Check logs
pm2 logs furniture-backend

# Restart
pm2 restart furniture-backend
```

### CORS errors
- Check `CORS_ORIGIN` trong backend `.env`
- Phải match chính xác với frontend URL

### Socket.IO không connect
- Check Nginx config có proxy WebSocket
- Check firewall ports

### Database connection failed
- Check MongoDB Atlas IP whitelist
- Check connection string format
- Check network access

---

## 📊 Monitoring

### PM2 Dashboard
```bash
pm2 monit
pm2 status
pm2 logs
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Update sau khi deploy

```bash
# Pull latest code
cd /var/www/furniture-project
git pull

# Backend
cd backend
npm install
pm2 restart furniture-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

---

## 💡 Tips

1. **Free tier limitations**:
   - Render: Sleep sau 15 phút không dùng
   - MongoDB Atlas: 512MB storage
   - Vercel: 100GB bandwidth/month

2. **Performance**:
   - Enable gzip compression
   - Use CDN cho static files
   - Optimize images

3. **Security**:
   - Đổi tất cả secrets
   - Enable HTTPS
   - Rate limiting
   - Input validation

---

Bạn muốn deploy theo option nào? Tôi sẽ hướng dẫn chi tiết! 🚀
