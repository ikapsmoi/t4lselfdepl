import React, { useState } from 'react';
import { Star, Calendar, ArrowRight, MapPin, Crown, Sparkles, X, Heart, Eye } from 'lucide-react';
import { Trip } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BookingModal } from './BookingModal';
import { CreatorApplicationModal } from '../creator/CreatorApplicationModal';
import { getCurrencySymbol, INDIA_CATEGORIES } from '../../utils/constants';


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
  const isIndiaTrip = currentTrip.type === 'indian_special' || INDIA_CATEGORIES.some(category => category.value === currentTrip.type);
  const displayCurrencySymbol = isIndiaTrip ? '₹' : currentTrip.currency ? getCurrencySymbol(currentTrip.currency) : '';
  const canBook = Boolean(displayCurrencySymbol && currentTrip.price > 0 && currentTrip.deposit_required > 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-px shadow-[0_18px_50px_-20px_rgba(15,23,42,0.6)]">
        <div className="relative overflow-hidden rounded-[15px] bg-white shadow-md">
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

          <button
            type="button"
            onClick={() => onViewDetails?.(currentTrip)}
            aria-label={`Explore ${currentTrip.title}`}
            className="group relative block h-44 w-full overflow-hidden text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/60 sm:h-52 md:h-56"
          >
            <img
              key={currentTrip.images[0]}
              src={currentTrip.images[0]}
              alt={currentTrip.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-slate-950/20 transition-colors duration-500 group-hover:from-slate-950/75" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl">
                Explore trip <ArrowRight className="w-4 h-4" />
              </span>
            </div>

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

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="text-xs sm:text-sm font-semibold">Starts {formatDate(currentTrip.start_date)}</div>
                {currentTrip.current_bookings > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <span className="font-bold text-xs">{spotsLeft} spots left</span>
                  </div>
                )}
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/30">
                <div className="h-full rounded-full bg-amber-300 transition-all duration-700" style={{ width: `${Math.min(100, Math.max(10, (spotsLeft / Math.max(currentTrip.max_capacity, 1)) * 100))}%` }} />
              </div>
            </div>
          </button>

          <div className="trip-card-brand-wash p-3 sm:p-4">
            <div className="relative z-10 mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-700 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Featured experience
            </div>
            <h2 className="relative z-10 mb-2 line-clamp-2 min-h-[2.7rem] text-base font-bold leading-[1.35] tracking-tight text-gray-900 sm:min-h-[3.25rem] sm:text-lg">
              {currentTrip.title}
            </h2>

            <div className="relative z-10 mb-3 grid grid-cols-2 gap-x-3 gap-y-2">
              <div className="flex min-w-0 items-center text-gray-700">
                <MapPin className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                <div className="min-w-0">
                  <div className="text-[10px] leading-4 text-gray-500 sm:text-xs">Destination</div>
                  <div className="truncate text-xs font-semibold leading-4 sm:text-sm">
                    {currentTrip.destination.length > 15
                      ? `${currentTrip.destination.slice(0, 14)}…`
                      : currentTrip.destination}
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 items-center text-gray-700">
                <div>
                  <div className="text-[10px] leading-4 text-gray-500 sm:text-xs">From</div>
                  <div className="text-xs font-bold leading-4 text-green-600 sm:text-sm">
                    {displayCurrencySymbol && currentTrip.price > 0
                      ? <>{displayCurrencySymbol}{currentTrip.price}<span className="ml-1 font-normal text-gray-500">/person</span></>
                      : 'Ask for price'}
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 items-center text-gray-700">
                <Calendar className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                <div>
                  <div className="text-[10px] leading-4 text-gray-500 sm:text-xs">Duration</div>
                  <div className="text-xs font-semibold leading-4 sm:text-sm">{currentTrip.duration} days</div>
                </div>
              </div>
              {currentTrip.review_count > 0 && (
                <div className="flex min-w-0 items-center text-gray-700">
                  <Star className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 fill-current text-yellow-500" />
                  <div>
                    <div className="text-[10px] leading-4 text-gray-500 sm:text-xs">Rating</div>
                    <div className="text-xs font-semibold leading-4 sm:text-sm">{currentTrip.rating}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10">
              <div className="flex w-full items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onViewDetails?.(currentTrip)}
                  className="min-w-0 flex-1 rounded-full border border-gray-300 px-2 py-2 text-xs font-semibold transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Details
                </Button>
                
                {canBook ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowBookingModal(true)}
                    className="min-w-0 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <Heart className="w-3.5 h-3.5 mr-1" />
                    Book
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => onViewDetails?.(currentTrip)}
                    className="min-w-0 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    Ask
                  </Button>
                )}
                
                <Button 
                  onClick={() => setShowCreatorModal(true)}
                  className="min-w-0 flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Crown className="w-3.5 h-3.5 mr-1" />
                  Host
                </Button>
              </div>
            </div>

            {currentTrip.current_bookings > 0 && spotsLeft <= 3 && spotsLeft > 0 && (
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