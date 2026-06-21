import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trips:trip_id(id, title, location),
          profiles:traveler_id(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (
    tripId: string, 
    travelerId: string,
    hostId: string,
    travelersCount: number, 
    totalAmount: number,
    depositAmount: number,
    emergencyContact: string,
    paymentMethod: 'stripe' | 'paypal' | 'bank',
    paymentOption: 'deposit' | 'full',
    dietaryRestrictions?: string,
    specialRequests?: string
  ) => {
    try {
      // Verify that the traveler and host exist in profiles table
      const { data: travelerProfile, error: travelerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', travelerId)
        .single();

      if (travelerError || !travelerProfile) {
        throw new Error('Traveler profile not found');
      }

      const { data: hostProfile, error: hostError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', hostId)
        .single();

      if (hostError || !hostProfile) {
        throw new Error('Host profile not found');
      }

      // Create the booking record with payment status
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          trip_id: tripId,
          traveler_id: travelerId,
          host_id: hostId,
          status: 'confirmed',
          installment_plan: paymentOption === 'deposit' ? {
            enabled: true,
            dueDates: [new Date().toISOString()],
            remainingAmount: totalAmount - depositAmount
          } : {
            enabled: false,
            dueDates: [],
            remainingAmount: 0
          }
        })
        .select()
        .single();

      if (bookingError) {
        if (bookingError.code === '23505') {
          throw new Error('You have already booked this trip. Please check your dashboard for existing bookings.');
        } else if (bookingError.code === '23503') {
          throw new Error('This trip is no longer available. Please try booking a different trip.');
        } else {
          throw new Error('Unable to create your booking at this time. Please try again or contact support.');
        }
      }

      // Add logging to help diagnose foreign key issues
      console.log('Creating booking with:', {
        tripId,
        travelerId,
        hostId,
        travelerProfileExists: !!travelerProfile,
        hostProfileExists: !!hostProfile
      });

      // Refresh bookings
      await fetchBookings();
      return bookingData;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  const getUserBookings = (userId: string) => {
    return bookings.filter(booking => booking.traveler_id === userId);
  };

  const getBookingByTripAndUser = async (tripId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trips:trip_id(id, title, location, start_date, end_date, price_per_person, currency),
          profiles:traveler_id(id, name, email)
        `)
        .eq('trip_id', tripId)
        .eq('traveler_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No booking found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user booking for trip:', error);
      return null;
    }
  };

  return {
    bookings,
    loading,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    getUserBookings,
    getBookingByTripAndUser,
  };
};