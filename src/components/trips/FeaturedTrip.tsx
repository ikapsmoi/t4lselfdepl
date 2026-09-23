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
      <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[1px] transform transition-all duration-300 max-w-sm mx-auto">
        <div className="bg-white rounded-xl overflow-hidden relative shadow-md">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            aria-label="Close featured trip"
            className="absolute top-2 right-2 z-30 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200"
          >
            <X className="w-3.5 h-3.5 text-gray-600 hover:text-gray-900" />
          </button>

          <div className="relative h-36 sm:h-44 md:h-52">
            <img
              key={currentTrip.images[0]}
              src={currentTrip.images[0]}
              alt={currentTrip.title}
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

            <div className="absolute top-2 left-2 z-20">
              <Badge variant="warning" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md text-[9px] px-2 py-1">
                ⭐ FEATURED
              </Badge>
            </div>

            <div className="absolute top-2 right-9 z-20">
              <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-0.5 rounded-full text-[9px] font-medium shadow-sm">
                {currentTripIndex + 1}/{featuredTrips.length}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
              <div className="flex items-center justify-between text-white">
                <div className="text-[10px] font-medium">Starts {formatDate(currentTrip.start_date)}</div>
                <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="font-bold text-[10px]">{spotsLeft} left</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <h1 className="tour-title text-gray-900 mb-2 line-clamp-2 min-h-[2.75rem]">
              {currentTrip.title}
            </h1>

            <div className="grid grid-cols-2 gap-2 mb-3 min-h-[82px]">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500">Destination</div>
                  <div className="font-semibold text-[10px] leading-tight">{currentTrip.destination}</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-[10px] font-bold text-green-600 mr-1.5">₹{currentTrip.price}</span>
                <div>
                  <div className="text-[10px] leading-tight">/person</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500">Duration</div>
                  <div className="font-semibold text-[10px] leading-tight">{currentTrip.duration} days</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Star className="w-3.5 h-3.5 mr-1.5 text-yellow-500 fill-current flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500">Rating</div>
                  <div className="font-semibold text-[10px] leading-tight">{currentTrip.rating}</div>
                </div>
              </div>
            </div>

            <div className="mt-1">
              <div className="flex items-center gap-1.5 sm:gap-2 w-full overflow-hidden">
                <Button 
                  variant="outline" 
                  onClick={() => onViewDetails?.(currentTrip)}
                  className="flex-1 min-w-0 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 py-1.5 px-1.5 text-[10px] font-semibold rounded-md"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Details
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={() => setShowBookingModal(true)}
                  className="flex-1 min-w-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 py-1.5 px-1.5 text-[10px] font-bold rounded-md"
                >
                  <Heart className="w-3.5 h-3.5 mr-1" />
                  Book
                </Button>
                
                <Button 
                  onClick={() => setShowCreatorModal(true)}
                  className="flex-1 min-w-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transform transition-all duration-300 py-1.5 px-1.5 text-[10px] font-bold rounded-md"
                >
                  <Crown className="w-3.5 h-3.5 mr-1" />
                  Host
                </Button>
              </div>
            </div>

            {spotsLeft <= 3 && spotsLeft > 0 && (
              <div className="mt-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1.5 rounded-full text-center shadow-md animate-pulse">
                <span className="text-[10px] font-bold">
                  Only {spotsLeft} spots left!
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