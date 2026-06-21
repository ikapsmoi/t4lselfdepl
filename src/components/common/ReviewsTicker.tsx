import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { useRecentReviews } from '../../hooks/useRecentReviews';

const ReviewsTicker: React.FC = memo(() => {
  const { reviews, loading, error } = useRecentReviews();

  if (loading) {
    return (
      <div className="reviews-ticker-container">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return null;
  }

  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div className="reviews-ticker-container">
      <div className="reviews-ticker-gradient-top"></div>
      <div className="reviews-ticker-scroll">
        {duplicatedReviews.map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="reviews-ticker-item"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {review.reviewer_name}
                  </span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="reviews-ticker-gradient-bottom"></div>
    </div>
  );
});

ReviewsTicker.displayName = 'ReviewsTicker';

export default ReviewsTicker;
