import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface EnhancedAuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, name: string, role: 'host' | 'traveler', instagramId?: string, cityData?: any) => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | null>(null);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  return context;
};

export const useEnhancedAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile with enhanced fields
  const fetchUserProfile = async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('No profile found for user:', id);
        setUser(null);
        return null;
      }
      console.error('Error fetching profile:', error);
      setUser(null);
      return null;
    }
    
    const userProfile = data as User;
    setUser(userProfile);
    return userProfile;
  };

  // Load session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        fetchUserProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Enhanced login with error handling
  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        const user = await fetchUserProfile(data.user.id);
        return user;
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced signup with profile creation
  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'host' | 'traveler',
    instagramId?: string,
    cityData?: any
  ): Promise<User | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) throw error;

      if (data.user) {
        // Create profile via Edge Function
        const profileResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-profile`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: data.user.id,
              email: email.toLowerCase().trim(),
              name: name.trim(),
              role,
              instagram_id: instagramId?.trim() || null,
              city_id: cityData?.city_id || null,
              city_name: cityData?.city_name || null,
              state_name: cityData?.state_name || null,
            }),
          }
        );

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Failed to create profile');
        }

        const { profile } = await profileResponse.json();
        
        // If session exists, user is automatically signed in
        if (data.session) {
          setUser(profile);
          return profile;
        }
        
        // If no session, email confirmation is required
        return null;
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Update profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, ...updates });
  };

  // Resend verification
  const resendVerification = async (email: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-verification`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to resend verification');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-password-reset`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send reset email');
    }
  };

  return { 
    user, 
    loading, 
    login, 
    signup, 
    logout, 
    updateProfile, 
    resendVerification, 
    resetPassword 
  };
};

export { EnhancedAuthContext };