export interface User {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'traveler' | 'admin';
  bio?: string;
  verified: boolean;
  points: number;
  tier: 'silver' | 'gold' | 'platinum';
  created_at: string;
  phone?: string;
  emergency_contact?: string;
  badges: string[];
  instagram_id?: string;
  city_id?: string;
  city_name?: string;
  state_name?: string;
  avatar_url?: string;
  discount_eligible_first_booking?: boolean;
  discount_used_at?: string;
  signup_source?: string;
  referral_code?: string;
  referred_by?: string;
  pending_referral_discount_percentage?: number;
  host_details?: {
    currency_preference?: string;
  };
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  country: string;
  type: 'adventure' | 'culture' | 'wellness' | 'food' | 'wildlife' | 'spiritual' | 'festival' | 'bollywood' | 'budget' | 'indian_special';
  price: number;
  currency: string;
  duration: number;
  max_capacity: number;
  current_bookings: number;
  start_date: string;
  end_date: string;
  images: string[];
  host_id: string;
  host?: User;
  rating: number;
  review_count: number;
  itinerary: {
    description?: string;
    duration?: number;
    difficulty?: string;
    tags?: string[];
    included?: string[];
    notIncluded?: string[];
    requirements?: string[];
    safetyMeasures?: string[];
  };
  created_at: string;
  featured: boolean;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  included: string[];
  not_included: string[];
  requirements: string[];
  cancellation_policy: string;
  deposit_required: number;
  group_discount: number;
  early_bird_discount?: number;
  safety_measures: string[];
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

export interface Booking {
  id: string;
  trip_id: string;
  traveler_id: string;
  traveler?: User;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'cancellation_pending';
  amount: number;
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded';
  booking_date: string;
  travelers_count: number;
  special_requests?: string;
  emergency_contact: string;
  dietary_restrictions?: string;
  payment_method: 'stripe' | 'paypal';
  installments?: PaymentInstallment[];
  booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'cancellation_pending';
  referral_discount_applied_percentage?: number;
}

export interface PaymentInstallment {
  id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Review {
  id: string;
  trip_id: string;
  reviewer_id: string;
  reviewer?: User;
  rating: number;
  comment: string;
  created_at: string;
  helpful_votes: number;
  photos?: string[];
}

export interface SearchFilters {
  destination?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  maxGroupSize?: number;
  startDate?: string;
  difficulty?: string;
  rating?: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  trip_id?: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'review' | 'message' | 'trip_update' | 'payment';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface TripNFT {
  id: string;
  trip_id: string;
  traveler_id: string;
  title: string;
  description: string;
  image_url: string;
  metadata: {
    destination: string;
    date_completed: string;
    host_name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    attributes: string[];
  };
  minted_at: string;
}

export interface TripAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'photography' | 'food' | 'wellness' | 'adventure' | 'cultural';
  icon: string;
  duration?: string;
  max_participants?: number;
}

export interface SafetyFeature {
  id: string;
  type: 'gps_tracking' | 'buddy_match' | 'emergency_contact' | 'check_in';
  enabled: boolean;
  data?: any;
}

export interface CreatorTrip extends Trip {
  creator_verified: boolean;
  creator_followers: number;
  creator_social_links: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  trending_score: number;
}