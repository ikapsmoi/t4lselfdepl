import { INDIA_DESTINATIONS } from '../india-tours/catalog.mjs';

const normalizeCityName = (name) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const indiaCoordinates = new Map(
  INDIA_DESTINATIONS.map(({ name, coordinates }) => [normalizeCityName(name), coordinates]),
);

const validCoordinates = (latitude, longitude) => (
  Number.isFinite(latitude)
  && Number.isFinite(longitude)
  && !(latitude === 0 && longitude === 0)
  && latitude >= -90
  && latitude <= 90
  && longitude >= -180
  && longitude <= 180
);

const toCoordinateNumber = (value) => (
  typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')
    ? Number(value)
    : Number.NaN
);

const coordinatesForCity = (city) => {
  const suppliedCoordinates = Array.isArray(city.coordinates) && city.coordinates.length === 2
    ? [toCoordinateNumber(city.coordinates[0]), toCoordinateNumber(city.coordinates[1])]
    : null;
  if (suppliedCoordinates && validCoordinates(...suppliedCoordinates)) {
    return suppliedCoordinates;
  }

  const latitude = toCoordinateNumber(city.lat);
  const longitude = toCoordinateNumber(city.lon ?? city.longitude);

  if (validCoordinates(latitude, longitude)) {
    return [latitude, longitude];
  }

  const knownIndiaCoordinates = indiaCoordinates.get(normalizeCityName(city.city_name));
  return city.country?.trim().toLowerCase() === 'india'
    ? knownIndiaCoordinates || null
    : null;
};

export const getTripRouteStops = (trip) => {
  const cities = Array.isArray(trip.itinerary?.cities)
    ? trip.itinerary.cities.filter((city) => city && typeof city.city_name === 'string' && city.city_name.trim())
    : [];
  const routeCities = cities.length > 0
    ? cities
    : trip.destination?.trim()
      ? [{ city_name: trip.destination.trim(), country: trip.country }]
      : [];

  return routeCities.map((city, index) => ({
    id: city.city_id || `${normalizeCityName(city.city_name)}-${index}`,
    name: city.city_name.trim(),
    state: city.state_name?.trim() || '',
    country: city.country?.trim() || '',
    nights: Number.isFinite(Number(city.nights)) && Number(city.nights) > 0
      ? Number(city.nights)
      : null,
    coordinates: coordinatesForCity(city),
  }));
};

export const getTripRouteMapPoints = (stops) => {
  if (stops.length < 2 || stops.some((stop) => !stop.coordinates)) return [];

  const longitudes = stops.map(({ coordinates }) => coordinates[1]);
  const latitudes = stops.map(({ coordinates }) => coordinates[0]);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);

  if (maxLongitude - minLongitude > 180) return [];

  const longitudeSpan = maxLongitude - minLongitude || 1;
  const latitudeSpan = maxLatitude - minLatitude || 1;

  return stops.map(({ coordinates }, index) => ({
    x: 12 + ((coordinates[1] - minLongitude) / longitudeSpan) * 76,
    y: 12 + ((maxLatitude - coordinates[0]) / latitudeSpan) * 76,
    index,
  }));
};
