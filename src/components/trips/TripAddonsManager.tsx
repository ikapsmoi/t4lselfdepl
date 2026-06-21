import React, { useState } from 'react';
import { Plus, X, Clock, DollarSign, FileText, List, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useTripAddons, TripAddon } from '../../hooks/useTripAddons';

interface TripAddonsManagerProps {
  tripId?: string;
  onAddonsChange?: () => void;
}

export const TripAddonsManager: React.FC<TripAddonsManagerProps> = ({
  tripId,
  onAddonsChange
}) => {
  const { addons, loading, createAddon, deleteAddon } = useTripAddons(tripId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddon, setNewAddon] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
    inclusions: [] as string[]
  });
  const [newInclusion, setNewInclusion] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      setNewAddon(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, newInclusion.trim()]
      }));
      setNewInclusion('');
    }
  };

  const handleRemoveInclusion = (index: number) => {
    setNewAddon(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const handleSaveAddon = async () => {
    if (!tripId) {
      alert('Trip ID is required to save add-ons');
      return;
    }

    if (!newAddon.name.trim() || !newAddon.price) {
      alert('Name and price are required');
      return;
    }

    setSaving(true);
    try {
      await createAddon(tripId, {
        name: newAddon.name.trim(),
        duration: newAddon.duration.trim() || undefined,
        price: parseFloat(newAddon.price),
        description: newAddon.description.trim() || undefined,
        inclusions: newAddon.inclusions
      });

      // Reset form
      setNewAddon({
        name: '',
        duration: '',
        price: '',
        description: '',
        inclusions: []
      });
      setShowAddForm(false);
      onAddonsChange?.();
    } catch (error) {
      console.error('Error saving add-on:', error);
      alert('Failed to save add-on. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (confirm('Are you sure you want to delete this add-on?')) {
      try {
        await deleteAddon(addonId);
        onAddonsChange?.();
      } catch (error) {
        console.error('Error deleting add-on:', error);
        alert('Failed to delete add-on. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Trip Add-ons & Extras</h3>
        <p className="text-gray-600">
          Offer additional experiences and services to enhance your travelers' journey
        </p>
      </div>

      {/* Existing Add-ons */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading add-ons...</p>
        </div>
      ) : addons.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Current Add-ons ({addons.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addons.map((addon) => (
              <div key={addon.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{addon.name}</h5>
                    {addon.duration && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {addon.duration}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-600">${addon.price}</span>
                    <button
                      onClick={() => handleDeleteAddon(addon.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {addon.description && (
                  <p className="text-sm text-gray-600 mb-3">{addon.description}</p>
                )}
                
                {addon.inclusions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {addon.inclusions.map((inclusion, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {inclusion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No add-ons created yet</p>
          <p className="text-sm text-gray-400">Add optional experiences to increase your trip value</p>
        </div>
      )}

      {/* Add New Add-on */}
      {!showAddForm ? (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            icon={Plus}
            className="border-dashed border-2"
          >
            Add New Experience
          </Button>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Create New Add-on
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Activity Name"
              placeholder="e.g., Professional Photography Session"
              value={newAddon.name}
              onChange={(e) => setNewAddon(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            
            <Input
              label="Duration"
              placeholder="e.g., 2 hours, Half day"
              value={newAddon.duration}
              onChange={(e) => setNewAddon(prev => ({ ...prev, duration: e.target.value }))}
            />
            
            <Input
              label="Price (USD)"
              type="number"
              placeholder="99"
              value={newAddon.price}
              onChange={(e) => setNewAddon(prev => ({ ...prev, price: e.target.value }))}
              required
            />
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newAddon.description}
                onChange={(e) => setNewAddon(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this add-on includes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Inclusions */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's Included
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                placeholder="e.g., Professional equipment, Editing"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={handleAddInclusion}
                icon={Plus}
                size="sm"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newAddon.inclusions.map((inclusion, index) => (
                <Badge key={index} variant="secondary" className="flex items-center">
                  {inclusion}
                  <button
                    type="button"
                    onClick={() => handleRemoveInclusion(index)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewAddon({
                  name: '',
                  duration: '',
                  price: '',
                  description: '',
                  inclusions: []
                });
                setNewInclusion('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAddon}
              loading={saving}
              icon={Save}
              className="flex-1"
            >
              Save Add-on
            </Button>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div className="text-sm text-yellow-800">
            <strong>Pro Tip:</strong> Add-ons are a great way to increase your trip value and offer personalized experiences. 
            Consider photography sessions, local food tours, wellness activities, or cultural workshops.
          </div>
        </div>
      </div>
    </div>
  );
};