import React, { useState, useEffect, memo, useRef } from 'react';
import { BadgePercent, MessageCircle, Star } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { FeaturedTrip } from '../trips/FeaturedTrip';
import { TripDetails } from '../trips/TripDetails';
import { SearchBar } from '../search/SearchBar';
import { supabase } from '../../lib/supabase';
import { openTravelPlanner } from './tripPlannerEvent';
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
  const [isVideoUnavailable, setIsVideoUnavailable] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const reduceMotion = useReducedMotion();

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
    'Festival FOMO? We’ve Got You.',
    'Weekend Escapes from ₹9,000',
    'Cash, Cards or Bank. Your Call.',
    'Travel with Group? We’ve Got You.',
    'Weddings & Corp Events Under ₹7L'
  ];
  const activeHeadline = heroHeadlines[currentBgIndex];
  const headlineWords = activeHeadline.split(' ');
  const [visibleHeadlineCharacters, setVisibleHeadlineCharacters] = useState(0);

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
  const heroVideoUrl = import.meta.env.VITE_HERO_VIDEO_URL;

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

  useEffect(() => {
    const headlineLength = activeHeadline.length;
    setVisibleHeadlineCharacters(0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisibleHeadlineCharacters(headlineLength);
      return;
    }

    const typingInterval = window.setInterval(() => {
      setVisibleHeadlineCharacters((visibleCharacters) => {
        if (visibleCharacters >= headlineLength) {
          window.clearInterval(typingInterval);
          return headlineLength;
        }
        return visibleCharacters + 1;
      });
    }, 42);

    return () => window.clearInterval(typingInterval);
  }, [activeHeadline]);

  return (
    <> {/* This fragment is necessary to return multiple elements */}
      <section ref={heroRef} className="hero-section bg-gray-950 max-lg:min-h-[72svh] max-lg:items-start max-lg:overflow-visible max-lg:pb-16 max-lg:pt-24 lg:justify-start">
        {/* New Users Ticker */}

        {/* Dynamic Background Slideshow */}
        <motion.div style={reduceMotion ? undefined : { y: heroParallax }} className="absolute inset-0 overflow-hidden max-lg:!inset-0 lg:left-[60%]">
          {(!heroVideoUrl || isVideoUnavailable || reduceMotion) && heroBackgrounds.map((bg, index) => (
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
          {heroVideoUrl && !isVideoUnavailable && !reduceMotion && (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={heroVideoUrl}
              poster={heroBackgrounds[0].url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onError={() => {
                console.error('The configured homepage hero video could not be loaded.');
                setIsVideoUnavailable(true);
              }}
            />
          )}

          {/* Premium cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60 lg:bg-gradient-to-l lg:from-transparent lg:via-black/25 lg:to-gray-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 lg:from-transparent lg:via-transparent lg:to-black/10" />

          {/* Background Indicator Dots */}
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 space-x-2 transform lg:left-[80%]">
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
        </motion.div>

        {reviewsData.length > 0 && (
          <div className="absolute left-1/2 top-3 z-20 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 sm:top-4">
            <AnimatePresence mode="wait">
            <motion.div
                key={currentReviewIndex}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-white/20 bg-gray-950/55 px-4 py-2 text-xs text-white shadow-lg backdrop-blur-xl"
                aria-live="polite"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden="true" />
                <span className="truncate">
                  A recent note from {reviewsData[currentReviewIndex].reviewerName} · {reviewsData[currentReviewIndex].tripTitle}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className={`hero-content lg:mx-auto lg:max-w-7xl lg:px-8 lg:text-left ${featuredTrips.length > 0 && showFeaturedTrip ? 'max-w-4xl mx-auto px-4' : ''}`}>
          {featuredTrips.length > 0 && showFeaturedTrip ? (
            <FeaturedTrip
              featuredTrips={featuredTrips}
              currentTripIndex={currentTripIndex}
              onViewDetails={(trip) => setSelectedTrip(trip)}
              onClose={() => setShowFeaturedTrip(false)}
            />
          ) : (
            <div className="relative z-10 mx-auto max-w-4xl animate-fade-in px-4 text-center text-white lg:ml-0 lg:mr-auto lg:w-3/5 lg:max-w-none lg:px-0 lg:text-left">
              {/* Label */}
              <div className="hero-spotlight-label relative isolate inline-flex items-center gap-2 overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                <span className="hero-spotlight-label__text relative z-10 text-xs font-bold text-white tracking-widest uppercase">What Makes Us Different</span>
              </div>

              <h1
                aria-label={activeHeadline}
                className={`hero-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.08] mb-5 text-white transition-opacity duration-300 ${
                isTextVisible ? 'opacity-100' : 'opacity-0'
              }`}
              >
                {headlineWords.map((word, wordIndex) => {
                  const precedingCharacterCount = headlineWords
                    .slice(0, wordIndex)
                    .reduce((count, previousWord) => count + previousWord.length + 1, 0);

                  return (
                    <span
                      key={`${currentBgIndex}-${wordIndex}`}
                      aria-hidden="true"
                      className="hero-headline__word"
                    >
                      {Array.from(word).map((character, characterIndex) => {
                        const index = precedingCharacterCount + characterIndex;
                        return (
                          <span
                            key={index}
                            className={`hero-headline__character ${
                              index < visibleHeadlineCharacters ? 'is-visible' : ''
                            }`}
                          >
                            {character}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </h1>

              {/* Floating glass search card */}
              <div className="mx-auto max-w-2xl lg:mx-0">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openTravelPlanner()}
                    className="flex min-h-14 flex-1 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-gray-900 shadow-lg transition-transform hover:scale-[1.02] hover:bg-gray-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 sm:text-base"
                  >
                    Design My Trip
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById('top-rated-adventures')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
                    }}
                    className="flex h-12 flex-1 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 sm:text-sm"
                  >
                    Explore trips
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <BadgePercent className="h-3.5 w-3.5 text-white/75" aria-hidden="true" />
                    Trip ideas built around you
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="relative z-30 mx-auto -mt-12 mb-8 w-full max-w-2xl px-4 lg:-mt-32 lg:max-w-7xl lg:px-8">
        <div className="overflow-visible rounded-2xl border border-white/30 bg-white/95 shadow-xl backdrop-blur-xl lg:w-3/5">
          <SearchBar trips={trips} tripsLoading={tripsLoading} onSearch={searchTrips} className="" navigateOnFilter={true} />
        </div>
      </div>

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
