
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { SearchFilters, Trip } from "@/types";
import { formatCitiesForDisplay } from '../../utils/formatters';

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [uniqueDestinations, setUniqueDestinations] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});

  // Fetch trips from Supabase
  const fetchTrips = useCallback(async (searchFilters?: SearchFilters) => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setTrips([]);
      setUniqueDestinations([]);
      setError(null);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      let query = supabase
        .from('trips')
        .select(`
          *,
          profiles:host_id (
            id, name, email, avatar_url, verified, tier, role, points, created_at, badges,
            host_details (
              currency_preference
            )
          )
        `)
        .eq('status', 'active');

      // Apply search filters
      if (searchFilters?.destination) {
        query = query.ilike('location', `%${searchFilters.destination}%`);
      }

      if (searchFilters?.type) {
        query = query.eq('category', searchFilters.type);
      }

      if (searchFilters?.minPrice) {
        query = query.gte('price_per_person', searchFilters.minPrice);
      }

      if (searchFilters?.maxPrice) {
        query = query.lte('price_per_person', searchFilters.maxPrice);
      }

      if (searchFilters?.maxGroupSize) {
        query = query.lte('group_size', searchFilters.maxGroupSize);
      }

      if (searchFilters?.difficulty) {
             query = query.eq('difficulty', searchFilters.difficulty);
        }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        // Filter by duration in-memory (since it's calculated from dates)
        let filteredData = data;
        if (searchFilters?.duration) {
          filteredData = data.filter(trip => {
            const calculatedDuration = Math.ceil(
              (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (searchFilters.duration === 30) {
              return calculatedDuration >= 30; // 30+ days
            } else {
              return calculatedDuration <= searchFilters.duration;
            }
          });
        }

        // ✅ Extract unique destinations
        const destinations = Array.from(
          new Set(filteredData.map((t) => t.location).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        setUniqueDestinations(destinations);

        
        // Get booking counts for each trip
        const tripIds = filteredData.map(trip => trip.id);
        let bookingCounts: Record<string, number> = {};
        
        if (tripIds.length > 0) {
          const { data: bookingsData } = await supabase
            .from('bookings')
            .select('trip_id')
            .in('trip_id', tripIds)
            .eq('status', 'confirmed');
          
          bookingCounts = (bookingsData || []).reduce((acc, booking) => {
            acc[booking.trip_id] = (acc[booking.trip_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }

        // Transform the data to match our Trip interface
        let transformedTrips: Trip[] = filteredData.map(trip => ({
          id: trip.id,
          title: trip.title,
          description: trip.itinerary?.description || 'Amazing travel experience awaits you on this incredible journey.',
          destination: trip.location,
          country: trip.location.split(',').pop()?.trim() || 'Unknown',
          type: trip.category,
          price: Number(trip.price_per_person),
          currency: trip.currency  ||trip.profiles?.host_details?.currency_preference || 'USD',
          duration: trip.itinerary?.duration ? Number(trip.itinerary.duration) : Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
          max_capacity: trip.group_size,
          current_bookings: bookingCounts[trip.id] || 0,
          start_date: trip.start_date,
          end_date: trip.end_date,
          images: trip.images && trip.images.length > 0 ? trip.images : [
            'https://images.pexels.com/photos/8185807/pexels-photo-8185807.jpeg'
          ],
          host_id: trip.host_id,
          host: trip.profiles ? {
            id: trip.profiles.id,
            name: trip.profiles.name,
            email: trip.profiles.email,
            avatar_url: trip.profiles.avatar_url,
            role: 'host',
            verified: trip.profiles.verified || false,
            points: 0,
            tier: 'silver',
            created_at: '',
            badges: []
          } : undefined,
          rating: 4.8, // Default rating for new trips
          review_count: 0,
          itinerary: trip.itinerary || {},
          created_at: trip.created_at,
          featured: trip.nomadic_badge || false,
          tags: trip.itinerary?.tags || [],
          difficulty: trip.difficulty,
          included: trip.itinerary?.included || [],
          not_included: trip.itinerary?.notIncluded || [],
          requirements: trip.itinerary?.requirements || [],
          cancellation_policy: 'Free cancellation up to 14 days before departure',
          deposit_required: Number((Number(trip.price_per_person) * 0.05).toFixed(2)),
          group_discount: trip.group_discount || 0, // Use actual group_discount from DB, default to 0 if null
          safety_measures: trip.itinerary?.safetyMeasures || []
        }));

        // Apply rating filter in-memory (since rating is currently mock data)
        if (searchFilters?.rating) {
          transformedTrips = transformedTrips.filter(trip => trip.rating >= searchFilters.rating!);
        }

        setTrips(transformedTrips);
      }
    } catch (error) {
      
      // Handle network/fetch errors gracefully
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Supabase not configured. Please click "Connect to Supabase" in the top right corner.');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to fetch trips');
      }
      
      setTrips([]);
      setUniqueDestinations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips(filters);
  }, [fetchTrips, filters]);

  const searchTrips = (searchFilters: SearchFilters) => {
    setFilters(searchFilters);
  };

  // Refresh trips data
  const refreshTrips = async () => {
    await fetchTrips(filters);
  };

  const getFeaturedTrip = useMemo(() => trips.find(trip => trip.featured), [trips]);

  const getTopRatedTrips = useMemo(() => trips
    .filter(trip => !trip.featured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6), [trips]);

  const getTrendingTrips = useMemo(() => trips
    .filter(trip => !trip.featured)
    .sort((a, b) => b.current_bookings - a.current_bookings)
    .slice(0, 6), [trips]);

  const getNearbyTrips = useMemo(() => (userLocation?: string) => {
    // In a real app, this would use geolocation
    return trips.slice(0, 3);
  }, [trips]);

  const getTripById = useMemo(() => (id: string) => trips.find(trip => trip.id === id), [trips]);

  const getFeaturedTripsArray = useMemo(() => trips.filter(trip => trip.featured), [trips]);

  return {
    trips,
    loading,
    error,
    filters,
    searchTrips,
    refreshTrips,
    getFeaturedTrip,
    getTopRatedTrips,
    getTrendingTrips,
    getNearbyTrips,
    getTripById,
    getFeaturedTripsArray,
    uniqueDestinations,
    fetchTrips,
  };
};
