import React from 'react';
import { Globe, Users, Shield, Heart, Award, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AboutPage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);

  const heroBackgrounds = [
    'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg',
    'https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg',
    'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg',
    'https://images.pexels.com/photos/2106776/pexels-photo-2106776.jpeg'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const values = [
    {
      icon: Heart,
      title: 'Authentic Connections',
      description: 'We believe travel is about the people you meet and the connections you make along the way.'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Your safety and security are our top priorities, with verified hosts and 24/7 support.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Our platform is built by travelers, for travelers, creating genuine experiences.'
    },
    {
      icon: Award,
      title: 'Quality Experiences',
      description: 'Every trip is carefully curated to ensure unforgettable adventures and lasting memories.'
    }
  ];

  const team = [
    {
      name: 'Ishan Kapoor',
      role: 'CEO & Co-Founder',
      image: 'WhatsApp Image 2026-03-18 at 7.53.51 PM.jpeg',
      bio: 'Former DM turned entrepreneur, passionate about connecting travelers worldwide.'
    },
    {
      name: 'Khushi Singh',
      role: 'Destination Manager-India',
      image: 'khushi.jfif',
      bio: 'Adventure seeker, building the future of group travel.'
    },
    {
      name: 'Mahak',
      role: 'Travel Sales Manager',
      image: 'mahak.jfif',
      bio: 'Community builder and travel expert, ensuring every traveler feels at home.'
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-500/30 to-teal-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">✨ Our Story</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              About TravelTag
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              We're on a mission to make travel more social, authentic, and accessible for the next generation of explorers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Mission Statement */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            To connect adventurous souls through authentic group travel experiences, 
            fostering meaningful connections and creating memories that last a lifetime.
          </p>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start your journey with TravelTag and discover what makes us different.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary">Browse Adventures</Button>
            <Button variant="outline">Become a Host</Button>
          </div>
        </div>
      </div>
    </div>
  );
};