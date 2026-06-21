import React from 'react';
import { Star, Quote, User } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { BADGES } from '../../utils/constants';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Traveler',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      rating: 5,
      text: 'My trip to Morocco exceeded all expectations. The host was incredible and I made lifelong friendships! The small group size made it feel so personal.',
      trip: 'Moroccan Desert Adventure',
      badges: ['top_traveler', 'culture_enthusiast'],
      location: 'San Francisco, CA',
    },
    {
      name: 'Pedro Machado',
      role: 'Host',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      rating: 5,
      text: 'Travel4life made it so easy to share my passion for adventure travel. I love building community through travel and seeing people discover new places!',
      trip: 'Tomorrowland 2016',
      badges: ['verified_host', 'adventure_seeker'],
      location: 'London, UK',
    },
    {
      name: 'Pankaj Mehta',
      role: 'Traveler',
      avatar: 'https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg',
      rating: 5,
      text: 'Solo travel was intimidating until I found Travel4life. Now I have confidence to explore anywhere! The community is so welcoming and supportive.',
      trip: 'Greece Island Hopping',
      badges: ['adventure_seeker', 'eco_warrior'],
      location: 'Delhi, India',
    },
    {
      name: 'Maximilian',
      role: 'Host',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
      rating: 5,
      text: 'Being a host on Travel4life has been incredibly rewarding. I get to share my culture and see my city through fresh eyes with every group.',
      trip: 'Japanese Cultural Journey',
      badges: ['verified_host', 'culture_enthusiast'],
      location: 'Tokyo, Japan',
    },
    {
      name: 'Lisa Thompson',
      role: 'Traveler',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      rating: 5,
      text: 'The wildlife safari in Corbett was absolutely magical. Our guide was so knowledgeable and the group became like family. Already planning my next trip!',
      trip: 'Indian Adventures',
      badges: ['eco_warrior', 'top_traveler'],
      location: 'Vancouver, Canada',
    },
    {
      name: 'Ahmed Hassan',
      role: 'Host',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      rating: 5,
      text: 'Travel4life has helped me turn my love for desert adventures into a thriving business. The platform makes everything so smooth and professional.',
      trip: 'Sahara Desert Experience',
      badges: ['verified_host', 'adventure_seeker'],
      location: 'Marrakech, Morocco',
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="text-center mb-16">
          <h2 className="heading-lg text-gray-900 mb-6">
            What Our Community Says
          </h2>
          <p className="body-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of travelers and hosts who have discovered their next adventure with us. 
            Real stories from real adventurers.
          </p>
        </div>

        <div className="flex animate-scroll-testimonials gap-8 pb-4 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-8 md:overflow-visible md:snap-none md:pb-0">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.name} className="bg-white rounded-2xl p-6 relative hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.14)] transition-all duration-300 group shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100/80 w-80 flex-shrink-0 snap-center md:w-auto">
              <Quote className="w-8 h-8 text-primary-500 mb-6 opacity-70" />
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent-500 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 italic leading-relaxed font-medium text-sm">"{testimonial.text}"</p>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 tracking-tight">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    {testimonial.role} • {testimonial.location}
                  </div>
                  <div className="text-sm text-primary-600 font-semibold mb-2">{testimonial.trip}</div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {testimonial.badges.map((badgeKey) => {
                      const badge = BADGES[badgeKey as keyof typeof BADGES];
                      return badge ? (
                        <Badge key={badgeKey} variant="secondary" size="sm">
                          {badge.icon}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" />
            </div>
          ))}
        </div>
        
        {/* Auto-scroll CSS */}
        <style jsx>{`
          @keyframes scroll-testimonials {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          
          .animate-scroll-testimonials {
            animation: scroll-testimonials 20s linear infinite;
          }
          
          .animate-scroll-testimonials:hover {
            animation-play-state: paused;
          }
          
          @media (min-width: 768px) {
            .animate-scroll-testimonials {
              animation: none;
              display: grid;
            }
          }
          
          @media (max-width: 767px) {
            .animate-scroll-testimonials {
              animation: scroll-testimonials 16s linear infinite;
            }
          }
        `}</style>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl p-8 md:p-12 text-white shadow-strong">
            <h3 className="heading-md mb-6">Ready to Start Your Adventure?</h3>
            <p className="body-lg mb-8 opacity-95 max-w-2xl mx-auto font-medium">
              Join our community of adventurers and discover experiences that will change your perspective on travel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  const element = document.getElementById('top-rated-adventures');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white text-primary-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-medium"
              >
                Browse Adventures
              </button>
              <button 
                data-host-signup
                onClick={() => {
                  // Trigger signup modal for becoming a host
                  const signUpButton = document.querySelector('[data-auth-signup]') as HTMLButtonElement;
                  if (signUpButton) {
                    signUpButton.click();
                  }
                }}
                className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-primary-600 transition-all"
              >
                Become a Host
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};