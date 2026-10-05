const europeDestinations = [
  'france',
  'switzerland',
  'italy',
  'netherlands',
  'belgium',
  'austria',
];

const routeRequirements = new Map([
  ['/europe/', (trip, text, location) => hasEuropeanInventory(location)],
  ['/europe/tours-from-india/', (trip, text, location) => hasEuropeanInventory(location)],
  ['/europe/tour-cost/', (trip, text, location) => hasEuropeanInventory(location)],
  ['/europe/switzerland/', (trip, text, location) => location.includes('switzerland')],
  ['/europe/france/', (trip, text, location) => location.includes('france')],
  ['/europe/italy/', (trip, text, location) => location.includes('italy')],
  ['/europe/paris-switzerland/', (trip, text, location) => location.includes('paris') && location.includes('switzerland')],
  ['/europe/france-switzerland-italy/', (trip, text, location) => ['france', 'switzerland', 'italy'].every((term) => location.includes(term))],
  ['/europe/honeymoon/', (trip, text, location) => hasEuropeanInventory(location) && /\bhoneymoon\b|\bcouple\b/.test(text)],
  ['/europe/family-tours/', (trip, text, location) => hasEuropeanInventory(location) && /\bfamil(y|ies)\b|\bchild(?:ren)?\b/.test(text)],
  ['/europe/tours-under-200000/', (trip, text, location) => hasEuropeanInventory(location) &&
    (!trip.currency || trip.currency === 'INR') && Number(trip.price_per_person) <= 200000],
]);

const hasEuropeanInventory = (searchText) => europeDestinations.some((destination) => searchText.includes(destination));

const getSearchText = (trip) => [
  trip.title,
  trip.location,
  trip.category,
  trip.itinerary?.description,
  ...(Array.isArray(trip.itinerary?.tags) ? trip.itinerary.tags : []),
].filter((value) => typeof value === 'string').join(' ').toLowerCase();

const getLocationText = (trip) => (typeof trip.location === 'string' ? trip.location : '').toLowerCase();

export const isIndexableEuropePage = (route, eligibleTrips) => {
  const requirement = routeRequirements.get(route);
  if (!requirement) return true;
  return eligibleTrips.some((trip) => requirement(trip, getSearchText(trip), getLocationText(trip)));
};
