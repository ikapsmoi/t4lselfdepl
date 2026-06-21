import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Filter, Search, ChevronDown, User, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth';
import { Review } from '../types';

export const ReviewsPage: React.FC = () => {
  const { reviews, loading, markHelpful } = useReviews();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);

  useEffect(() => {
    let filtered = [...reviews];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewer?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter(review => review.rating >= minRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'helpful') {
        return b.helpful_votes - a.helpful_votes;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, ratingFilter, sortBy]);

  const handleMarkHelpful = (reviewId: string) => {
    markHelpful(reviewId);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trip Reviews</h1>
          <p className="text-gray-600 mb-6">
            Real experiences from travelers around the world
          </p>

          {/* Rating Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900 mb-2">{averageRating}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(parseFloat(averageRating)))}
                </div>
                <p className="text-sm text-gray-600">{reviews.length} reviews</p>
              </div>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={ratingFilter}
              onChange={(value) => setRatingFilter(value)}
              options={[
                { value: 'all', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4+ Stars' },
                { value: '3', label: '3+ Stars' },
                { value: '2', label: '2+ Stars' },
                { value: '1', label: '1+ Stars' },
              ]}
            />

            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as 'recent' | 'helpful' | 'rating')}
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'helpful', label: 'Most Helpful' },
                { value: 'rating', label: 'Highest Rated' },
              ]}
            />
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Reviewer Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {review.reviewer?.avatar ? (
                          <img
                            src={review.reviewer.avatar}
                            alt={review.reviewer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {review.reviewer?.name || 'Anonymous'}
                          </h3>
                          {review.reviewer?.verified && (
                            <Badge variant="info" size="sm">
                              Verified
                            </Badge>
                          )}
                          {review.reviewer?.tier && (
                            <Badge
                              variant={
                                review.reviewer.tier === 'gold'
                                  ? 'warning'
                                  : review.reviewer.tier === 'silver'
                                  ? 'secondary'
                                  : 'primary'
                              }
                              size="sm"
                            >
                              {review.reviewer.tier}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  </div>

                  {/* Review Photo */}
                  {review.photos && review.photos.length > 0 && review.photos[0] && (
                    <div className="mb-4">
                      <img
                        src={review.photos[0]}
                        alt="Review"
                        className="rounded-xl max-h-96 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(review.photos![0])}
                      />
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful_votes})
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-6xl max-h-full">
              <img
                src={selectedImage}
                alt="Review"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white text-gray-900 rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
