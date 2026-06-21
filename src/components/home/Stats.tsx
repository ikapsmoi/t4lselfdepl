import React from 'react';
import { Users, Globe, Star, Shield, TrendingUp, Heart } from 'lucide-react';

export const Stats: React.FC = () => {
  const stats = [
    {
      icon: Users,
      number: '12K+',
      label: 'Happy Travelers',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
    {
      icon: Globe,
      number: '60+',
      label: 'Destinations',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      icon: Star,
      number: '4.65',
      label: 'Average Rating',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      icon: Shield,
      number: '100%',
      label: 'Verified Hosts',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: TrendingUp,
      number: '95%',
      label: 'Rebooking Rate',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      icon: Heart,
      number: '25K+',
      label: 'Friendships Made',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white" id="stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-600 mb-3">Why Travelers Choose Us</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">
            Trusted by Adventurers Worldwide
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto font-body">
            Numbers that speak to our commitment to exceptional travel experiences
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`text-2xl md:text-3xl font-display font-bold ${stat.color} mb-1`}>{stat.number}</div>
              <div className="text-xs md:text-sm font-body text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
