import React, { useState, useEffect, memo } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { FeaturedTrip } from '../trips/FeaturedTrip';
import { TripDetails } from '../trips/TripDetails';
import { SearchBar } from '../search/SearchBar';
import { NewUsersTicker } from '../common/NewUsersTicker';
import { useTrips } from '../../hooks/useTrips';
import { supabase } from '../../lib/supabase';
import { MessageCircle } from 'lucide-react';

const Hero: React.FC = memo(() => {
  const { getFeaturedTripsArray, searchTrips } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentTripIndex, setCurrentTripIndex] = useState(0);
  const [showFeaturedTrip, setShowFeaturedTrip] = useState(false);

  const [currentWordInSetIndex, setCurrentWordInSetIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);

  // Independent review rotation index
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Initialize with mock data, but expect to be overwritten by fetched data
  interface ReviewData {
    reviewerName: string;
    reviewComment: string;
    tripTitle: string;
  }

  const [reviewsData, setReviewsData] = useState<ReviewData[]>([
    { reviewerName: 'Sarah', reviewComment: 'Amazing experience! Would definitely recommend...', tripTitle: 'Epic Iceland Adventure' },
    { reviewerName: 'Mike', reviewComment: 'Best trip ever! The group was fantastic and...', tripTitle: 'Cultural Japan Journey' },
    { reviewerName: 'Emma', reviewComment: 'Incredible adventure! Everything was perfectly...', tripTitle: 'Costa Rica Wildlife' },
    { reviewerName: 'Alex', reviewComment: 'Unforgettable journey! The host was amazing...', tripTitle: 'Swiss Alps Hiking' },
    { reviewerName: 'Lisa', reviewComment: 'Life-changing experience! I loved every moment...', tripTitle: 'Bali Spiritual Retreat' }
  ]);

  const featuredTrips = getFeaturedTripsArray;

  // Five sets of three words, one for each background image
  const fadingWordSets = [
  ["Tomorrowland Ultra Coachella"],
    ["Epic Group Trips"],
["Every Destination Affordable"],
    ["Travel Free as a Host"],
   ["Content & Memories"]
  ];

  // Dynamic background images for Gen Z travel vibes
  const heroBackgrounds = React.useMemo(() => [
    {
      url: '/ChatGPT Image Mar 18, 2026, 06_04_06 PM.png',
      title: 'Beach Adventures',
      vibe: 'You Travel'
    },
    {
      url: '/ChatGPT Image Mar 18, 2026, 05_59_31 PM.png',
      title: 'Mountain Escapes',
     vibe: 'For Free'
    },
    {
      url: '/ChatGPT Image Mar 18, 2026, 05_31_27 PM.png',
      title: 'City Exploration',
     vibe: 'To Places'
    },
    {
      url: 'https://images.pexels.com/photos/34030625/pexels-photo-34030625.jpeg',
      title: 'Cultural Immersion',
     vibe: 'on Everyones'
    },
    {
      url: '/ChatGPT Image Mar 18, 2026, 05_30_22 PM.png',
      title: 'Wildlife Adventures',
      vibe: 'Bucket List'
    }
  ], []);

  // Rotate backgrounds every 4 seconds
  useEffect(() => {
    // Show featured trip after 5 seconds
    const featuredTripTimer = setTimeout(() => {
      if (featuredTrips.length > 0) {
        setShowFeaturedTrip(true);
      }
    }, 80000);

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
        } else {
          // Use mock data silently
        }
      } catch (e) {
        console.error('Exception fetching reviews:', e);
      }
    };

    fetchDynamicData();

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);

      // Reset to first word of new set when background changes
      setIsTextVisible(false);
      setTimeout(() => {
        setCurrentWordInSetIndex(0);
        setIsTextVisible(true);
      }, 300);
    }, 4000);

    // Independent review rotation - cycles through all reviews every 3 seconds
    const reviewInterval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviewsData.length);
    }, 3000);

    // Featured trips carousel
    const tripInterval = setInterval(() => {
      if (featuredTrips.length > 1) {
        setCurrentTripIndex((prev) => (prev + 1) % featuredTrips.length);
      }
    }, 5000); // 5 second intervals as requested

    return () => {
      clearInterval(interval);
      clearInterval(reviewInterval);
      clearInterval(tripInterval);
      clearTimeout(featuredTripTimer);
    };
  }, [featuredTrips.length, reviewsData.length, heroBackgrounds.length]);

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
                src={bg.url}
                alt={`${bg.title} - ${bg.vibe}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
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
                onClick={() => setCurrentBgIndex(index)}
                aria-label={`View ${heroBackgrounds[index].title} background`}
                className={`transition-all duration-300 rounded-full ${
                  index === currentBgIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
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
                <span className="text-xs font-semibold text-white/90 tracking-widest uppercase">Curated Travel Experiences</span>
              </div>

              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.08] mb-5 text-white transition-opacity duration-300 ${
                isTextVisible ? 'opacity-100' : 'opacity-0'
              }`}>
                {fadingWordSets[currentBgIndex][currentWordInSetIndex]}
              </h1>

              <p className="text-base md:text-xl font-body font-normal text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Grand Events · 13 years of excellence · Unbeatable prices. 
              </p>

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
                    Explore Experiences
                  </button>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("triggerSignup"));
                      setTimeout(() => {
                        const bottomEl = document.getElementById("modal-bottom");
                        if (bottomEl) bottomEl.scrollIntoView({ behavior: "smooth" });
                      }, 1);
                    }}
                    className="flex-1 py-2.5 px-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all duration-200 text-xs sm:text-sm"
                  >
                    Become a Host
                  </button>
                </div>

                {/* Search bar */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/30">
                  <SearchBar onSearch={searchTrips} className="" navigateOnFilter={true} />
                </div>

                {/* Live metrics */}
                <div className="flex items-center justify-center gap-6 mt-5">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <div className="flex -space-x-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 border-2 border-white/30"></div>
                      ))}
                    </div>
                    <span className="text-xs font-medium">12K+ travelers</span>
                  </div>
                  <div className="w-px h-3 bg-white/30"></div>
                  <div className="flex items-center gap-1 text-white/80">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">4.65 rating</span>
                  </div>
                  <div className="w-px h-3 bg-white/30"></div>
                  <span className="text-xs font-medium text-white/80">60+ destinations</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp Support Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => window.open('https://wa.link/ghfcus', '_blank')}
          className="bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          aria-label="Contact support via WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Plan Trip in 5 Minutes
          </div>
        </button>
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
