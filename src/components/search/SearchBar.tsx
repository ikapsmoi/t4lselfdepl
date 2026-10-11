import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ChevronUp, ChevronDown, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { SearchFilters, Trip } from '../../types';
import {
  TRIP_TYPES,
  PRICE_RANGES,
  DURATION_OPTIONS,
  GROUP_SIZES,
  DIFFICULTY_LEVELS,
} from '../../utils/constants';
import { useAnalytics } from '../../utils/analytics';
import { getTripPath } from '../../utils/tripSeo';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  trips: Trip[];
  tripsLoading?: boolean;
  className?: string;
  navigateOnFilter?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = memo(({ onSearch, trips, tripsLoading = false, className = '', navigateOnFilter = false }) => {
  const { searchTrip } = useAnalytics();
  const [destination, setDestination] = useState(
    () => new URLSearchParams(window.location.search).get('destination') || ''
  );
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsAbove, setSuggestionsAbove] = useState(false);
  const [type, setType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [duration, setDuration] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [rating, setRating] = useState('');
  const [filtersMinimized, setFiltersMinimized] = useState(true);

  const handleSearch = () => {
    const normalizedDestination = destination.trim().toLocaleLowerCase();
    const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ??
      trips.find(trip => trip.title.trim().toLocaleLowerCase() === normalizedDestination);

    setSuggestionsOpen(false);
    if (selectedTrip) {
      searchTrip(destination, { selectedTripId: selectedTrip.id });
      window.location.href = getTripPath(selectedTrip.id);
      return;
    }

    const filters: SearchFilters = {};

    if (destination) filters.destination = destination;
    if (type) filters.type = type;
    if (difficulty) filters.difficulty = difficulty;
    if (rating) filters.rating = parseFloat(rating);

    if (priceRange && priceRange !== '100000+') {
      const [min, max] = priceRange.split('-').map((p) => parseInt(p));
      filters.minPrice = min;
      if (max) filters.maxPrice = max;
    } else if (priceRange === '100000+') {
      filters.minPrice = 100000;
    }

    if (duration && duration !== '30+') {
      const [min, max] = duration.split('-').map((d) => parseInt(d));
      filters.duration = max || min;
    } else if (duration === '30+') {
      filters.duration = 30;
    }

    if (groupSize && groupSize !== '20+') {
      const [min, max] = groupSize.split('-').map((s) => parseInt(s));
      filters.maxGroupSize = max || min;
    } else if (groupSize === '20+') {
      filters.maxGroupSize = 20;
    }

    console.log('SearchBar: Calling onSearch with filters:', filters);
    onSearch(filters);

    searchTrip(destination, { type, priceRange, duration, groupSize, difficulty, rating });

    setTimeout(() => {
      const element =
        document.getElementById('trending-destinations') ||
        document.getElementById('top-rated-adventures');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const clearFilters = () => {
    setDestination('');
    setSelectedTripId(null);
    setSuggestionsOpen(false);
    setType('');
    setPriceRange('');
    setDuration('');
    setGroupSize('');
    setDifficulty('');
    setRating('');
    onSearch({});
  };

  const openSuggestions = (input: HTMLInputElement) => {
    const bounds = input.getBoundingClientRect();
    setSuggestionsAbove(window.innerHeight - bounds.bottom < 300 && bounds.top > 300);
    setSuggestionsOpen(true);
  };

  const hasActiveFilters =
    destination || type || priceRange || duration || groupSize || difficulty || rating;

  const matchingTrips = useMemo(() => {
    const query = destination.trim().toLocaleLowerCase();
    return [...(trips ?? [])].filter((trip) => {
      const tripType = TRIP_TYPES.find((option) => option.value === trip.type);
      const searchableText = [
        trip.title,
        trip.destination,
        trip.country,
        trip.type,
        tripType?.label,
      ].filter(Boolean).join(' ').toLocaleLowerCase();
      return trip.title?.trim() && (!query || searchableText.includes(query));
    });
  }, [destination, trips]);

  const recommendedTypes = useMemo(() => {
    const counts = new Map<string, number>();
    matchingTrips.forEach((trip) => counts.set(trip.type, (counts.get(trip.type) || 0) + 1));
    return TRIP_TYPES
      .filter((tripType) => counts.has(tripType.value))
      .sort((a, b) => (counts.get(b.value) || 0) - (counts.get(a.value) || 0))
      .slice(0, 4);
  }, [matchingTrips]);

  const visibleTrips = useMemo(() => {
    return matchingTrips
      .filter((trip) => !type || trip.type === type)
      .sort((a, b) => {
        if (!destination.trim()) {
          return Number(b.featured) - Number(a.featured) || b.rating - a.rating || a.title.localeCompare(b.title);
        }
        return a.title.localeCompare(b.title);
      });
  }, [destination, matchingTrips, type]);

  return (
    <div className={`w-full min-w-0 rounded-2xl p-3.5 sm:p-6 ${className}`}>
      {/* Experience tabs */}
      <div
        className="search-experience-tabs scrollbar-hide -mx-3.5 mb-4 flex h-11 items-center gap-2 overflow-x-auto px-3.5 sm:mx-0 sm:mb-4 sm:h-14 sm:px-1"
        role="group"
        aria-label="Trip categories. Swipe or scroll horizontally to see all categories."
        tabIndex={0}
      >
        {TRIP_TYPES.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={type === tab.value}
            onClick={() => {
              setType(tab.value);
              if (navigateOnFilter) {
                  window.location.hash = `trips?type=${encodeURIComponent(tab.value)}`;
              } else {
                onSearch({ type: tab.value });
              }
            }}
            className={`search-experience-tab relative isolate inline-flex min-h-9 shrink-0 items-center overflow-hidden rounded-full border px-4 text-[13px] font-medium whitespace-nowrap transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 sm:min-h-12 sm:text-sm sm:font-semibold ${
              type === tab.value
                ? 'border-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {type === tab.value && (
              <motion.span
                layoutId="search-active-tab"
                className="absolute inset-0 rounded-full bg-gray-900 shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">
              {tab.value === 'indian_special' ? 'India' : tab.value === 'festival' ? 'Festivals' : tab.value === 'budget' ? 'Budget' : tab.label}
            </span>
          </button>
        ))}
      </div>
      <p className="-mt-2 mb-3 text-[10px] text-gray-400 sm:hidden">Swipe to see more categories →</p>

      {/* Main Search */}
      <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:gap-3">
        <div className="relative w-full min-w-0 flex-1">
          <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4" />
          <input
            type="text"
            placeholder={tripsLoading ? 'Loading trips...' : 'Where do you want to go?'}
            aria-label="Search trips"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls="trip-title-suggestions"
            value={destination}
            onFocus={(event) => openSuggestions(event.currentTarget)}
            onClick={(event) => openSuggestions(event.currentTarget)}
            onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 100)}
            onChange={(e) => {
              setDestination(e.target.value);
              setSelectedTripId(null);
              setSuggestionsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              } else if (e.key === 'Escape') {
                setSuggestionsOpen(false);
              }
            }}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 sm:pl-12 sm:pr-24"
          />
          {suggestionsOpen && !tripsLoading && (
            <div
              className={`absolute left-0 right-0 z-50 flex max-h-[min(70vh,24rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:rounded-2xl ${
                suggestionsAbove ? 'bottom-full mb-2' : 'top-full mt-2'
              }`}
            >
              {recommendedTypes.length > 0 && (
                <div className="shrink-0 border-b border-gray-100 px-3 py-3 sm:px-4">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                    Recommended trip types
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedTypes.map((tripType) => (
                      <button
                        key={tripType.value}
                        type="button"
                        aria-pressed={type === tripType.value}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setType(type === tripType.value ? '' : tripType.value);
                          setSelectedTripId(null);
                        }}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          type === tripType.value
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300 hover:bg-sky-50'
                        }`}
                      >
                        {tripType.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div
                id="trip-title-suggestions"
                role="listbox"
                aria-label="Available trips"
                className="min-h-0 overflow-y-auto py-1"
              >
                {visibleTrips.length > 0 ? visibleTrips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    role="option"
                    aria-selected={trip.id === selectedTripId}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setDestination(trip.title);
                      setSelectedTripId(trip.id);
                      setSuggestionsOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-sky-50 focus:bg-sky-50 focus:outline-none sm:px-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-900">{trip.title}</span>
                      <span className="block truncate text-xs text-gray-500">{trip.destination}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
                      {TRIP_TYPES.find((tripType) => tripType.value === trip.type)?.label || 'Trip'}
                    </span>
                  </button>
                )) : (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    {matchingTrips.length > 0 ? 'No trips in this type. Choose another type.' : 'No matching trips found'}
                  </p>
                )}
              </div>
            </div>
          )}
          {destination && (
            <button
              type="button"
              onClick={() => {
                setDestination('');
                setSelectedTripId(null);
              }}
              aria-label="Clear selected package"
              title="Clear selected package"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {/* Social icons inside search input */}
          <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 sm:flex">
            {destination && (
              <button
                type="button"
                onClick={() => {
                  setDestination('');
                  setSelectedTripId(null);
                }}
                aria-label="Clear selected package"
                title="Clear selected package"
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <a href="https://www.instagram.com/travel4life_net/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-80 transition-opacity" aria-label="Instagram">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="2" fill="none"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/thetravellersstore/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-80 transition-opacity" aria-label="Facebook">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex w-full min-w-0 gap-2 sm:w-auto sm:flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFiltersMinimized(!filtersMinimized)}
            ariaLabel={filtersMinimized ? 'Show search filters' : 'Hide search filters'}
            aria-expanded={!filtersMinimized}
            icon={filtersMinimized ? ChevronDown : ChevronUp}
            size="md"
            className="relative min-h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-600 hover:bg-gray-100 sm:w-auto sm:flex-none sm:min-w-[120px]"
          >
            {filtersMinimized ? 'Filters' : 'Hide'}
            {hasActiveFilters && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sky-500 sm:-right-1 sm:-top-1 sm:h-3 sm:w-3" />
            )}
          </Button>

          <Button
            type="button"
            onClick={handleSearch}
            ariaLabel="Search for trips"
            icon={Search}
            variant="primary"
            size="md"
            className="h-12 min-w-0 flex-[1.2] rounded-xl bg-gray-900 px-6 text-white transition-transform active:scale-95 hover:bg-gray-700 sm:w-auto sm:flex-none sm:min-w-[110px]"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {!filtersMinimized && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4 sm:mt-5 sm:pt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Refine your search</h3>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} icon={X}>
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 text-gray-900 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
            <Select
              label="Trip Type"
              placeholder="Any type"
              value={type}
              onChange={setType}
              options={TRIP_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <Select
              label="Price Range"
              placeholder="Any price"
              value={priceRange}
              onChange={setPriceRange}
              options={PRICE_RANGES}
            />
            <Select
              label="Duration"
              placeholder="Any duration"
              value={duration}
              onChange={setDuration}
              options={DURATION_OPTIONS}
            />
            <Select
              label="Group Size"
              placeholder="Any size"
              value={groupSize}
              onChange={setGroupSize}
              options={GROUP_SIZES}
            />
            <Select
              label="Difficulty"
              placeholder="Any level"
              value={difficulty}
              onChange={setDifficulty}
              options={DIFFICULTY_LEVELS.map((d) => ({ value: d.value, label: d.label }))}
            />
            <Select
              label="Min Rating"
              placeholder="Any rating"
              value={rating}
              onChange={setRating}
              options={[
                { value: '4.5', label: '4.5+ stars' },
                { value: '4.0', label: '4.0+ stars' },
                { value: '3.5', label: '3.5+ stars' },
                { value: '3.0', label: '3.0+ stars' },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
