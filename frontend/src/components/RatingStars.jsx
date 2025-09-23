import React from "react";

const RatingStars = ({ rating }) => {
  const star = [];
  for (let i = 1; i <= 5; i++) {
    star.push(
      <span
        key={i}
        className={`ri-star${i <= rating ? "-fill" : "-line"}`}
      ></span>
    );
  }
  return <div className="product__rating">{star}</div>;
};

export default RatingStars;
