import React, { useState, memo } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Trip } from '../../types';
import { TripCard } from './TripCard';
import { TripDetails } from './TripDetails';
import { INDIA_CATEGORIES, getCurrencySymbol } from '../../utils/constants';

interface TripGridProps {
  trips: Trip[];
  title: string;
  subtitle?: string;
  loading?: boolean;
  variant?: 'default' | 'compact';
  showViewAll?: boolean;
  mobileCarousel?: boolean;
  prominentFirst?: boolean;
  hideCity?: boolean;
}

export const TripGrid: React.FC<TripGridProps> = memo(({ 
  
  trips, 
  title, 
  subtitle, 
  loading = false,
  variant = 'default',
  showViewAll = false,
  mobileCarousel = false,
  prominentFirst = false,
  hideCity
}) => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayTrips = showViewAll && !showAll ? trips.slice(0, 6) : trips;
  const firstTrip = displayTrips[0];
  const remainingTrips = displayTrips.slice(1);

  // Determine the currency symbol for the prominent first trip
  const firstTripDisplayCurrencySymbol = React.useMemo(() => {
    if (!firstTrip) return getCurrencySymbol('INR'); // Default if no first trip
    const indiaSpecialTypes = INDIA_CATEGORIES.map(cat => cat.value);
    if (!indiaSpecialTypes.includes('indian_special')) {
        indiaSpecialTypes.push('indian_special');
    }
    if (firstTrip.type && indiaSpecialTypes.includes(firstTrip.type)) {
      return '₹'; // Force INR for India Special trips
    }
    return getCurrencySymbol(firstTrip.currency || 'INR'); // Fallback to existing logic
  }, [firstTrip]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-2 text-base">{subtitle}</p>}
        </div>
        <div className={`grid gap-5 md:gap-6 ${
          variant === 'compact'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-[20px] h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-2 text-base">{subtitle}</p>}
          </div>
          {showViewAll && trips.length > 6 && (
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `View All ${trips.length}`}
            </Button>
          )}
        </div>
        
        {trips.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-[20px]">
            <div className="text-gray-400 text-lg mb-2">No trips found</div>
            <p className="text-gray-500 text-sm">Try adjusting your search filters or explore different destinations</p>
          </div>
        ) : (
          <div className={`gap-5 md:gap-6 ${
            mobileCarousel
              ? 'flex overflow-x-scroll snap-x-mandatory scroll-pl-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none md:pb-0'
              : `grid gap-5 md:gap-6 ${
                  variant === 'compact'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`
          }`}>
            {prominentFirst && firstTrip ? (
              <>
                {/* Prominent First Trip */}
                <div className="md:col-span-2 lg:col-span-3 mb-4">
                  <div className="relative h-64 md:h-80 rounded-[20px] overflow-hidden shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] border border-gray-100">
                    <img
                      src={firstTrip.images?.[0] || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                      alt={firstTrip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1.5">{firstTrip.title}</h3>
                      {!hideCity && (
                        <p className="text-sm md:text-base text-white/80 mb-3">{formatCitiesForDisplay(firstTrip.itinerary?.cities) || firstTrip.destination} • {firstTrip.duration} days</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-semibold">{firstTrip.rating}</span>
                          </div>
                          <span className="text-lg md:text-xl font-bold">{firstTripDisplayCurrencySymbol}{firstTrip.price}</span>
                        </div>
                        <button
                          onClick={() => setSelectedTrip(firstTrip)}
                          className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-sm px-5 py-2.5 rounded-2xl transition-colors shadow-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Remaining Trips */}
                {remainingTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    variant={variant}
                    isMobileCarouselItem={mobileCarousel}
                    onClick={() => setSelectedTrip(trip)}
                    hideCity={hideCity} 
                  />
                ))}
              </>
            ) : (
              displayTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  variant={variant}
                  isMobileCarouselItem={mobileCarousel}
                  onClick={() => setSelectedTrip(trip)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </>
  );
});

TripGrid.displayName = 'TripGrid';