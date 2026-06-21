import React, { useState, memo, useCallback } from 'react';
import { Star, Users, Calendar, MapPin, Heart, Clock, TrendingUp, Shield, User, EggFried as Verified, ExternalLink } from 'lucide-react';
import { Trip } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { TRIP_TYPES, DIFFICULTY_LEVELS, getCurrencySymbol, INDIA_CATEGORIES } from '../../utils/constants';
import { formatCitiesForDisplay } from '../../utils/formatters';


interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  showSaveButton?: boolean;
  variant?: 'default' | 'compact';
  isCreatorTrip?: boolean;
  trending_score?: number;
  isMobileCarouselItem?: boolean;
  hideCity?: boolean;
}

export const TripCard: React.FC<TripCardProps> = memo(({ 
  trip, 
  onClick, 
  showSaveButton = true,
  variant = 'default',
  isCreatorTrip = false,
  trending_score,
  isMobileCarouselItem = false
}) => {
  const { user } = useAuth();
  const { savedTrips, saveTrip, unsaveTrip } = useDashboard(user?.id || '', 'traveler');
  const [isSaved, setIsSaved] = useState(() => 
    savedTrips.some(st => st.trip.id === trip.id)
  );
  const [savingTrip, setSavingTrip] = useState(false);

  // Update isSaved when savedTrips changes
  React.useEffect(() => {
    setIsSaved(savedTrips.some(st => st.trip.id === trip.id));
  }, [savedTrips, trip.id]);

  const spotsLeft = trip.max_capacity - trip.current_bookings;
  const tripType = TRIP_TYPES.find(t => t.value === trip.type);
  const difficultyLevel = DIFFICULTY_LEVELS.find(d => d.value === trip.difficulty);
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0;
  const isFull = spotsLeft === 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSaveTrip = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to save trips');
      return;
    }

    setSavingTrip(true);
    try {
      if (isSaved) {
        const success = await unsaveTrip(trip.id);
        if (success) {
          setIsSaved(false);
        }
      } else {
        const success = await saveTrip(trip.id);
        if (success) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving trip:', error);
    } finally {
      setSavingTrip(false);
    }
  }, [user, isSaved, trip.id, saveTrip, unsaveTrip]);

  // Determine the currency symbol based on trip type
  const displayCurrencySymbol = React.useMemo(() => {
    const indiaSpecialTypes = INDIA_CATEGORIES.map(cat => cat.value);
    // Ensure 'indian_special' is included if not already in INDIA_CATEGORIES values
    if (!indiaSpecialTypes.includes('indian_special')) {
        indiaSpecialTypes.push('indian_special');
    }

    if (trip.type && indiaSpecialTypes.includes(trip.type)) {
      return '₹'; // Force INR for India Special trips
    }
    return getCurrencySymbol(trip.currency || 'INR'); // Fallback to existing logic
  }, [trip.type, trip.currency]);

  if (variant === 'compact') {
    return (
      <div
        className={`bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.14)] transition-all duration-400 hover:-translate-y-1 cursor-pointer group ${
          isMobileCarouselItem ? 'w-[calc(100vw-2rem)] flex-shrink-0 snap-start' : ''
        }`}
        onClick={onClick}
      >
        <div className="relative h-44 overflow-hidden">
          <img
            src={trip.images?.[0] || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-600"
          />
          {trip.featured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
            </div>
          )}
          {showSaveButton && (
            <button
              onClick={handleSaveTrip}
              aria-label={isSaved ? 'Remove from saved trips' : 'Save trip'}
              disabled={savingTrip}
              className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all ${
                savingTrip ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-current' : 'text-gray-400'}`} />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span className="text-sm font-semibold">{trip.rating}</span>
              </div>
              <span className="text-base font-bold">{displayCurrencySymbol}{trip.price}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 leading-snug">{trip.title}</h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{trip.duration} days</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{spotsLeft} spots left</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-400 hover:-translate-y-2 cursor-pointer group md:w-auto md:flex-shrink md:snap-none border border-gray-100/80 ${
        isMobileCarouselItem ? 'w-[calc(100vw-2rem)] flex-shrink-0 snap-start' : ''
      }`}
      onClick={onClick}
    >
      {/* Image takes 65% of card height */}
      <div className="relative h-60 md:h-64 overflow-hidden">
        <img
          src={trip.images && trip.images.length > 0 ? trip.images[0] : 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-600"
        />

        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges - minimal */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {trip.featured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
          {tripType && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {tripType.label}
            </span>
          )}
        </div>

        {/* Save button */}
        <div className="absolute top-4 right-4 z-10">
          {showSaveButton && (
            <button
              onClick={handleSaveTrip}
              aria-label={isSaved ? 'Remove from saved trips' : 'Save trip'}
              disabled={savingTrip}
              className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all duration-200 ${
                savingTrip ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-current' : 'text-gray-400'} ${savingTrip ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>

        {/* Price and rating overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between text-white">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-sm font-bold">{trip.rating}</span>
              <span className="text-xs text-white/60 ml-1">{trip.duration} days</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold tracking-tight">{displayCurrencySymbol}{trip.price}</div>
            </div>
          </div>
        </div>

        {isFull && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3 leading-snug">{trip.title}</h3>

        {/* Host Info */}
        {trip.host && (
          <div className="flex items-center mb-3">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mr-2.5">
              {trip.host.avatar_url ? (
                <img src={trip.host.avatar_url} alt={trip.host.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500 font-medium">{trip.host.name}</span>
            {trip.host.verified && (
              <Verified className="w-4 h-4 text-sky-500 ml-1" />
            )}
          </div>
        )}

        {/* Travel date */}
        {trip.start_date && (
          <div className="flex items-center text-gray-500 mb-3">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span className="text-xs font-medium">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
          </div>
        )}

        {/* Location + View Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-400">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate max-w-[140px]">{formatCitiesForDisplay(trip.itinerary?.cities) || trip.destination}</span>
          </div>
          <div className="flex items-center gap-2">
            {isAlmostFull && !isFull && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                {spotsLeft} left
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClick?.(); }}
              className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-full transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TripCard.displayName = 'TripCard';