import React from 'react';
import { Shield, Users, Phone, MapPin, Heart, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const SafetyPage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

  const heroBackgrounds = [
    'https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg',
    'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg',
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Verified Hosts',
      description: 'All hosts undergo background checks and identity verification'
    },
    {
      icon: Users,
      title: 'Small Groups',
      description: 'Intimate group sizes for better safety and personalized experiences'
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Round-the-clock emergency support and assistance'
    },
    {
      icon: MapPin,
      title: 'GPS Tracking',
      description: 'Live location sharing with emergency contacts'
    },
    {
      icon: Heart,
      title: 'Travel Insurance',
      description: 'Comprehensive coverage for all our trips'
    },
    {
      icon: CheckCircle,
      title: 'Safety Protocols',
      description: 'Standardized safety procedures for all activities'
    }
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
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/40 via-blue-500/30 to-teal-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">🛡️ Safety First</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              Safety & Trust
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              Your safety is our priority. Discover how we keep you protected on every adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Safety Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {safetyFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4">
                <feature.icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Emergency Contact */}
        <div className="text-center bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Support</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            In case of emergency during your trip, contact our 24/7 support team immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" icon={Phone}>Emergency Hotline</Button>
            <Button variant="outline" icon={MessageCircle}>Live Chat</Button>
          </div>
        </div>
      </div>
    </div>
  );
};