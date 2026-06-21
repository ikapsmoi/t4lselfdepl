import React, { useState, useEffect } from 'react';
import { Bookmark, MapPin, Calendar, Trophy, Search, Heart, Star, Gift, Plus, Settings, CheckCircle, Shield, Users, Sparkles, Award, MessageCircle } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { Trip } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TravelerSettingsModal } from './TravelerSettingsModal';
import { NFTSouvenirs } from '../nft/NFTSouvenirs';
import { SafetyTools } from '../safety/SafetyTools';
import { BuddyMatchComponent } from '../buddy/BuddyMatchComponent';
import { TripDetails } from '../trips/TripDetails';
import { ReferralModal } from '../referral/ReferralModal';
import { BookingConfirmationDisplayModal } from '../trips/BookingConfirmationDisplayModal';
import { PaymentHistoryModal } from '../trips/PaymentHistoryModal';
import { USER_TIERS, BADGES } from '../../utils/constants';
import { useMessages } from '../../hooks/useMessages';
import { MessageHostModal } from '../trips/MessageHostModal';

export const TravelerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    upcomingTrips, 
    pastTrips, 
    savedTrips, 
    loading, 
    error,
    cancelBooking 
  } = useDashboard(user?.id || '', 'traveler');
  const [showSettings, setShowSettings] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedTripForDetails, setSelectedTripForDetails] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showHostMessageModal, setShowHostMessageModal] = useState(false);
  const [selectedTripForMessaging, setSelectedTripForMessaging] = useState<Trip | null>(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [selectedTripForConfirmation, setSelectedTripForConfirmation] = useState<Trip | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedTripForPayment, setSelectedTripForPayment] = useState<Trip | null>(null);

  const { messages, conversations, sendMessage, markAsRead } = useMessages(user?.id || '');

  const handleCancelTrip = async (bookingId: string) => {
    const confirmed = window.confirm('Are you sure you want to request cancellation for this trip? The host will need to approve your request.');
    if (!confirmed) return;

    try {
      await cancelBooking(bookingId);
      setNotification('Cancellation request sent to host. They will review and respond within 24 hours.');
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error canceling trip:', error);
      setNotification('Failed to send cancellation request. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      await sendMessage(selectedConversation, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const currentTier = USER_TIERS[user?.tier as keyof typeof USER_TIERS] || USER_TIERS.silver;
  const userBadges = user?.badges || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'badges', label: 'Badges & Rewards', icon: Award },
    { id: 'souvenirs', label: 'NFT Souvenirs', icon: Sparkles },
    { id: 'safety', label: 'Safety Tools', icon: Shield },
    { id: 'buddy', label: 'Find Buddy', icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Traveler'}!</h1>
            <p className="text-gray-600 mt-2">You're a {currentTier.name} with {user?.points || 0} points</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Tier Badge */}
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${currentTier.bgGradient} text-white font-semibold shadow-lg`}>
              <span className="flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                {currentTier.name}
              </span>
            </div>
            <Button
              variant="outline"
              icon={Users}
              onClick={() => setShowReferralModal(true)}
            >
              Refer Friends
            </Button>
            <Button
              variant="outline"
              icon={Settings}
              onClick={() => setShowSettings(true)}
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
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
        {activeTab === 'overview' && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingTrips.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                <p className="text-2xl font-bold text-gray-900">{pastTrips.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved Trips</p>
                <p className="text-2xl font-bold text-gray-900">{savedTrips.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Tier</p>
                <p className="text-lg font-bold text-gray-900">{currentTier.name}</p>
                <p className="text-xs text-gray-500">{user?.points || 0} points</p>
              </div>
            </div>
          </div>
        </div>

            {/* Tier Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Tier:</span>
                  <Badge variant="secondary" className={`${currentTier.color} font-semibold`}>
                    {currentTier.name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-semibold text-gray-900">{user?.points || 0}</span>
                </div>
                
                {/* Progress to next tier */}
                {user?.tier !== 'platinum' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress to next tier:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user?.tier === 'silver' ? `${1000 - (user?.points || 0)} points to Gold` : `${5000 - (user?.points || 0)} points to Platinum`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${currentTier.bgGradient}`}
                        style={{ 
                          width: `${Math.min(100, ((user?.points || 0) / (user?.tier === 'silver' ? 1000 : 5000)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tier Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {currentTier.perks.map((perk, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

        {/* Upcoming Trips */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Trips</h2>
          </div>
          <div className="p-6">
            {upcomingTrips.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming trips</p>
                <Button variant="primary" className="mt-4">
                  Browse Trips
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={trip.images?.[0] || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                        alt={trip.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{trip.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {trip.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        trip.booking_status === 'confirmed' ? 'success' :
                        trip.booking_status === 'cancellation_pending' ? 'warning' :
                        trip.booking_status === 'cancelled' ? 'danger' :
                        'secondary'
                      }>
                        {trip.booking_status === 'cancellation_pending' ? 'Cancellation Pending' : 
                         trip.booking_status === 'confirmed' ? 'Confirmed' :
                         trip.booking_status === 'cancelled' ? 'Cancelled' :
                         trip.booking_status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTripForConfirmation(trip);
                          setShowBookingConfirmation(true);
                        }}
                        className="text-green-600 hover:text-green-700 hover:border-green-300"
                      >
                        View Confirmation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTripForPayment(trip);
                          setShowPaymentHistory(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                      >
                        Payment History
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTripForMessaging(trip);
                          setShowHostMessageModal(true);
                        }}
                        icon={MessageCircle}
                        className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                      >
                        Message Host
                      </Button>
                      {trip.booking_status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelTrip(trip.booking_id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Cancel Trip
                        </Button>
                      )}
                      {trip.booking_status === 'cancellation_pending' && (
                        <div className="text-xs text-orange-600 font-medium">
                          Awaiting host approval
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Past Trips - Only show if there are past trips */}
        {pastTrips.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Past Trips</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastTrips.map((trip) => (
                  <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={trip.images?.[0] || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                      alt={trip.title}
                      className="w-full h-32 rounded-lg object-cover mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 mb-1">{trip.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {trip.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Completed</Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTripForPayment(trip);
                            setShowPaymentHistory(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                        >
                          Payment History
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTripForMessaging(trip);
                            setShowHostMessageModal(true);
                          }}
                          icon={MessageCircle}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Message Host
                        </Button>
                      <Button variant="outline" size="sm">
                        Write Review
                      </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Trips */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Saved Trips</h2>
          </div>
          <div className="p-6">
            {savedTrips.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved trips</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTripForDetails(trip.trip)}
                  >
                    <img
                      src={trip.trip.images?.[0] || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                      alt={trip.trip.title}
                      className="w-full h-32 rounded-lg object-cover mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 mb-1">{trip.trip.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {trip.trip.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ${trip.trip.price}
                      </span>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedTripForDetails(trip.trip); }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="flex h-[70vh]">
              {/* Conversations List */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Conversations</h3>
                </div>
                <div className="space-y-1">
                  {Object.keys(conversations).length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    Object.entries(conversations).map(([otherUserId, msgs]) => {
                      const lastMessage = msgs[msgs.length - 1];
                      const unreadCount = msgs.filter(m => !m.read && m.receiver_id === user?.id).length;
                      
                      return (
                        <button
                          key={otherUserId}
                          onClick={() => {
                            setSelectedConversation(otherUserId);
                            // Mark messages as read
                            msgs.filter(m => !m.read && m.receiver_id === user?.id).forEach(m => markAsRead(m.id));
                          }}
                          className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedConversation === otherUserId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {lastMessage.sender_id === user?.id ? lastMessage.receiver?.name : lastMessage.sender?.name || 'Unknown User'}
                            </span>
                            {unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {lastMessage.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(lastMessage.created_at)}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Thread Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h4 className="font-semibold text-gray-900">
                        {conversations[selectedConversation]?.[0]?.sender_id === user?.id 
                          ? conversations[selectedConversation]?.[0]?.receiver?.name 
                          : conversations[selectedConversation]?.[0]?.sender?.name || 'Unknown User'}
                      </h4>
                      {conversations[selectedConversation]?.[0]?.trip && (
                        <p className="text-sm text-gray-600">
                          Re: {conversations[selectedConversation][0].trip.title}
                        </p>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {conversations[selectedConversation]?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTimeAgo(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          loading={sendingMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          size="sm"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Badges & Rewards Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-8">
            {/* Current Tier Display */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-white" />
                <h2 className="text-3xl font-bold mb-2">{currentTier.name}</h2>
                <p className="text-lg opacity-90 mb-4">{user?.points || 0} Points Earned</p>
                <p className="opacity-80">{currentTier.description}</p>
              </div>
            </div>

            {/* Earned Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Badges</h3>
              {userBadges.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No badges earned yet</p>
                  <p className="text-sm text-gray-400">Complete trips and engage with the community to earn badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userBadges.map((badgeKey, index) => {
                    const badge = BADGES[badgeKey as keyof typeof BADGES];
                    return badge ? (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <div className={`font-semibold ${badge.color} text-sm`}>{badge.name}</div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Available Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(BADGES).map(([key, badge]) => {
                  const isEarned = userBadges.includes(key);
                  return (
                    <div key={key} className={`text-center p-4 rounded-lg border-2 transition-all ${
                      isEarned 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}>
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <div className={`font-semibold text-sm ${isEarned ? badge.color : 'text-gray-400'}`}>
                        {badge.name}
                      </div>
                      {isEarned && (
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NFT Souvenirs Tab */}
        {activeTab === 'souvenirs' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <NFTSouvenirs userId={user?.id || ''} />
          </div>
        )}

        {/* Safety Tools Tab */}
        {activeTab === 'safety' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <SafetyTools tripId="" isActive={false} />
          </div>
        )}

        {/* Buddy Match Tab */}
        {activeTab === 'buddy' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <BuddyMatchComponent />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <TravelerSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Referral Modal */}
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        userRole="traveler"
        userName={user?.name || 'Traveler'}
      />
      </div>

      {/* Trip Details Modal for Saved Trips */}
      {selectedTripForDetails && (
        <TripDetails
          trip={selectedTripForDetails}
          onClose={() => setSelectedTripForDetails(null)}
        />
      )}

      {/* Message Host Modal */}
      {showHostMessageModal && selectedTripForMessaging && (
        <MessageHostModal
          isOpen={showHostMessageModal}
          onClose={() => {
            setShowHostMessageModal(false);
            setSelectedTripForMessaging(null);
          }}
          trip={selectedTripForMessaging}
        />
      )}

      {/* Booking Confirmation Modal */}
      {showBookingConfirmation && selectedTripForConfirmation && (
        <BookingConfirmationDisplayModal
          isOpen={showBookingConfirmation}
          onClose={() => {
            setShowBookingConfirmation(false);
            setSelectedTripForConfirmation(null);
          }}
          booking={null}
          trip={selectedTripForConfirmation}
        />
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && selectedTripForPayment && (
        <PaymentHistoryModal
          isOpen={showPaymentHistory}
          onClose={() => {
            setShowPaymentHistory(false);
            setSelectedTripForPayment(null);
          }}
          trip={selectedTripForPayment}
        />
      )}
    </>
  );
};