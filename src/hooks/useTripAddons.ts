import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface TripAddon {
  id: string;
  trip_id: string;
  name: string;
  duration?: string;
  price: number;
  description?: string;
  inclusions: string[];
  created_at: string;
  updated_at: string;
}

export const useTripAddons = (tripId?: string) => {
  const [addons, setAddons] = useState<TripAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddons = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('trip_addons')
        .select('*')
        .eq('trip_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAddons(data || []);
    } catch (err) {
      console.error('Error fetching trip add-ons:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch add-ons');
      setAddons([]);
    } finally {
      setLoading(false);
    }
  };

  const createAddon = async (tripId: string, addonData: Omit<TripAddon, 'id' | 'trip_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('trip_addons')
        .insert([{
          trip_id: tripId,
          ...addonData
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh addons list
      await fetchAddons(tripId);
      return data;
    } catch (err) {
      console.error('Error creating add-on:', err);
      throw err;
    }
  };

  const updateAddon = async (addonId: string, updates: Partial<TripAddon>) => {
    try {
      const { data, error } = await supabase
        .from('trip_addons')
        .update(updates)
        .eq('id', addonId)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setAddons(prev => prev.map(addon => 
        addon.id === addonId ? { ...addon, ...updates } : addon
      ));
      return data;
    } catch (err) {
      console.error('Error updating add-on:', err);
      throw err;
    }
  };

  const deleteAddon = async (addonId: string) => {
    try {
      const { error } = await supabase
        .from('trip_addons')
        .delete()
        .eq('id', addonId);

      if (error) throw error;
      
      // Update local state
      setAddons(prev => prev.filter(addon => addon.id !== addonId));
    } catch (err) {
      console.error('Error deleting add-on:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchAddons(tripId);
    }
  }, [tripId]);

  return {
    addons,
    loading,
    error,
    fetchAddons,
    createAddon,
    updateAddon,
    deleteAddon
  };
};