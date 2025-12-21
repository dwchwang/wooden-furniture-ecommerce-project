import React from "react";
import { Link } from "react-router-dom";
import bannerImg from "../../assets/cover.png";

const Banner = () => {
  return (
    <>
      <div className="section__container header__container">
        <div className="header__content z-30">
          <h1>Nội Thất Gỗ & Trang Trí Nội Thất</h1>
          <p>
            Khám phá những xu hướng mới nhất và thể hiện phong cách sống của bạn
            với bộ sưu tập đồ gỗ nội thất cao cấp. Chúng tôi mang đến những sản
            phẩm bàn ghế, tủ kệ, giường, và phụ kiện trang trí được thiết kế
            tinh tế, bền đẹp, phù hợp cho mọi không gian và nhu cầu.
          </p>
          <button className="btn">
            <Link to="/shop">Khám Phá Ngay</Link>
          </button>
        </div>
        <div className="w-full h-[550px]">
          <img
            src={bannerImg}
            alt="banner"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </>
  );
};

export default Banner;
