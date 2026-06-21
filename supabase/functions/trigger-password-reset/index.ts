import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface PasswordResetRequest {
  email: string;
  triggered_by_failed_attempts?: boolean;
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

    const { email, triggered_by_failed_attempts }: PasswordResetRequest = await req.json();

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

    // Trigger password reset
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't expose the actual error to prevent email enumeration
    }

    // Log the password reset attempt
    await supabase
      .from('auth_audit')
      .insert({
        event_type: 'password_reset_requested',
        metadata: { 
          email: normalizedEmail,
          triggered_by_failed_attempts: triggered_by_failed_attempts || false
        }
      });

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({ message: 'If an account exists with this email, a password reset link has been sent.' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});