import React, { Suspense, lazy } from 'react';
import Hero from '../components/home/Hero';
import { TripGrid } from '../components/trips/TripGrid';

import { FestivalReleaseCTA } from '../components/home/FestivalReleaseCTA';
import { useTrips } from '../hooks/useTrips';
import { useAnalytics } from '../utils/analytics';
import { MapPin, ArrowRight } from 'lucide-react';
import { TRIP_TYPES } from '../utils/constants';

const SocialReviews = lazy(() => import('../components/home/SocialReviews').then(({ SocialReviews: Component }) => ({ default: Component })));
const Testimonials = lazy(() => import('../components/home/Testimonials').then(({ Testimonials: Component }) => ({ default: Component })));
const Newsletter = lazy(() => import('../components/home/Newsletter').then(({ Newsletter: Component }) => ({ default: Component })));
const FAQ = lazy(() => import('../components/home/FAQ').then(({ FAQ: Component }) => ({ default: Component })));
const CreatorTrips = lazy(() => import('../components/creator/CreatorTrips').then(({ CreatorTrips: Component }) => ({ default: Component })));
const IndiaSpecials = lazy(() => import('../components/india/IndiaSpecials').then(({ IndiaSpecials: Component }) => ({ default: Component })));
const ClientGallery = lazy(() => import('../components/home/ClientGallery').then(({ ClientGallery: Component }) => ({ default: Component })));
const HowItWorksPage = lazy(() => import('./HowItWorksPage').then(({ HowItWorksPage: Component }) => ({ default: Component })));
const SafetyPage = lazy(() => import('./SafetyPage').then(({ SafetyPage: Component }) => ({ default: Component })));

const DeferredHomeSection: React.FC<{ children: React.ReactNode; reserveHeight: number }> = ({ children, reserveHeight }) => {
  const [isNearViewport, setIsNearViewport] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: '700px 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} style={isNearViewport ? undefined : { minHeight: reserveHeight }} aria-busy={!isNearViewport}>
      {isNearViewport && (
        <Suspense fallback={<div aria-hidden="true" style={{ minHeight: reserveHeight }} />}>
          {children}
        </Suspense>
      )}
    </div>
  );
};

const SectionDivider: React.FC = () => (
  <div className="relative py-4 md:py-6">
    <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </div>
  </div>
);

