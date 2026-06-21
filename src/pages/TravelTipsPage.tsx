import React from 'react';
import { Backpack, DollarSign, MapPin, Camera, Plane, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const TravelTipsPage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = React.useState(0);
  const [selectedCategory, setSelectedCategory] = React.useState('packing');

  const heroBackgrounds = [
    'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg',
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    'https://images.pexels.com/photos/2106776/pexels-photo-2106776.jpeg'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'packing', label: 'Smart Packing', icon: Backpack },
    { id: 'budget', label: 'Budget Hacks', icon: DollarSign },
    { id: 'destinations', label: 'Destination Guides', icon: MapPin },
    { id: 'photography', label: 'Travel Photography', icon: Camera },
    { id: 'planning', label: 'Trip Planning', icon: Compass }
  ];

  const tips = {
    packing: [
      { title: 'Pack Light, Pack Right', content: 'Stick to 3 color schemes max. Roll clothes instead of folding to save 30% space.' },
      { title: 'Essential Tech Kit', content: 'Portable charger, universal adapter, and offline maps are non-negotiables.' },
      { title: 'Weather-Ready Layers', content: 'Pack versatile layers that work in multiple climates and occasions.' },
      { title: 'Document Backup', content: 'Store digital copies of passport, insurance, and tickets in cloud storage.' }
    ],
    budget: [
      { title: 'Book Smart, Save Big', content: 'Tuesday bookings are typically 15% cheaper. Book 6-8 weeks ahead for best deals.' },
      { title: 'Local Currency Hacks', content: 'Use ATMs instead of currency exchange. Notify your bank before traveling.' },
      { title: 'Food Budget Tips', content: 'Mix street food with restaurants. Lunch menus are often cheaper than dinner.' },
      { title: 'Free Activities First', content: 'Research free walking tours, museums, and local events before paying for attractions.' }
    ],
    destinations: [
      { title: 'Research Like a Local', content: 'Follow local Instagram accounts and food bloggers for authentic recommendations.' },
      { title: 'Seasonal Sweet Spots', content: 'Visit during shoulder seasons for better weather, fewer crowds, and lower prices.' },
      { title: 'Cultural Etiquette', content: 'Learn basic greetings and customs. Locals appreciate the effort and you\'ll get better experiences.' },
      { title: 'Hidden Gems', content: 'Ask your TravelTag host for secret spots that aren\'t in guidebooks.' }
    ],
    photography: [
      { title: 'Golden Hour Magic', content: 'Shoot during sunrise/sunset for Instagram-worthy lighting. Plan your day around these times.' },
      { title: 'Phone Photography Pro', content: 'Use portrait mode for people, clean your lens, and try different angles.' },
      { title: 'Backup Everything', content: 'Upload photos daily to cloud storage. Don\'t risk losing memories to a broken phone.' },
      { title: 'Respect Local Rules', content: 'Some places prohibit photography. Always ask permission when photographing people.' }
    ],
    planning: [
      { title: 'Pre-Trip Research', content: 'Join your trip\'s group chat early. Connect with fellow travelers before departure.' },
      { title: 'Health Preparations', content: 'Check vaccination requirements 6 weeks before travel. Pack a basic first aid kit.' },
      { title: 'Communication Plan', content: 'Share your itinerary with family. Set up international roaming or local SIM cards.' },
      { title: 'Flexible Mindset', content: 'Plans change, weather happens. Stay flexible and embrace unexpected adventures.' }
    ]
  };

  const currentTips = tips[selectedCategory as keyof typeof tips] || tips.packing;

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
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 via-yellow-500/30 to-green-500/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="hero-content">
          <div className="text-center text-white animate-fade-in relative z-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">💡 Pro Tips</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none mb-6 text-shadow-lg">
              Travel Like a Pro
            </h1>
            
            <p className="text-lg md:text-xl font-body leading-relaxed mb-8 max-w-4xl mx-auto font-medium opacity-95 text-shadow">
              Insider secrets from seasoned travelers and hosts. Level up your adventure game with these expert tips.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-white hover:bg-yellow-50 border border-gray-200 text-gray-700'
              }`}
            >
              <category.icon className="w-5 h-5 mr-2" />
              {category.label}
            </button>
          ))}
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {currentTips.map((tip, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{tip.title}</h3>
              <p className="text-gray-700">{tip.content}</p>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Travel Hacks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="font-semibold text-gray-900 mb-1">Download Offline Maps</h4>
              <p className="text-sm text-gray-600">Save data and never get lost</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🧴</div>
              <h4 className="font-semibold text-gray-900 mb-1">Travel-Size Everything</h4>
              <p className="text-sm text-gray-600">TSA-friendly and space-saving</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💳</div>
              <h4 className="font-semibold text-gray-900 mb-1">No Foreign Fees Card</h4>
              <p className="text-sm text-gray-600">Save 3% on every purchase abroad</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎒</div>
              <h4 className="font-semibold text-gray-900 mb-1">Pack a Day Bag</h4>
              <p className="text-sm text-gray-600">For delayed luggage situations</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Put These Tips to Use?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join a TravelTag adventure and travel with confidence, knowing you're prepared for anything.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={() => window.location.hash = 'home'}>
              Browse Adventures
            </Button>
            <Button variant="outline">
              Join Travel Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};