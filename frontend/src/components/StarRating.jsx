import React from 'react';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange = null
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const handleClick = (index) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const filled = index < Math.floor(rating);
        const halfFilled = !filled && index < rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              } ${filled || halfFilled ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            {filled ? (
              <i className="ri-star-fill"></i>
            ) : halfFilled ? (
              <i className="ri-star-half-fill"></i>
            ) : (
              <i className="ri-star-line"></i>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
