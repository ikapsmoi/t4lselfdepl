import React, { useState, useEffect } from 'react';
import { Star, Heart, MessageCircle } from 'lucide-react';

interface SocialReview {
  id: string;
  platform: 'instagram' | 'facebook';
  username: string;
  avatar: string;
  content: string;
  trip: string;
  rating: number;
  likes: number;
  timeAgo: string;
  image?: string;
}

const socialReviews: SocialReview[] = [
  {
    id: '1',
    platform: 'instagram',
    username: '@ikapsmoi',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Tomorrowland with Travel4life was UNREAL! Best crew, best vibes. Already booked for next year',
    trip: 'Tomorrowland Belgium',
    rating: 5,
    likes: 342,
    timeAgo: '2d ago',
    image: '/tml1.jpeg'
  },
  {
    id: '2',
    platform: 'facebook',
    username: 'Vishal Gulati',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Never thought I\'d travel solo but Travel4life made it feel like going with friends. Salzburg trip was magical!',
    trip: 'Salzburg Music Festival',
    rating: 5,
    likes: 189,
    timeAgo: '5d ago',
    image: '/salzburg1.jpeg'
  },
  {
    id: '3',
    platform: 'instagram',
    username: 'travel.with.aarav',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'EDC Las Vegas with the best group ever! The planning was seamless, literally stress-free',
    trip: 'EDC Las Vegas',
    rating: 5,
    likes: 567,
    timeAgo: '1w ago',
    image: '/edc1.jpeg'
  },
  {
    id: '4',
    platform: 'facebook',
    username: 'Sneha Kapoor',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Amsterdam trip was perfectly curated. Small group, big adventures. 10/10 would recommend Travel4life!',
    trip: 'Amsterdam Explorer',
    rating: 5,
    likes: 234,
    timeAgo: '3d ago',
    image: '/amster1.jpeg'
  },
  {
    id: '5',
    platform: 'instagram',
    username: 'Dr_Ankit.Yadav & Ashish',
    avatar: 'https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Third trip with T4L and they keep exceeding expectations. The hosts genuinely care about your experience',
    trip: 'Winter Europe Special',
    rating: 5,
    likes: 421,
    timeAgo: '4d ago',
    image: '/winter1.jpeg'
  },
  {
    id: '6',
    platform: 'facebook',
    username: 'Meera Joshi',
    avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'Made friends for life on this trip. The community aspect is what makes Travel4life special. Can\'t wait for the next one!',
    trip: 'Bali Cultural Retreat',
    rating: 5,
    likes: 156,
    timeAgo: '6d ago'
  }
];

export const SocialReviews: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % socialReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="block md:hidden py-8 px-4">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFDC80" />
                <stop offset="25%" stopColor="#F77737" />
                <stop offset="50%" stopColor="#E1306C" />
                <stop offset="75%" stopColor="#C13584" />
                <stop offset="100%" stopColor="#833AB4" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)"/>
          </svg>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900">What Travelers Say</h3>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {socialReviews.map((review) => (
            <div key={review.id} className="w-full flex-shrink-0 px-0.5">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {review.image && (
                  <div className="h-36 overflow-hidden">
                    <img
                      src={review.image}
                      alt={review.trip}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <img
                      src={review.avatar}
                      alt={review.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900 truncate">{review.username}</span>
                        {review.platform === 'instagram' ? (
                          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2" fill="none"/>
                            <circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="2" fill="none"/>
                            <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C"/>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{review.timeAgo}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2.5 line-clamp-3">{review.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-3 h-3" /> {review.likes}
                      </span>
                      <span className="text-xs text-gray-400 truncate max-w-[100px]">{review.trip}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {socialReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-5 h-1.5 bg-gray-800' : 'w-1.5 h-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
