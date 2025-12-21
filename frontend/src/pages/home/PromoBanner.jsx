import React from "react";

const PromoBanner = () => {
  return (
    <section className="section__container banner__container">
      <div className="banner__card">
        <span>
          <i className="ri-truck-line"></i>
        </span>
        <h4>Miễn Phí Vận Chuyển</h4>
        <p>Giao hàng miễn phí cho đơn hàng trên 5 triệu đồng trong nội thành.</p>
      </div>
      <div className="banner__card">
        <span>
          <i className="ri-wallet-3-line"></i>
        </span>
        <h4>Đảm Bảo Hoàn Tiền 100%</h4>
        <p>Hoàn tiền đầy đủ nếu sản phẩm không đúng mô tả hoặc bị lỗi.</p>
      </div>
      <div className="banner__card">
        <span>
          <i className="ri-user-voice-line"></i>
        </span>
        <h4>Hỗ Trợ Tận Tâm</h4>
        <p>Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ 24/7 qua hotline và chat.</p>
      </div>
    </section>
  );
};

export default PromoBanner;
