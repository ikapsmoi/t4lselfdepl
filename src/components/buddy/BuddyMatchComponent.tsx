import React, { useState, useEffect } from 'react';
import { Users, MapPin, Star, Heart, MessageCircle, Verified } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';

interface BuddyMatch {
  id: string;
  name: string;
  avatar_url: string;
  city_name: string;
  state_name: string;
  verified: boolean;
  tier: string;
  badges: string[];
  compatibility_score: number;
}

export const BuddyMatchComponent: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<BuddyMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBuddyMatches = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setError('Please sign in to find buddy matches');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-buddy-matches?limit=10&offset=0`,
        {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load buddy matches');
      }
    } catch (error) {
      console.error('Buddy match error:', error);
      setError('Failed to load buddy matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuddyMatches();
  }, [user]);

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'text-purple-600';
      case 'gold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Please sign in to find travel buddies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Users className="w-7 h-7 mr-3 text-blue-600" />
          Find Your Travel Buddy
        </h2>
        <p className="text-gray-600">
          Connect with like-minded travelers in your area for safer and more fun adventures
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchBuddyMatches} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Finding your perfect travel buddies...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No buddy matches found in your area yet</p>
          <Button variant="outline" onClick={fetchBuddyMatches}>
            Refresh Matches
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={match.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(match.name)}`}
                  alt={match.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{match.name}</h3>
                    {match.verified && (
                      <Verified className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    {match.city_name}, {match.state_name}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compatibility</span>
                  <Badge 
                    variant="secondary" 
                    size="sm"
                    className={getCompatibilityColor(match.compatibility_score)}
                  >
                    {match.compatibility_score}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tier</span>
                  <span className={`text-sm font-medium capitalize ${getTierColor(match.tier)}`}>
                    {match.tier}
                  </span>
                </div>

                {match.badges && match.badges.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Badges</span>
                    <div className="flex flex-wrap gap-1">
                      {match.badges.slice(0, 3).map((badge, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {badge.replace('_', ' ')}
                        </Badge>
                      ))}
                      {match.badges.length > 3 && (
                        <Badge variant="secondary" size="sm">
                          +{match.badges.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1" icon={MessageCircle}>
                  Message
                </Button>
                <Button variant="primary" size="sm" className="flex-1" icon={Heart}>
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" onClick={fetchBuddyMatches} disabled={loading}>
          Load More Matches
        </Button>
      </div>
    </div>
  );
};