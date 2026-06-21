import React, { useState } from 'react';
import { Award, Download, Share2, Eye, Sparkles, Trophy, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TripNFT } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface NFTSouvenirsProps {
  userId: string;
}

export const NFTSouvenirs: React.FC<NFTSouvenirsProps> = ({ userId }) => {
  const [selectedNFT, setSelectedNFT] = useState<TripNFT | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [nfts, setNfts] = useState<TripNFT[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch NFTs from database
  React.useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // For now, we'll use mock data since the trip_nfts table doesn't exist yet
        // In a real implementation, this would be:
        // const { data, error } = await supabase
        //   .from('trip_nfts')
        //   .select('*')
        //   .eq('traveler_id', userId);
        
        // Mock data for demonstration
        const mockNfts: TripNFT[] = [
          {
            id: '1',
            trip_id: '1',
            traveler_id: userId,
            title: 'Iceland Aurora Explorer',
            description: 'Witnessed the magical Northern Lights in Iceland',
            image_url: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg',
            metadata: {
              destination: 'Reykjavik, Iceland',
              date_completed: '2025-01-15',
              host_name: 'Erik Johansson',
              rarity: 'epic',
              attributes: ['Northern Lights', 'Glacier Hiking', 'Hot Springs', 'Photography']
            },
            minted_at: '2025-01-16'
          },
          {
            id: '2',
            trip_id: '2',
            traveler_id: userId,
            title: 'Spiritual Varanasi Journey',
            description: 'Sacred pilgrimage along the holy Ganges',
            image_url: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg',
            metadata: {
              destination: 'Varanasi, India',
              date_completed: '2024-12-20',
              host_name: 'Rajesh Sharma',
              rarity: 'legendary',
              attributes: ['Ganga Aarti', 'Temple Visits', 'Meditation', 'Cultural Immersion']
            },
            minted_at: '2024-12-21'
          }
        ];
        
        setNfts(mockNfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchNFTs();
    }
  }, [userId]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-purple-500 to-pink-500';
      case 'epic': return 'from-blue-500 to-purple-500';
      case 'rare': return 'from-green-500 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Trophy className="w-5 h-5" />;
      case 'epic': return <Star className="w-5 h-5" />;
      case 'rare': return <Award className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleShare = (nft: TripNFT) => {
    if (navigator.share) {
      navigator.share({
        title: nft.title,
        text: nft.description,
        url: nft.image_url,
      }).catch(console.error);
    } else {
      // Fallback: copy image URL to clipboard
      navigator.clipboard.writeText(nft.image_url).then(() => {
        alert('Image URL copied to clipboard!');
      }).catch(() => {
        setSelectedNFT(nft);
        setShowShareModal(true);
      });
    }
  };

  const handleDownload = (nft: TripNFT) => {
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = nft.image_url;
    link.download = `${nft.title.replace(/\s+/g, '_')}_souvenir.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <Sparkles className="w-8 h-8 mr-3 text-purple-600" />
          My Travel Souvenirs
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Digital collectibles from your amazing adventures. Each NFT represents a unique memory 
          and achievement from your travels.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your souvenirs...</p>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Souvenirs Yet</h3>
          <p className="text-gray-600 mb-6">Complete your first trip to earn your first digital souvenir!</p>
          <Button variant="primary">Explore Trips</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nfts.map((nft) => (
            <div key={nft.id} className="group relative">
              {/* NFT Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                {/* Rarity Border */}
                <div className={`h-1 bg-gradient-to-r ${getRarityColor(nft.metadata.rarity)}`} />
                
                {/* Image */}
                <div className="relative">
                  <img
                    src={nft.image_url}
                    alt={nft.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant="secondary" 
                      className={`bg-gradient-to-r ${getRarityColor(nft.metadata.rarity)} text-white border-0 flex items-center`}
                    >
                      {getRarityIcon(nft.metadata.rarity)}
                      <span className="ml-1 capitalize">{nft.metadata.rarity}</span>
                    </Badge>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                      <button
                        onClick={() => setSelectedNFT(nft)}
                        className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleShare(nft)}
                        className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <Share2 className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDownload(nft)}
                        className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <Download className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{nft.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{nft.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Destination:</span>
                      <span className="font-medium">{nft.metadata.destination}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed:</span>
                      <span className="font-medium">
                        {new Date(nft.metadata.date_completed).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Host:</span>
                      <span className="font-medium">{nft.metadata.host_name}</span>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {attr}
                        </Badge>
                      ))}
                      {nft.metadata.attributes.length > 3 && (
                        <Badge variant="secondary" size="sm">
                          +{nft.metadata.attributes.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <Modal
          isOpen={!!selectedNFT}
          onClose={() => setSelectedNFT(null)}
          title="Travel Souvenir Details"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="relative">
              <img
                src={selectedNFT.image_url}
                alt={selectedNFT.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute top-4 right-4">
                <Badge 
                  variant="secondary" 
                  className={`bg-gradient-to-r ${getRarityColor(selectedNFT.metadata.rarity)} text-white border-0 flex items-center`}
                >
                  {getRarityIcon(selectedNFT.metadata.rarity)}
                  <span className="ml-1 capitalize">{selectedNFT.metadata.rarity}</span>
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedNFT.title}</h3>
              <p className="text-gray-600 mb-4">{selectedNFT.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Destination:</span>
                <div className="font-medium">{selectedNFT.metadata.destination}</div>
              </div>
              <div>
                <span className="text-gray-500">Date Completed:</span>
                <div className="font-medium">
                  {new Date(selectedNFT.metadata.date_completed).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Host:</span>
                <div className="font-medium">{selectedNFT.metadata.host_name}</div>
              </div>
              <div>
                <span className="text-gray-500">Minted:</span>
                <div className="font-medium">
                  {new Date(selectedNFT.minted_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Attributes</h4>
              <div className="flex flex-wrap gap-2">
                {selectedNFT.metadata.attributes.map((attr, index) => (
                  <Badge key={index} variant="secondary">
                    {attr}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => handleShare(selectedNFT)}
                icon={Share2}
                className="flex-1"
              >
                Share
              </Button>
              <Button 
                variant="primary" 
                onClick={() => handleDownload(selectedNFT)}
                icon={Download}
                className="flex-1"
              >
                Download
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Share Modal */}
      {showShareModal && selectedNFT && (
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share Your Souvenir"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">Share your travel achievement with friends!</p>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => window.open(`https://instagram.com`, '_blank')}
                className="p-4 bg-pink-50 rounded-lg text-center hover:bg-pink-100 transition-colors"
              >
                <div className="text-2xl mb-2">📸</div>
                <div className="text-sm font-medium">Instagram</div>
              </button>
              <button 
                onClick={() => window.open(`https://facebook.com`, '_blank')}
                className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                <div className="text-2xl mb-2">📘</div>
                <div className="text-sm font-medium">Facebook</div>
              </button>
              <button 
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my travel souvenir: ${selectedNFT.title} - ${selectedNFT.image_url}`)}`, '_blank')}
                className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-medium">WhatsApp</div>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};