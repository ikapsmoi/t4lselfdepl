import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface LoginAttemptRequest {
  email: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
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

    const { email, success, ip_address, user_agent }: LoginAttemptRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const identifier = `login_${normalizedEmail}`;

    if (success) {
      // Clear rate limit on successful login
      await supabase
        .from('rate_limits')
        .delete()
        .eq('identifier', identifier);

      // Log successful login
      await supabase
        .from('auth_audit')
        .insert({
          email: normalizedEmail,
          event_type: 'login_success',
          ip_address,
          user_agent,
          success: true
        });

      return new Response(
        JSON.stringify({ message: 'Login attempt logged' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle failed login attempt
    const { data: existingLimit, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .single();

    let attemptCount = 1;
    let shouldTriggerReset = false;

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching rate limit:', fetchError);
    }

    if (existingLimit) {
      attemptCount = existingLimit.attempt_count + 1;
      
      // Update existing record
      await supabase
        .from('rate_limits')
        .update({
          attempt_count: attemptCount,
          last_attempt: new Date().toISOString()
        })
        .eq('identifier', identifier);
    } else {
      // Create new record
      await supabase
        .from('rate_limits')
        .insert({
          identifier,
          attempt_count: attemptCount,
          first_attempt: new Date().toISOString(),
          last_attempt: new Date().toISOString()
        });
    }

    // Check if we should trigger password reset (3rd attempt)
    if (attemptCount >= 3) {
      shouldTriggerReset = true;
      
      // Set lockout until timestamp (15 minutes from now)
      const lockoutUntil = new Date();
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 15);
      
      await supabase
        .from('rate_limits')
        .update({
          locked_until: lockoutUntil.toISOString()
        })
        .eq('identifier', identifier);

      // Trigger password reset
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: normalizedEmail,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
      }

      // Log password reset trigger
      await supabase
        .from('auth_audit')
        .insert({
          email: normalizedEmail,
          event_type: 'password_reset_request',
          ip_address,
          user_agent,
          success: true,
          metadata: { triggered_by_failed_attempts: true, attempt_count: attemptCount }
        });
    }

    // Log failed login attempt
    await supabase
      .from('auth_audit')
      .insert({
        email: normalizedEmail,
        event_type: 'login_failed',
        ip_address,
        user_agent,
        success: false,
        metadata: { attempt_count: attemptCount }
      });

    return new Response(
      JSON.stringify({ 
        attempt_count: attemptCount,
        password_reset_triggered: shouldTriggerReset,
        locked_until: attemptCount >= 3 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Track login attempt error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});