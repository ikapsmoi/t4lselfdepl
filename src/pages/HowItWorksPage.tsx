import React from 'react';
import { Search, Users, Plane, Heart, Shield, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HowItWorksPage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

  const heroBackgrounds = [
    'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg',
    'https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg',
    'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: Search,
      title: 'Discover Your Vibe',
      description: 'Browse current listings and check the details provided for each trip',
      details: [
        'Filter by your interests and budget',
        'Review trip-specific dates and inclusions',
        'Ask us about any information not shown'
      ]
    },
    {
      icon: Users,
      title: 'Join Your Squad',
      description: 'Review the group size and arrangements listed for your trip',
      details: [
        'Confirm who is organizing the trip',
        'Ask whether group communication is available',
        'Check the current availability before booking'
      ]
    },
    {
      icon: Plane,
      title: 'Live Your Adventure',
      description: 'Plan your trip using the information confirmed for your booking',
      details: [
        'Confirm the itinerary and included services',
        'Ask about local contacts and safety arrangements',
        'Review the written booking terms'
      ]
    },
    {
      icon: Heart,
      title: 'Confirm Before Booking',
      description: 'Make sure the trip details and terms meet your needs',
      details: [
        'Confirm the total price and payment schedule',
        'Read the applicable cancellation policy',
        'Check whether insurance is included or arrange it separately'
      ]
    }
  ];

  const features = [
    { icon: Shield, title: 'Trip-specific details', description: 'Check each listing and request confirmation for missing terms' },
    { icon: Star, title: 'Travel planning', description: 'Use the guides to prepare questions for an enquiry' },
    { icon: Users, title: 'Group size', description: 'Review the capacity stated on the individual listing' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="absolute inset-0 overflow-hidden">
          {heroBackgrounds.map((bg, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
                index === currentBgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{ backgroundImage: `url(${bg})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-pink-500/30 to-orange-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">✨ How It Works</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              Adventure Made Simple
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              From dreaming to doing in just a few clicks. Here's how Travel4life makes group travel effortless and epic.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}>
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <span className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold mr-3">
                    Step {index + 1}
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                <ul className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-gray-100 to-white rounded-2xl p-8 shadow-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {index === 0 && '🔍'}
                      {index === 1 && '👥'}
                      {index === 2 && '✈️'}
                      {index === 3 && '📸'}
                    </div>
                    <p className="text-gray-600">
                      {index === 0 && 'Search through 500+ unique adventures'}
                      {index === 1 && 'Connect with 50K+ verified travelers'}
                      {index === 2 && 'Explore 120+ destinations worldwide'}
                      {index === 3 && 'Earn rewards and collect memories'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Features */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Why 50K+ Travelers Trust Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Adventure?</h3>
          <p className="text-gray-600 mb-6">Join thousands of travelers who've discovered their next favorite destination with us.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={() => window.location.hash = 'home'}>
              Browse Adventures
            </Button>
            <Button variant="outline" onClick={() => {
              const signUpButton = document.querySelector('[data-auth-signup]') as HTMLButtonElement;
              if (signUpButton) signUpButton.click();
            }}>
              Join Travel4life
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
