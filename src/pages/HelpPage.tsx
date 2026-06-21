import React from 'react';
import { HelpCircle, MessageCircle, Phone, Mail, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const HelpPage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');

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

  const helpCategories = [
    {
      icon: MessageCircle,
      title: 'Booking Help',
      description: 'Questions about reservations and payments',
      articles: 12
    },
    {
      icon: Phone,
      title: 'Trip Support',
      description: 'Help during your travel experience',
      articles: 8
    },
    {
      icon: HelpCircle,
      title: 'Account Issues',
      description: 'Profile and account management',
      articles: 15
    },
    {
      icon: Mail,
      title: 'Host Resources',
      description: 'Information for trip hosts',
      articles: 20
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-teal-500/30 to-green-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">🆘 Support</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              Help Center
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              Find answers to your questions and get the support you need for your travel adventures.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                <category.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-3">{category.description}</p>
              <p className="text-sm text-blue-600 font-medium">{category.articles} articles</p>
            </div>
          ))}
        </div>

        {/* Contact Options */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you 24/7. Choose the best way to reach us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" icon={MessageCircle}>Live Chat</Button>
            <Button variant="outline" icon={Mail}>Email Support</Button>
            <Button variant="outline" icon={Phone}>Call Us</Button>
          </div>
        </div>
      </div>
    </div>
  );
};