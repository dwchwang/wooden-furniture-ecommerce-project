import React from "react";
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
    },
    {
      id: 2,
      image: card2,
      trend: "Nội thất gỗ cao cấp – Xu hướng 2025",
      title: "Bàn ghế phòng khách",
    },
    {
      id: 3,
      image: card3,
      trend: "Nội thất gỗ cao cấp – Xu hướng 2025",
      title: "giường gỗ tự nhiên",
    },
  ];

  return (
    <section>
      <div className="section__container hero__container">
        {cards.map((card) => (
          <div key={card.id} className="hero__card">
            <img src={card.image} alt={card.title}/>
            <div className="hero__content">
              <p className="text-red-950">
                {card.trend}
              </p>
              <h4>{card.title}</h4>
              <a href="#">Discover More</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
