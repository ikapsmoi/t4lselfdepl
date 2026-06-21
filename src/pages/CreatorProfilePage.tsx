import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, Users, MapPin, Calendar, Instagram, Youtube, 
  Heart, MessageCircle, Share2, Verified, Trophy, Globe, Camera,
  PenTool, Plane, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TripCard } from '../components/trips/TripCard';
import { TripDetails } from '../components/trips/TripDetails';
import { supabase } from '../lib/supabase';
import { Trip } from '../types';

interface CreatorProfile {
  id: string;
  name: string;
  avatar_url?: string;
  creator_verified: boolean;
  creator_followers: number;
  instagram_id?: string;
  travel_moto?: string;
  creator_description?: string;
  total_earnings_inr?: number;
  verified: boolean;
  tier: string;
  points: number;
  email?: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
}

export const CreatorProfilePage: React.FC = () => {
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [creatorTrips, setCreatorTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const creatorId = urlParams.get('id');
    
    if (creatorId) {
      fetchCreatorData(creatorId);
    } else {
      setError('Creator ID not found');
      setLoading(false);
    }
  }, []);

  const fetchCreatorData = async (creatorId: string) => {
    try {
      setLoading(true);
      
      // Fetch creator profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, creator_verified, creator_followers, instagram_id, travel_moto, creator_description, total_earnings_inr, verified, tier, points, email')
        .eq('id', creatorId)
        .eq('creator_verified', true)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        if (profileError.code === 'PGRST116') {
          setError('Creator not found or not verified');
        } else {
          setError('Failed to load creator profile');
        }
        return;
      }
      
      setCreator(profileData);

      // Fetch creator's trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('host_id', creatorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (tripsError) {
        console.error('Error fetching trips:', tripsError);
        // Don't fail the entire page if trips can't be loaded
        setCreatorTrips([]);
      } else {
        // Transform trips data
        const transformedTrips: Trip[] = (tripsData || []).map(trip => ({
          id: trip.id,
          title: trip.title,
          description: trip.itinerary?.description || 'Amazing creator-led travel experience.',
          destination: trip.location,
          country: trip.location.split(',').pop()?.trim() || 'Unknown',
          type: trip.category,
          price: Number(trip.price_per_person),
          currency: trip.currency || 'USD',
          duration: Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)),
          max_capacity: trip.group_size,
          current_bookings: 0,
          start_date: trip.start_date,
          end_date: trip.end_date,
          images: trip.images || ['https://images.pexels.com/photos/8185807/pexels-photo-8185807.jpeg'],
          host_id: trip.host_id,
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
          safety_measures: trip.itinerary?.safetyMeasures || []
        }));


        setCreatorTrips(transformedTrips);

        // Separate upcoming and past trips
        const today = new Date();
        const upcoming = transformedTrips.filter(trip => new Date(trip.start_date) > today);
        const past = transformedTrips.filter(trip => new Date(trip.end_date) <= today);
        
        setUpcomingTrips(upcoming);
        setPastTrips(past);
      }

      // Fetch blog posts
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title, content, image_urls, created_at')
        .eq('host_id', creatorId)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (blogError) {
        console.error('Error fetching blog posts:', blogError);
        setBlogPosts([]);
      } else {
        setBlogPosts(blogData || []);
      }

    } catch (err) {
      console.error('Error fetching creator data:', err);
      setError('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'about', label: 'About', icon: Users },
    { id: 'trips', label: 'Trips', icon: Plane },
    { id: 'blog', label: 'Blog', icon: PenTool }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading {creator?.name || 'creator'} profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Creator Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'This creator profile is not available or has been removed.'}</p>
          <div className="flex space-x-4 justify-center">
            <Button onClick={() => window.location.hash = 'creator-trips'}>
              Browse Creators
            </Button>
            <Button variant="outline" onClick={() => window.location.hash = 'home'}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => window.location.hash = 'creator-trips'}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-4"
          >
          </Button>
        </div>

        {/* Creator Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            {/* Social Media Links in Header */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {creator.instagram_id && (
                <a
                  href={`https://www.instagram.com/${creator.instagram_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
          
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.name)}`}
                  alt={creator.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                />
                {creator.creator_verified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Verified className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                  {creator.verified && (
                    <Verified className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                
                {creator.travel_moto && (
                  <p className="text-lg text-gray-600 italic mb-4">"{creator.travel_moto}"</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{(creator.creator_followers / 1000).toFixed(1)}K</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{creatorTrips.length}</div>
                    <div className="text-sm text-gray-500">Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">4.9</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">₹{creator.total_earnings_inr || Math.floor(Math.random() * 40000 + 10000)}</div>
                    <div className="text-sm text-gray-500">Total Earnings</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                  {creator.instagram_id && (
                    <Button
                      variant="primary"
                      icon={Instagram}
                      onClick={() => window.open(`https://www.instagram.com/${creator.instagram_id}`, '_blank')}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      Follow on Instagram
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    icon={MessageCircle}
                    onClick={() => {
                      // Create mailto link for contacting creator
                      const subject = `Message from TravelTag - Interest in your trips`;
                      const body = `Hi ${creator.name},\n\nI'm interested in learning more about your travel experiences and trips.\n\nBest regards,\nA TravelTag User`;
                      const mailtoLink = `mailto:${creator.email || 'support@traveltag.net'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(mailtoLink, '_blank');
                    }}
                  >
                    Message Creator
                  </Button>
                  <Button 
                    variant="outline" 
                    icon={Share2}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${creator.name} - TravelTag Creator`,
                          text: `Check out ${creator.name}'s amazing travel experiences on TravelTag!`,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Profile link copied to clipboard!');
                      }
                    }}
                  >
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About {creator.name}</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {creator.creator_description || 'This creator hasn\'t added a description yet.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900">{creator.points}</div>
                  <div className="text-sm text-gray-600">Host Points</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900 capitalize">{creator.tier}</div>
                  <div className="text-sm text-gray-600">Tier Level</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900">{creatorTrips.length}</div>
                  <div className="text-sm text-gray-600">Adventures Created</div>
                </div>
              </div>
            </div>

            {/* Creator Stats */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Creator Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{(creator.creator_followers / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{creatorTrips.length}</div>
                  <div className="text-sm text-gray-600">Total Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{creator.total_earnings_inr?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">4.9</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="space-y-8">
            {/* Upcoming Trips */}
            {upcomingTrips.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Upcoming Adventures ({upcomingTrips.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onClick={() => setSelectedTrip(trip)}
                      isCreatorTrip={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Trips */}
            {pastTrips.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Past Adventures ({pastTrips.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onClick={() => setSelectedTrip(trip)}
                      isCreatorTrip={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {creatorTrips.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Adventures Yet</h3>
                <p className="text-gray-600">This creator hasn't posted any trips yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-8">
            {blogPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <PenTool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
                <p className="text-gray-600">This creator hasn't shared any travel stories yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.hash = 'blog'}>
                  Explore Other Stories
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {post.image_urls.length > 0 && (
                      <img
                        src={post.image_urls[0]}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                      <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
                        <Button variant="outline" size="sm" onClick={() => window.location.hash = 'blog'}>
                          Read More
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
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