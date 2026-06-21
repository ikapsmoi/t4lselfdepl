import React, { useState } from 'react';
import { Plus, TrendingUp, Users, Star, Calendar, MessageCircle, Settings, Search, Save, Instagram, Youtube, Facebook, Phone, MapPin, CreditCard, Edit, Pencil, Verified as Verify, IndianRupee, Euro, Trash2 } from 'lucide-react';
import { getCurrencyIcon, getCurrencySymbol } from '../../utils/constants';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { TripGrid } from '../trips/TripGrid';
import { CreateTripModal } from '../trips/CreateTripModal';
import { HostSettingsModal } from './HostSettingsModal';
import { ReferralModal } from '../referral/ReferralModal';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { useTrips } from '../../hooks/useTrips';
import { useMessages } from '../../hooks/useMessages';
import { Trip } from '../../types';

export const HostDashboard: React.FC = () => {
  const { user } = useAuth();
  const { refreshTrips } = useTrips();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  const handleDeleteTrip = async (tripId: string, tripTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${tripTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingTripId(tripId);
    try {
      const result = await deleteTrip(tripId);
      
      if (result.success) {
        setNotification('Trip deleted successfully!');
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification(result.error || 'Failed to delete trip');
        setTimeout(() => setNotification(null), 8000);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      setNotification('Failed to delete trip. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setDeletingTripId(null);
    }
  };

  const { 
    loading: dashboardLoading, 
    stats, 
    upcomingTrips, 
    recentBookings, 
    hostDetails,
    saveHostDetails,
    updateBookingStatusByHost,
    deleteTrip
  } = useDashboard(user?.id || '', 'host');

  const { messages, loading: messagesLoading, conversations, sendMessage, markAsRead } = useMessages(user?.id || '');

  const CurrencyIcon = getCurrencyIcon(hostDetails?.currency_preference || 'USD');

  const navigateToTrips = () => {
    // Navigate to home page first
    window.location.hash = 'home';
    // Then scroll to trending destinations after navigation
    setTimeout(() => {
      const element = document.getElementById('trending-destinations');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
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

  const handleCancellationAction = async (bookingId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'cancelled' : 'confirmed';
    const actionText = action === 'approve' ? 'approve' : 'reject';
    
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this cancellation request?`);
    if (!confirmed) return;

    try {
      const success = await updateBookingStatusByHost(bookingId, newStatus);
      if (success) {
        alert(`Cancellation request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert(`Failed to ${actionText} cancellation request. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${actionText}ing cancellation:`, error);
      alert(`Failed to ${actionText} cancellation request. Please try again.`);
    }
  };

  const statsDisplay = [
    { 
      label: 'Total Trips', 
      value: dashboardLoading ? 'Arriving Soon' : stats.totalTrips.toString(), 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      change: 'On its Way' 
    },
    { 
      label: 'Total Travelers', 
      value: dashboardLoading ? 'Arriving Soon' : stats.totalTravelers.toString(), 
      icon: Users, 
      color: 'text-green-600', 
      change: 'On its Way' 
    },
    { 
      label: 'Total Earnings', 
      value: dashboardLoading ? 'Arriving Soon' : `$${stats.totalEarnings.toLocaleString()}`, 
      icon: CurrencyIcon, 
      color: 'text-yellow-600', 
      change: 'On its Way' 
    },
    { 
      label: 'Avg Rating', 
      value: dashboardLoading ? 'Arriving Soon' : stats.avgRating.toFixed(1), 
      icon: Star, 
      color: 'text-purple-600', 
      change: 'On its Way' 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">
            Welcome back, {user?.name}! 🌟
          </h1>
          <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto leading-relaxed mb-8">
            You be the Host. We take care of the rest. No payment required for vouchers. Lowest 15% commission worldwide. Payment fees on us.  
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" icon={Plus} onClick={() => setShowCreateModal(true)} className="shadow-lg">
              Create New Trip
            </Button>
            <Button variant="outline" size="lg" icon={Users} onClick={() => setShowReferralModal(true)}>
              Refer Friends
            </Button>
            <Button variant="outline" size="lg" icon={Verify} onClick={() => setShowSettingsModal(true)}>
              Verify Account
            </Button>
            <Button variant="secondary" size="lg" icon={Search} onClick={navigateToTrips}>
              Find a Trip
            </Button>
          </div>
        </div>

        {/* Host Status Card */}
        <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-3xl p-8 mb-12 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 flex items-center justify-center lg:justify-start">
                <Star className="w-8 h-8 mr-3 text-yellow-300 fill-current" />
                Verified Host Status
              </h3>
              <p className="text-lg text-white opacity-95 font-body">
                You're a trusted member of our community with <span className="font-bold text-2xl">{user?.points || 0}</span> host points
              </p>
            </div>
            <div className="text-center lg:text-right">
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">4.9</div>
              <div className="text-lg font-semibold text-white opacity-90">Host Rating</div>
              <div className="flex items-center justify-center lg:justify-end mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Host Information Scroller */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-8 mb-12 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6 text-center">Host Success Metrics</h3>
            <div className="flex animate-scroll-left-infinite space-x-8">
              {/* Duplicate content for seamless loop */}
              {[...Array(2)].map((_, loopIndex) => (
                <React.Fragment key={loopIndex}>
                  <div className="flex-shrink-0 text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[280px]">
                    <div className="text-3xl font-bold mb-2">₹50,000 - ₹1,00,000</div>
                    <div className="text-lg font-semibold">Expected Minimum Earnings per Trip</div>
                    <div className="text-sm opacity-90 mt-2">Based on group size and trip duration</div>
                  </div>
                  
                  <div className="flex-shrink-0 text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[280px]">
                    <div className="text-3xl font-bold mb-2">10 - 20</div>
                    <div className="text-lg font-semibold">Average Group Size</div>
                    <div className="text-sm opacity-90 mt-2">Perfect for intimate experiences</div>
                  </div>
                  
                  <div className="flex-shrink-0 text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[280px]">
                    <div className="text-3xl font-bold mb-2">15%</div>
                    <div className="text-lg font-semibold">Commission Only</div>
                    <div className="text-sm opacity-90 mt-2">Lowest in the industry</div>
                  </div>
                  
                  <div className="flex-shrink-0 text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[280px]">
                    <div className="text-3xl font-bold mb-2">3 Steps</div>
                    <div className="text-lg font-semibold">Simplified Trip Creation</div>
                    <div className="text-sm opacity-90 mt-2">Easy setup, maximum impact</div>
                  </div>
                  
                  <div className="flex-shrink-0 text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[280px]">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-lg font-semibold">Support & Insurance</div>
                    <div className="text-sm opacity-90 mt-2">We've got your back</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                {!dashboardLoading && (
                  <Badge variant="success" size="md" className="font-semibold">{stat.change}</Badge>
                )}
              </div>
              <p className="text-base text-gray-600 mb-2 font-body">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-bold text-gray-900">Recent Bookings</h3>
              <Button variant="outline" size="md">View All</Button>
            </div>
            <div className="space-y-6">
              {dashboardLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-500 font-body">Loading bookings...</p>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-500 mb-6 font-body">No recent bookings</p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-display font-semibold text-gray-900">{booking.profiles?.name || 'Unknown Traveler'}</p>
                        <p className="text-base text-gray-600 font-body">{booking.trips?.title || 'Unknown Trip'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">${booking.amount}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge 
                        variant={
                          booking.status === 'confirmed' ? 'success' : 
                          booking.status === 'cancellation_pending' ? 'warning' :
                          booking.status === 'cancelled' ? 'danger' :
                          'secondary'
                        } 
                        size="md"
                        className="font-semibold"
                      >
                        {booking.status === 'cancellation_pending' ? 'Cancellation Pending' : booking.status}
                      </Badge>
                      <span className="text-sm text-gray-500 font-body">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Cancellation Action Buttons */}
                    {booking.status === 'cancellation_pending' && (
                      <div className="flex space-x-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancellationAction(booking.id, 'reject')}
                          className="text-blue-600 hover:text-blue-700 border-blue-300"
                        >
                          Reject Cancellation
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancellationAction(booking.id, 'approve')}
                          className="text-red-600 hover:text-red-700 border-red-300"
                        >
                          Approve Cancellation
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-8 flex items-center">
              <Calendar className="w-7 h-7 mr-3 text-blue-600" />
              Upcoming Trips
            </h3>
            {dashboardLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-500 font-body">Loading trips...</p>
              </div>
            ) : upcomingTrips.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-500 mb-6 font-body">No upcoming trips</p>
                <Button variant="outline" size="md" onClick={() => setShowCreateModal(true)}>
                  Create Your First Trip
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingTrips.map((trip) => (
                <div key={trip.id} className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-display font-semibold text-gray-900 mb-2">{trip.title}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.destination || trip.location}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Pencil}
                        onClick={() => {
                          setEditingTrip(trip);
                          setShowCreateModal(true);
                        }}
                        className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteTrip(trip.id, trip.title)}
                        loading={deletingTripId === trip.id}
                        disabled={deletingTripId === trip.id}
                        className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-base text-gray-600 mb-4 font-body">
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600"> 
                      {getCurrencySymbol(trip.currency || 'USD')}{trip.price_per_person || trip.price}/person
                    </span>
                    <Badge variant="info" size="sm">
                      {trip.category || trip.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base text-blue-600 font-semibold">
                      {trip.current_bookings}/{trip.max_capacity} travelers
                    </span>
                    <span className="text-sm text-gray-500 font-body">
                      {Math.round((trip.current_bookings / trip.max_capacity) * 100)}% full
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${(trip.current_bookings / trip.max_capacity) * 100}%` }}
                    />
                  </div>
                </div>
                ))}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="md" 
              className="w-full mt-8" 
              icon={MessageCircle}
              onClick={() => setShowMessagesModal(true)}
            >
              View Messages ({messages.filter(m => !m.read).length})
            </Button>
          </div>
        </div>

        {/* Host's Trips */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Your Hosted Adventures
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
              Manage and track your amazing trips that bring travelers together
            </p>
          </div>
          {dashboardLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-500 font-body">Loading your trips...</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-6 font-body">Your hosted trips will appear here</p>
              <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
                Create Your First Trip
              </Button>
            </div>
          )}
        </div>

        {/* Create Trip Modal */}
        <CreateTripModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTrip(null);
          }}
          onTripSaved={() => {
            // Refresh trips data to show new trip on homepage
            refreshTrips();
            // Close modal and reset editing state
            setShowCreateModal(false);
            setEditingTrip(null);
          }}
          initialTrip={editingTrip}
        />

        {/* Settings Modal */}
        <HostSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          hostDetails={hostDetails}
          saveHostDetails={saveHostDetails}
        />

        {/* Referral Modal */}
        <ReferralModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          userRole="host"
          userName={user?.name || 'Host'}
        />

        {/* Messages Modal */}
        <Modal
          isOpen={showMessagesModal}
          onClose={() => setShowMessagesModal(false)}
          title="Messages"
          maxWidth="max-w-5xl"
        >
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
        </Modal>
      </div>
    </div>
  );
};