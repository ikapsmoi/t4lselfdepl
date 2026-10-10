export const productPath = (id) => `/trips/${encodeURIComponent(id)}/`;

const hasDate = (value) => Boolean(value && !Number.isNaN(new Date(value).getTime()));
export const isSafeImage = (image) => {
  if (typeof image !== 'string' || !image.trim()) return false;
  if (image.startsWith('/')) return !image.startsWith('//') && !image.includes('..');

  try {
    return ['http:', 'https:'].includes(new URL(image).protocol);
  } catch {
    return false;
  }
};
const hasImage = (images) => Array.isArray(images) && images.some(isSafeImage);

export const getProductQuality = (trip, referenceDate = new Date()) => {
  const description = trip.itinerary?.description;
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const today = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  ));
  const lastTravelDay = new Date(Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  ));
  const checks = {
    id: typeof trip.id === 'string' && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(trip.id),
    title: Boolean(trip.title?.trim()),
    category: Boolean(trip.category?.trim()),
    destination: typeof trip.location === 'string' &&
      trip.location.trim().length >= 3 && /[a-z\d]/i.test(trip.location),
    dates: hasDate(trip.start_date) && hasDate(trip.end_date) &&
      endDate.getTime() >= startDate.getTime() && lastTravelDay >= today,
    price: trip.price_per_person !== null && trip.price_per_person !== undefined && Number.isFinite(Number(trip.price_per_person)) && Number(trip.price_per_person) >= 0,
    description: Boolean(typeof description === 'string' && description.trim().length >= 40),
    image: hasImage(trip.images),
  };

  return {
    eligible: Object.values(checks).every(Boolean),
    checks,
  };
};

export const getMissingFields = (trip) => Object.entries(getProductQuality(trip).checks)
  .filter(([, present]) => !present)
  .map(([field]) => field);

export const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');
