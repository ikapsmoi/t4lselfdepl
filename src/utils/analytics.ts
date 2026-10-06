import { supabase } from '../lib/supabase';
import type { Travel4LifeContactContext } from './travel4lifeContact.js';

// Generate a session ID for tracking user sessions
const generateSessionId = (): string => {
  const existing = sessionStorage.getItem('traveltag_session_id');
  if (existing) return existing;
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('traveltag_session_id', sessionId);
  return sessionId;
};

const getOrganicSource = (referrer: string): string => {
  if (!referrer) return 'direct';

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    return /(^|\.)google\./.test(hostname) || /(^|\.)bing\.com$/.test(hostname)
      || /(^|\.)search\.yahoo\.com$/.test(hostname) || /(^|\.)duckduckgo\.com$/.test(hostname)
      ? 'organic'
      : 'referral';
  } catch {
    return 'direct';
  }
};

export const trackContactEvent = async (eventName: string, context: Travel4LifeContactContext = {}) => {
  const pageUrl = `${window.location.origin}${window.location.pathname}`;
  const metadata = {
    page_url: pageUrl,
    page_type: context.pageType || 'travel',
    destination: context.destination || '',
    city: context.city || '',
    country: context.country || '',
    entity: context.entity || context.package || context.resort || context.destination || '',
    resort: context.resort || '',
    package: context.package || '',
    event_type: context.eventType || '',
    trip_type: context.tripType || '',
    origin: context.origin || '',
    source: getOrganicSource(document.referrer),
  };
  let sessionId = sessionStorage.getItem('traveltag_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('traveltag_session_id', sessionId);
  }

  try {
    const { error } = await supabase.from('analytics_events').insert([{
      event_name: eventName,
      user_id: null,
      session_id: sessionId,
      metadata,
    }]);
    if (error) console.error('Contact analytics tracking error:', error);
  } catch (error) {
    console.error('Contact analytics tracking failed:', error);
  }
};

// Main analytics tracking function
export const trackEvent = async (
  eventName: string, 
  metadata: Record<string, any> = {},
  userId?: string
) => {
  try {
    // Get current user if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      currentUserId = user?.id || null;
    }

    // Check if profile exists for the user_id to prevent foreign key constraint violation
    let validatedUserId = null;
    if (currentUserId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUserId)
        .maybeSingle();
      
      // Only use user_id if profile exists, otherwise set to null for anonymous tracking
      if (profile && !profileError) {
        validatedUserId = currentUserId;
      }
    }

    // Prepare event data
    const eventData = {
      event_name: eventName,
      user_id: validatedUserId,
      session_id: generateSessionId(),
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer || null,
        timestamp: new Date().toISOString()
      },
      ip_address: null,
      user_agent: navigator.userAgent
    };

    // Insert into analytics_events table
    const { error } = await supabase
      .from('analytics_events')
      .insert([eventData]);

    if (error) {
      console.error('Analytics tracking error:', error);
    } else {
      console.log(`📊 Event tracked: ${eventName}`, { ...metadata, user_id: validatedUserId });
    }
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

// Specific tracking functions for common events
export const analytics = {
  // Page views
  viewHome: () => trackEvent('view_home'),
  viewTrip: (tripId: string) => trackEvent('view_trip', { trip_id: tripId }),
  clickTripCard: (tripId: string) => trackEvent('click_trip_card', { trip_id: tripId }),
  
  // User actions
  clickJoin: (tripId: string) => trackEvent('click_join', { trip_id: tripId }),
  whatsappClick: (context: string, tripId?: string) => trackEvent('whatsapp_click', {
    context,
    ...(tripId ? { trip_id: tripId } : {})
  }),
  startBooking: (tripId: string, tripPrice: number) => trackEvent('start_booking', { 
    trip_id: tripId, 
    trip_price: tripPrice 
  }),
  completeBooking: (tripId: string, revenue: number, paymentMethod: string) => trackEvent('complete_booking', { 
    trip_id: tripId, 
    revenue, 
    payment_method: paymentMethod 
  }),
  
  // Authentication
  signUp: (role: string, metadata?: any) => trackEvent('sign_up', { role, ...metadata }),
  login: () => trackEvent('login'),
  profileComplete: (completionPercentage: number) => trackEvent('profile_complete', { 
    completion_percentage: completionPercentage 
  }),
  
  // Referrals
  referralSent: (referralCode: string, platform: string) => trackEvent('referral_sent', { 
    referral_code: referralCode,
    platform 
  }),
  referralRedeemed: (referrerUserId: string, newUserId: string) => trackEvent('referral_redeemed', { 
    referrer_user_id: referrerUserId,
    new_user_id: newUserId 
  }),
  
  // Host actions
  hostSignup: () => trackEvent('host_signup'),
  hostTripCreated: (tripId: string, tripType: string, price: number) => trackEvent('host_trip_created', { 
    trip_id: tripId,
    trip_type: tripType,
    price 
  }),
  
  // App lifecycle
  appOpen: () => trackEvent('app_open'),
  
  // Additional useful events
  searchTrip: (searchQuery: string, filters: any) => trackEvent('search_trip', { 
    search_query: searchQuery,
    filters 
  }),
  saveTrip: (tripId: string) => trackEvent('save_trip', { trip_id: tripId }),
  shareTrip: (tripId: string, platform: string) => trackEvent('share_trip', { 
    trip_id: tripId,
    platform 
  }),
  exitIntent: () => trackEvent('exit_intent'),
  newsletterSignup: (email: string) => trackEvent('newsletter_signup', { email }),
  
  // Discount tracking
  discountClaimed: (userId: string, discountAmount: number) => trackEvent('discount_claimed', {
    user_id: userId,
    discount_amount: discountAmount,
    discount_type: 'first_booking_10_percent'
  }),
  discountApplied: (userId: string, bookingId: string, discountAmount: number) => trackEvent('discount_applied', {
    user_id: userId,
    booking_id: bookingId,
    discount_amount: discountAmount,
    discount_type: 'first_booking_10_percent'
  })
};

// Hook for easy analytics integration
export const useAnalytics = () => {
  return {
    track: trackEvent,
    ...analytics
  };
};