import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ReferralStats {
  total_referrals: number;
  pending_discount_percentage: number;
  total_discount_earned: number;
  referral_events: Array<{
    id: string;
    referred_name: string;
    referred_email: string;
    discount_percentage: number;
    created_at: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Check for required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing environment variables:', {
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_ANON_KEY: !!supabaseAnonKey
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing required environment variables' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user's profile with pending discount
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('pending_referral_discount_percentage')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get referral events for this user
    const { data: referralEvents, error: eventsError } = await supabase
      .from('referral_events')
      .select(`
        id,
        discount_percentage,
        created_at,
        referred:profiles!referred_id (
          name,
          email
        )
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching referral events:', eventsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch referral stats' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate stats
    const totalReferrals = referralEvents?.length || 0;
    const totalDiscountEarned = referralEvents?.reduce((sum, event) => sum + Number(event.discount_percentage), 0) || 0;

    const stats: ReferralStats = {
      total_referrals: totalReferrals,
      pending_discount_percentage: Number(profile.pending_referral_discount_percentage) || 0,
      total_discount_earned: totalDiscountEarned,
      referral_events: (referralEvents || []).map(event => ({
        id: event.id,
        referred_name: event.referred?.name || 'Unknown',
        referred_email: event.referred?.email || 'Unknown',
        discount_percentage: Number(event.discount_percentage),
        created_at: event.created_at
      }))
    };

    return new Response(
      JSON.stringify(stats),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get referral stats error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});