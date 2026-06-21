import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  User, MapPin, Calendar, Phone, Mail, Users, Star, 
  CheckCircle, XCircle, AlertTriangle, MessageCircle, CreditCard 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface HostTripBookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: any;
  trip?: any;
}

export const HostTripBookingDetailsModal: React.FC<HostTripBookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  trip
}) => {
  const { user } = useAuth();
  const [travelerDetails, setTravelerDetails] = useState<any>(null);
  const [tripBookings, setTripBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && (booking || trip)) {
      fetchDetails();
    }
  }, [isOpen, booking, trip]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      if (booking) {
        // Fetch traveler details for this booking
        const { data: traveler, error: travelerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', booking.traveler_id)
          .single();

        if (travelerError) throw travelerError;
        setTravelerDetails(traveler);
      } else if (trip) {
        // Fetch all bookings for this trip
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles:traveler_id (
              id, name, email, phone, avatar_url, verified, tier
            )
          `)
          .eq('trip_id', trip.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setTripBookings(bookings || []);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'cancellation_pending': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={booking ? "Booking Details" : "Trip Bookings"}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button variant="outline" onClick={fetchDetails} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : booking ? (
          // Single Booking Details
          <div className="space-y-6">
            {/* Trip Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Trip Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Trip:</span>
                  <div className="font-semibold text-gray-900">{booking.trips?.title || 'Unknown Trip'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Destination:</span>
                  <div className="font-semibold text-gray-900">{booking.trips?.location || 'Unknown'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Dates:</span>
                  <div className="font-semibold text-gray-900">
                    {booking.trips?.start_date && booking.trips?.end_date 
                      ? `${formatDate(booking.trips.start_date)} - ${formatDate(booking.trips.end_date)}`
                      : 'Dates not available'
                    }
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Price:</span>
                  <div className="font-semibold text-green-600">${booking.trips?.price_per_person || 'N/A'} per person</div>
                </div>
              </div>
            </div>

            {/* Traveler Information */}
            {travelerDetails && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Traveler Information
                </h3>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    {travelerDetails.avatar_url ? (
                      <img
                        src={travelerDetails.avatar_url}
                        alt={travelerDetails.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-xl font-semibold text-gray-900">{travelerDetails.name}</h4>
                      {travelerDetails.verified && (
                        <Badge variant="success" size="sm">Verified</Badge>
                      )}
                      <Badge variant="secondary" size="sm" className="capitalize">
                        {travelerDetails.tier} Tier
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm">{travelerDetails.email}</span>
                      </div>
                      {travelerDetails.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{travelerDetails.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Booking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Booking Date:</span>
                  <div className="font-semibold text-gray-900">{formatDate(booking.created_at)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Amount:</span>
                  <div className="font-semibold text-green-600">${booking.amount}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={getStatusColor(booking.status)} className="mt-1">
                    {booking.status === 'cancellation_pending' ? 'Cancellation Pending' : booking.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : trip ? (
          // Trip with All Bookings
          <div className="space-y-6">
            {/* Trip Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{trip.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Destination:</span>
                  <div className="font-semibold text-gray-900">{trip.location}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Duration:</span>
                  <div className="font-semibold text-gray-900">
                    {Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Capacity:</span>
                  <div className="font-semibold text-gray-900">{tripBookings.length}/{trip.group_size} booked</div>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Bookings ({tripBookings.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {tripBookings.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No bookings yet</p>
                  </div>
                ) : (
                  tripBookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                            {booking.profiles?.avatar_url ? (
                              <img
                                src={booking.profiles.avatar_url}
                                alt={booking.profiles.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{booking.profiles?.name || 'Unknown'}</h4>
                              {booking.profiles?.verified && (
                                <Badge variant="success" size="sm">Verified</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-4">
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {booking.profiles?.email}
                              </span>
                              {booking.profiles?.phone && (
                                <span className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {booking.profiles.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">${booking.amount}</div>
                          <Badge variant={getStatusColor(booking.status)} size="sm" className="mt-1">
                            {booking.status === 'cancellation_pending' ? 'Cancellation Pending' : booking.status}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(booking.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};