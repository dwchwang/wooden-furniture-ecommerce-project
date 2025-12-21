import React from "react";
import { Link } from "react-router-dom";
import instaImg1 from "../assets/instagram-1.jpg";
import instaImg2 from "../assets/instagram-2.jpg";
import instaImg3 from "../assets/instagram-3.jpg";
import instaImg4 from "../assets/instagram-4.jpg";
import instaImg5 from "../assets/instagram-5.jpg";
import instaImg6 from "../assets/instagram-6.jpg";

const Footer = () => {
  return (
    <>
      <footer className="section__container footer__container">
        {/* Contact Info */}
        <div className="footer__col">
          <h4>THÔNG TIN LIÊN HỆ</h4>
          <p>
            <span>
              <i className="ri-map-pin-fill"></i>
            </span>
            136 Hồ Tùng Mậu, Hà Nội
          </p>
          <p>
            <span>
              <i className="ri-mail-fill"></i>
            </span>
            woodenfurniture@gmail.com
          </p>
          <p>
            <span>
              <i className="ri-phone-fill"></i>
            </span>
            0345 829 556
          </p>
        </div>

        {/* Company */}
        <div className="footer__col">
          <h4>CỬA HÀNG</h4>
          <Link to="/">Trang Chủ</Link>
          <Link to="/shop">Cửa Hàng</Link>
          <Link to="/contact">Liên Hệ</Link>
          <Link to="/blogs">Tin Tức</Link>
          <a href="#terms">Điều Khoản & Điều Kiện</a>
        </div>

        {/* Useful Links */}
        <div className="footer__col">
          <h4>LIÊN KẾT HỮU ÍCH</h4>
          <Link to="/contact">Trợ Giúp</Link>
          <Link to="/orders">Theo Dõi Đơn Hàng</Link>
          <Link to="/shop?category=ban">Bàn</Link>
          <Link to="/shop?category=giuong">Giường</Link>
          <Link to="/shop?category=tu">Tủ</Link>
        </div>

        {/* Social Media */}
        <div className="footer__col">
          <h4>KẾT NỐI VỚI CHÚNG TÔI</h4>
          <div className="instagram__grid">
            <img src={instaImg1} alt="Nội thất 1" />
            <img src={instaImg2} alt="Nội thất 2" />
            <img src={instaImg3} alt="Nội thất 3" />
            <img src={instaImg4} alt="Nội thất 4" />
            <img src={instaImg5} alt="Nội thất 5" />
            <img src={instaImg6} alt="Nội thất 6" />
          </div>
        </div>
      </footer>

      <div className="footer__bar">
        Bản quyền © 2025 bởi Wooden Furniture. Đã đăng ký bản quyền.
      </div>
    </>
  );
};

export default Footer;
