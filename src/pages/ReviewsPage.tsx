import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Search, User, Facebook, Instagram, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useReviews } from '../hooks/useReviews';
import { Review } from '../types';

export const ReviewsPage: React.FC = () => {
  const { reviews, loading, markHelpful } = useReviews();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-[#fff8f1] to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Traveler Reviews</h1>
          <p className="mb-6 text-gray-600">
            Real experiences from travelers around the world.
          </p>

          {/* Rating Summary */}
          <div className="flex flex-col gap-6 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
            <div className="shrink-0 text-center sm:min-w-36">
              <div className="mb-1 text-6xl font-bold tracking-tight text-orange-700">4.7</div>
              <p className="text-sm font-medium text-gray-600">out of 5</p>
            </div>
            <div className="border-t border-orange-200 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                13 years of helping travelers make memories
              </h2>
              <p className="mt-2 max-w-3xl leading-relaxed text-gray-600">
                Read what our customers say on our review and social pages below.
              </p>
            </div>
          </div>
        </div>

        {/* Independent review and social pages */}
        <section
          aria-labelledby="external-reviews-heading"
          className="mb-8 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
        >
          <div className="p-5 sm:p-8">
            <div className="mb-5">
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-orange-700">
                From our community
              </p>
              <h2 id="external-reviews-heading" className="text-xl font-bold text-gray-900 sm:text-2xl">
                Read our customer reviews
              </h2>
              <p className="mt-2 max-w-3xl text-gray-600">
                Visit our pages to read feedback and see more of our travel community.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  name: 'Travel Life',
                  href: 'https://www.facebook.com/travellife2/reviews',
                  platform: 'Facebook',
                  description: 'Travel experiences and feedback from the Travel Life community.',
                  action: 'Read Facebook reviews',
                },
                {
                  name: 'The Travellers Store',
                  href: 'https://www.facebook.com/thetravellersstore/reviews',
                  platform: 'Facebook',
                  description: 'Browse customer reviews on The Travellers Store Facebook page.',
                  action: 'Read Facebook reviews',
                },
                {
                  name: 'Travel4Life',
                  href: 'https://share.google/A8SbO5BriJrmdT7Zl',
                  platform: 'Google',
                  description: 'See customer feedback on our Google business profile.',
                  action: 'Read Google reviews',
                },
                {
                  name: '@travel4life_net',
                  href: 'https://www.instagram.com/travel4life_net/',
                  platform: 'Instagram',
                  description: 'Follow trip highlights, travel inspiration, and updates.',
                  action: 'Visit Instagram',
                },
              ].map((page) => (
                <a
                  key={page.href}
                  href={page.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-40 flex-col justify-between rounded-xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/70 p-4 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      {page.platform === 'Facebook' ? (
                        <Facebook className="h-4 w-4 text-[#1877F2]" fill="currentColor" aria-hidden="true" />
                      ) : page.platform === 'Instagram' ? (
                        <Instagram className="h-4 w-4 text-[#C13584]" aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true" className="text-base font-extrabold text-[#4285F4]">G</span>
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                        {page.platform}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-orange-800">
                      {page.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{page.description}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                    {page.action}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Google, Facebook, and Instagram are independent platforms. You may need to sign in to
              view some content.
            </p>
          </div>
        </section>

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
