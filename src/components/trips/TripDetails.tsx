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
import { PromoteTripModal } from './PromoteTripModal';
import { BookingConfirmationDisplayModal } from './BookingConfirmationDisplayModal';
import { TRIP_TYPES, DIFFICULTY_LEVELS, BADGES, DEFAULT_TRIP_INCLUSIONS, DEFAULT_TRIP_EXCLUSIONS } from '../../utils/constants';
import { DEFAULT_TRIP_REVIEWS } from '../../utils/defaultReviews';
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
  const { viewTrip, clickJoin, whatsappClick } = useAnalytics();
  const { user } = useAuth();
  const { getBookingByTripAndUser } = useBookings();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [showVRPreview, setShowVRPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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
  const includedItems = trip.included?.some(item => item.trim())
    ? trip.included
    : DEFAULT_TRIP_INCLUSIONS;
  const excludedItems = trip.not_included?.some(item => item.trim())
    ? trip.not_included
    : DEFAULT_TRIP_EXCLUSIONS;
  const displayedExcludedItems = trip.type === 'indian_special'
    ? excludedItems.filter(item => item !== 'City tax if applicable.' && item !== 'Visa fees not included.')
    : excludedItems;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleWhatsAppClick = () => {
    const message = `Hi Travel4life! I would like to check availability for "${trip.title}" in ${trip.destination}. Dates: ${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}. Please share the package details and next steps.`;
    window.open(`https://wa.me/919871621921?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    whatsappClick('trip_details', trip.id);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-xs md:text-sm">
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 bg-white border-b px-3 py-2 md:px-4 md:py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center">
              <h1 className="text-sm font-semibold text-gray-900 md:text-lg">Trip Details</h1>
            </div>
            <button 
              onClick={onClose} 
              aria-label="Close trip details"
              className="p-1.5 md:p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <X className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>
          <div className="flex items-center justify-center space-x-1.5 md:space-x-2 mt-2 md:mt-3 max-w-7xl mx-auto">
              <Button variant="ghost" size="sm" onClick={handleShare} icon={Share2} className="text-[10px] px-2 py-1 md:text-sm">
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowVRPreview(true)} icon={Eye} className="text-[10px] px-2 py-1 md:text-sm">
                Preview Trip
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSaved(!isSaved)}
                icon={Heart}
                className={`text-[10px] px-2 py-1 md:text-sm ${isSaved ? 'text-red-500' : ''}`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 py-4 md:px-4 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="space-y-3 md:space-y-4">
                <img
                  src={(trip.images && trip.images.length > 0) ? trip.images[selectedImageIndex] : (trip.type === 'budget' ? '/pkg1.png' : 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg')}
                  alt={trip.title}
                  className="w-full h-48 md:h-96 object-cover rounded-xl"
                />
                {(trip.images && trip.images.length > 1) && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {trip.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index ? 'border-yellow-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                  {trip.featured && <Badge variant="warning" className="text-[9px] md:text-xs">⭐ Featured</Badge>}
                  <Badge variant={tripType?.value === 'adventure' ? 'success' : 'info'} className="text-[9px] md:text-xs">
                    {tripType?.label}
                  </Badge>
                  <Badge variant="secondary" className={`${difficultyLevel?.color} text-[9px] md:text-xs`}>
                    {difficultyLevel?.label}
                  </Badge>
                </div>

                <h1 className="tour-detail-title text-gray-900 mb-3 md:mb-4">{trip.title}</h1>
                {userBookingForThisTrip && (
                  <Badge
                    variant={getStatusColor(userBookingForThisTrip.status)}
                    className="mb-3 md:mb-4 text-[9px] md:text-xs"
                  >
                    Booked: {userBookingForThisTrip.status === 'cancellation_pending' ? 'Cancellation Pending' : userBookingForThisTrip.status}
                  </Badge>
                )}

                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6 text-gray-600">
                  <div className="flex items-center text-[10px] md:text-sm">
                    <MapPin className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1 md:mr-2" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center text-[10px] md:text-sm">
                    <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1 md:mr-2" />
                    <span>{trip.duration} days</span>
                  </div>
                  <div className="flex items-center text-[10px] md:text-sm">
                    <Users className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1 md:mr-2" />
                    <span>{trip.max_capacity} max</span>
                  </div>
                  <Rating rating={trip.rating} reviewCount={trip.review_count + DEFAULT_TRIP_REVIEWS.length} />
                </div>

                <p className="tour-description text-gray-700 mb-4 md:mb-6 whitespace-pre-wrap">{trip.description}</p>

                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                  {trip.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm" className="text-[9px] md:text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600 mr-1.5 md:mr-2" />
                    What's Included
                  </h3>
                  <ul className="space-y-1.5 md:space-y-2 list-disc ml-4 md:ml-5">
                    {includedItems.map((item, index) => (
                      <li key={index} className="flex items-center text-[10px] text-gray-700 md:text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center">
                    <XCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-600 mr-1.5 md:mr-2" />
                    Not Included
                  </h3>
                  <ul className="space-y-1.5 md:space-y-2 list-disc ml-4 md:ml-5">
                    {displayedExcludedItems.map((item, index) => (
                      <li key={index} className="flex items-center text-[10px] text-gray-700 md:text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 md:w-5 md:h-5 text-orange-600 mr-1.5 md:mr-2" />
                    Requirements
                  </h3>
                  <ul className="space-y-1.5 md:space-y-2 list-disc ml-4 md:ml-5">
                    {trip.requirements.map((req, index) => (
                      <li key={index} className="flex items-center text-[10px] text-gray-700 md:text-sm">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center">
                    <Shield className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600 mr-1.5 md:mr-2" />
                    Safety Measures
                  </h3>
                  <ul className="space-y-1.5 md:space-y-2 list-disc ml-4 md:ml-5">
                    {trip.safety_measures.map((measure, index) => (
                      <li key={index} className="flex items-center text-[10px] text-gray-700 md:text-sm">
                        {measure}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-white rounded-xl shadow-lg p-3 md:p-6 border">
                <div className="text-center mb-4 md:mb-6">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{displayCurrencySymbol}{trip.price}</div>
                  <div className="text-xs md:text-sm text-gray-600">per person · total trip price</div>
                  <div className="mt-1 text-xs font-semibold text-amber-700">
                    {displayCurrencySymbol}{trip.deposit_required} deposit due today ({Math.round((trip.deposit_required / trip.price) * 100)}%)
                  </div>
                  {trip.early_bird_discount && (
                    <Badge variant="success" size="sm" className="mt-2 text-[9px] md:text-xs">
                      Save {trip.early_bird_discount}% - Early Bird!
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 md:space-y-4 mb-4 md:mb-6">
                  <div className="flex justify-between gap-2 text-[10px] md:text-sm">
                    <span className="text-gray-600">Dates:</span>
                    <span className="font-medium text-right">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-[10px] md:text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{trip.duration} days</span>
                  </div>
                  <div className="flex justify-between gap-2 text-[10px] md:text-sm">
                    <span className="text-gray-600">Group size:</span>
                    <span className="font-medium">{trip.current_bookings}/{trip.max_capacity} travelers</span>
                  </div>
                  <div className="flex justify-between gap-2 text-[10px] md:text-sm">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className={`font-medium ${difficultyLevel?.color}`}>{difficultyLevel?.label}</span>
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <div className="flex justify-between text-[10px] md:text-sm mb-1 md:mb-2">
                    <span className="text-gray-600">Spots filled</span>
                    <span className="font-medium">{trip.current_bookings}/{trip.max_capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                    <div 
                      className="bg-yellow-500 h-1.5 md:h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(trip.current_bookings / trip.max_capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {isFull ? (
                  <Button variant="outline" className="w-full text-[10px] md:text-sm" disabled>
                    Trip is Full
                  </Button>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    <Button 
                      className="w-full text-[10px] md:text-sm" 
                      onClick={() => {
                        clickJoin(trip.id);
                        setShowBookingModal(true);
                      }}
                    >
                      Book Now - {getCurrencySymbol(trip.currency || 'USD')}{trip.deposit_required} deposit
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full text-xs md:text-sm"
                      onClick={handleWhatsAppClick}
                      icon={MessageCircle}
                    >
                      Ask on WhatsApp
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full mt-2 md:mt-3 text-[10px] md:text-sm"
                      onClick={() => setShowVRPreview(true)}
                      icon={Eye}
                    >
                      360° Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-1.5 md:mt-2 text-[10px] md:text-sm"
                      onClick={() => setShowInquireModal(true)}
                      icon={MessageCircle}
                    >
                      Inquire Now
                    </Button>
                  </div>
                )}

                {isAlmostFull && (
                  <div className="mt-3 md:mt-4 p-2 md:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center text-orange-800 text-[10px] md:text-sm">
                      <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                      <span className="font-medium">Only {spotsLeft} spots left!</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 md:mt-6 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 md:p-4 md:text-sm">
                  <strong>What happens next?</strong> Choose your travelers, review inclusions and add-ons, then confirm your booking. You will receive a booking reference before completing payment.
                </div>

                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1 md:mb-2 text-xs md:text-sm">Cancellation Policy</h4>
                  <p className="text-xs text-gray-600 md:text-sm">{trip.cancellation_policy}</p>
                </div>

                {trip.group_discount > 0 && (
                  <div className="mt-3 md:mt-4 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-green-800 text-xs md:text-sm">
                      <strong>Group Discount:</strong> Save {trip.group_discount}% when booking with 4+ people
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-8">
            <ReviewSection tripId={trip.id} />
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
