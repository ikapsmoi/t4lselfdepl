import { DollarSign, IndianRupee, Euro } from 'lucide-react';

export const TRIP_TYPES = [
  { value: 'adventure', label: 'Adventure', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'culture', label: 'Culture', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'wellness', label: 'Wellness', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { value: 'food', label: 'Food & Wine', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'wildlife', label: 'Wildlife', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { value: 'spiritual', label: 'Spiritual Hub', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { value: 'festival', label: 'Festival Specials', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { value: 'bollywood', label: 'Bollywood Trips', color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'budget', label: 'Budget Backpacking', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { value: 'indian_special', label: 'Indian Special', color: 'text-orange-600', bgColor: 'bg-orange-100' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'text-green-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
  { value: 'challenging', label: 'Challenging', color: 'text-red-600' },
];

export const DIFFICULTY_VALUE_MAP = {
  'easy': 1,
  'moderate': 2,
  'challenging': 3,
} as const;

export const USER_TIERS = {
  silver: { 
    name: 'Silver Explorer', 
    color: 'text-gray-600', 
    bgGradient: 'from-gray-400 via-gray-500 to-gray-600',
    minPoints: 0, 
    perks: ['Basic support', 'Trip recommendations'],
    description: 'Starting tier - earn points by completing trips and leaving reviews'
  },
  gold: { 
    name: 'Gold Adventurer', 
    color: 'text-yellow-600', 
    bgGradient: 'from-yellow-400 via-orange-500 to-red-500',
    minPoints: 1000, 
    perks: ['Priority support', '5% trip discount', 'Early access'],
    description: 'Earn 1000+ points by completing 3-4 trips and engaging with the community'
  },
  platinum: { 
    name: 'Platinum Nomad', 
    color: 'text-purple-600', 
    bgGradient: 'from-purple-600 via-pink-600 to-red-600',
    minPoints: 5000, 
    perks: ['VIP support', '10% trip discount', 'Exclusive trips', 'Free cancellation'],
    description: 'Elite tier for 5000+ points - achieved by completing 15+ trips and hosting experiences'
  },
};

export const POPULAR_DESTINATIONS = [
  'Bali, Indonesia',
  'Tokyo, Japan',
  'Reykjavik, Iceland',
  'San José, Costa Rica',
  'Marrakech, Morocco',
  'Auckland, New Zealand',
  'Cusco, Peru',
  'Bangkok, Thailand',
  'Dubrovnik, Croatia',
  'Bergen, Norway',
  'Cape Town, South Africa',
  'Patagonia, Chile',
];

export const DURATION_OPTIONS = [
  { value: '1-3', label: '1-3 days' },
  { value: '4-7', label: '4-7 days' },
  { value: '8-14', label: '1-2 weeks' },
  { value: '15-30', label: '2-4 weeks' },
  { value: '30+', label: '1+ month' },
];

export const PRICE_RANGES = [
  { value: '0-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2500', label: '$1,000 - $2,500' },
  { value: '2500-5000', label: '$2,500 - $5,000' },
  { value: '5000+', label: '$5,000+' },
];

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹', icon: IndianRupee },
  { value: 'USD', label: 'USD ($)', symbol: '$', icon: DollarSign },
  { value: 'EUR', label: 'EUR (€)', symbol: '€', icon: Euro },
];

export const getCurrencyIcon = (currencyCode: string) => {
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  return currency?.icon || DollarSign;
};

export const getCurrencySymbol = (currencyCode: string) => {
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  return currency?.symbol || '$';
};

export const GROUP_SIZES = [
  { value: '1-4', label: '1-4 people' },
  { value: '5-8', label: '5-8 people' },
  { value: '9-12', label: '9-12 people' },
  { value: '13-20', label: '13-20 people' },
  { value: '20+', label: '20+ people' },
];

export const BADGES = {
  verified_host: { name: 'Verified Host', icon: '✓', color: 'text-green-600' },
  top_traveler: { name: 'Top Traveler', icon: '⭐', color: 'text-yellow-600' },
  adventure_seeker: { name: 'Adventure Seeker', icon: '🏔️', color: 'text-blue-600' },
  culture_enthusiast: { name: 'Culture Enthusiast', icon: '🏛️', color: 'text-purple-600' },
  eco_warrior: { name: 'Eco Warrior', icon: '🌱', color: 'text-green-600' },
  foodie: { name: 'Foodie', icon: '🍽️', color: 'text-orange-600' },
  creator: { name: 'Verified Creator', icon: '⭐', color: 'text-purple-600' },
  nft_collector: { name: 'NFT Collector', icon: '🎨', color: 'text-indigo-600' },
  safety_champion: { name: 'Safety Champion', icon: '🛡️', color: 'text-blue-600' },
};

export const INDIA_CATEGORIES = [
  { 
    value: 'spiritual', 
    label: 'Spiritual Hub', 
    description: 'Sacred journeys and spiritual awakening',
    icon: '🕉️',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  { 
    value: 'food-trails', 
    label: 'Food Trails', 
    description: 'Culinary adventures across India',
    icon: '🍛',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  { 
    value: 'festival', 
    label: 'Festival Specials', 
    description: 'Celebrate India\'s vibrant festivals',
    icon: '🎊',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  { 
    value: 'bollywood', 
    label: 'Bollywood Trips', 
    description: 'Behind the scenes of Indian cinema',
    icon: '🎬',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  { 
    value: 'budget', 
    label: 'Budget Backpacking', 
    description: 'Affordable adventures for young travelers',
    icon: '🎒',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }
];
