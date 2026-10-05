import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star } from 'lucide-react';
import { SearchBar } from '../components/search/SearchBar';
import { TripGrid } from '../components/trips/TripGrid';
import { useTrips } from '../hooks/useTrips';
import { Button } from '../components/ui/Button';
import { Badge } from '../ui/Badge';
import { getTravel4LifeContactContext, getTravel4LifeWhatsAppUrl } from '../utils/travel4lifeContact.js';
import { trackContactEvent } from '../utils/analytics';

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-3 text-3xl font-display font-bold tracking-tight text-gray-900 sm:mb-4 sm:text-4xl md:text-5xl">
            Discover Amazing Adventures
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 font-body sm:text-xl">
            Browse through hundreds of unique travel experiences created by passionate hosts worldwide.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-10 sm:mb-16">
          <SearchBar trips={trips} tripsLoading={loading} onSearch={searchTrips} />
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
              <section className="rounded-2xl border border-sky-100 bg-white p-5 text-center shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">No active Europe trips are listed right now</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Trip dates and availability change. Contact Travel4life to ask about current plans or a
                  custom Europe itinerary; we will confirm what is actually available.
                </p>
                <a
                  href={getTravel4LifeWhatsAppUrl(getTravel4LifeContactContext({ pageType: 'europe', destination: 'Europe' }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void trackContactEvent('contact_whatsapp_click', getTravel4LifeContactContext({ pageType: 'europe', destination: 'Europe' }))}
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