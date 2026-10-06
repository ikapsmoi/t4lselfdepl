import React, { useState, useEffect, memo } from 'react';
import { BadgePercent, Star, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { FeaturedTrip } from '../trips/FeaturedTrip';
import { TripDetails } from '../trips/TripDetails';
import { SearchBar } from '../search/SearchBar';
import { NewUsersTicker } from '../common/NewUsersTicker';
import { supabase } from '../../lib/supabase';
import { FloatingWhatsAppEnquiry } from '../common/FloatingWhatsAppEnquiry';
import type { SearchFilters, Trip } from '../../types';

interface HeroProps {
  trips: Trip[];
  tripsLoading: boolean;
  searchTrips: (filters: SearchFilters) => void;
}

const Hero: React.FC<HeroProps> = memo(({ trips, tripsLoading, searchTrips }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [loadedBackgrounds, setLoadedBackgrounds] = useState(() => new Set([0]));
  const [currentTripIndex, setCurrentTripIndex] = useState(0);
  const [showFeaturedTrip, setShowFeaturedTrip] = useState(false);

  const [isTextVisible, setIsTextVisible] = useState(true);

  // Independent review rotation index
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  interface ReviewData {
    reviewerName: string;
    reviewComment: string;
    tripTitle: string;
  }

  const [reviewsData, setReviewsData] = useState<ReviewData[]>([]);

  const featuredTrips = trips.filter((trip) => trip.featured);

  const heroHeadlines = [
    'Find Your Travel Crew',
    'Festivals Hit Different Together',
    'Curated Group Adventures',
    'Make New Memories',
    'Go Further Together'
  ];

  const heroBackgrounds = React.useMemo(() => [
    {
      url: '/optimized/hero-beach.webp',
      title: 'A group relaxing by the sea',
      vibe: 'Beach trip'
    },
    {
      url: '/optimized/hero-mountain.webp',
      title: 'Travellers exploring the mountains',
      vibe: 'Mountain trip'
    },
    {
      url: '/optimized/hero-city.webp',
      title: 'A group discovering a new city',
      vibe: 'City trip'
    },
    {
      url: 'https://images.pexels.com/photos/34030625/pexels-photo-34030625.jpeg?auto=compress&cs=tinysrgb&w=1440&h=960&q=78&fm=webp',
      title: 'Travellers experiencing local culture',
      vibe: 'Cultural trip'
    },
    {
      url: '/optimized/hero-wildlife.webp',
      title: 'Travellers spotting wildlife',
      vibe: 'Wildlife trip'
    }
  ], []);

  useEffect(() => {
    const fetchDynamicData = async () => {
      // Fetch recent reviews with reviewer details
      try {
        const { data: reviewsQueryData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            comment,
            created_at,
            reviewer_id,
            profiles!reviews_reviewer_id_fkey(name),
            trips!reviews_trip_id_fkey(title)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else if (reviewsQueryData && reviewsQueryData.length > 0) {
          const formattedReviews: ReviewData[] = reviewsQueryData.map((review: any) => ({
            reviewerName: review.profiles?.name || 'Anonymous',
            reviewComment: review.comment?.substring(0, 50) + (review.comment?.length > 50 ? '...' : ''),
            tripTitle: review.trips?.title || 'Amazing Trip'
          }));
          setReviewsData(formattedReviews);
          setCurrentReviewIndex(0);
        }
      } catch (e) {
        console.error('Exception fetching reviews:', e);
      }
    };

    fetchDynamicData();
  }, []);

  useEffect(() => {
    const featuredTripTimer = setTimeout(() => {
      if (featuredTrips.length > 0) {
        setShowFeaturedTrip(true);
      }
    }, 80000);

    const tripInterval = setInterval(() => {
      if (featuredTrips.length > 1) {
        setCurrentTripIndex((prev) => (prev + 1) % featuredTrips.length);
      }
    }, 5000);

    return () => {
      clearInterval(tripInterval);
      clearTimeout(featuredTripTimer);
    };
  }, [featuredTrips.length]);

  useEffect(() => {
    const reviewInterval = setInterval(() => {
      if (reviewsData.length > 1) {
        setCurrentReviewIndex((prev) => (prev + 1) % reviewsData.length);
      }
    }, 3000);
    return () => clearInterval(reviewInterval);
  }, [reviewsData.length]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextIndex = (currentBgIndex + 1) % heroBackgrounds.length;

      if (loadedBackgrounds.has(nextIndex)) {
        setCurrentBgIndex(nextIndex);
        setIsTextVisible(false);
        window.setTimeout(() => setIsTextVisible(true), 300);
        return;
      }

      const image = new Image();
      const revealNextBackground = () => {
        setLoadedBackgrounds((loaded) => new Set(loaded).add(nextIndex));
        setCurrentBgIndex(nextIndex);
        setIsTextVisible(false);
        window.setTimeout(() => setIsTextVisible(true), 300);
      };
      image.onload = revealNextBackground;
      image.onerror = revealNextBackground;
      image.src = heroBackgrounds[nextIndex].url;
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [currentBgIndex, heroBackgrounds, loadedBackgrounds]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <> {/* This fragment is necessary to return multiple elements */}
      <section className="hero-section">
        {/* New Users Ticker */}

        {/* Dynamic Background Slideshow */}
        <div className="absolute inset-0 overflow-hidden">
          {heroBackgrounds.map((bg, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentBgIndex
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={loadedBackgrounds.has(index) ? bg.url : undefined}
                alt={`${bg.title} - ${bg.vibe}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </div>
          ))}

          {/* Premium cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />

          {/* Review notification widget */}
          {reviewsData.length > 0 && (
            <div className="absolute top-20 right-4 md:top-24 md:right-8 hidden sm:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20 animate-float max-w-[240px]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-sky-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {reviewsData[currentReviewIndex].reviewerName} reviewed
                    </div>
                    <div className="text-xs text-white/70 truncate">
                      "{reviewsData[currentReviewIndex].reviewComment}"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Background Indicator Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {heroBackgrounds.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setLoadedBackgrounds((loaded) => new Set(loaded).add(index));
                  setCurrentBgIndex(index);
                }}
                aria-label={`View ${heroBackgrounds[index].title} background`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full"
                aria-current={index === currentBgIndex ? 'true' : undefined}
              >
                <span className={`block h-2 w-2 rounded-full bg-white/50 transition-transform duration-300 ${
                  index === currentBgIndex
                    ? 'scale-x-[4] bg-white'
                    : 'hover:bg-white/80'
                }`} />
              </button>
            ))}
          </div>
        </div>

        <div className={`hero-content ${featuredTrips.length > 0 && showFeaturedTrip ? 'max-w-4xl mx-auto px-4' : ''}`}>
          {featuredTrips.length > 0 && showFeaturedTrip ? (
            <FeaturedTrip
              featuredTrips={featuredTrips}
              currentTripIndex={currentTripIndex}
              onViewDetails={(trip) => setSelectedTrip(trip)}
              onClose={() => setShowFeaturedTrip(false)}
            />
          ) : (
            <div className="text-center text-white animate-fade-in relative z-10 max-w-4xl mx-auto px-4">
              {/* Label */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.1 mb-6">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-white/90 tracking-widest uppercase">Group or Customised Tours</span>
              </div>

              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.08] mb-5 text-white transition-opacity duration-300 ${
                isTextVisible ? 'opacity-100' : 'opacity-0'
              }`}>
                {heroHeadlines[currentBgIndex]}
              </h1>

              {/* Floating glass search card */}
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => {
                      window.location.hash = 'home';
                      setTimeout(() => {
                        const element = document.getElementById('top-rated-adventures');
                        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 300);
                    }}
                    className="flex-1 py-2.5 px-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg text-xs sm:text-sm"
                  >
                    Explore trips
                  </button>
                  <button
                    onClick={() => {
                      window.location.hash = 'how-it-works';
                      window.scrollTo(0, 0);
                    }}
                    className="flex-1 py-2.5 px-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all duration-200 text-xs sm:text-sm"
                  >
                    How it works
                  </button>
                </div>

                {/* Search bar */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/30">
                  <SearchBar trips={trips} tripsLoading={tripsLoading} onSearch={searchTrips} className="" navigateOnFilter={true} />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <Star className="h-3.5 w-3.5 text-white/75" aria-hidden="true" />
                    4.9 rating
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <Users className="h-3.5 w-3.5 text-white/75" aria-hidden="true" />
                    12000 plus travelers
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <BadgePercent className="h-3.5 w-3.5 text-white/75" aria-hidden="true" />
                    Pre Purchaser Rates
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <FloatingWhatsAppEnquiry />

      {/* Trip Details Modal */}
      {selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          onClose={() => { console.log('onClose called in Hero'); setSelectedTrip(null); }}
        />
      )}
    </>
  );
});

Hero.displayName = 'Hero';

export default Hero;
