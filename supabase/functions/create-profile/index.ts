import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface CreateProfileRequest {
  user_id: string;
  email: string;
  name: string;
  role: 'host' | 'traveler';
  instagram_id?: string;
  referral_code?: string;
  signup_source?: string;
  discount_eligible?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      user_id, 
      email, 
      name, 
      role, 
      instagram_id, 
      referral_code,
      signup_source = 'direct',
      discount_eligible = false 
    }: CreateProfileRequest = await req.json();

    // Validate required fields
    if (!user_id || !email || !name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate role
    if (!['host', 'traveler'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize Instagram ID
    let sanitizedInstagramId = null;
    if (instagram_id) {
      sanitizedInstagramId = instagram_id
        .trim()
        .replace(/^@/, '') // Remove leading @
        .toLowerCase();
      
      // Validate Instagram ID format
      const instagramRegex = /^[a-zA-Z0-9._]{1,40}$/;
      if (!instagramRegex.test(sanitizedInstagramId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid Instagram ID format' }),
          {
            has_referral: !!referral_code,
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Handle referral code if provided
    let referrer_id = null;
    if (referral_code) {
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referral_code.toLowerCase().trim())
        .single();

      if (!referrerError && referrer) {
        referrer_id = referrer.id;
      }
    }

    // Create/upsert profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user_id,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role,
        referral_code: email.toLowerCase().trim(), // Use email as referral code
        referred_by: referrer_id,
        instagram_id: sanitizedInstagramId,
        signup_source,
        discount_eligible_first_booking: discount_eligible,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        verified: false,
        points: 0,
        tier: 'silver'
      })
      .select('id, name, email, role, verified, points, tier, discount_eligible_first_booking, signup_source, referral_code, referred_by, pending_referral_discount_percentage')
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to create profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If the user is a host, create an entry in the host_details table
    if (profile && role === 'host') {
      const { error: hostDetailsError } = await supabase
        .from('host_details')
        .insert({
          id: profile.id, // Use the same ID as the profile
          // Default values for other columns will be applied by the database
        });

      if (hostDetailsError) {
        console.error('Error creating host_details entry:', hostDetailsError);
        // Log the error but don't necessarily fail the entire profile creation
        // as the main profile is already created.
      }
    }

    // If the user is a host, create an entry in the host_details table
    if (profile && role === 'host') {
      const { error: hostDetailsError } = await supabase
        .from('host_details')
        .insert({
          id: profile.id, // Use the same ID as the profile
          // Default values for other columns will be applied by the database
        });

      if (hostDetailsError) {
        console.error('Error creating host_details entry:', hostDetailsError);
        // Log the error but don't necessarily fail the entire profile creation
        // as the main profile is already created.
      }
    }

    // Log successful profile creation
    await supabase
      .from('auth_audit')
      .insert({
        event_type: 'profile_created',
        metadata: { 
          role, 
          has_instagram: !!sanitizedInstagramId,
          signup_source,
          discount_eligible
        }
      });

    return new Response(
      JSON.stringify({ profile }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Create profile error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});