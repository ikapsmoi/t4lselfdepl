import React, { useState, memo } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Trip } from '../../types';
import { TripCard } from './TripCard';
import { TripDetails } from './TripDetails';
import { INDIA_CATEGORIES, getCurrencySymbol } from '../../utils/constants';
import { formatCitiesForDisplay } from '../../utils/formatters';

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
      <div className="space-y-5 sm:space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">{subtitle}</p>}
        </div>
        <div className={`grid gap-4 sm:gap-5 md:gap-6 ${
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
      <div className="min-w-0 space-y-5 sm:space-y-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">{subtitle}</p>}
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
          <div className="rounded-2xl bg-gray-50 px-5 py-12 text-center sm:rounded-[20px] sm:py-16">
            <div className="mb-2 text-base text-gray-400 sm:text-lg">No trips found</div>
            <p className="text-gray-500 text-sm">Try adjusting your search filters or explore different destinations</p>
          </div>
        ) : (
          <div className={`min-w-0 gap-4 sm:gap-5 md:gap-6 ${
            mobileCarousel
              ? 'flex snap-x snap-mandatory overscroll-x-contain overflow-x-auto scroll-pl-4 pb-4 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none md:pb-0'
              : `grid ${
                  variant === 'compact'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`
          }`}>
            {prominentFirst && firstTrip ? (
              <>
                {/* Prominent First Trip */}
                <div className="mb-3 sm:mb-4 md:col-span-2 lg:col-span-3">
                  <div className="relative h-56 overflow-hidden rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] sm:h-64 sm:rounded-[20px] md:h-80">
                    <img
                      src={firstTrip.images?.[0] || (firstTrip.type === 'budget' ? '/optimized/pkg1.webp' : 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&q=75&fm=webp')}
                      alt={firstTrip.title}
                      width={1280}
                      height={720}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                      <h3 className="tour-featured-title mb-1.5">{firstTrip.title}</h3>
                      {!hideCity && (
                        <p className="text-sm md:text-base text-white/80 mb-3">{formatCitiesForDisplay(firstTrip.itinerary?.cities) || firstTrip.destination} • {firstTrip.duration} days</p>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-3">
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