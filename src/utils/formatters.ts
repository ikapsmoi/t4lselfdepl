// src/utils/formatters.ts
interface ItineraryCity {
  city_name: string;
  state_name: string;
  country?: string;
  nights?: number;
}

export const formatCitiesForDisplay = (cities: ItineraryCity[] | undefined): string => {
  if (!cities || cities.length === 0) {
    return ''; // Return empty string to use fallback destination
  }

  if (cities.length === 1) {
    return cities[0].city_name;
  }

  const firstCity = cities[0].city_name;
  const lastCity = cities[cities.length - 1].city_name;

  // For more than 2 cities, show first and last
  return `${firstCity} → ${lastCity}`;
};

export const cleanTripTitle = (title: string | undefined): string => {
  const cleanedTitle = (title || '')
    .replace(/\uFFFD+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleanedTitle || 'Untitled trip';
};

export const stripSourceNotes = (value?: string | null): string => {
  if (!value) return '';

  const cleaned = value
    .replace(/\s*Source notes\s*:\s*.*?(?=\s*(?:Arbitrage note\s*:|$))/gis, '')
    .replace(/\s*Arbitrage note\s*:\s*.*$/gis, '')
    .replace(/\s*Published starting package\.?\s*/gi, '')
    .replace(/\s*Look for local DMC net rate\.?\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned;
};
