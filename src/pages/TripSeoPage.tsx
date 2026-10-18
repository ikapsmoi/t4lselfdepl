import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Home, MapPin, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Trip } from '../types';
import { TripDetails } from '../components/trips/TripDetails';
import { cleanTripTitle, formatTripDateRange, stripSourceNotes } from '../utils/formatters';
import { getTripCanonicalUrl, getTripJsonLd, getTripPath, getTripSeoDescription, getTripSeoTitle } from '../utils/tripSeo';
import { updateSeoForTrip } from '../utils/seo';
import { Travel4LifeContactCTA } from '../components/common/Travel4LifeContactCTA';

const fallbackImage = (category: string): string => {
  if (category === 'budget') return '/optimized/pkg1.webp';
  if (category === 'indian_special') return '/pkg2.png';
  return 'https://images.pexels.com/photos/8185807/pexels-photo-8185807.jpeg';
};

const HomeNavigation: React.FC = () => (
  <a
    href="/#home"
    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:border-sky-600 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
  >
    <Home className="h-4 w-4" aria-hidden="true" />
    Back to Home
  </a>
);

type TripRow = {
  id: string;
  title: string;
  location: string;
  category: Trip['type'];
  host_id: string;
  start_date: string;
  end_date: string;
  dates_flexible?: boolean;
  price_per_person: number;
  group_size: number;
  currency?: string;
  deposit_required?: number;
  images?: string[];
  itinerary?: Record<string, unknown> & {
    description?: string;
    duration?: number;
    included?: string[];
    notIncluded?: string[];
    tags?: string[];
    requirements?: string[];
    safetyMeasures?: string[];
  };
  difficulty?: Trip['difficulty'];
  group_discount?: number;
  nomadic_badge?: boolean;
  created_at: string;
  profiles?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    verified?: boolean;
    created_at?: string;
  };
};

const toTrip = (row: TripRow): Trip => {
  const itinerary = row.itinerary || {};
  const duration = (() => {
    const itineraryDuration = Number(itinerary.duration);
    const dateDiff = Math.max(1, Math.ceil((new Date(row.end_date).getTime() - new Date(row.start_date).getTime()) / (1000 * 60 * 60 * 24)));
    if (Number.isFinite(itineraryDuration) && itineraryDuration > 0) {
      return Math.max(itineraryDuration, dateDiff);
    }
    if (Array.isArray(itinerary.cities)) {
      const cityNights = itinerary.cities.reduce((total: number, city) => {
        if (!city || typeof city !== 'object') return total;
        const nights = Number((city as Record<string, unknown>).nights);
        return Number.isFinite(nights) && nights > 0 ? total + nights : total;
      }, 0);
      if (cityNights > 0) return Math.max(cityNights + 1, dateDiff);
    }
    return dateDiff;
  })();
  const existingImages = Array.isArray(row.images) ? row.images : [];
  const resolvedImage = resolveTripImage(
    row.title,
    row.location,
    row.category,
    existingImages,
    fallbackImage(row.category)
  ).src;
  const images = existingImages.length > 0
    ? [resolvedImage, ...existingImages.slice(1)]
    : [resolvedImage];
  const included = Array.isArray(itinerary.included) && itinerary.included.length > 0
    ? itinerary.included
    : row.category === 'indian_special'
      ? [
        'Accommodation included for the entire duration of the stay at central 3 star property.',
        'Daily Continental breakfast included.',
        'Transfers as per the itinerary included.',
        'Sightseeing as per the itinerary offered and shared with you.',
        'Double occupancy rates.',
        'Travel Insurance included.',
        'Visa assistance at INR 2000 per person included.',
        'GST and TCS additional.',
      ]
      : [];
  const notIncluded = Array.isArray(itinerary.notIncluded) && itinerary.notIncluded.length > 0
    ? itinerary.notIncluded
    : row.category === 'indian_special'
      ? [
        'GST and TCS not included.',
        'Airfare from India not included.',
        'Any other meals except breakfast not included.',
        'All Prices are Per Person on Double sharing occupancy basis.',
      ]
      : [];
  const tags = Array.isArray(itinerary.tags) ? itinerary.tags : [];

  return {
    id: row.id,
    title: cleanTripTitle(row.title),
    description: stripSourceNotes(itinerary.description) || 'Explore this Travel4life group travel experience.',
    destination: row.location,
    country: row.location?.split(',').pop()?.trim() || 'Unknown',
    type: row.category,
    price: Number(row.price_per_person),
    currency: row.currency || '',
    duration,
    max_capacity: Number(row.group_size || 0),
    current_bookings: 0,
    start_date: row.start_date,
    end_date: row.end_date,
    dates_flexible: row.dates_flexible === true,
    images,
    host_id: row.host_id,
    host: row.profiles ? {
      id: row.profiles.id,
      email: row.profiles.email || '',
      name: row.profiles.name || 'Travel4life host',
      role: 'host',
      verified: Boolean(row.profiles.verified),
      points: 0,
      tier: 'silver',
      created_at: row.profiles.created_at || '',
      badges: [],
      avatar_url: row.profiles.avatar_url,
    } : undefined,
    rating: 0,
    review_count: 0,
    itinerary,
    created_at: row.created_at,
    featured: Boolean(row.nomadic_badge),
    tags,
    difficulty: row.difficulty || 'easy',
    included,
    not_included: notIncluded,
    requirements: Array.isArray(itinerary.requirements) ? itinerary.requirements : [],
    cancellation_policy: '',
    deposit_required: typeof row.deposit_required === 'number' && Number.isFinite(row.deposit_required)
      ? row.deposit_required
      : 0,
    group_discount: Number(row.group_discount || 0),
    safety_measures: Array.isArray(itinerary.safetyMeasures) ? itinerary.safetyMeasures : [],
  };
};

