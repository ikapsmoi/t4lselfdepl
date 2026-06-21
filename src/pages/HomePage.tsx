import React from 'react';
import Hero from '../components/home/Hero';
import { SearchBar } from '../components/search/SearchBar';
import { TripGrid } from '../components/trips/TripGrid';

import { Testimonials } from '../components/home/Testimonials';
import { Newsletter } from '../components/home/Newsletter';
import { FAQ } from '../components/home/FAQ';
import { CreatorTrips } from '../components/creator/CreatorTrips';
import { IndiaSpecials } from '../components/india/IndiaSpecials';
import { ClientGallery } from '../components/home/ClientGallery';
import { SocialReviews } from '../components/home/SocialReviews';
import { HowItWorksPage } from './HowItWorksPage';
import { SafetyPage } from './SafetyPage';
import { useTrips } from '../hooks/useTrips';
import { useAnalytics } from '../utils/analytics';
import { MapPin, ArrowRight } from 'lucide-react';

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
        src="https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1920"
        alt="Cinematic travel destination"
        className="w-full h-full object-cover"
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
  const { trips, loading, searchTrips, getTopRatedTrips, getTrendingTrips } = useTrips();
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
      <Hero />

      {/* Top-Rated Adventures */}
      <div id="top-rated-adventures">
        <section className="py-10 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TripGrid
              trips={trips}
              title="Top-Rated Adventures"
              subtitle="Join our most beloved trips rated by fellow travelers"
              loading={loading}
              mobileCarousel={true}
              showViewAll={false}
              prominentFirst={false}
            />
          </div>
        </section>
      </div>

      {/* Social Reviews - Mobile Only */}
      <SocialReviews />

      <SectionDivider />

      {/* Creator Trips */}
      <section className="py-10 md:py-16" id="creator-trips">
        <CreatorTrips />
      </section>

      <SectionDivider />

      {/* Client Gallery - Masonry */}
      <ClientGallery />

      <SectionDivider />

      {/* Cinematic Storytelling Section */}
      <StorytellingSection />

      <SectionDivider />

      {/* India Specials */}
      <div id="india-specials" className="py-8 md:py-16">
        <IndiaSpecials />
      </div>

      {/* Safety & Trust - Only show when clicked */}
      {showSafety && (
        <div id="safety">
          <SafetyPage />
        </div>
      )}

      {/* Community/Testimonials - Only show when clicked */}
      {showTestimonialsSection && (
        <div id="testimonials">
          <Testimonials />
        </div>
      )}

      {/* How It Works - Only show when clicked */}
      {showHowItWorksSection && (
        <div id="how-it-works">
          <HowItWorksPage />
        </div>
      )}

      <SectionDivider />
      <FAQ />
      <SectionDivider />
      <Newsletter />
    </div>
  );
};
