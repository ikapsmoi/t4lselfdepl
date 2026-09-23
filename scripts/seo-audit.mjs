const siteUrl = (process.env.SITE_URL || 'https://travel4life.net').replace(/\/$/, '');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to run the SEO audit.');
}

const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/trips?select=id,title,category,location,start_date,end_date,price_per_person,images,itinerary,status&status=eq.active&order=created_at.desc`;
const response = await fetch(endpoint, {
  headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
});

if (!response.ok) {
  throw new Error(`Supabase SEO audit query failed with HTTP ${response.status}: ${await response.text()}`);
}

const trips = await response.json();
const eligible = trips.filter((trip) => trip.id && trip.title && trip.status === 'active');
const report = {
  generatedAt: new Date().toISOString(),
  siteUrl,
  totalProducts: trips.length,
  indexableProducts: eligible.length,
  missingTitle: trips.filter((trip) => !trip.title).length,
  missingDestination: trips.filter((trip) => !trip.location).length,
  missingDates: trips.filter((trip) => !trip.start_date || !trip.end_date).length,
  missingPrice: trips.filter((trip) => trip.price_per_person === null || trip.price_per_person === undefined).length,
  missingImage: trips.filter((trip) => !Array.isArray(trip.images) || trip.images.length === 0).length,
  sampleProduct: eligible[0] ? {
    id: eligible[0].id,
    title: eligible[0].title,
    url: `${siteUrl}/trips/${encodeURIComponent(eligible[0].id)}`,
  } : null,
};

console.log(JSON.stringify(report, null, 2));
