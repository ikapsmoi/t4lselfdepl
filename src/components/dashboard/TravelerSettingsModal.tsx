import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { 
  Instagram, Phone, MapPin, Save, Upload, User, Shield, 
  Star, CheckCircle, AlertTriangle, Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAnalytics } from '../../utils/analytics';

interface TravelerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TravelerSettingsModal: React.FC<TravelerSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, uploadAvatar, verifyUserAndAwardPoints, updateProfile } = useAuth();
  const { profileComplete } = useAnalytics();
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    instagram_id: '',
    city_name: '',
    state_name: '',
    phone: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Initialize settings form with existing data
  React.useEffect(() => {
    if (user) {
      setSettingsForm({
        name: user.name || '',
        instagram_id: user.instagram_id || '',
        city_name: user.city_name || '',
        state_name: user.state_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateProfile(settingsForm);
      
      // Calculate profile completion percentage
      const fields = Object.values(settingsForm);
      const completedFields = fields.filter(field => field && field.trim()).length;
      const completionPercentage = Math.round((completedFields / fields.length) * 100);
      
      profileComplete(completionPercentage);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    if (!user) {
      alert('User not found. Please sign in again.');
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(selectedFile, user.id);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('traveler-avatar-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      alert(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!user) return;

    setVerifying(true);
    setVerificationMessage('');
    setVerificationSuccess(false);

    try {
      const result = await verifyUserAndAwardPoints(user.id);
      setVerificationMessage(result.message);
      setVerificationSuccess(result.success);
      
      if (result.success) {
        setTimeout(() => {
          setVerificationMessage('');
          setVerificationSuccess(false);
        }, 5000);
      }
    } catch (error) {
      setVerificationMessage('An error occurred during verification');
      setVerificationSuccess(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Traveler Settings"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 sm:space-y-8">
        </div>

        {/* Profile Verification Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
            Profile Verification
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Current Avatar */}
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden bg-gray-200">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="visually-hidden"
                  id="traveler-avatar-upload"
                />
                <label htmlFor="traveler-avatar-upload" className="cursor-pointer inline-block">
                  <span className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 cursor-pointer">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Choose Photo
                  </span>
                </label>
                
                {selectedFile && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </div>
                )}
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleUploadAvatar}
                  loading={uploadingAvatar}
                  disabled={!selectedFile || uploadingAvatar}
                  className="w-full"
                >
                  Upload Profile Picture
                </Button>
              </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                  user?.verified ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {user?.verified ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    {user?.verified ? 'Verified Traveler' : 'Unverified Account'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {user?.verified ? 'Your account is verified' : 'Upload a photo to verify your account'}
                  </div>
                </div>
              </div>

              {!user?.verified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center text-yellow-800 mb-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="font-semibold text-sm sm:text-base">Verification Benefits</span>
                  </div>
                  <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                    <li>• Earn 200 points instantly</li>
                    <li>• Build trust with hosts</li>
                    <li>• Access to exclusive trips</li>
                    <li>• Priority booking status</li>
                  </ul>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleVerifyAccount}
                loading={verifying}
                disabled={user?.verified || !user?.avatar_url || verifying}
                className="w-full"
                icon={Shield}
                size="sm"
              >
                {user?.verified ? 'Already Verified' : 'Verify My Account'}
              </Button>

              {verificationMessage && (
                <div className={`p-2 sm:p-3 rounded-lg border ${
                  verificationSuccess 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {verificationSuccess ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">{verificationMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4 sm:space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <Input
              label="Full Name"
              placeholder="Your full name"
              value={settingsForm.name}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
            />

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Instagram className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Instagram Handle
              </label>
              <Input
                placeholder="@username"
                value={settingsForm.instagram_id}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, instagram_id: e.target.value }))}
              />
            </div>

            <Input
              label="City"
              placeholder="Your city"
              value={settingsForm.city_name}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, city_name: e.target.value }))}
            />

            <Input
              label="State/Province"
              placeholder="Your state or province"
              value={settingsForm.state_name}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, state_name: e.target.value }))}
            />

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Mobile Number
              </label>
              <Input
                placeholder="+1 234 567 8900"
                value={settingsForm.phone}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1" size="sm">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSettings}
            loading={savingSettings}
            icon={Save}
            className="flex-1"
            size="sm"
          >
            Save Settings
          </Button>
        </div>
    </Modal>
  );
};