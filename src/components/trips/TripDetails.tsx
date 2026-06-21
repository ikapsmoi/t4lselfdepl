import React, { useState, useEffect } from 'react';
import { 
  Star, Users, Calendar, MapPin, Clock, Shield, Heart, Share2, X,
  CheckCircle, XCircle, AlertTriangle, Camera, MessageCircle, Eye 
} from 'lucide-react';
import { Trip, User, Booking } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { BookingModal } from './BookingModal';
import { ReviewSection } from './ReviewSection';
import { VRPreview } from '../vr/VRPreview';
import { InquireNowModal } from './InquireNowModal';
import { MessageHostModal } from './MessageHostModal';
import { PromoteTripModal } from './PromoteTripModal';
import { BookingConfirmationDisplayModal } from './BookingConfirmationDisplayModal';
import { TRIP_TYPES, DIFFICULTY_LEVELS, BADGES } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/constants';
import { useAnalytics } from '../../utils/analytics';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import { INDIA_CATEGORIES } from '../../utils/constants';
interface TripDetailsProps {
  trip: Trip;
  onClose: () => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ trip, onClose }) => {
  const { viewTrip, clickJoin } = useAnalytics();
  const { user } = useAuth();
  const { getBookingByTripAndUser } = useBookings();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [showVRPreview, setShowVRPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMessageHostModal, setShowMessageHostModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showExistingBookingConfirmationModal, setShowExistingBookingConfirmationModal] = useState(false);
  const [userBookingForThisTrip, setUserBookingForThisTrip] = useState<Booking | null>(null);

  // Track trip view event
  React.useEffect(() => {
    viewTrip(trip.id);
  }, [trip.id]);

  // Fetch user's booking for this trip
  useEffect(() => {
    const fetchUserBooking = async () => {
      if (user && user.id) {
        try {
          const booking = await getBookingByTripAndUser(trip.id, user.id);
          setUserBookingForThisTrip(booking);
        } catch (error) {
          console.error('Error fetching user booking:', error);
          setUserBookingForThisTrip(null);
        }
      } else {
        setUserBookingForThisTrip(null);
      }
    };

    fetchUserBooking();
  }, [user, trip.id, getBookingByTripAndUser]);

  // Auto-close after 10 seconds
  //useEffect(() => {
    //const timer = setTimeout(() => {
    //  onClose();
   // }, 15000); // 10 seconds

    // Clear the timer if the component unmounts or onClose is called
    //return () => clearTimeout(timer);
  //}, [onClose]);

  const spotsLeft = trip.max_capacity - trip.current_bookings;
  const tripType = TRIP_TYPES.find(t => t.value === trip.type);
  const difficultyLevel = DIFFICULTY_LEVELS.find(d => d.value === trip.difficulty);
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0;
  const isFull = spotsLeft === 0;

  // Determine the currency symbol based on trip type
  const displayCurrencySymbol = React.useMemo(() => {
    const indiaSpecialTypes = INDIA_CATEGORIES.map(cat => cat.value);
    if (!indiaSpecialTypes.includes('indian_special')) {
        indiaSpecialTypes.push('indian_special');
    }

    if (trip.type && indiaSpecialTypes.includes(trip.type)) {
      return '₹'; // Force INR for India Special trips
    }
    return getCurrencySymbol(trip.currency || 'INR'); // Fallback to existing logic
  }, [trip.type, trip.currency]);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = () => {
    setShowPromoteModal(true);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Trip Details</h1> 
            </div>
            <button 
              onClick={onClose} 
              aria-label="Close trip details"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center justify-center space-x-2 mt-3 max-w-7xl mx-auto">
              <Button variant="ghost" size="sm" onClick={handleShare} icon={Share2}>
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowVRPreview(true)} icon={Eye}>
                Preview Trip
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSaved(!isSaved)}
                icon={Heart}
                className={isSaved ? 'text-red-500' : ''}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                <img
                  src={(trip.images && trip.images.length > 0) ? trip.images[selectedImageIndex] : 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                  alt={trip.title}
                  className="w-full h-64 md:h-96 object-cover rounded-xl"
                />
                {(trip.images && trip.images.length > 1) && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {trip.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index ? 'border-yellow-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Trip Info */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {trip.featured && <Badge variant="warning">⭐ Featured</Badge>}
                  <Badge variant={tripType?.value === 'adventure' ? 'success' : 'info'}>
                    {tripType?.label}
                  </Badge>
                  <Badge variant="secondary" className={difficultyLevel?.color}>
                    {difficultyLevel?.label}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{trip.title}</h1>
                {userBookingForThisTrip && (
                  <Badge
                    variant={getStatusColor(userBookingForThisTrip.status)}
                    className="mb-4"
                  >
                    Booked: {userBookingForThisTrip.status === 'cancellation_pending' ? 'Cancellation Pending' : userBookingForThisTrip.status}
                  </Badge>
                )}

                
                <div className="flex items-center space-x-4 mb-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{trip.duration} days</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span>{trip.max_capacity} max</span>
                  </div>
                  <Rating rating={trip.rating} reviewCount={trip.review_count} />
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">{trip.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {trip.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    What's Included
                  </h3>
                  <ul className="space-y-2 list-disc ml-5">
                    {trip.included.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    Not Included
                  </h3>
                  <ul className="space-y-2 list-disc ml-5">
                    {trip.not_included.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Requirements & Safety */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    Requirements
                  </h3>
                  <ul className="space-y-2 list-disc ml-5">
                    {trip.requirements.map((req, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    Safety Measures
                  </h3>
                  <ul className="space-y-2 list-disc ml-5">
                    {trip.safety_measures.map((measure, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        {measure}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reviews */}
              <ReviewSection tripId={trip.id} />
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 border">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">{getCurrencySymbol(trip.currency || 'USD')}{trip.price}</div>
                  <div className="text-gray-600">per person</div>
                  {trip.early_bird_discount && (
                    <Badge variant="success" size="sm" className="mt-2">
                      Save {trip.early_bird_discount}% - Early Bird!
                    </Badge>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dates:</span>
                    <span className="font-medium">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{trip.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Group size:</span>
                    <span className="font-medium">{trip.current_bookings}/{trip.max_capacity} travelers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className={`font-medium ${difficultyLevel?.color}`}>{difficultyLevel?.label}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Spots filled</span>
                    <span className="font-medium">{trip.current_bookings}/{trip.max_capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(trip.current_bookings / trip.max_capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {isFull ? (
                  <Button variant="outline" className="w-full" disabled>
                    Trip is Full
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        clickJoin(trip.id);
                        setShowBookingModal(true);
                      }}
                    >
                      Book Now - {getCurrencySymbol(trip.currency || 'USD')}{trip.deposit_required} deposit
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowMessageHostModal(true)}
                      icon={MessageCircle}
                    >
                      Message Host
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => setShowVRPreview(true)}
                      icon={Eye}
                    >
                      360° Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => setShowInquireModal(true)}
                      icon={MessageCircle}
                    >
                      Inquire Now
                    </Button>
                  </div>
                )}

                {isAlmostFull && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center text-orange-800">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Only {spotsLeft} spots left!</span>
                    </div>
                  </div>
                )}

                {/* Cancellation Policy */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                  <p className="text-sm text-gray-600">{trip.cancellation_policy}</p>
                </div>

                {/* Group Discount */}
                {trip.group_discount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-green-800 text-sm">
                      <strong>Group Discount:</strong> Save {trip.group_discount}% when booking with 4+ people
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        trip={trip}
      />

      <InquireNowModal
        isOpen={showInquireModal}
        onClose={() => setShowInquireModal(false)}
        trip={trip}
      />

      <MessageHostModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        trip={trip}
      />

      <MessageHostModal
        isOpen={showMessageHostModal}
        onClose={() => setShowMessageHostModal(false)}
        trip={trip}
      />

      <PromoteTripModal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        trip={trip}
      />

      {/* VR Preview */}
      {showVRPreview && (
        <VRPreview
          trip={trip}
          onClose={() => setShowVRPreview(false)}
        />
      )}

      {/* Existing Booking Confirmation Modal */}
      {showExistingBookingConfirmationModal && userBookingForThisTrip && (
        <BookingConfirmationDisplayModal
          isOpen={showExistingBookingConfirmationModal}
          onClose={() => setShowExistingBookingConfirmationModal(true)}
          booking={userBookingForThisTrip}
          trip={trip}
        />
      )}
    </div>
  );
};
