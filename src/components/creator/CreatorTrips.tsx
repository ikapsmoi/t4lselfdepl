import React, { useState, useEffect } from 'react';
import { Star, Users, Play, Instagram, Youtube, EggFried as Verified } from 'lucide-react';
import { CreatorTrip, Trip } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TripCard } from '../trips/TripCard';
import { CreatorApplicationModal } from './CreatorApplicationModal';
import { supabase } from '../../lib/supabase';
import { TripDetails } from '../trips/TripDetails';



export const CreatorTrips: React.FC = () => {
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
  const fetchTopCreators = async () => {
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
          avatar: profile.avatar_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          followers: profile.creator_followers || 0,
          specialty: 'Travel & Adventure', // Placeholder - could be derived from trip categories
          verified: profile.creator_verified,
          trips_hosted: Math.floor(Math.random() * 8) + 10, // Random number between 10-99
          rating: 4.8, // Placeholder - would require aggregating from reviews
          total_earnings_inr: profile.total_earnings_inr || Math.floor(Math.random() * 40000 + 10000),
          instagram_id: profile.instagram_id
        }));
        setDynamicTopCreators(mappedCreators);
      } else {
        // Fallback to mock data if no verified creators found
        const fallbackCreators = [
          {
            id: '1',
            name: 'Priya Sharma',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            followers: 250000,
            specialty: 'Bollywood & Entertainment',
            verified: true,
            trips_hosted: Math.floor(Math.random() * 90) + 10,
            rating: 4.9,
            total_earnings_inr: 45000,
            instagram_id: 'priya_bollywood_travels'
          },
          {
            id: '2',
            name: 'Arjun Patel',
            avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
            followers: 180000,
            specialty: 'Yoga & Spirituality',
            verified: true,
            trips_hosted: Math.floor(Math.random() * 90) + 10,
            rating: 4.8,
            total_earnings_inr: 38000,
            instagram_id: 'arjun_yoga_journeys'
          },
          {
            id: '3',
            name: 'Chef Ravi Menon',
            avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
            followers: 320000,
            specialty: 'Culinary Adventures',
            verified: true,
            trips_hosted: Math.floor(Math.random() * 90) + 10,
            rating: 4.9,
            total_earnings_inr: 52000,
            instagram_id: 'chef_ravi_travels'
          }
        ];
        setDynamicTopCreators(fallbackCreators);
      }
    } catch (err) {
      console.error('Error fetching top creators:', err);
      setErrorCreators('Failed to load top creators.');
      // Fallback to mock data on error
      const fallbackCreators = [
        {
          id: '1',
          name: 'Priya Sharma',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          followers: 250000,
          specialty: 'Bollywood & Entertainment',
          verified: true,
          trips_hosted: 15,
          rating: 4.9
        }
      ];
      setDynamicTopCreators(fallbackCreators);
    } finally {
      setLoadingCreators(false);
    }
  };

  // Fetch creator trips from database
  const fetchCreatorTrips = async () => {
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
          title: trip.title,
          description: trip.itinerary?.description || 'Amazing creator-led travel experience awaits you.',
          destination: trip.location,
          country: trip.location.split(',').pop()?.trim() || 'Unknown',
          type: trip.category,
          price: Number(trip.price_per_person),
          currency: trip.currency || 'USD',
          duration: trip.itinerary?.duration ? Number(trip.itinerary.duration) : Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
          max_capacity: trip.group_size,
          current_bookings: bookingCounts[trip.id] || 0,
          start_date: trip.start_date,
          end_date: trip.end_date,
          images: trip.images && trip.images.length > 0 ? trip.images : [
            'https://images.pexels.com/photos/8185807/pexels-photo-8185807.jpeg'
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
          rating: 4.8,
          review_count: 0,
          itinerary: trip.itinerary || {},
          created_at: trip.created_at,
          featured: trip.nomadic_badge || false,
          tags: trip.itinerary?.tags || [],
          difficulty: trip.difficulty || 'easy',
          included: trip.itinerary?.included || [],
          not_included: trip.itinerary?.notIncluded || [],
          requirements: trip.itinerary?.requirements || [],
          cancellation_policy: 'Free cancellation up to 14 days before departure',
          deposit_required: Number((Number(trip.price_per_person) * 0.3).toFixed(2)),
          group_discount: 10,
          safety_measures: trip.itinerary?.safetyMeasures || [],
          creator_verified: trip.host?.creator_verified || false,
          creator_followers: trip.host?.creator_followers || 0,
          creator_social_links: {
            instagram: trip.host?.instagram_id || undefined,
            youtube: undefined,
            tiktok: undefined,
          },
          trending_score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
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
  };

  // Fetch creators on component mount
  useEffect(() => {
    fetchTopCreators();
    fetchCreatorTrips();
  }, []);

  return (
    <div className="space-y-2">
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
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Top Verified Creators</h3>
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
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-creators space-x-3">
              {/* Duplicate creators for seamless loop */}
              {[...dynamicTopCreators, ...dynamicTopCreators].map((creator, index) => (
                <div key={`${creator.id}-${index}`} className="flex-shrink-0 w-56">
                  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                    {/* Instagram-style gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl opacity-15"></div>
                    <div className="absolute inset-[2px] bg-white rounded-xl"></div>

                    <div className="relative z-10 text-center">
                      <div className="relative mb-3 inline-block">
                        <button
                          onClick={() => {
                            window.location.hash = `creator-profile?id=${creator.id}`;
                          }}
                        >
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-14 h-14 rounded-full object-cover border-3 border-gradient-to-r from-pink-500 to-purple-500 shadow-md"
                          />
                        </button>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow">
                          <Verified className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{creator.name}</h4>
                      <p className="text-xs text-gray-500 mb-3">{creator.specialty}</p>

                      <div className="grid grid-cols-3 gap-1 mb-3 text-center">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{(creator.followers / 1000).toFixed(1)}K</div>
                          <div className="text-[10px] text-gray-400">followers</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{creator.trips_hosted}</div>
                          <div className="text-[10px] text-gray-400">trips</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-current mr-0.5" />
                            <span className="text-sm font-bold text-gray-900">{creator.rating}</span>
                          </div>
                          <div className="text-[10px] text-gray-400">rating</div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Instagram}
                        onClick={() => {
                          window.open(`https://www.instagram.com/${creator.instagram_id}`, '_blank');
                        }}
                        className="border-pink-500 text-pink-500 hover:bg-pink-50 w-full text-xs py-1.5"
                      >
                        Follow
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for auto-scroll animation */}
      <style jsx>{`
        @keyframes scroll-creators {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-creators {
          animation: scroll-creators 20s linear infinite;
        }
        
        .animate-scroll-creators:hover {
          animation-play-state: paused;
        }
        
        @media (max-width: 768px) {
          .animate-scroll-creators {
            animation: scroll-creators 15s linear infinite;
          }
        }
      `}</style>

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