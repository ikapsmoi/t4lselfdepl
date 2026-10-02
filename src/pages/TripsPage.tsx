import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star } from 'lucide-react';
import { SearchBar } from '../components/search/SearchBar';
import { TripGrid } from '../components/trips/TripGrid';
import { useTrips } from '../hooks/useTrips';
import { Button } from '../components/ui/Button';
import { Badge } from '../ui/Badge';

export const TripsPage: React.FC = () => {
  const { trips, loading, error, searchTrips, refreshTrips, getTrendingTrips } = useTrips();
  const [showFilters, setShowFilters] = useState(false);
  const trendingTrips = getTrendingTrips;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const destination = searchParams.get('destination');
    const type = hashParams.get('type') || searchParams.get('type');
    const initialFilters = {
      ...(destination ? { destination } : {}),
      ...(type ? { type } : {}),
    };

    if (Object.keys(initialFilters).length > 0) {
      searchTrips(initialFilters);
    }
  }, [searchTrips]);

  const isEuropeSearch =
    new URLSearchParams(window.location.search).get('destination')?.trim().toLowerCase() === 'europe';

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

        {error && (
          <div role="alert" className="mb-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p>We could not load trips right now. {error}</p>
            <button
              type="button"
              onClick={() => void refreshTrips()}
              className="mt-3 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        <div className="space-y-16">
          <TripGrid
            trips={trips}
            title="All Adventures"
            subtitle={`${trips.length} amazing experiences waiting for you`}
            loading={loading}
            showViewAll={false}
          />

          {trips.length === 0 && !loading && !error && (
            isEuropeSearch ? (
              <section className="rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">No active Europe trips are listed right now</h2>
                <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                  Trip dates and availability change. Contact Travel4life to ask about current plans or a
                  custom Europe itinerary; we will confirm what is actually available.
                </p>
                <a
                  href="https://wa.me/919871621921?text=Hi%20Travel4life%2C%20I%27m%20interested%20in%20Europe%20travel%20from%20India."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  Ask about Europe travel
                </a>
              </section>
            ) : (
              <TripGrid
                trips={trendingTrips}
                title="Trending Adventures"
                subtitle="Popular destinations our community is loving"
                loading={false}
                showViewAll={false}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};