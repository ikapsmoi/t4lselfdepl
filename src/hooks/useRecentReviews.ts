import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export const useRecentReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer_id
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (reviewsError) throw reviewsError;

        if (reviewsData && reviewsData.length > 0) {
          const reviewerIds = reviewsData.map(r => r.reviewer_id);

          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', reviewerIds);

          if (profilesError) throw profilesError;

          const profilesMap = new Map(
            profilesData?.map(p => [p.id, p.full_name]) || []
          );

          const enrichedReviews = reviewsData.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            reviewer_name: profilesMap.get(review.reviewer_id) || 'Anonymous Traveler',
            created_at: review.created_at
          }));

          setReviews(enrichedReviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();

    const channel = supabase
      .channel('reviews-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { reviews, loading, error };
};
