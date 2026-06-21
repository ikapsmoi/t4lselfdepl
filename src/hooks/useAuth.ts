import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, name: string, role: 'host' | 'traveler', instagramId?: string, cityData?: any, signupSource?: string, discountEligible?: boolean) => Promise<{ success: boolean; user?: User | null; error?: string }>;
  signupWithReferral: (email: string, password: string, name: string, role: 'host' | 'traveler', referralCode?: string, instagramId?: string, cityData?: any, signupSource?: string, discountEligible?: boolean) => Promise<{ success: boolean; user?: User | null; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  uploadAvatar: (file: File, userId: string) => Promise<string>;
  verifyUserAndAwardPoints: (userId: string) => Promise<{ success: boolean; message: string; newTier?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile
  const fetchUserProfile = async (id: string): Promise<User | null> => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return null;
    }

    try {

    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) {
      // Handle case where no profile exists (PGRST116 error code)
      if (error.code === 'PGRST116') {
        console.warn('No profile found for user:', id, '- This is expected for new users');
        setUser(null);
        return null;
      }
      console.error('Unexpected error fetching profile:', error.message, error);
      setUser(null);
      return null;
    }
    
    // Also update local user state if discount fields changed
    if (user && user.id === id) {
      setUser(data as User);
    }
    
    setUser(data as User);
    return data as User;
    } catch (error) {
      // Handle network/fetch errors gracefully
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Supabase not configured or network error - skipping profile fetch');
        setUser(null);
        return null;
      }
      console.error('Unexpected error fetching profile:', error);
      setUser(null);
      return null;
    }
  };

  // ✅ Load session on mount
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

  // ✅ Login
  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) {
        // Track failed login attempt
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-login-attempt`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email.toLowerCase().trim(),
                success: false,
                ip_address: 'unknown',
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
              }),
            }
          );
        } catch (trackError) {
          console.error('Error tracking failed login:', trackError);
        }
        
        setLoading(false);
        throw error;
      }
      
      if (data.user) {
        // Track successful login
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-login-attempt`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email.toLowerCase().trim(),
                success: true,
                ip_address: 'unknown',
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
              }),
            }
          );
        } catch (trackError) {
          console.error('Error tracking successful login:', trackError);
        }
        
        const user = await fetchUserProfile(data.user.id);
        setLoading(false);
        return user;
      }
      
      setLoading(false);
      return null;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // ✅ Signup
  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'host' | 'traveler',
    instagramId?: string,
    cityData?: any,
    signupSource?: string,
    discountEligible?: boolean
  ): Promise<{ success: boolean; user?: User | null; error?: string }> => {
    return signupWithReferral(email, password, name, role, undefined, instagramId, cityData, signupSource, discountEligible);
  };

  // Auto-registration for booking flow
  const autoRegister = async (
    email: string,
    name?: string
  ): Promise<{ success: boolean; user?: User | null; error?: string }> => {
    console.log('🔐 autoRegister called with:', { email, name });
    const defaultPassword = '081087';
    const defaultName = name || 'New Traveler';
    
    console.log('🔐 Calling signupWithReferral for auto-registration');
    const result = await signupWithReferral(
      email, 
      defaultPassword, 
      defaultName, 
      'traveler',
      undefined, // referralCode
      undefined, // instagramId
      undefined, // cityData
      'auto_registration', // signupSource
      false // discountEligible
    );
    console.log('🔐 signupWithReferral result for auto-registration:', result);
    return result;
  };
  // ✅ Signup with Referral
  const signupWithReferral = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'host' | 'traveler',
    referralCode?: string,
    instagramId?: string,
    cityData?: any,
    signupSource?: string,
    discountEligible?: boolean
  ): Promise<{ success: boolean; user?: User | null; error?: string }> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create profile via Edge Function
        try {
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
                referral_code: referralCode?.trim() || null,
                instagram_id: instagramId?.trim() || null,
                city_id: cityData?.city_id || null,
                city_name: cityData?.city_name || null,
                state_name: cityData?.state_name || null,
                signup_source: signupSource || 'direct',
                discount_eligible_first_booking: discountEligible || false,
              }),
            }
          );

          if (!profileResponse.ok) {
            const errorData = await profileResponse.json();
            setLoading(false);
            return { success: false, error: errorData.error || 'Failed to create profile' };
          }

          const { profile } = await profileResponse.json();
          
          // If session exists, user is automatically signed in
          if (data.session) {
            setUser(profile);
            setLoading(false);
            return { success: true, user: profile };
          }
          
          // If no session, email confirmation is required
          setLoading(false);
          return { success: true, user: null };
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          setLoading(false);
          return { success: false, error: 'Failed to create profile' };
        }
      }
      setLoading(false);
      return { success: false, error: 'Failed to create account' };
    } catch (error: any) {
      console.error('Signup error:', error);
      setLoading(false);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  // ✅ Resend verification
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

  // ✅ Reset password
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

  // ✅ Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ✅ Update profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    // Prepare the update object with only allowed fields
    const allowedFields = ['name', 'instagram_id', 'city_name', 'state_name', 'phone'];
    const updateData: any = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = updates[key as keyof User];
      }
    });
    
    const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, ...updates });
  };

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (file: File, userId: string): Promise<string> => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Get current session for authorization
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Please sign in to upload avatar');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      // Upload via Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { avatar_url } = await response.json();

      // Update local user state
      if (user && user.id === userId) {
        setUser({ ...user, avatar_url });
      }

      return avatar_url;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  // Verify user and award points
  const verifyUserAndAwardPoints = async (userId: string): Promise<{ success: boolean; message: string; newTier?: string }> => {
    try {
      // Fetch current user profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points, tier, verified, avatar_url')
        .eq('id', userId)
        .single();

      if (fetchError) {
        return { success: false, message: 'Failed to fetch user profile' };
      }

      // Check if already verified
      if (profile.verified) {
        return { success: false, message: 'Your account is already verified!' };
      }

      // Check if profile picture exists
      if (!profile.avatar_url) {
        return { success: false, message: 'Please upload a profile picture first to verify your account' };
      }

      // Calculate new points and tier
      const newPoints = (profile.points || 0) + 200;
      let newTier = profile.tier;

      // Determine new tier based on points
      if (newPoints >= 5000) {
        newTier = 'platinum';
      } else if (newPoints >= 1000) {
        newTier = 'gold';
      } else {
        newTier = 'silver';
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verified: true,
          points: newPoints,
          tier: newTier
        })
        .eq('id', userId);

      if (updateError) {
        return { success: false, message: 'Failed to verify account' };
      }

      // Update local user state
      if (user && user.id === userId) {
        setUser({ ...user, verified: true, points: newPoints, tier: newTier });
      }

      const tierChanged = newTier !== profile.tier;
      const message = tierChanged 
        ? `Account verified! You earned 200 points and advanced to ${newTier} tier!`
        : `Account verified! You earned 200 points.`;

      return { success: true, message, newTier: tierChanged ? newTier : undefined };
    } catch (error) {
      console.error('Verification error:', error);
      return { success: false, message: 'An error occurred during verification' };
    }
  };

  return { 
    user, 
    loading, 
    login, 
    signup, 
    autoRegister,
    signupWithReferral,
    logout, 
    updateProfile, 
    resendVerification, 
    resetPassword,
    uploadAvatar,
    verifyUserAndAwardPoints
  };
};

export { AuthContext };