const formatDate = (value: string): string => new Date(value).toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const TripSeoPage: React.FC = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [relatedTrips, setRelatedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const tripId = decodeURIComponent(window.location.pathname.split('/')[2] || '');

  useEffect(() => {
    let cancelled = false;

    const loadTrip = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select(`*, profiles:host_id (id, name, email, avatar_url, verified, created_at)`)
        .eq('id', tripId)
        .eq('status', 'active')
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const loadedTrip = toTrip(data);
      const { data: relatedData } = await supabase
        .from('trips')
        .select(`*, profiles:host_id (id, name, email, avatar_url, verified, created_at)`)
        .eq('status', 'active')
        .eq('category', loadedTrip.type)
        .neq('id', loadedTrip.id)
        .limit(4);

      const loadedRelatedTrips = (relatedData || []).map(toTrip);
      setTrip(loadedTrip);
      window.dispatchEvent(new CustomEvent('travel4life:contact-context', {
        detail: {
          pageType: 'package',
          destination: loadedTrip.destination,
          package: loadedTrip.title,
          tripType: loadedTrip.type,
          entity: loadedTrip.title,
        },
      }));
      setRelatedTrips(loadedRelatedTrips);
      setLoading(false);

      const image = loadedTrip.images[0]?.startsWith('http')
        ? loadedTrip.images[0]
        : `${window.location.origin}${loadedTrip.images[0]}`;
      updateSeoForTrip({
        title: getTripSeoTitle(loadedTrip),
        description: getTripSeoDescription(loadedTrip),
        canonicalUrl: getTripCanonicalUrl(loadedTrip.id),
        image,
        jsonLd: getTripJsonLd(loadedTrip, loadedRelatedTrips),
      });
    };

    loadTrip();
    return () => { cancelled = true; };
  }, [tripId]);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><div className="text-center"><HomeNavigation /><p className="mt-4">Loading trip details...</p></div></main>;
  }

  if (notFound || !trip) {
    return <main className="min-h-screen flex items-center justify-center"><div className="text-center"><HomeNavigation /><h1 className="mt-6 text-3xl font-bold">Trip not found</h1><p className="mt-2 text-gray-600">This active trip is not available.</p></div></main>;
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <HomeNavigation />
        </div>
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <a href="/#home" className="hover:text-sky-700">Home</a><span className="mx-2">/</span>
          <a href="/trips" className="hover:text-sky-700">Trips</a><span className="mx-2">/</span>
          <span className="text-gray-900">{trip.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-start">
          <img src={trip.images[0]} alt={trip.title} className="w-full aspect-[16/10] object-cover rounded-2xl" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">{trip.type.replace('_', ' ')}</p>
            <h1 className="tour-detail-title mt-2 text-gray-900">{trip.title}</h1>
            <p className="tour-description mt-4 text-gray-600">{trip.description}</p>
            <div className="mt-6 grid gap-3 text-gray-700">
              <span className="flex items-center gap-2"><MapPin className="w-5 h-5" />{trip.destination}</span>
              <span className="flex items-center gap-2"><Calendar className="w-5 h-5" />{formatTripDateRange(trip.start_date, trip.end_date, trip.dates_flexible, formatDate)}</span>
              <span className="flex items-center gap-2"><Users className="w-5 h-5" />{trip.max_capacity} travelers maximum</span>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-2xl font-bold text-gray-900">
                {trip.currency ? `${trip.currency} ${trip.price.toLocaleString('en-IN')}` : 'Ask for current price'}
              </p>
              <button onClick={() => setShowDetails(true)} className="rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-700">Check availability</button>
            </div>
          </div>
        </div>

        <Travel4LifeContactCTA
          variant="inline"
          context={{
            pageType: 'package',
            destination: trip.destination,
            package: trip.title,
            tripType: trip.type,
            entity: trip.title,
          }}
        />

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What's included</h2>
            {trip.included.length > 0 ? <ul className="mt-4 space-y-2">{trip.included.map((item) => <li key={item} className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-600" />{item}</li>)}</ul> : <p className="mt-4 text-gray-600">Package inclusions are confirmed during inquiry.</p>}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trip information</h2>
            <p className="mt-4 text-gray-600">This active Travel4life package is listed for {trip.destination}. Dates, capacity, pricing, and booking options are based on the current trip record.</p>
          </div>
        </section>

        {relatedTrips.length > 0 && <section className="mt-12"><h2 className="text-2xl font-bold text-gray-900">Related trips</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{relatedTrips.map((relatedTrip) => <a key={relatedTrip.id} href={getTripPath(relatedTrip.id)} className="rounded-xl border border-gray-200 p-4 hover:border-sky-400"><h3 className="tour-title text-gray-900">{relatedTrip.title}</h3><p className="tour-meta mt-1 text-gray-600">{relatedTrip.destination}</p></a>)}</div></section>}
      </div>
      {showDetails && <TripDetails trip={trip} onClose={() => setShowDetails(false)} />}
    </main>
  );
};
import { resolveTripImage } from '../utils/tripImages';
