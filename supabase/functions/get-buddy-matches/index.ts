import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface BuddyMatch {
  id: string;
  name: string;
  avatar_url: string;
  city_name: string;
  state_name: string;
  verified: boolean;
  tier: string;
  badges: string[];
  compatibility_score: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    // Get current user's profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('state_name, city_name')
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

    // Parse query parameters
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Find buddy matches in same state first, then expand
    let query = supabase
      .from('profiles')
      .select('id, name, avatar_url, city_name, state_name, verified, tier, badges')
      .neq('id', user.id) // Exclude current user
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Prioritize same state
    if (currentProfile.state_name) {
      query = query.eq('state_name', currentProfile.state_name);
    }

    const { data: profiles, error: matchError } = await query;

    if (matchError) {
      console.error('Buddy match error:', matchError);
      return new Response(
        JSON.stringify({ error: 'Failed to find matches' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate compatibility scores (simplified algorithm)
    const buddyMatches: BuddyMatch[] = (profiles || []).map(profile => {
      let score = 50; // Base score
      
      // Same state bonus
      if (profile.state_name === currentProfile.state_name) {
        score += 30;
      }
      
      // Same city bonus
      if (profile.city_name === currentProfile.city_name) {
        score += 40;
      }
      
      // Verified user bonus
      if (profile.verified) {
        score += 10;
      }
      
      // Tier compatibility
      if (profile.tier === 'gold' || profile.tier === 'platinum') {
        score += 15;
      }
      
      // Badge compatibility (simplified)
      if (profile.badges && profile.badges.length > 0) {
        score += Math.min(profile.badges.length * 5, 25);
      }
      
      return {
        ...profile,
        compatibility_score: Math.min(score, 100)
      };
    });

    // Sort by compatibility score
    buddyMatches.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return new Response(
      JSON.stringify({ matches: buddyMatches }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Buddy match error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});