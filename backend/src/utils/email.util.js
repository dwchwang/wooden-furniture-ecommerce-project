import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Furniture Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (email, orderData) => {
  const subject = `Xác nhận đơn hàng #${orderData.orderNumber}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #4CAF50; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛋️ Cảm ơn bạn đã đặt hàng!</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${orderData.shippingAddress.fullName}</strong>,</p>
          <p>Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý.</p>
          
          <div class="order-details">
            <h3>Thông tin đơn hàng</h3>
            <p><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
            <p><strong>Ngày đặt:</strong> ${new Date(orderData.createdAt).toLocaleDateString("vi-VN")}</p>
            <p><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod}</p>
            
            <h4>Sản phẩm:</h4>
            ${orderData.items
              .map(
                (item) => `
              <div class="item">
                <p><strong>${item.product.name}</strong></p>
                <p>Số lượng: ${item.quantity} x ${item.price.toLocaleString("vi-VN")}đ</p>
              </div>
            `
              )
              .join("")}
            
            <div class="total">
              <p>Tạm tính: ${orderData.subtotal.toLocaleString("vi-VN")}đ</p>
              ${orderData.voucher ? `<p>Giảm giá: -${orderData.voucher.discountAmount.toLocaleString("vi-VN")}đ</p>` : ""}
              <p>Phí vận chuyển: ${orderData.shippingFee.toLocaleString("vi-VN")}đ</p>
              <p style="font-size: 20px;">Tổng cộng: ${orderData.total.toLocaleString("vi-VN")}đ</p>
            </div>
          </div>
          
          <div class="order-details">
            <h3>Địa chỉ giao hàng</h3>
            <p>${orderData.shippingAddress.fullName}</p>
            <p>${orderData.shippingAddress.phone}</p>
            <p>${orderData.shippingAddress.street}, ${orderData.shippingAddress.ward}</p>
            <p>${orderData.shippingAddress.district}, ${orderData.shippingAddress.city}</p>
          </div>
          
          <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao.</p>
          <p>Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi!</p>
        </div>
        <div class="footer">
          <p>© 2024 Furniture Store. All rights reserved.</p>
          <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

// Send order status update email
const sendOrderStatusUpdate = async (email, orderData, newStatus) => {
  const statusMessages = {
    processing: "đang được xử lý",
    shipping: "đang được giao",
    delivered: "đã được giao thành công",
    cancelled: "đã bị hủy",
  };

  const subject = `Cập nhật đơn hàng #${orderData.orderNumber}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .status { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .status-badge { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; border-radius: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Cập nhật đơn hàng</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${orderData.shippingAddress.fullName}</strong>,</p>
          
          <div class="status">
            <p>Đơn hàng <strong>#${orderData.orderNumber}</strong></p>
            <div class="status-badge">${statusMessages[newStatus] || newStatus}</div>
          </div>
          
          ${
            newStatus === "delivered"
              ? `
            <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
            <p>Nếu bạn hài lòng với sản phẩm, đừng quên để lại đánh giá nhé!</p>
          `
              : newStatus === "cancelled"
                ? `
            <p>Đơn hàng của bạn đã bị hủy.</p>
            <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
          `
                : `
            <p>Chúng tôi sẽ tiếp tục cập nhật cho bạn về tình trạng đơn hàng.</p>
          `
          }
        </div>
        <div class="footer">
          <p>© 2024 Furniture Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  const subject = "Chào mừng đến với Furniture Store!";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Chào mừng bạn!</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Furniture Store!</p>
          <p>Chúng tôi rất vui được phục vụ bạn với những sản phẩm nội thất chất lượng cao.</p>
          <p>Hãy khám phá các sản phẩm của chúng tôi và tận hưởng trải nghiệm mua sắm tuyệt vời!</p>
        </div>
        <div class="footer">
          <p>© 2024 Furniture Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

export {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendWelcomeEmail,
};
