import React, { useState, memo } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Trip } from '../../types';
import { TripCard } from './TripCard';
import { TripDetails } from './TripDetails';
import { INDIA_CATEGORIES, getCurrencySymbol } from '../../utils/constants';
import { formatCitiesForDisplay } from '../../utils/formatters';
import { useSlowMobileCarousel } from '../../hooks/useSlowMobileCarousel';

interface TripGridProps {
  trips: Trip[];
  title: string;
  subtitle?: string;
  loading?: boolean;
  variant?: 'default' | 'compact';
  showViewAll?: boolean;
  mobileCarousel?: boolean;
  autoAdvanceMobile?: boolean;
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
  autoAdvanceMobile = false,
  prominentFirst = false,
  hideCity
}) => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showAll, setShowAll] = useState(false);
  const carousel = useSlowMobileCarousel<HTMLDivElement>(mobileCarousel && autoAdvanceMobile);

  const displayTrips = showViewAll && !showAll ? trips.slice(0, 6) : trips;
  const firstTrip = displayTrips[0];
  const remainingTrips = displayTrips.slice(1);

  // Determine the currency symbol for the prominent first trip
  const firstTripDisplayCurrencySymbol = React.useMemo(() => {
    if (!firstTrip) return '';
    const indiaSpecialTypes = INDIA_CATEGORIES.map(cat => cat.value);
    if (!indiaSpecialTypes.includes('indian_special')) {
        indiaSpecialTypes.push('indian_special');
    }
    if (firstTrip.type && indiaSpecialTypes.includes(firstTrip.type)) {
      return '₹'; // Force INR for India Special trips
    }
    return firstTrip.currency ? getCurrencySymbol(firstTrip.currency) : '';
  }, [firstTrip]);

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">{subtitle}</p>}
        </div>
        <div className={`grid gap-6 lg:gap-8 ${
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
      <div className="min-w-0 space-y-6 sm:space-y-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">{subtitle}</p>}
          </div>
          {showViewAll && trips.length > 6 && (
            <Button 
              variant="outline" 
              className="border-gray-400 text-gray-800 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-600"
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
          <div
            ref={carousel.carouselRef}
            onPointerEnter={carousel.onPointerEnter}
            onPointerLeave={carousel.onPointerLeave}
            onFocusCapture={carousel.onFocusCapture}
            onBlurCapture={carousel.onBlurCapture}
            className={`min-w-0 gap-4 md:gap-6 lg:gap-8 ${
            mobileCarousel
              ? '-mx-4 flex snap-x snap-mandatory overscroll-x-contain overflow-x-auto gap-4 px-4 pb-6 scrollbar-hide md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:snap-none md:pb-0 md:px-0 lg:grid-cols-3'
              : `grid ${
                  variant === 'compact'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`
          }`}>
            {prominentFirst && firstTrip ? (
              <>
                {/* Prominent First Trip */}
                <div className={`shrink-0 snap-start md:col-span-2 md:pb-2 md:snap-none lg:col-span-3 ${mobileCarousel ? 'w-[82vw] max-w-[320px] md:w-auto md:max-w-none' : 'w-auto'}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100/80 shadow-sm transition-all duration-300 ease-out hover:shadow-lg md:aspect-[16/9]">
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
                          {firstTrip.review_count > 0 && (
                            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm font-semibold">{firstTrip.rating}</span>
                            </div>
                          )}
                          <span className="text-lg md:text-xl font-bold">
                            {firstTripDisplayCurrencySymbol && firstTrip.price > 0
                              ? `${firstTripDisplayCurrencySymbol}${firstTrip.price}`
                              : 'Ask for price'}
                          </span>
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
                  hideCity={hideCity}
                />
              ))
            )}
            {mobileCarousel && <div aria-hidden="true" className="w-0 shrink-0 pr-4 md:hidden" />}
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