import React from "react";
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
        {/* info */}
        <div className="footer__col">
          <h4>CONTACT INFO</h4>
          <p>
            <span>
              <i className="ri-map-pin-fill"></i>
            </span>
            136 Ho Tung Mau, Ha Noi
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
            0345829556
          </p>
        </div>

        {/* company */}
        <div className="footer__col">
          <h4>COMPANY</h4>
          <a href="/">Home</a>
          <a href="/">About Us</a>
          <a href="/">Work With Us</a>
          <a href="/">Our Blogs</a>
          <a href="/">Terms & Conditions</a>
        </div>

        {/* usefullink */}
        <div className="footer__col">
          <h4>USEFUL LINK</h4>
          <a href="/">Help</a>
          <a href="/">Track Your Order</a>
          <a href="/">Table</a>
          <a href="/">Bed</a>
          <a href="/">Cabinet</a>
        </div>

        {/* Facebook */}
        <div className="footer__col">
          <h4>FACEBOOK</h4>
          <div className="instagram__grid">
            <img src={instaImg1} alt="instaImg1" />
            <img src={instaImg2} alt="instaImg2" />
            <img src={instaImg3} alt="instaImg3" />
            <img src={instaImg4} alt="instaImg4" />
            <img src={instaImg5} alt="instaImg5" />
            <img src={instaImg6} alt="instaImg6" />
          </div>
        </div>
      </footer>

      <div className="footer__bar">
        Copyright © 2025 by woodenfurniture. All rights reserved.
      </div>
    </>
  );
};

export default Footer;
