import React, { useState } from 'react';
import { Plus, Minus, Camera, Utensils, Leaf, Palette, Mountain } from 'lucide-react';
import { TripAddon as TripAddonType } from '../../hooks/useTripAddons';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TripAddonsProps {
  addons: TripAddonType[];
  selectedAddons: string[];
  onAddonsChange: (addons: string[]) => void;
  onTotalChange: (total: number) => void;
}

export const TripAddons: React.FC<TripAddonsProps> = ({
  addons,
  selectedAddons,
  onAddonsChange,
  onTotalChange
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleAddonToggle = (addonId: string) => {
    const isSelected = selectedAddons.includes(addonId);
    let newSelectedAddons: string[];
    
    if (isSelected) {
      newSelectedAddons = selectedAddons.filter(id => id !== addonId);
      setQuantities(prev => ({ ...prev, [addonId]: 0 }));
    } else {
      newSelectedAddons = [...selectedAddons, addonId];
      setQuantities(prev => ({ ...prev, [addonId]: 1 }));
    }
    
    onAddonsChange(newSelectedAddons);
    calculateTotal(newSelectedAddons);
  };

  const handleQuantityChange = (addonId: string, change: number) => {
    const currentQuantity = quantities[addonId] || 1;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    setQuantities(prev => ({ ...prev, [addonId]: newQuantity }));
    
    if (newQuantity === 0) {
      const newSelectedAddons = selectedAddons.filter(id => id !== addonId);
      onAddonsChange(newSelectedAddons);
      calculateTotal(newSelectedAddons);
    } else {
      calculateTotal(selectedAddons);
    }
  };

  const calculateTotal = (addons: string[]) => {
    const total = addons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      const quantity = quantities[addonId] || 1;
      return sum + (addon ? addon.price * quantity : 0);
    }, 0);
    
    onTotalChange(total);
  };

  const totalAddonsPrice = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId);
    const quantity = quantities[addonId] || 1;
    return sum + (addon ? addon.price * quantity : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Enhance Your Trip</h3>
        <p className="text-gray-600">Add special experiences to make your adventure even more memorable</p>
      </div>

      {/* Selected Addons Summary */}
      {selectedAddons.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-green-600" />
            Selected Add-ons ({selectedAddons.length})
          </h4>
          <div className="space-y-2 mb-4">
            {selectedAddons.map(addonId => {
              const addon = TRIP_ADDONS.find(a => a.id === addonId);
              const quantity = quantities[addonId] || 1;
              return addon ? (
                <div key={addonId} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{addon.name} x{quantity}</span>
                  <span className="text-green-600 font-semibold">${(addon.price * quantity).toLocaleString()}</span>
                </div>
              ) : null;
            })}
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Add-ons:</span>
            <span className="text-xl font-bold text-green-600">${totalAddonsPrice.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Addons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map((addon) => {
          const isSelected = selectedAddons.includes(addon.id);
          const quantity = quantities[addon.id] || 1;
          
          return (
            <div
              key={addon.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                isSelected 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleAddonToggle(addon.id)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 bg-blue-100 text-blue-600">
                <Plus className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="mb-3">
                <h4 className="text-base font-semibold text-gray-900 mb-2">{addon.name}</h4>
                <p className="text-gray-600 text-xs mb-2">{addon.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  {addon.duration && (
                    <span className="text-xs text-gray-500">{addon.duration}</span>
                  )}
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-900">
                  ${addon.price}
                  <span className="text-xs font-normal text-gray-500 ml-1">per person</span>
                </div>

                {isSelected && (
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleQuantityChange(addon.id, -1)}
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-gray-900 min-w-[16px] text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(addon.id, 1)}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>


      {/* Call to Action */}
    </div>
  );
};