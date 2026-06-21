import React from 'react';
import { Search, Users, Plane, Heart, Shield, Star } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: 'Discover',
      description: 'Browse unique trips created by passionate hosts around the world',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Users,
      title: 'Connect',
      description: 'Join small groups of like-minded travelers who share your interests',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Plane,
      title: 'Adventure',
      description: 'Experience incredible destinations with expert local guidance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: Heart,
      title: 'Memories',
      description: 'Create lasting friendships and unforgettable memories that last a lifetime',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Hosts',
      description: 'All hosts are background-checked and verified for your safety',
    },
    {
      icon: Star,
      title: 'Quality Guaranteed',
      description: 'Every trip is reviewed and rated by our community',
    },
    {
      icon: Users,
      title: 'Small Groups',
      description: 'Intimate group sizes for personalized experiences',
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="text-center mb-16">
          <h2 className="heading-lg text-gray-900 mb-6">
            How TravelTag offers experiences across 45+ countries with special focus on: Works
          </h2>
          <p className="body-lg text-gray-600 max-w-3xl mx-auto">
            Your journey to incredible adventures starts here. Join our community of explorers 
            and discover the world through authentic, small-group experiences.
          </p>
        </div>

        {/* Main Steps */}
        <div className="relative mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl ${step.bgColor} mb-8 group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{step.description}</p>
                
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-primary-200 to-transparent transform -translate-x-1/2 -translate-y-1/2 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Features */}
        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-soft overflow-hidden">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg)',
            }}
          />
          <div className="absolute inset-0 bg-white bg-opacity-60" />
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="heading-md text-gray-900 mb-6">Why Choose TravelTag?</h3>
              <p className="body-md text-gray-600 max-w-2xl mx-auto">
                We're committed to providing safe, authentic, and unforgettable travel experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-soft mb-6">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">{feature.title}</h4>
                  <p className="text-gray-600 font-medium">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};