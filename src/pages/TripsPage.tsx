import React, { useState } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star } from 'lucide-react';
import { SearchBar } from '../components/search/SearchBar';
import { TripGrid } from '../components/trips/TripGrid';
import { useTrips } from '../hooks/useTrips';
import { Button } from '../components/ui/Button';
import { Badge } from '../ui/Badge';

export const TripsPage: React.FC = () => {
  const { trips, loading, searchTrips, getTrendingTrips } = useTrips();
  const [showFilters, setShowFilters] = useState(false);
  const trendingTrips = getTrendingTrips;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">
            Discover Amazing Adventures
          </h1>
          <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto leading-relaxed">
            Browse through hundreds of unique travel experiences created by passionate hosts worldwide.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-16">
          <SearchBar onSearch={searchTrips} />
        </div>

        {/* Results */}
        <div className="space-y-16">
          <TripGrid
            trips={trips}
            title="All Adventures"
            subtitle={`${trips.length} amazing experiences waiting for you`}
            loading={loading}
            showViewAll={false}
          />

          {trips.length === 0 && !loading && (
            <TripGrid
              trips={trendingTrips}
              title="Trending Adventures"
              subtitle="Popular destinations our community is loving"
              loading={false}
              showViewAll={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};