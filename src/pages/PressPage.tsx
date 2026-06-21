import React from 'react';
import { Camera, Download, Mail, Users, Globe, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const PressPage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

  const heroBackgrounds = [
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: '50K+', label: 'Active Travelers', icon: Users },
    { number: '120+', label: 'Destinations', icon: Globe },
    { number: '4.9/5', label: 'Average Rating', icon: TrendingUp }
  ];

  const mediaKit = [
    { name: 'TravelTag Logo Pack', type: 'ZIP', size: '2.4 MB' },
    { name: 'Brand Guidelines', type: 'PDF', size: '1.8 MB' },
    { name: 'Product Screenshots', type: 'ZIP', size: '15.2 MB' },
    { name: 'Company Fact Sheet', type: 'PDF', size: '890 KB' }
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-500/30 to-pink-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">📰 Press Kit</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              Press & Media
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              Revolutionizing group travel for the next generation. Get the latest news, resources, and brand assets.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Company Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                <stat.icon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Company Story */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              <strong>TravelTag</strong> was born from a simple idea: travel should bring people together, not isolate them. 
              Founded in 2024, we've quickly become the go-to platform for Gen Z and millennial travelers seeking authentic, 
              social experiences.
            </p>
            <p className="mb-4">
              Our mission is to make group travel accessible, safe, and unforgettable. We connect adventurous souls 
              with verified hosts who create unique experiences that you simply can't find anywhere else.
            </p>
            <p>
              Today, we're proud to serve over 50,000 travelers across 120+ destinations, with a 4.9/5 average rating 
              and a 95% rebooking rate. We're not just changing how people travel – we're building a global community 
              of explorers.
            </p>
          </div>
        </div>

        {/* Media Kit */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Camera className="w-7 h-7 mr-3 text-purple-600" />
            Media Kit & Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaKit.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" size="sm">{item.type}</Badge>
                      <span className="text-sm text-gray-500">{item.size}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" icon={Download}>
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Press Contact */}
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Press Inquiries</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            For media inquiries, interviews, or partnership opportunities, reach out to our press team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              icon={Mail}
              onClick={() => window.open('mailto:press@traveltag.com', '_blank')}
            >
              Contact Press Team
            </Button>
            <Button variant="outline">
              Download Media Kit
            </Button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>Press Contact: press@traveltag.com</p>
            <p>Response time: Within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};