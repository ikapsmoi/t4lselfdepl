import React, { useState } from 'react';
import { Star, Users, Calendar, ArrowRight, MapPin, Clock, Crown, Sparkles, X, Heart, Share2, Eye, User, Verified } from 'lucide-react';
import { Trip } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BookingModal } from './BookingModal';
import { CreatorApplicationModal } from '../creator/CreatorApplicationModal';
import { DIFFICULTY_LEVELS } from '../../utils/constants';


interface FeaturedTripProps {
  featuredTrips: Trip[];
  currentTripIndex: number;
  onViewDetails?: (trip: Trip) => void;
  onClose?: () => void;
}

export const FeaturedTrip: React.FC<FeaturedTripProps> = ({ 
  featuredTrips, 
  currentTripIndex,
  onViewDetails,
  onClose = () => {}
}) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  
  // Get current trip or fallback to first trip
  const currentTrip = featuredTrips[currentTripIndex] || featuredTrips[0];
  
  if (!currentTrip || featuredTrips.length === 0) {
    return null;
  }

  const spotsLeft = currentTrip.max_capacity - currentTrip.current_bookings;
  const difficultyLevel = DIFFICULTY_LEVELS.find(d => d.value === currentTrip.difficulty);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-1 transform hover:scale-102 transition-all duration-300 max-w-2xl mx-fixed">
        {/* Clean white shadow container */}
        <div className="bg-white rounded-2xl overflow-hidden relative shadow-lg">
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            aria-label="Close featured trip"
            className="absolute top-3 right-3 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4 text-gray-600 hover:text-gray-900" />
          </button>

          {/* Hero Image */}
          <div className="relative h-48 sm:h-64 md:h-72">
            <img
              key={currentTrip.images[0]}
              src={currentTrip.images[0]}
              alt={currentTrip.title}
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            />
            
            {/* Clean overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 z-20">
              <Badge variant="warning" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md text-xs">
                ⭐ FEATURED ADVENTURE
              </Badge>
            </div>

            {/* Trip counter */}
            <div className="absolute top-4 right-16 z-20">
              <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-md">
                {currentTripIndex + 1} of {featuredTrips.length}
              </div>
            </div>

            {/* Bottom info overlay - only spots left and start date */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="text-sm font-medium">Starts {formatDate(currentTrip.start_date)}</div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="font-bold text-sm">{spotsLeft} spots left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Information Section */}
          <div className="p-6">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 min-h-[2.5rem]">
              {currentTrip.title}
            </h1>
            
            {/* Trip Details Grid - Fixed height container */}
            <div className="grid grid-cols-2 gap-4 mb-4 min-h-[100px]">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Destination</div>
                  <div className="font-semibold text-sm">{currentTrip.destination}</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-sm font-bold text-green-600 mr-2">₹{currentTrip.price}</span>
                <div>
                  <div className="font-small">per person</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-semibold text-sm">{currentTrip.duration} days</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
                <div>
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="font-semibold text-sm">{currentTrip.rating}</div>
                </div>
              </div>
            </div>

            {/* Description with fixed height
            <div className="mb-6 min-h-[4rem]">
              <p className="text-gray-600 line-clamp-3 leading-relaxed">
                {currentTrip.description}
              </p>
            </div> */}

            {/* Host Information - Fixed height container
            {currentTrip.host && (
              <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-xl min-h-[5rem]">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mr-4">
                  {currentTrip.host.avatar_url ? (
                    <img
                      src={currentTrip.host.avatar_url}
                      alt={currentTrip.host.name}
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
                    <span className="font-semibold text-gray-900 text-lg">{currentTrip.host.name}</span>
                    {currentTrip.host.verified && (
                      <Verified className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Verified Host • Expert Guide</div>
                </div>
              </div>
            )}*/}
            
            {/* Action buttons with fixed height container */}
            <div className="min-h-[3rem] flex items-end">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => onViewDetails?.(currentTrip)}
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 py-2 text-sm font-semibold"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 text-sm font-bold"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Book Now
                </Button>
                
                <Button 
                  onClick={() => setShowCreatorModal(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 text-sm font-bold"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Host This Trip
                </Button>
              </div>
            </div>
            
            {/* Urgency Indicator - Fixed position */}
            {spotsLeft <= 3 && spotsLeft > 0 && (
              <div className="mt-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-center shadow-lg animate-pulse">
                <span className="text-sm font-bold">
                  Only {spotsLeft} spots left! Book now to secure your adventure.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          trip={currentTrip}
        />
      )}

      {/* Creator Application Modal */}
      {showCreatorModal && (
        <CreatorApplicationModal
          isOpen={showCreatorModal}
          onClose={() => setShowCreatorModal(false)}
          tripName={currentTrip.title}
        />
      )}

    </>
  );
};