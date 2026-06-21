import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  reviewCount,
  interactive = false,
  onRatingChange,
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= Math.floor(rating);
          const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <button
              key={index}
              type="button"
              onClick={() => interactive && onRatingChange?.(starRating)}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            >
              <Star
                className={`${sizes[size]} ${
                  isFilled || isHalfFilled
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      
      {showNumber && (
        <span className={`ml-1 font-medium text-gray-900 ${textSizes[size]}`}>
          {(rating ?? 0).toFixed(1)}
        </span>
      )}
      
      {reviewCount !== undefined && (
        <span className={`ml-1 text-gray-500 ${textSizes[size]}`}>
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};