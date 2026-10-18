import React, { useState, memo, useCallback } from 'react';
import { Star, Users, Calendar, MapPin, Heart, User, EggFried as Verified, ExternalLink } from 'lucide-react';
import { Trip } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { useAnalytics } from '../../utils/analytics';
import { TRIP_TYPES, getCurrencySymbol, INDIA_CATEGORIES } from '../../utils/constants';
import { formatCitiesForDisplay, formatTripDateRange } from '../../utils/formatters';
import { resolveTripThumbnail } from '../../utils/tripImages';
import { optimizeImageUrl } from '../../utils/imageOptimization';
import { getTripPath } from '../../utils/tripSeo';


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
  isMobileCarouselItem = false
}) => {
  const { user } = useAuth();
  const { savedTrips, saveTrip, unsaveTrip } = useDashboard(user?.id || '', 'traveler');
  const { clickTripCard } = useAnalytics();
  const [isSaved, setIsSaved] = useState(() => 
    savedTrips.some(st => st.trip.id === trip.id)
  );
  const [savingTrip, setSavingTrip] = useState(false);

  // Update isSaved when savedTrips changes
  React.useEffect(() => {
    setIsSaved(savedTrips.some(st => st.trip.id === trip.id));
  }, [savedTrips, trip.id]);

  const spotsLeft = Math.max(0, trip.max_capacity - trip.current_bookings);
  const confirmedOccupancy = trip.max_capacity > 0
    ? Math.min(100, Math.round((trip.current_bookings / trip.max_capacity) * 100))
    : 0;
  const fallbackImage = trip.type === 'budget'
    ? '/optimized/pkg1.webp'
    : trip.type === 'indian_special'
      ? '/pkg2.png'
      : 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800';
  const tripImage = resolveTripThumbnail(trip.title, trip.destination, trip.type, trip.images, fallbackImage);
  const tripType = TRIP_TYPES.find(t => t.value === trip.type);
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0;
  const isFull = trip.max_capacity > 0 && spotsLeft === 0;

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
    return trip.currency ? getCurrencySymbol(trip.currency) : '';
  }, [trip.type, trip.currency]);
  const hasDisplayPrice = Boolean(displayCurrencySymbol) && Number.isFinite(trip.price) && trip.price > 0;

  if (variant === 'compact') {
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg cursor-pointer group ${
          isMobileCarouselItem ? 'w-[82vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none md:snap-none' : ''
        }`}
        onClick={() => {
          clickTripCard(trip.id);
          onClick?.();
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={optimizeImageUrl(tripImage.src, { width: 480, height: 320 })}
            alt={trip.title}
            width={480}
            height={320}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied !== 'true') {
                event.currentTarget.dataset.fallbackApplied = 'true';
                event.currentTarget.src = tripImage.src;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-600"
          />
          {tripImage.credit && (
            <a
              href={tripImage.credit.source}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              title={`Photo by ${tripImage.credit.artist} · ${tripImage.credit.license}`}
              className="absolute left-3 top-12 z-10 max-w-[72%] rounded bg-black/60 px-1.5 py-1 text-[8px] leading-tight text-white"
            >
              Photo: {tripImage.credit.artist} · {tripImage.credit.license}
            </a>
          )}
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
              className={`absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md transition-transform duration-150 ease-out hover:bg-black/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 ${
                savingTrip ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-rose-500' : 'text-white'}`} />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              {trip.review_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span className="text-sm font-semibold">{trip.rating}</span>
                </div>
              )}
              <span className="text-base font-bold">{hasDisplayPrice ? `${displayCurrencySymbol}${trip.price}` : 'Ask for price'}</span>
            </div>
          </div>
        </div>
        <div className="trip-card-brand-wash flex flex-1 flex-col p-3.5 sm:p-4">
          <h3 className="line-clamp-1 text-[16px] font-semibold leading-tight text-gray-900">{trip.title}</h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{trip.dates_flexible ? 'Flexible' : formatDate(trip.start_date)} · {trip.duration} days</span>
            </div>
            {trip.max_capacity > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Up to {trip.max_capacity}</span>
              </div>
            )}
          </div>
          {trip.max_capacity > 0 && trip.current_bookings > 0 && (
            <div className="mt-3" aria-label={`${confirmedOccupancy}% of trip capacity reserved`}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-medium text-gray-500">{confirmedOccupancy}% of spaces reserved</span>
                <span className={spotsLeft <= 4 ? 'font-semibold text-orange-700' : 'text-gray-500'}>
                  {spotsLeft > 0 ? `${spotsLeft} spaces left` : 'Fully booked'}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${confirmedOccupancy}%` }} />
              </div>
            </div>
          )}
          <div className="mt-auto flex items-center gap-1 truncate border-t border-gray-100 pt-3 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{formatCitiesForDisplay(trip.itinerary?.cities) || trip.destination}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg cursor-pointer group md:w-auto md:flex-shrink md:snap-none ${
        isMobileCarouselItem ? 'w-[82vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none md:snap-none' : ''
      }`}
      onClick={() => {
        clickTripCard(trip.id);
        onClick?.();
      }}
    >
      {/* Image takes 65% of card height */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={optimizeImageUrl(tripImage.src, { width: 640, height: 420 })}
          alt={trip.title}
          width={640}
          height={420}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (event.currentTarget.dataset.fallbackApplied !== 'true') {
              event.currentTarget.dataset.fallbackApplied = 'true';
              event.currentTarget.src = tripImage.src;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-600"
        />
        {tripImage.credit && (
          <a
            href={tripImage.credit.source}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            title={`Photo by ${tripImage.credit.artist} · ${tripImage.credit.license}`}
            className="absolute left-4 top-14 z-10 max-w-[72%] rounded bg-black/60 px-1.5 py-1 text-[8px] leading-tight text-white"
          >
            Photo: {tripImage.credit.artist} · {tripImage.credit.license}
          </a>
        )}

        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges - minimal */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {trip.featured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
          {tripType && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {trip.type === 'budget' ? 'Budget' : tripType.label}
            </span>
          )}
        </div>

        {/* Save button */}
        <div className="absolute right-3 top-3 z-10">
          {showSaveButton && (
            <button
              onClick={handleSaveTrip}
              aria-label={isSaved ? 'Remove from saved trips' : 'Save trip'}
              disabled={savingTrip}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md transition-transform duration-150 ease-out hover:bg-black/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 ${
                savingTrip ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-rose-500' : 'text-white'} ${savingTrip ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>

        {/* Price and rating overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex items-end justify-between text-white">
            <div className="flex items-center gap-1.5">
              {trip.review_count > 0 && (
                <>
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-bold">{trip.rating}</span>
                </>
              )}
              <span className="text-xs text-white/60 ml-1">{trip.duration} days</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold tracking-tight sm:text-2xl">{hasDisplayPrice ? `${displayCurrencySymbol}${trip.price}` : 'Ask for price'}</div>
            </div>
          </div>
        </div>

        {isFull && trip.type !== 'europe' && trip.type !== 'weekend' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="trip-card-brand-wash flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-1 text-[16px] font-semibold leading-tight text-gray-900">{trip.title}</h3>

        {/* Host Info */}
        {trip.host && (
          <div className="flex items-center mb-3">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mr-2.5">
              {trip.host.avatar_url ? (
                <img
                  src={optimizeImageUrl(trip.host.avatar_url, { width: 96, height: 96 })}
                  alt={trip.host.name}
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallbackApplied !== 'true') {
                      event.currentTarget.dataset.fallbackApplied = 'true';
                      event.currentTarget.src = trip.host!.avatar_url;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
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
        {(trip.start_date || trip.dates_flexible) && (
          <div className="flex items-center text-gray-500 mb-3">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span className="text-xs font-medium">
              {formatTripDateRange(trip.start_date, trip.end_date, trip.dates_flexible, formatDate)}
            </span>
          </div>
        )}

        {trip.max_capacity > 0 && trip.current_bookings > 0 && (
          <div className="mb-3" aria-label={`${confirmedOccupancy}% of trip capacity reserved`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="font-medium text-gray-500">{confirmedOccupancy}% of spaces reserved</span>
              <span className={spotsLeft <= 4 ? 'font-semibold text-orange-700' : 'text-gray-500'}>
                {spotsLeft > 0 ? `${spotsLeft} spaces left` : 'Fully booked'}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${confirmedOccupancy}%` }} />
            </div>
          </div>
        )}

        {/* Location + View Details */}
        <div className="mt-auto flex flex-col items-start gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-full items-center text-gray-400 sm:max-w-[140px]">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate max-w-[140px]">{formatCitiesForDisplay(trip.itinerary?.cities) || trip.destination}</span>
          </div>
          <div className="flex max-w-full flex-wrap items-center gap-1.5 sm:gap-2">
            {isAlmostFull && !isFull && (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                {spotsLeft} spaces left
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClick?.(); }}
              aria-label={`View details for ${trip.title}`}
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-sky-50 px-3 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Inquire now</span>
            </button>
            <a
              href={getTripPath(trip.id)}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
              aria-label={`Open ${trip.title} page`}
            >
              Open page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

TripCard.displayName = 'TripCard';