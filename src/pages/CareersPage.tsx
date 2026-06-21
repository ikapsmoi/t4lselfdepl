import React from 'react';
import { Briefcase, Users, Globe, Heart, TrendingUp, Coffee, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const CareersPage: React.FC = () => {
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

  const openPositions = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build amazing user experiences for our travel platform'
    },
    {
      title: 'Community Manager',
      department: 'Marketing',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Grow and engage our community of travelers and hosts'
    },
    {
      title: 'Travel Experience Curator',
      department: 'Operations',
      location: 'Remote',
      type: 'Full-time',
      description: 'Source and verify amazing travel experiences worldwide'
    }
  ];

  const benefits = [
    { icon: Globe, title: 'Travel Stipend', description: '$2,000 annual travel budget' },
    { icon: Users, title: 'Remote First', description: 'Work from anywhere in the world' },
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health coverage' },
    { icon: Coffee, title: 'Flexible Hours', description: 'Work-life balance is key' }
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
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/40 via-blue-500/30 to-purple-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">💼 Join Our Team</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              Build the Future of Travel
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              Join our mission to connect travelers worldwide and create unforgettable experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Work With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4">
                  <benefit.icon className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Open Positions</h3>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-xl font-semibold text-gray-900">{position.title}</h4>
                      <Badge variant="primary">{position.type}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 mb-3">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {position.location}
                      </span>
                    </div>
                    <p className="text-gray-700">{position.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <Button variant="primary">Apply Now</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Don't See Your Role?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion for travel and community.
          </p>
          <Button variant="outline">Send Us Your Resume</Button>
        </div>
      </div>
    </div>
  );
};