export const productPath = (id) => `/trips/${encodeURIComponent(id)}`;

const hasDate = (value) => Boolean(value && !Number.isNaN(new Date(value).getTime()));
const hasImage = (images) => Array.isArray(images) && images.some((image) => typeof image === 'string' && image.trim());

export const getProductQuality = (trip) => {
  const description = trip.itinerary?.description;
  const checks = {
    id: Boolean(trip.id),
    title: Boolean(trip.title?.trim()),
    category: Boolean(trip.category?.trim()),
    destination: Boolean(trip.location?.trim()),
    dates: hasDate(trip.start_date) && hasDate(trip.end_date),
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
