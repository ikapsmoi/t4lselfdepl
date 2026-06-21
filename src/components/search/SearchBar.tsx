import React, { useState, useMemo, memo } from 'react';
import { Search, MapPin, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useTrips } from '@/hooks/useTrips';
import { SearchFilters } from '../../types';
import {
  TRIP_TYPES,
  PRICE_RANGES,
  DURATION_OPTIONS,
  GROUP_SIZES,
  DIFFICULTY_LEVELS,
} from '../../utils/constants';
import { useAnalytics } from '../../utils/analytics';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  className?: string;
  navigateOnFilter?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = memo(({ onSearch, className = '', navigateOnFilter = false }) => {
  const { searchTrip } = useAnalytics();
  const [destination, setDestination] = useState('');
  const [type, setType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [duration, setDuration] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [rating, setRating] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filtersMinimized, setFiltersMinimized] = useState(true);

  // ✅ Pull trips directly
  const { trips, loading: tripsLoading } = useTrips();

  const handleSearch = () => {
    const filters: SearchFilters = {};

    if (destination) filters.destination = destination;
    if (type) filters.type = type;
    if (difficulty) filters.difficulty = difficulty;
    if (rating) filters.rating = parseFloat(rating);

    if (priceRange && priceRange !== '5000+') {
      const [min, max] = priceRange.split('-').map((p) => parseInt(p));
      filters.minPrice = min;
      if (max) filters.maxPrice = max;
    } else if (priceRange === '5000+') {
      filters.minPrice = 5000;
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
    setType('');
    setPriceRange('');
    setDuration('');
    setGroupSize('');
    setDifficulty('');
    setRating('');
    onSearch({});
  };

  const hasActiveFilters =
    destination || type || priceRange || duration || groupSize || difficulty || rating;

  // ✅ Build title list dynamically from trips
  const titleList = useMemo(() => {
    const live = (trips ?? [])
      .map((trip) => trip.title?.trim())
      .filter(Boolean);

    return [...new Set(live)].sort((a, b) => a.localeCompare(b));
  }, [trips]);

  return (
    <div className={`w-full rounded-[20px] p-5 ${className}`}>
      {/* Experience tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { label: 'Adventure', value: 'adventure' },
          { label: 'Cultural', value: 'culture' },
          { label: 'Festivals', value: 'festivals' },
          { label: 'Wellness', value: 'wellness' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setType(tab.value);
              if (navigateOnFilter) {
                window.location.hash = 'trips';
                setTimeout(() => {
                  onSearch({ type: tab.value });
                }, 100);
              } else {
                onSearch({ type: tab.value });
              }
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              type === tab.value
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative w-full">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={tripsLoading ? 'Loading trips...' : 'Where do you want to go?'}
            aria-label="Search trips"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full pl-12 pr-16 py-3.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
            list="trip-titles"
          />
          {/* Social icons inside search input */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
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
          <datalist id="trip-titles">
            {titleList.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </div>

        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setFiltersMinimized(!filtersMinimized)}
            ariaLabel={filtersMinimized ? 'Show search filters' : 'Hide search filters'}
            icon={filtersMinimized ? ChevronDown : ChevronUp}
            size="md"
            className="bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 px-4 py-3 rounded-2xl min-w-[120px]"
          >
            {filtersMinimized ? 'Filters' : 'Hide'}
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                !
              </span>
            )}
          </Button>

          <Button
            onClick={handleSearch}
            ariaLabel="Search for trips"
            icon={Search}
            variant="primary"
            size="md"
            className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-2xl min-w-[110px]"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && !filtersMinimized && (
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Refine your search</h3>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} icon={X}>
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-gray-900">
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
