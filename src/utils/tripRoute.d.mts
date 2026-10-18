export interface TripRouteStop {
  id: string;
  name: string;
  state: string;
  country: string;
  nights: number | null;
  coordinates: [number, number] | null;
}

export interface TripRouteMapPoint {
  x: number;
  y: number;
  index: number;
}

export function getTripRouteStops(trip: {
  itinerary?: { cities?: Array<{
    city_id?: string;
    city_name: string;
    state_name?: string;
    country?: string;
    lat?: number;
    lon?: number;
    longitude?: number;
    coordinates?: [number, number];
    nights?: number;
  }> };
  destination?: string;
  country?: string;
}): TripRouteStop[];

export function getTripRouteMapPoints(stops: TripRouteStop[]): TripRouteMapPoint[];
