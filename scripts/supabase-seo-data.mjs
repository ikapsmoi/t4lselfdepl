import { loadEnv } from 'vite';

export const fetchActiveTrips = async () => {
  const env = loadEnv('production', process.cwd(), 'VITE_');
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to generate SEO product pages.');
  }

  const endpoint = new URL('/rest/v1/trips', supabaseUrl.replace(/\/$/, ''));
  endpoint.search = new URLSearchParams({
    select: 'id,title,category,location,start_date,end_date,price_per_person,currency,group_size,images,itinerary,updated_at,status',
    status: 'eq.active',
    order: 'updated_at.desc',
  }).toString();
  const response = await fetch(endpoint, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
  });

  if (!response.ok) {
    throw new Error(`Supabase SEO product query failed with HTTP ${response.status}: ${await response.text()}`);
  }

  const trips = await response.json();
  if (!Array.isArray(trips)) {
    throw new Error('Supabase SEO product query returned an unexpected response.');
  }
  return trips;
};
