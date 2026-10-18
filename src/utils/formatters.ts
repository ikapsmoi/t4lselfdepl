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

const cleanTripText = (value?: string | null): string => {
  if (!value) return '';

  return value
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\s*Source\s*:[\s\S]*$/i, '')
    .replace(/\s*Source notes\s*:\s*.*?(?=\s*(?:Arbitrage note\s*:|$))/gis, '')
    .replace(/\s*Arbitrage note\s*:\s*.*$/gis, '')
    .replace(/\s*Published starting package\.?\s*/gi, '')
    .replace(/\s*Look for local DMC net rate\.?\s*/gi, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const splitReadableText = (value: string): string[] => value
  .split(/\n+/)
  .flatMap((line) => line
    .replace(/^\s*(?:[-*]|\d+[.)])\s+/, '')
    .split(/\s+(?=[•·▪◦])|[•·▪◦]\s*|;\s*|(?<=[.!?])\s+(?=[\p{Lu}\d“"'])/u))
  .map((item) => item.trim())
  .filter(Boolean);

export const stripSourceNotes = (value?: string | null): string => cleanTripText(value)
  .replace(/\s+/g, ' ')
  .trim();

export const formatTripDescription = (value?: string | null): string[] => {
  const cleaned = cleanTripText(value);
  if (!cleaned) return [];

  return cleaned
    .split(/\n\s*\n/)
    .flatMap(splitReadableText);
};

export const formatTripListItems = (items?: string[] | null): string[] => {
  if (!items?.length) return [];

  return items
    .flatMap((item) => splitReadableText(cleanTripText(item)))
    .filter((item) => !/^Source\s*:/i.test(item));
};

export const formatTripDateRange = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  datesFlexible: boolean | null | undefined,
  formatDate: (date: string) => string = (date) => new Date(date).toLocaleDateString(),
): string => {
  if (datesFlexible) return 'Flexible';
  if (!startDate || !endDate) return 'Dates not available';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
