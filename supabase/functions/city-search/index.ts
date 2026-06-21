import { corsHeaders } from '../_shared/cors.ts';

interface CityResult {
  city_id: string;
  city_name: string;
  state_name: string;
  country: string;
  lat: number;
  lon: number;
}

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// Simple in-memory cache for common cities
const cityCache = new Map<string, CityResult[]>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const RATE_LIMIT_WINDOW = 1000 * 60; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
}

async function searchCities(query: string): Promise<CityResult[]> {
  const cacheKey = query.toLowerCase().trim();
  
  // Check cache first
  if (cityCache.has(cacheKey)) {
    const cached = cityCache.get(cacheKey)!;
    return cached;
  }
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&featuretype=city&accept-language=en`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelTag-App/1.0 (contact@traveltag.com)',
        'Accept-Language': 'en'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data: NominatimResult[] = await response.json();
    
    const results: CityResult[] = data
      .filter(item => item.address && (item.address.city || item.address.town || item.address.village))
      .map(item => ({
        city_id: item.place_id,
        city_name: item.address.city || item.address.town || item.address.village || '',
        state_name: item.address.state || '',
        country: item.address.country || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }))
      .slice(0, 10);
    
    // Cache results
    cityCache.set(cacheKey, results);
    
    // Clean up cache periodically
    setTimeout(() => cityCache.delete(cacheKey), CACHE_TTL);
    
    return results;
  } catch (error) {
    console.error('City search error:', error);
    
    // Return fallback cities for common searches
    const fallbackCities: Record<string, CityResult[]> = {
      'mumbai': [{
        city_id: 'mumbai-1',
        city_name: 'Mumbai',
        state_name: 'Maharashtra',
        country: 'India',
        lat: 19.0760,
        lon: 72.8777
      }],
      'delhi': [{
        city_id: 'delhi-1',
        city_name: 'New Delhi',
        state_name: 'Delhi',
        country: 'India',
        lat: 28.6139,
        lon: 77.2090
      }],
      'bangalore': [{
        city_id: 'bangalore-1',
        city_name: 'Bangalore',
        state_name: 'Karnataka',
        country: 'India',
        lat: 12.9716,
        lon: 77.5946
      }]
    };
    
    return fallbackCities[cacheKey] || [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
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

    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const cities = await searchCities(query.trim());

    return new Response(
      JSON.stringify({ cities }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('City search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});