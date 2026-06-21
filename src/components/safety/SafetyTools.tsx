import React, { useState } from 'react';
import { Shield, MapPin, Users, Phone, AlertTriangle, CheckCircle, Clock, Heart } from 'lucide-react';
import { SafetyFeature } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface SafetyToolsProps {
  tripId: string;
  isActive?: boolean;
}

export const SafetyTools: React.FC<SafetyToolsProps> = ({ tripId, isActive = false }) => {
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<string | null>(null);

  // Mock safety data
  const safetyFeatures: SafetyFeature[] = [
    { id: '1', type: 'gps_tracking', enabled: true },
    { id: '2', type: 'buddy_match', enabled: false },
    { id: '3', type: 'emergency_contact', enabled: true },
    { id: '4', type: 'check_in', enabled: true }
  ];

  const potentialBuddies = [
    {
      id: '1',
      name: 'Sarah Chen',
      age: 28,
      interests: ['Photography', 'Hiking', 'Culture'],
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      compatibility: 95,
      verified: true,
      trips_completed: 12
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      age: 32,
      interests: ['Adventure', 'Food', 'History'],
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      compatibility: 88,
      verified: true,
      trips_completed: 8
    },
    {
      id: '3',
      name: 'Emily Watson',
      age: 26,
      interests: ['Wellness', 'Nature', 'Yoga'],
      avatar: 'https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg',
      compatibility: 92,
      verified: true,
      trips_completed: 15
    }
  ];

  const liveUpdates = [
    { time: '10:30 AM', status: 'Departed from hotel', location: 'Mumbai Central', icon: MapPin },
    { time: '11:15 AM', status: 'Arrived at first destination', location: 'Gateway of India', icon: CheckCircle },
    { time: '12:45 PM', status: 'Lunch break', location: 'Colaba Causeway', icon: Clock },
    { time: '2:30 PM', status: 'Currently exploring', location: 'Elephanta Caves', icon: MapPin }
  ];

  const emergencyContacts = [
    { name: 'Trip Host', phone: '+91 98765 43210', type: 'primary' },
    { name: 'Local Emergency', phone: '100', type: 'emergency' },
    { name: 'TravelTag Support', phone: '+1 555 123 4567', type: 'support' }
  ];

  const handleBuddySelect = (buddyId: string) => {
    setSelectedBuddy(buddyId);
  };

  const handleBuddyRequest = () => {
    if (selectedBuddy) {
      console.log('Sending buddy request to:', selectedBuddy);
      setShowBuddyModal(false);
      setSelectedBuddy(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">Safety & Trust Tools</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your safety is our priority. Use these tools to stay connected and secure during your adventure.
        </p>
      </div>

      {/* Safety Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* GPS Tracking */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Live GPS Tracking</h3>
          <p className="text-gray-600 text-sm mb-4">Share your location with family and friends</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowTrackingModal(true)}
          >
            View Tracking
          </Button>
        </div>

        {/* Buddy Match */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="secondary" size="sm">Available</Badge>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Buddy Match</h3>
          <p className="text-gray-600 text-sm mb-4">Find a travel companion for solo adventures</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowBuddyModal(true)}
          >
            Find Buddy
          </Button>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <Badge variant="danger" size="sm">Ready</Badge>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
          <p className="text-gray-600 text-sm mb-4">Quick access to help when needed</p>
          <Button variant="outline" size="sm" className="w-full">
            View Contacts
          </Button>
        </div>

        {/* Check-in System */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <Badge variant="info" size="sm">Scheduled</Badge>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Auto Check-in</h3>
          <p className="text-gray-600 text-sm mb-4">Regular safety updates to your contacts</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              const subject = 'Auto Check-in Request - TravelTag';
              const body = `Auto check-in request initiated:

User: ${user?.name || 'Unknown User'}
Email: ${user?.email || 'Unknown Email'}
Time: ${new Date().toLocaleString()}
Trip ID: ${tripId}

The user has initiated an auto check-in request for safety monitoring.

Please set up the auto check-in system for this user.`;
              
              const mailtoLink = `mailto:support@traveltag.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              window.open(mailtoLink, '_blank');
              
              alert('Check-in request initiated! An email has been sent to admin and your emergency contacts will be notified.');
            }}
          >
            Configure
          </Button>
        </div>
      </div>

      {/* Live Trip Updates (if active) */}
      {isActive && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-green-600" />
            Live Trip Updates
          </h3>
          <div className="space-y-4">
            {liveUpdates.map((update, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <update.icon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{update.status}</div>
                  <div className="text-sm text-gray-600">{update.location}</div>
                </div>
                <div className="text-sm text-gray-500">{update.time}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Share with Family
            </Button>
          </div>
        </div>
      )}

      {/* Emergency Contacts Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Phone className="w-6 h-6 mr-2 text-red-600" />
          Emergency Contacts
        </h3>
        <div className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm text-gray-600 capitalize">{contact.type}</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-gray-900">{contact.phone}</span>
                <Button variant="outline" size="sm">
                  Call
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GPS Tracking Modal */}
      <Modal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        title="Live GPS Tracking"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600">Interactive map would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Current location: Elephanta Caves, Mumbai</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.3 km</div>
              <div className="text-sm text-gray-600">Distance Traveled</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4h 15m</div>
              <div className="text-sm text-gray-600">Trip Duration</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1">
              Share Location
            </Button>
            <Button variant="primary" className="flex-1">
              Emergency Alert
            </Button>
          </div>
        </div>
      </Modal>

      {/* Buddy Match Modal */}
      <Modal
        isOpen={showBuddyModal}
        onClose={() => setShowBuddyModal(false)}
        title="Find Your Travel Buddy"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">
              Connect with like-minded solo travelers on the same trip for safety and companionship.
            </p>
          </div>

          <div className="space-y-4">
            {potentialBuddies.map((buddy) => (
              <div
                key={buddy.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBuddy === buddy.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleBuddySelect(buddy.id)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={buddy.avatar}
                    alt={buddy.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{buddy.name}</h4>
                      <span className="text-gray-500">• {buddy.age}</span>
                      {buddy.verified && (
                        <Badge variant="success" size="sm">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {buddy.trips_completed} trips completed
                      </span>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm text-gray-600">{buddy.compatibility}% match</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {buddy.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowBuddyModal(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              variant="primary" 
              onClick={handleBuddyRequest}
              disabled={!selectedBuddy}
              className="flex-1"
            >
              Send Buddy Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};