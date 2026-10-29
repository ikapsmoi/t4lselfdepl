import React, { useState, useEffect } from 'react';
import { Star, Users, Instagram, User, Youtube, MapPin, Calendar, Heart, ArrowLeft, Filter } from 'lucide-react';
import { CreatorTrip, Trip } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/trips/TripCard';
import { TripDetails } from '../components/trips/TripDetails';
import { supabase } from '../lib/supabase';
import { INDIAN_TRAVEL_CREATORS } from '../data/indianTravelCreators';
import { CreatorAvatar } from '../components/creator/CreatorAvatar';

export const CreatorTripsPage: React.FC = () => {
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [creators, setCreators] = useState<any[]>([]);
  const [creatorTrips, setCreatorTrips] = useState<CreatorTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchCreatorsAndTrips();
  }, []);

  const fetchCreatorsAndTrips = async () => {
    setLoading(true);
    try {
      // Fetch verified creators
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, creator_followers, creator_verified, instagram_id')
        .eq('creator_verified', true)
        .order('creator_followers', { ascending: false });

      if (creatorsError) throw creatorsError;

      // Fetch creator trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          host:profiles!host_id (
            id, name, avatar_url, verified, creator_verified, creator_followers, instagram_id
          )
        `)
        .eq('host.creator_verified', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;

      setCreators(creatorsData || []);
      
      // Transform trips data
      const transformedTrips: CreatorTrip[] = (tripsData || []).map(trip => ({
        ...trip,
        type: trip.category || 'adventure',
        destination: trip.location,
        price: Number(trip.price_per_person),
        duration: Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
        max_capacity: trip.group_size,
        current_bookings: 0, // Would need to fetch from bookings table
        rating: 4.8,
        review_count: 0,
        creator_verified: trip.host?.creator_verified || false,
        creator_followers: trip.host?.creator_followers || 0,
        creator_social_links: {
          instagram: trip.host?.instagram_id
        },
        trending_score: Math.floor(Math.random() * 40) + 60
      }));

      setCreatorTrips(transformedTrips);
    } catch (error) {
      console.error('Error fetching creators and trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = selectedCreator 
    ? creatorTrips.filter(trip => trip.host_id === selectedCreator)
    : creatorTrips;

  const categories = [
    { value: 'all', label: 'All Creators' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'culture', label: 'Culture' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'food', label: 'Food & Wine' }
  ];

  const featuredProfiles = creators.slice(0, 6);
  const featuredCreatorHandles = new Set(
    featuredProfiles
      .map((profile) => profile.instagram_id?.toLowerCase())
      .filter(Boolean),
  );
  const featuredCreators = [
    ...featuredProfiles.map((creator) => ({ ...creator, isIndependent: false })),
    ...INDIAN_TRAVEL_CREATORS
      .filter((creator) => !featuredCreatorHandles.has(creator.handle.slice(1).toLowerCase()))
      .map((creator) => ({
        id: `independent-${creator.handle}`,
        name: creator.name,
        avatar_url: creator.avatarUrl || '',
        creator_followers: creator.followersCount,
        followers_label: creator.followers,
        creator_verified: false,
        instagram_id: creator.handle.slice(1),
        profile_url: creator.profileUrl,
        isIndependent: true,
      })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => window.location.hash = 'home'}
              className="relative z-10 p-2 rounded-full hover:bg-gray-100 transition-colors mr-4"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Star className="w-8 h-8 text-purple-600 mr-3" />
                Creator Adventures
              </h1>
              <p className="text-gray-600 mt-1">Exclusive trips with verified influencers and content creators</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading creator adventures...</p>
          </div>
        ) : (
          <>
            {/* Featured Creators */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Creators</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {featuredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className={`bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 relative overflow-hidden ${
                      selectedCreator === creator.id ? 'border-purple-500' : 'border-transparent hover:border-purple-200'
                    }`}
                    onClick={() => {
                      if (!creator.isIndependent) {
                        setSelectedCreator(selectedCreator === creator.id ? null : creator.id);
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl opacity-0 hover:opacity-10 transition-opacity duration-300"></div>

                    <div className="relative z-10 text-center">
                      <div className="relative mb-3 inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (creator.isIndependent) {
                              window.open(creator.profile_url, '_blank', 'noopener,noreferrer');
                            } else if (creator.id) {
                              window.location.hash = `creator-profile?id=${creator.id}`;
                            }
                          }}
                          className="block mx-auto"
                        >
                          <CreatorAvatar
                            src={creator.avatar_url}
                            name={creator.name}
                            className="h-14 w-14 rounded-full object-cover border-3 border-purple-200 shadow-md"
                          />
                        </button>
                        {!creator.isIndependent && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{creator.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">
                        {creator.followers_label || `${(creator.creator_followers / 1000).toFixed(0)}K`} followers
                      </p>
                      {creator.isIndependent && (
                        <p className="mb-3 text-[10px] text-gray-400">Independent creator</p>
                      )}

                      <div className="space-y-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={creator.instagram_id ? Instagram : User}
                          ariaLabel={creator.instagram_id ? `Follow ${creator.name} on Instagram` : `View ${creator.name}'s profile`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (creator.instagram_id) {
                              window.open(creator.profile_url || `https://www.instagram.com/${creator.instagram_id}`, '_blank', 'noopener,noreferrer');
                            } else if (creator.isIndependent && creator.profile_url) {
                              window.open(creator.profile_url, '_blank', 'noopener,noreferrer');
                            } else if (creator.id && !creator.isIndependent) {
                              window.location.hash = `creator-profile?id=${creator.id}`;
                            }
                          }}
                          className={`w-full text-xs py-1.5 ${
                            creator.instagram_id
                              ? 'border-pink-500 text-pink-500 hover:bg-pink-50'
                              : 'border-purple-500 text-purple-500 hover:bg-purple-50'
                          }`}
                        >
                          {creator.instagram_id ? 'Follow' : 'View profile'}
                        </Button>
                        {!creator.isIndependent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-purple-500 text-purple-500 hover:bg-purple-50 text-xs py-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCreator(creator.id);
                            }}
                          >
                            View Trips
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Trips Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCreator 
                    ? `${creators.find(c => c.id === selectedCreator)?.name}'s Adventures`
                    : 'All Creator Adventures'
                  }
                </h2>
                {selectedCreator && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCreator(null)}
                    size="sm"
                  >
                    Show All Creators
                  </Button>
                )}
              </div>

              {filteredTrips.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Creator Trips Found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedCreator 
                      ? 'This creator hasn\'t posted any trips yet.'
                      : 'No creator trips available at the moment.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      isCreatorTrip={true}
                      trending_score={trip.trending_score}
                      onClick={() => setSelectedTrip(trip)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </div>
  );
};