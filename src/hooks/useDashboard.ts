import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trip, Booking } from '../types';
import { useAnalytics } from '../utils/analytics';

export interface DashboardStats {
  totalTrips: number;
  totalTravelers: number;
  totalEarnings: number;
  avgRating: number;
}

export interface HostDetails {
  id: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  mobile?: string;
  address?: string;
  bank_details?: string;
  currency_preference?: string;
}

export interface SavedTrip {
  id: string;
  trip: Trip;
  saved_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  pending_discount_percentage: number;
  total_discount_earned: number;
  referral_events: Array<{
    id: string;
    referred_name: string;
    referred_email: string;
    discount_percentage: number;
    created_at: string;
  }>;
}

export const useDashboard = (userId: string, userRole: 'host' | 'traveler') => {
  const { saveTrip: trackSaveTrip } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalTravelers: 0,
    totalEarnings: 0,
    avgRating: 0
  });
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [hostDetails, setHostDetails] = useState<HostDetails | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loadingReferralStats, setLoadingReferralStats] = useState(false);

  // Fetch traveler's upcoming trips from bookings
  const fetchTravelerUpcomingTrips = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *, trips:trip_id (
            id,
            host_id,
            title,
            location,
            start_date,
            end_date,
            price_per_person,
            category,
            images
          )
        `)
        .eq('traveler_id', userId)
        .in('status', ['confirmed', 'pending'])
        .gte('trips.start_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const trips = data?.filter(booking => booking.trips !== null).map(booking => {
        const startDate = new Date(booking.trips.start_date);
        const endDate = new Date(booking.trips.end_date);
        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...booking.trips,
          destination: booking.trips.location,
          price: booking.trips.price_per_person,
          duration: durationDays, // Calculate duration dynamically
          images: booking.trips.images && booking.trips.images.length > 0
            ? booking.trips.images
            : ['https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'], // Fallback image
          booking_status: booking.status,
          booking_id: booking.id,
          type: booking.trips.category,
          max_capacity: booking.trips.group_size || 10,
          current_bookings: 0,
          rating: 4.8,
          review_count: 0,
          itinerary: {},
          featured: false,
          tags: [],
          difficulty: 'easy',
          included: [],
          not_included: [],
          requirements: [],
          cancellation_policy: 'Free cancellation up to 14 days before departure',
          deposit_required: Number((Number(booking.trips.price_per_person) * 0.3).toFixed(2)),
          group_discount: 10,
          safety_measures: []
        };
      }) || [];

      setUpcomingTrips(trips);
    } catch (error) {
      console.error('Error fetching traveler upcoming trips:', error);
     // Set empty array on error to prevent UI issues
     setUpcomingTrips([]);
    }
  };

  // Fetch traveler's past trips from bookings
  const fetchTravelerPastTrips = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *, trips:trip_id (
            id,
            title,
            host_id,
            location,
            start_date,
            end_date,
            price_per_person,
            category,
            images
          )
        `)
        .eq('traveler_id', userId)
        .eq('status', 'confirmed')
        .lt('trips.end_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      const trips = (data ?? [])
        .filter(booking => booking && booking.trips && booking.trips.start_date)
        .map(booking => {
        const startDate = new Date(booking.trips.start_date);
        const endDate = new Date(booking.trips.end_date);
        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...booking.trips,
          destination: booking.trips.location,
          price: booking.trips.price_per_person,
          duration: durationDays,
          images: booking.trips.images && booking.trips.images.length > 0
            ? booking.trips.images
            : ['https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'],
          booking_status: booking.status,
          booking_id: booking.id
        };
      });

      setPastTrips(trips);
    } catch (error) {
      console.error('Error fetching traveler past trips:', error);
      setPastTrips([]);
    }
  };

  // Fetch saved trips for traveler
  const fetchSavedTrips = async () => {
    // Return early if userId is not valid
    if (!userId || userId.trim() === '') {
      setSavedTrips([]);
      return;
    }

    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured - skipping saved trips fetch');
      setSavedTrips([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_trips')
        .select(`
          id,
          created_at, trips:trip_id (
            id,
            title,
            location,
            price_per_person,
            rating,
            category,
            start_date,
            end_date,
            images,
            itinerary
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const savedTripsData = data?.map(item => ({
        id: item.id,
        trip: {
          ...item.trips,
          destination: item.trips.location,
          price: item.trips.price_per_person,
          rating: item.trips.rating ?? 4.8, // Default rating if null
          review_count: item.trips.review_count ?? 0, // Default review count
          type: item.trips.category,
          duration: item.trips.start_date && item.trips.end_date
            ? Math.ceil((new Date(item.trips.end_date).getTime() - new Date(item.trips.start_date).getTime()) / (1000 * 60 * 60 * 24))
            : 7, // fallback to 7 days if dates are missing
          images: item.trips.images && item.trips.images.length > 0
            ? item.trips.images
            : ['https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg'],
          tags: item.trips.itinerary?.tags || [],
          included: item.trips.itinerary?.included || [],
          not_included: item.trips.itinerary?.not_included || [],
          requirements: item.trips.itinerary?.requirements || [],
          safety_measures: item.trips.itinerary?.safety_measures || []
        },
        saved_at: item.created_at
      })) || [];

      setSavedTrips(savedTripsData);
    } catch (error) {
      console.error('Error fetching saved trips:', error);
      setSavedTrips([]);
    }
  };

  // Fetch host stats
  const fetchHostStats = async () => {
    if (!userId) return;
    
    try {
      // Total trips
      const { count: totalTrips } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId);

      // Total travelers (sum of confirmed bookings)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id,
          trips!inner(host_id)
        `)
        .eq('trips.host_id', userId)
        .eq('status', 'confirmed');

      const totalTravelers = bookingsData?.length || 0;

      // Total earnings (sum of paid payments)
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(`
          amount,
          bookings!payments_booking_id_fkey!inner(
            trips!inner(host_id)
          )
        `)
        .eq('bookings.trips.host_id', userId)
        .eq('status', 'paid');

      const totalEarnings = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Average rating (from reviews table - we'll create this later)
      // For now, use a default value
      const avgRating = 4.8;

      setStats({
        totalTrips: totalTrips || 0,
        totalTravelers,
        totalEarnings,
        avgRating
      });
    } catch (error) {
      console.error('Error fetching host stats:', error);
    }
  };

  // Fetch host's upcoming trips
  const fetchHostUpcomingTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('host_id', userId)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (error) throw error;
      setUpcomingTrips(data || []);
    } catch (error) {
      console.error('Error fetching host upcoming trips:', error);
    }
  };

  // Fetch host's recent bookings
  const fetchHostRecentBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trips!inner(
            id,
            title,
            location,
            start_date,
            end_date,
            price_per_person,
            currency
          ),
          profiles:traveler_id(
            id,
            name,
            email,
            avatar_url,
            verified,
            tier
          )
        `)
        .eq('trips.host_id', userId)
        .in('status', ['confirmed', 'pending', 'cancellation_pending'])
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      setRecentBookings(data || []);
    } catch (error) {
      console.error('Error fetching host recent bookings:', error);
      setRecentBookings([]);
    }
  };

  // Fetch host details
  const fetchHostDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('host_details')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHostDetails(data || null);
    } catch (error) {
      console.warn('Host details not found - this is expected for new hosts:', error);
    }
  };

  // Fetch referral stats
  const fetchReferralStats = async () => {
    setLoadingReferralStats(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('No session available for referral stats');
        setReferralStats(null);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-referral-stats`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const stats = await response.json();
        setReferralStats(stats);
      } else {
        console.error('Failed to fetch referral stats');
        setReferralStats(null);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      setReferralStats(null);
    } finally {
      setLoadingReferralStats(false);
    }
  };

  // Reset pending discount after it's been used
  const resetPendingDiscount = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No session available');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-pending-discount`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reset pending discount');
      }

      // Refresh referral stats
      await fetchReferralStats();
      return true;
    } catch (error) {
      console.error('Error resetting pending discount:', error);
      return false;
    }
  };

  // Save host details
  const saveHostDetails = async (details: Partial<HostDetails>) => {
    try {
      const { error } = await supabase
        .from('host_details')
        .upsert({
          id: userId,
          ...details,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setHostDetails(prev => ({ ...prev, ...details } as HostDetails));
      return true;
    } catch (error) {
      console.error('Error saving host details:', error);
      return false;
    }
  };

  // Save trip to saved_trips
  const saveTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('saved_trips')
        .insert({
          user_id: userId,
          trip_id: tripId
        });

      if (error) throw error;
      
      // Refresh saved trips
      trackSaveTrip(tripId);
      await fetchSavedTrips();
      return true;
    } catch (error) {
      console.error('Error saving trip:', error);
      return false;
    }
  };

  // Remove trip from saved_trips
  const unsaveTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('saved_trips')
        .delete()
        .eq('user_id', userId)
        .eq('trip_id', tripId);

      if (error) throw error;
      
      // Refresh saved trips
      await fetchSavedTrips();
      return true;
    } catch (error) {
      console.error('Error unsaving trip:', error);
      return false;
    }
  };

  // Create new trip
  const createTrip = async (tripData: any) => {
    try {
      const tripPayload = {
        host_id: userId,
        title: tripData.title,
        category: tripData.type,
        location: tripData.destination,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        itinerary: tripData.itinerary || {},
        price_per_person: parseFloat(tripData.price),
        group_size: parseInt(tripData.maxCapacity),
        status: 'active',
        images: tripData.images || [],
        difficulty: tripData.difficulty || 'easy'
      };

      // If tripData has an id, include it for updates
      if (tripData.id) {
        tripPayload.id = tripData.id;
      }

      const { data, error } = await supabase
        .from('trips')
        .upsert(tripPayload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh host data
      if (userRole === 'host') {
        await Promise.all([
          fetchHostStats(),
          fetchHostUpcomingTrips()
        ]);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating/updating trip:', error);
      console.error('Trip data:', tripData);
      console.error('Supabase error details:', error);
      return null;
    }
  };

  // Delete trip function
  const deleteTrip = async (tripId: string) => {
    try {
      // Check if trip has any bookings
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('trip_id', tripId);

      if (bookingsError) {
        console.error('Error checking bookings:', bookingsError);
        return { success: false, error: 'Failed to check trip bookings. Please try again.' };
      }

      if (existingBookings && existingBookings.length > 0) {
        return { 
          success: false, 
          error: 'Trip has existing bookings. Please contact support@traveltag.net to proceed with deletion.' 
        };
      }

      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('host_id', userId);

      if (error) throw error;
      
      // Refresh host data
      if (userRole === 'host') {
        await Promise.all([
          fetchHostStats(),
          fetchHostUpcomingTrips()
        ]);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting trip:', error);
      return { success: false, error: 'Failed to delete trip. Please try again.' };
    }
  };

  // Cancel booking function
  const cancelBooking = async (bookingId: string) => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancellation_pending' })
        .eq('id', bookingId)
        .eq('traveler_id', userId);

      if (error) throw error;
      
      // Refresh traveler data
      if (userRole === 'traveler') {
        await fetchTravelerUpcomingTrips();
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  };

  // Host function to approve/reject cancellation
  const updateBookingStatusByHost = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Refresh host data
      if (userRole === 'host') {
        await fetchHostRecentBookings();
      }
      
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  };
  // Initialize data based on user role
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (userRole === 'host') {
        await Promise.all([
          fetchHostStats(),
          fetchHostUpcomingTrips(),
          fetchHostRecentBookings(),
          fetchHostDetails()
        ]);
      } else {
        await Promise.all([
          fetchTravelerUpcomingTrips(),
          fetchTravelerPastTrips(), // Added this to fetch past trips
          fetchSavedTrips(),
          fetchReferralStats()
        ]);
      }
      
      setLoading(false);
    };

    if (userId) {
      fetchData();
    }
  }, [userId, userRole]);

  return {
    loading,
    error,
    stats,
    upcomingTrips,
    pastTrips,
    recentBookings,
    savedTrips,
    hostDetails,
    referralStats,
    loadingReferralStats,
    saveHostDetails,
    saveTrip,
    unsaveTrip,
    createTrip,
    deleteTrip,
    cancelBooking,
    updateBookingStatusByHost,
    fetchReferralStats,
    resetPendingDiscount,
    refreshData: () => {
      return Promise.all([
        userRole === 'host' 
          ? Promise.all([
              fetchHostStats(),
              fetchHostUpcomingTrips(),
              fetchHostRecentBookings()
            ])
          : Promise.all([
              fetchTravelerUpcomingTrips(),
              fetchTravelerPastTrips(),
              fetchSavedTrips(),
              fetchReferralStats()
            ])
      ]);
    }
  };
};