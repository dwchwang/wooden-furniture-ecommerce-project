import React from "react";
import { Link } from "react-router-dom";
import card1 from "../../assets/card-1.png";
import card2 from "../../assets/card-2.jpg";
import card3 from "../../assets/card-3.jpg";

const HeroSection = () => {
  const cards = [
    {
      id: 1,
      image: card1,
      trend: "Nội thất gỗ cao cấp – Xu hướng 2025",
      title: "Tủ gỗ hiện đại",
      link: "/shop?type=Tủ"
    },
    {
      id: 2,
      image: card2,
      trend: "Nội thất gỗ cao cấp – Xu hướng 2025",
      title: "Bàn ghế phòng khách",
      link: "/shop?type=Bàn"
    },
    {
      id: 3,
      image: card3,
      trend: "Nội thất gỗ cao cấp – Xu hướng 2025",
      title: "Giường gỗ tự nhiên",
      link: "/shop?type=Giường"
    },
  ];

  return (
    <section>
      <div className="section__container hero__container">
        {cards.map((card) => (
          <div key={card.id} className="hero__card">
            <img src={card.image} alt={card.title} />
            <div className="hero__content">
              <p className="text-red-950">
                {card.trend}
              </p>
              <h4>{card.title}</h4>
              <Link to={card.link}>Discover More</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