const StorytellingSection: React.FC = () => (
  <section className="relative py-0 overflow-hidden">
    <div className="relative h-[60vh] md:h-[70vh]">
      <img
        src="https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1440&q=75&fm=webp"
        alt="Cinematic travel destination"
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-300 uppercase tracking-wider">Stories from the Road</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
              Every journey has<br />a story worth telling
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-md">
              From the ancient streets of Salzburg to the electric nights of Tomorrowland,
              our travelers discover moments that become lifelong memories.
            </p>
            <button
              onClick={() => {
                window.location.hash = 'stories';
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
            >
              Read Our Stories
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const HomePage: React.FC = () => {
  const { trips, loading, searchTrips } = useTrips();
  const [topRatedCategory, setTopRatedCategory] = React.useState('all');
  const topRatedTrips = trips
    .filter(trip =>
      trip.type !== 'indian_special' &&
      (topRatedCategory === 'all' || trip.type === topRatedCategory)
    )
    .sort((firstTrip, secondTrip) =>
      Number(secondTrip.type === 'festival') - Number(firstTrip.type === 'festival')
    );
  const topRatedCategories = TRIP_TYPES.filter(type =>
    type.value !== 'indian_special' && trips.some(trip => trip.type === type.value)
  );
  const { viewHome } = useAnalytics();
  const [showIndiaSpecials, setShowIndiaSpecials] = React.useState(false);
  const [showTrendingDestinations, setShowTrendingDestinations] = React.useState(false);
  const [showSafety, setShowSafety] = React.useState(false);
  const [showTestimonialsSection, setShowTestimonialsSection] = React.useState(false);
  const [showHowItWorksSection, setShowHowItWorksSection] = React.useState(false);

  // Track home page view
  React.useEffect(() => {
    viewHome();
  }, []);


  // Listen for hash changes to show/hide sections
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      // Reset all section visibility
      setShowTestimonialsSection(false);
      setShowHowItWorksSection(false);
      setShowSafety(false);

      if (hash === '#top-rated-adventures') {
        setTimeout(() => {
          const element = document.getElementById('top-rated-adventures');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      } else if (hash === '#testimonials') {
        setShowTestimonialsSection(true);
        setTimeout(() => {
          const element = document.getElementById('testimonials');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      } else if (hash === '#how-it-works') {
        setShowHowItWorksSection(true);
        setTimeout(() => {
          const element = document.getElementById('how-it-works');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      } else if (hash === '#safety') {
        setShowSafety(true);
        setTimeout(() => {
          const element = document.getElementById('safety');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen">
      <Hero trips={trips} tripsLoading={loading} searchTrips={searchTrips} />
      <FestivalReleaseCTA />

      {/* Top-Rated Adventures */}
      <div id="top-rated-adventures">
        <section className="py-10 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-600">Browse by category</p>
              <div className="top-rated-category-tabs flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:overflow-visible">
                <button
                  type="button"
                  onClick={() => setTopRatedCategory('all')}
                  className={`top-rated-category-tab relative isolate shrink-0 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    topRatedCategory === 'all'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900'
                  }`}
                >
                  <span className="relative z-10">All</span>
                </button>
                {topRatedCategories.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setTopRatedCategory(type.value)}
                    className={`top-rated-category-tab relative isolate shrink-0 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      topRatedCategory === type.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <span className="relative z-10">{type.value === 'budget' ? 'Budget' : type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <TripGrid
              trips={topRatedTrips}
              title="Top-Rated Adventures"
              subtitle="Join our most beloved trips rated by fellow travelers"
              loading={loading}
              mobileCarousel={true}
              showViewAll={true}
              prominentFirst={false}
            />
          </div>
        </section>
      </div>

      {/* Social Reviews - Mobile Only */}
      <DeferredHomeSection reserveHeight={280}><SocialReviews /></DeferredHomeSection>

      <SectionDivider />

      {/* Creator Trips */}
      <section className="py-10 md:py-16" id="creator-trips">
        <DeferredHomeSection reserveHeight={520}><CreatorTrips /></DeferredHomeSection>
      </section>

      <SectionDivider />

      {/* Client Gallery - Masonry */}
      <DeferredHomeSection reserveHeight={520}><ClientGallery /></DeferredHomeSection>

      <SectionDivider />

      {/* Cinematic Storytelling Section */}
      <StorytellingSection />

      <SectionDivider />

      {/* India Specials */}
      <div id="india-specials" className="py-8 md:py-16">
        <DeferredHomeSection reserveHeight={620}><IndiaSpecials trips={trips} loading={loading} /></DeferredHomeSection>
      </div>

      {/* Safety & Trust - Only show when clicked */}
      {showSafety && (
        <div id="safety">
          <Suspense fallback={<PageSectionLoader />}><SafetyPage /></Suspense>
        </div>
      )}

      {/* Community/Testimonials - Only show when clicked */}
      {showTestimonialsSection && (
        <div id="testimonials">
          <Suspense fallback={<PageSectionLoader />}><Testimonials /></Suspense>
        </div>
      )}

      {/* How It Works - Only show when clicked */}
      {showHowItWorksSection && (
        <div id="how-it-works">
          <Suspense fallback={<PageSectionLoader />}><HowItWorksPage /></Suspense>
        </div>
      )}

      <SectionDivider />
      <DeferredHomeSection reserveHeight={480}><FAQ /></DeferredHomeSection>
      <SectionDivider />
      <DeferredHomeSection reserveHeight={260}><Newsletter /></DeferredHomeSection>
    </div>
  );
};

const PageSectionLoader: React.FC = () => <div aria-hidden="true" className="min-h-96" />;
