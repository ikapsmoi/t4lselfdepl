import React from 'react';
import { FileText, Shield, Users, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

  const heroBackgrounds = [
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg',
    'https://images.pexels.com/photos/2106776/pexels-photo-2106776.jpeg'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600/40 via-blue-500/30 to-purple-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">📋 Legal</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              Terms of Service
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              Understanding your rights and responsibilities when using TravelTag.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> January 1, 2025
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using TravelTag, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-6">
              Permission is granted to temporarily use TravelTag for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-6">
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Booking and Payments</h2>
            <p className="text-gray-700 mb-6">
              All bookings are subject to availability and confirmation. Payment terms vary by trip and host.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation Policy</h2>
            <p className="text-gray-700 mb-6">
              Cancellation policies vary by trip. Please review the specific policy before booking.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Questions about our Terms?</h4>
                  <p className="text-blue-800">
                    Contact our legal team at info@travel4life.net for clarification on any terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};