import React, { useState } from 'react';
import { MapPin, Calendar, Users, Star, TrendingUp, Heart } from 'lucide-react';
import { INDIA_CATEGORIES } from '../../utils/constants';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TripCard } from '../trips/TripCard';
import { TripDetails } from '../trips/TripDetails';
import { IndiaTripInquiryModal } from './IndiaTripInquiryModal';
import { TripGrid } from '../trips/TripGrid';
import { Trip } from '../../types';
import { useTrips } from '../../hooks/useTrips';


export const IndiaSpecials: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const { trips, loading, fetchTrips } = useTrips();



  // Filter trips to show only Indian specials and other India-related categories
  const indiaTrips = trips.filter(trip => 
    trip.type === 'indian_special' || 
    trip.type === 'spiritual' || 
    trip.type === 'food' || 
        trip.type === 'festivals' || 
    trip.type === 'bollywood' || 
    trip.type === 'budget'
  );
  const filteredTrips = selectedCategory 
    ? indiaTrips.filter(trip => {
        if (selectedCategory === 'food-trails') return trip.type === 'food';
        if (selectedCategory === 'indian_special') return trip.type === 'indian_special';
        return trip.type === selectedCategory;
      })
    : indiaTrips;

  const stats = [
    { label: 'States Covered', value: '28+', icon: MapPin },
    { label: 'Cultural Experiences', value: '150+', icon: Heart },
    { label: 'Festival Trips', value: '25+', icon: Star },
    { label: 'Budget Adventures', value: '40+', icon: TrendingUp }
  ];

  return (
    <section className="py-8 relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/30 to-green-50">
      {/* Decorative Indian-inspired background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-200/25 to-teal-100/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-saffron-100/10 to-orange-100/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        {/* Subtle mandala-inspired pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #d97706 1px, transparent 1px), radial-gradient(circle at 75% 75%, #15803d 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <span className="text-6xl mr-4">🇮🇳</span>
            <h2 className="text-4xl font-bold text-gray-900">India Specials</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          </p>
        </div>

        {/* Stats 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
                <stat.icon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>*/}

        {/* Category Showcase 
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {INDIA_CATEGORIES.map((category) => (
            <div
              key={category.value}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${category.bgColor} border border-gray-200`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className={`font-bold text-sm mb-1 ${category.color}`}>{category.label}</h4>
                <p className="text-gray-600 text-xs">{category.description}</p>
              </div>
            </div>
          ))}
        </div>*/}

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Explore India</h3>
          <div className="flex flex-wrap justify-center gap-2 px-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all touch-friendly ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                  : 'bg-white hover:bg-orange-50 border border-orange-200 text-gray-700'
              }`}
            >
              All Categories
            </button>
            {INDIA_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center touch-friendly ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-white hover:bg-orange-50 border border-orange-200 text-gray-700'
                }`}
              >
                <span className="mr-1 text-base">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured India Experience */}
        {/* Featured India Experiences Carousel */}
        {indiaTrips.length > 0 && (
          <div className="mb-16">
            <TripGrid
              trips={filteredTrips.slice(0, 6)}
              title="Featured India Experiences"
              subtitle="Handpicked adventures across the incredible subcontinent"
              loading={loading}
              mobileCarousel={true}
              showViewAll={false}
              prominentFirst={true}
              hideCity={true}
            />
          </div>
        )}

        {/* Trips Grid
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading India experiences...</p>
          </div>
        ) : (
          <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedCategory 
                ? `${INDIA_CATEGORIES.find(c => c.value === selectedCategory)?.label} Experiences`
                : 'Featured India Experiences'
              } 
            </h3>
            <Button variant="outline">
              View All ({filteredTrips.length})
            </Button>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="text-center py-16 bg-orange-50 rounded-2xl">
              <span className="text-6xl mb-4 block">🇮🇳</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No India experiences yet</h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory 
                  ? `No ${INDIA_CATEGORIES.find(c => c.value === selectedCategory)?.label.toLowerCase()} experiences available yet.`
                  : 'Be the first to create an amazing India experience!'
                }
              </p>
              <Button 
                variant="primary" 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  const signUpButton = document.querySelector('[data-auth-signup]') as HTMLButtonElement;
                  if (signUpButton) {
                    signUpButton.click();
                  }
                }}
              >
                Create India Trip
              </Button>
            </div>
          ) : (*/}
        {/* Filtered Trips Grid 
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading India experiences...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCategory 
                  ? `${INDIA_CATEGORIES.find(c => c.value === selectedCategory)?.label} Experiences`
                  : 'All India Experiences'
                } 
              </h3>
              <Button variant="outline">
                View All ({filteredTrips.length})
              </Button>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="text-center py-16 bg-orange-50 rounded-2xl">
                <span className="text-6xl mb-4 block">🇮🇳</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No India experiences yet</h3>
                <p className="text-gray-600 mb-6">
                  {selectedCategory 
                    ? `No ${INDIA_CATEGORIES.find(c => c.value === selectedCategory)?.label.toLowerCase()} experiences available yet.`
                    : 'Be the first to create an amazing India experience!'
                  }
                </p>
                <Button 
                  variant="primary" 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => {
                    const signUpButton = document.querySelector('[data-auth-signup]') as HTMLButtonElement;
                    if (signUpButton) {
                      signUpButton.click();
                    }
                  }}
                >
                  Create India Trip
                </Button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip) => (
                <div key={trip.id} className="relative">
                  {/* India Badge 
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="warning" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center">
                      🇮🇳 {trip.type === 'indian_special' ? 'India Special' : 'India Experience'}
                    </Badge>
                  </div>
                  <TripCard trip={trip} onClick={() => setSelectedTrip(trip)} />
                </div>
              ))}
            </div>
            )}
          </div>
      
        )} 

        {/* Call to Action */}
        <div className="text-center mt-16 bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Explore Incredible India?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the magic of India through our authentic, 
            locally-guided experiences. From the Himalayas to the backwaters, every journey tells a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => setShowInquiryModal(true)}
            >
              Plan My India Trip
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                // Trigger signup modal for becoming a host
                const signUpButton = document.querySelector('[data-auth-signup]') as HTMLButtonElement;
                if (signUpButton) {
                  signUpButton.click();
                }
              }}
            >
              Become India Host
            </Button>
          </div>
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      {/* India Trip Inquiry Modal */}
      <IndiaTripInquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
      />
    </section>
  );
};