import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

export const useReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id (
            id,
            name,
            email,
            avatar_url,
            verified,
            tier,
            badges,
            points,
            role,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      // Transform data to match Review type
      const transformedReviews = (data || []).map(review => ({
        id: review.id,
        trip_id: review.trip_id,
        reviewer_id: review.reviewer_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        helpful_votes: review.helpful_votes || 0,
        photos: review.photo_url ? [review.photo_url] : [],
        reviewer: review.reviewer ? {
          id: review.reviewer.id,
          name: review.reviewer.name,
          email: review.reviewer.email,
          avatar: review.reviewer.avatar_url,
          role: review.reviewer.role || 'traveler',
          verified: review.reviewer.verified || false,
          points: review.reviewer.points || 0,
          tier: review.reviewer.tier || 'bronze',
          created_at: review.reviewer.created_at,
          badges: review.reviewer.badges || []
        } : undefined
      }));

      setReviews(transformedReviews);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const loadReviews = async () => {
      if (isSubscribed) {
        await fetchReviews();
      }
    };

    loadReviews();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const getTripReviews = (tripId: string) => {
    return reviews.filter(review => review.trip_id === tripId);
  };

  const addReview = async (tripId: string, rating: number, comment: string, photoUrl?: string) => {
    if (!user) {
      throw new Error('You must be logged in to post a review');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([{
          trip_id: tripId,
          reviewer_id: user.id,
          rating,
          comment,
          photo_url: photoUrl || null
        }])
        .select(`
          *,
          reviewer:profiles!reviewer_id (
            id, name, email, avatar_url, verified, tier, badges, points, role, created_at
          )
        `)
        .single();

      if (insertError) throw insertError;

      // Transform and add to local state
      const transformedReview = {
        id: data.id,
        trip_id: data.trip_id,
        reviewer_id: data.reviewer_id,
        rating: data.rating,
        comment: data.comment,
        created_at: data.created_at,
        helpful_votes: data.helpful_votes || 0,
        photos: data.photo_url ? [data.photo_url] : [],
        reviewer: data.reviewer ? {
          id: data.reviewer.id,
          name: data.reviewer.name,
          email: data.reviewer.email,
          avatar: data.reviewer.avatar_url,
          role: data.reviewer.role || 'traveler',
          verified: data.reviewer.verified || false,
          points: data.reviewer.points || 0,
          tier: data.reviewer.tier || 'bronze',
          created_at: data.reviewer.created_at,
          badges: data.reviewer.badges || []
        } : undefined
      };

      setReviews(prev => [transformedReview, ...prev]);
      return transformedReview;
    } catch (err) {
      throw err;
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      // Get current review
      const currentReview = reviews.find(r => r.id === reviewId);
      if (!currentReview) return;

      // Update in database
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ helpful_votes: currentReview.helpful_votes + 1 })
        .eq('id', reviewId);

      if (updateError) throw updateError;

      // Update local state
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, helpful_votes: review.helpful_votes + 1 }
            : review
        )
      );
    } catch (err) {
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    getTripReviews,
    addReview,
    markHelpful,
    refreshReviews: fetchReviews
  };
};