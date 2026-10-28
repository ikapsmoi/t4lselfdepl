import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Instagram, EggFried as Verified } from 'lucide-react';
import { CreatorTrip, Trip } from '../../types';
import { Button } from '../ui/Button';
import { CreatorApplicationModal } from './CreatorApplicationModal';
import { supabase } from '../../lib/supabase';
import { TripDetails } from '../trips/TripDetails';
import { cleanTripTitle } from '../../utils/formatters';
import { useSlowMobileCarousel } from '../../hooks/useSlowMobileCarousel';
import { INDIAN_TRAVEL_CREATORS } from '../../data/indianTravelCreators';



export const CreatorTrips: React.FC = () => {
  const creatorsCarousel = useSlowMobileCarousel<HTMLDivElement>();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [showCreatorApplicationModal, setShowCreatorApplicationModal] = useState(false);
  const [selectedTripForDetails, setSelectedTripForDetails] = useState<Trip | null>(null);
  const [dynamicTopCreators, setDynamicTopCreators] = useState<any[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [errorCreators, setErrorCreators] = useState<string | null>(null);
  const [dynamicCreatorTrips, setDynamicCreatorTrips] = useState<CreatorTrip[]>([]);
  const [loadingCreatorTrips, setLoadingCreatorTrips] = useState(true);
  const [errorCreatorTrips, setErrorCreatorTrips] = useState<string | null>(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Fetch top creators from database
  const fetchTopCreators = useCallback(async () => {
    setLoadingCreators(true);
    setErrorCreators(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, creator_followers, creator_verified, role, total_earnings_inr, instagram_id')
        .eq('role', 'host')
        .eq('creator_verified', true)
        .order('creator_followers', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Map the fetched data to the structure expected by the component
        const mappedCreators = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar_url || '',
          followers: profile.creator_followers || 0,
          specialty: 'Travel & Adventure', // Placeholder - could be derived from trip categories
          verified: profile.creator_verified,
          trips_hosted: 0,
          rating: 0,
          total_earnings_inr: Number(profile.total_earnings_inr) || 0,
          instagram_id: profile.instagram_id
        }));
        setDynamicTopCreators(mappedCreators);
      } else {
        setDynamicTopCreators([]);
      }
    } catch (err) {
      console.error('Error fetching top creators:', err);
      setErrorCreators('Failed to load top creators.');
      setDynamicTopCreators([]);
    } finally {
      setLoadingCreators(false);
    }
  }, []);

  // Fetch creator trips from database
  const fetchCreatorTrips = useCallback(async () => {
    setLoadingCreatorTrips(true);
    setErrorCreatorTrips(null);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          host:profiles!host_id (
            id, name, avatar_url, verified, tier, instagram_id, creator_verified, creator_followers
          )
        `)
        .eq('host.creator_verified', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Get booking counts for each trip
        const tripIds = data.map(trip => trip.id);
        let bookingCounts: Record<string, number> = {};
        
        if (tripIds.length > 0) {
          const { data: bookingsData } = await supabase
            .from('bookings')
            .select('trip_id')
            .in('trip_id', tripIds)
            .eq('status', 'confirmed');
          
          bookingCounts = (bookingsData || []).reduce((acc, booking) => {
            acc[booking.trip_id] = (acc[booking.trip_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }

        const transformedTrips: CreatorTrip[] = data.map(trip => ({
          id: trip.id,
          title: cleanTripTitle(trip.title),
          description: trip.itinerary?.description || 'Amazing creator-led travel experience awaits you.',
          destination: trip.location,
          country: trip.location.split(',').pop()?.trim() || 'Unknown',
          type: trip.category || 'adventure',
          price: Number(trip.price_per_person),
          currency: trip.currency || (trip.category === 'indian_special' ? 'INR' : ''),
          duration: trip.itinerary?.duration ? Number(trip.itinerary.duration) : Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
          max_capacity: trip.group_size,
          current_bookings: bookingCounts[trip.id] || 0,
          start_date: trip.start_date,
          end_date: trip.end_date,
          dates_flexible: trip.dates_flexible === true,
          images: trip.images && trip.images.length > 0 ? trip.images : [
            trip.category === 'budget'
              ? '/optimized/pkg1.webp'
              : trip.category === 'indian_special'
                ? '/pkg2.png'
                : 'https://images.pexels.com/photos/8185807/pexels-photo-8185807.jpeg'
          ],
          host_id: trip.host_id,
          host: trip.host ? {
            id: trip.host.id,
            name: trip.host.name,
            email: '',
            avatar: trip.host.avatar_url,
            role: 'host',
            verified: trip.host.verified || false,
            points: 0,
            tier: trip.host.tier || 'silver',
            created_at: '',
            badges: [],
            instagram_id: trip.host.instagram_id,
            avatar_url: trip.host.avatar_url,
          } : undefined,
          rating: 0,
          review_count: 0,
          itinerary: trip.itinerary || {},
          created_at: trip.created_at,
          featured: trip.nomadic_badge || false,
          tags: trip.itinerary?.tags || [],
          difficulty: trip.difficulty || 'easy',
          included: trip.itinerary?.included || [],
          not_included: trip.itinerary?.notIncluded || [],
          requirements: trip.itinerary?.requirements || [],
          cancellation_policy: '',
          deposit_required: Number(trip.deposit_required) || 0,
          group_discount: Number(trip.group_discount) || 0,
          safety_measures: trip.itinerary?.safetyMeasures || [],
          creator_verified: trip.host?.creator_verified || false,
          creator_followers: trip.host?.creator_followers || 0,
          creator_social_links: {
            instagram: trip.host?.instagram_id || undefined,
            youtube: undefined,
            tiktok: undefined,
          },
          trending_score: Number(trip.trending_score) || 0
        }));
        
        setDynamicCreatorTrips(transformedTrips);
      }
    } catch (err) {
      console.error('Error fetching creator trips:', err);
      setErrorCreatorTrips('Failed to load creator trips.');
      setDynamicCreatorTrips([]);
    } finally {
      setLoadingCreatorTrips(false);
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '600px 0px' });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    void fetchTopCreators();
    void fetchCreatorTrips();
  }, [fetchCreatorTrips, fetchTopCreators, shouldLoad]);

  const featuredCreators = [
    ...dynamicTopCreators,
    ...INDIAN_TRAVEL_CREATORS.map((creator) => ({
      id: `independent-${creator.handle}`,
      name: creator.name,
      avatar: '',
      followers: creator.followersCount,
      followersLabel: creator.followers,
      specialty: creator.specialty,
      verified: false,
      instagram_id: creator.handle.slice(1),
      profileUrl: creator.profileUrl,
      isIndependent: true,
    })),
  ];

  return (
    <div ref={sectionRef} className="space-y-2">
      {/* Header
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-purple-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">Trending Influencers</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Join verified creators and influencers on adventures. Create content-worthy memories.
        </p>
      </div> */}

      {/* Featured Creator Spotlight */}
      {/* Top Creators Section */}
      <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 md:p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Travel Creators</h3>
        <p className="mb-4 text-center text-sm text-gray-500 md:mb-8">
          Travel4life hosts and independent Indian travel creators
        </p>
        {loadingCreators ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading top creators...</p>
          </div>
        ) : errorCreators ? (
          <div className="text-center py-8 text-red-500">
            <p>{errorCreators}</p>
            <Button variant="outline" size="sm" onClick={fetchTopCreators} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <div
            ref={creatorsCarousel.carouselRef}
            onPointerEnter={creatorsCarousel.onPointerEnter}
            onPointerLeave={creatorsCarousel.onPointerLeave}
            onFocusCapture={creatorsCarousel.onFocusCapture}
            onBlurCapture={creatorsCarousel.onBlurCapture}
            className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide sm:-mx-8 sm:px-8 md:mx-0 md:px-0"
          >
            {featuredCreators.length === 0 && (
              <p className="w-full py-6 text-center text-sm text-gray-600">No creator profiles are available right now.</p>
            )}
            {featuredCreators.map((creator) => (
                <div key={creator.id} className="w-[82vw] max-w-[320px] shrink-0 snap-start md:w-56 md:max-w-none">
                  <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-transform duration-150 ease-out active:scale-[0.98] hover:shadow-lg">
                    {/* Instagram-style gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl opacity-15"></div>
                    <div className="trip-card-brand-wash absolute inset-[2px] rounded-xl"></div>

                    <div className="relative z-10 text-center">
                      <div className="relative mb-3 inline-block">
                        <button
                          aria-label={`Open ${creator.name}${creator.isIndependent ? ' Instagram profile' : ' Travel4life creator profile'}`}
                          onClick={() => {
                            if (creator.isIndependent) {
                              window.open(creator.profileUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              window.location.hash = `creator-profile?id=${creator.id}`;
                            }
                          }}
                        >
                          {creator.avatar ? (
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-14 h-14 rounded-full object-cover border-3 border-gradient-to-r from-pink-500 to-purple-500 shadow-md"
                            />
                          ) : (
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-500" aria-hidden="true">
                              {creator.name.charAt(0)}
                            </span>
                          )}
                        </button>
                        {creator.verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow">
                            <Verified className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{creator.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">{creator.specialty}</p>
                      {creator.isIndependent && (
                        <p className="text-[10px] text-gray-400 mb-2">Independent creator</p>
                      )}

                      {creator.followers > 0 && (
                        <div className="mb-3 text-center">
                          <div className="text-sm font-bold text-gray-900">
                            {creator.followersLabel || creator.followers.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400">followers</div>
                        </div>
                      )}

                      {creator.instagram_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Instagram}
                          onClick={() => {
                            window.open(creator.profileUrl || `https://www.instagram.com/${creator.instagram_id}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="border-pink-500 text-pink-500 hover:bg-pink-50 w-full text-xs py-1.5"
                        >
                          Follow
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
            ))}
            <div aria-hidden="true" className="w-0 shrink-0 pr-4 md:hidden" />
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Become a Creator Host</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Share your expertise and passion with fellow travelers. Join our verified creator program 
          and turn your knowledge into amazing travel experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            icon={Star}
            onClick={() => setShowCreatorApplicationModal(true)}
          >
            Apply as Creator
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.hash = 'how-it-works'}
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Creator Application Modal */}
      <CreatorApplicationModal
        isOpen={showCreatorApplicationModal}
        onClose={() => setShowCreatorApplicationModal(false)}
      />

      {/* Trip Details Modal */}
      {selectedTripForDetails && (
        <TripDetails
          trip={selectedTripForDetails}
          onClose={() => setSelectedTripForDetails(null)}
        />
      )}
    </div>
  );
};