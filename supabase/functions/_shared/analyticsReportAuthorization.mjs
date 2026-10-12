export const authorizeAnalyticsReportRequest = async ({ request, createClient, supabaseUrl, anonKey }) => {
  const bearerToken = request.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!bearerToken) {
    return { authorized: false, status: 401, error: 'Authentication required.' };
  }

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase URL and anon key are required to authorize analytics reports.');
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user } = {}, error: authError } = await authClient.auth.getUser(bearerToken);

  if (authError || !user) {
    return { authorized: false, status: 401, error: 'Invalid or expired session.' };
  }

  const { data: profile, error: profileError } = await authClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to verify analytics administrator role: ${profileError.message}`);
  }

  if (profile?.role !== 'admin') {
    return { authorized: false, status: 403, error: 'Administrator access required.' };
  }

  return { authorized: true, userId: user.id };
};
