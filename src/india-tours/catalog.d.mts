export interface IndiaDestination {
  id: string;
  name: string;
  coordinates: [number, number];
}

export interface IndiaJourneyConcept {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  category: string;
  duration_days: string;
  duration_nights: number | null;
  starting_city: string;
  ending_city: string;
  route_stops: IndiaDestination[];
  itinerary: Array<{
    stop_number: number;
    destination: string;
    description: string;
    activities: string[];
    overnight_destination: string | null;
    transport_mode: string | null;
    estimated_travel_time: string | null;
    optional_activities: string[];
    included_meals: string[] | null;
  }>;
  coordinates: [number, number][];
  inclusions: string[] | null;
  exclusions: string[] | null;
  accommodation_category: string | null;
  transport_details: string | null;
  price_status: 'verified_price' | 'quote_required' | 'temporarily_unavailable' | 'draft' | 'archived';
  supplier_net_cost: number | null;
  supplier_currency: string | null;
  selling_price: number | null;
  selling_currency: string | null;
  pricing_basis: 'per_person' | 'per_room' | 'group_total' | null;
  price_valid_until: string | null;
  availability_status: 'available' | 'unverified' | 'unavailable';
  minimum_travellers: number | null;
  maximum_travellers: number | null;
  last_verified_at: string | null;
  source_reference: string;
  is_featured: boolean;
  is_active: boolean;
  approval_status: 'draft' | 'approved' | 'archived';
  seo_title: string | null;
  seo_description: string | null;
}

export const JOURNEY_CATEGORIES: Array<{ id: string; label: string }>;
export const INDIA_DESTINATIONS: IndiaDestination[];
export const INDIA_JOURNEY_CONCEPTS: IndiaJourneyConcept[];
export function getApprovedActivePackages(journeys?: IndiaJourneyConcept[]): IndiaJourneyConcept[];
export function getJourneysMatchingDestination(destinationName: string, journeys?: IndiaJourneyConcept[]): IndiaJourneyConcept[];
export function validateJourneyCatalogue(journeys?: IndiaJourneyConcept[]): string[];
