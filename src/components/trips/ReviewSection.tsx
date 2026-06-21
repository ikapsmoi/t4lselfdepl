import React, { useState } from 'react';
import { Star, ThumbsUp, Camera, User, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../hooks/useAuth';
import { BADGES } from '../../utils/constants';
import { useBookings } from '../../hooks/useBookings';

interface ReviewSectionProps {
  tripId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ tripId }) => {
  const { getTripReviews, addReview, markHelpful, loading: reviewsLoading } = useReviews();
  const { user } = useAuth();
  const { getUserBookings } = useBookings();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviews = getTripReviews(tripId);
  
  // Check if user has completed this trip
  const userBookings = user ? getUserBookings(user.id) : [];
  const hasCompletedTrip = userBookings.some(booking => 
    booking.trip_id === tripId && 
    booking.status === 'confirmed' &&
    new Date(booking.trips?.end_date || '') < new Date()
  );
  
  // Check if user has already reviewed this trip
  const hasReviewed = reviews.some(review => review.reviewer_id === user?.id);

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please sign in to post a review');
      return;
    }

    if (!hasCompletedTrip) {
      alert('You can only review trips you have completed');
      return;
    }

    if (hasReviewed) {
      alert('You have already reviewed this trip');
      return;
    }

    if (!newComment.trim()) {
      alert('Please write a comment for your review');
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview(tripId, newRating, newComment);
      setShowReviewModal(false);
      setNewComment('');
      setNewRating(5);
      alert('Review posted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to post review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Reviews ({reviews.length})
        </h2>
        {user && hasCompletedTrip && !hasReviewed && (
          <Button variant="outline" onClick={() => setShowReviewModal(true)}>
            Write a Review
          </Button>
        )}
        {user && !hasCompletedTrip && (
          <div className="text-sm text-gray-500">
            Complete this trip to write a review
          </div>
        )}
        {user && hasReviewed && (
          <div className="text-sm text-green-600 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            You've reviewed this trip
          </div>
        )}
      </div>

      {reviewsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {review.reviewer?.avatar ? (
                    <img
                      src={review.reviewer.avatar}
                      alt={review.reviewer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.reviewer?.name || 'Anonymous'}</h4>
                      <div className="flex items-center space-x-2">
                        <Rating rating={review.rating} showNumber={false} size="sm" />
                        <span className="text-sm text-gray-500">• {formatDate(review.created_at)}</span>
                      </div>
                    </div>
                    
                    {review.reviewer?.badges && (
                      <div className="flex space-x-1">
                        {review.reviewer.badges.map((badgeKey) => {
                          const badge = BADGES[badgeKey as keyof typeof BADGES];
                          return badge ? (
                            <Badge key={badgeKey} variant="secondary" size="sm">
                              {badge.icon} {badge.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {review.photos && review.photos.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt="Review"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => markHelpful(review.id)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful ({review.helpful_votes})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Write a Review"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <Rating
              rating={newRating}
              interactive
              onRatingChange={setNewRating}
              size="lg"
              showNumber={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with future travelers..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview} 
              loading={submittingReview}
              disabled={submittingReview || !newComment.trim()}
              className="flex-1"
            >
              {submittingReview ? 'Posting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};