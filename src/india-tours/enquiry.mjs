export const sanitizeEnquiryText = (value, maxLength) => String(value ?? '')
  .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, maxLength);

export const createIndiaEnquiryMessage = ({
  journey,
  travellerName,
  travellerEmail,
  travellerCount,
  travellerCountry,
  tripDuration,
  travelDates,
  budget,
  accommodation,
  travellerPace,
  travellerType,
  currencyPreference,
  pageUrl = 'https://travel4life.net/india-tours/',
}) => {
  if (!journey?.name || !Array.isArray(journey.route_stops) || journey.route_stops.length === 0) {
    throw new TypeError('A valid India route idea is required to prepare an enquiry.');
  }
  const name = sanitizeEnquiryText(travellerName, 100);
  const email = sanitizeEnquiryText(travellerEmail, 254);
  const countText = String(travellerCount ?? '').trim();
  const count = Number(countText);
  if (!name) throw new TypeError('Please enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TypeError('Please enter a valid email address.');
  if (!/^\d+$/.test(countText) || !Number.isInteger(count) || count < 1 || count > 40) {
    throw new TypeError('Please enter a whole number of travellers from 1 to 40.');
  }
  const parsedPageUrl = new URL(pageUrl);
  if (
    parsedPageUrl.origin !== 'https://travel4life.net'
    || parsedPageUrl.pathname !== '/india-tours/'
    || parsedPageUrl.search
    || parsedPageUrl.hash
  ) {
    throw new TypeError('The enquiry page URL must be the canonical Travel4Life India tours page.');
  }
  const country = sanitizeEnquiryText(travellerCountry, 40);
  const allowedCountries = new Set(['United States', 'United Kingdom', 'Australia', 'Germany', 'France', 'Netherlands', 'Other']);
  if (country && !allowedCountries.has(country)) throw new TypeError('Please select a supported country option.');
  const duration = sanitizeEnquiryText(tripDuration, 20);
  const allowedDurations = new Set(['5–7 days', '8–10 days', '11–14 days', '15–21 days', '22+ days']);
  if (duration && !allowedDurations.has(duration)) throw new TypeError('Please select a supported trip duration.');
  const dates = sanitizeEnquiryText(travelDates, 80) || 'Not decided';
  const budgetText = sanitizeEnquiryText(budget, 50) || 'Prefer to discuss';
  const accommodationText = sanitizeEnquiryText(accommodation, 60) || 'Not decided';
  const pace = sanitizeEnquiryText(travellerPace, 30);
  const party = sanitizeEnquiryText(travellerType, 30);
  const currency = sanitizeEnquiryText(currencyPreference, 3).toUpperCase();
  if (pace && !['Relaxed', 'Balanced', 'Fast-paced'].includes(pace)) throw new TypeError('Please select a supported travel pace.');
  if (party && !['Solo', 'Couple', 'Family', 'Group'].includes(party)) throw new TypeError('Please select a supported traveller type.');
  if (currency && !['USD', 'GBP', 'EUR'].includes(currency)) throw new TypeError('Please select a supported currency preference.');
  const route = journey.route_stops.map(({ name: stopName }) => sanitizeEnquiryText(stopName, 80)).join(' → ');
  const message = [
    'Hello Travel4Life,',
    '',
    'I am interested in planning an India trip.',
    '',
    `Selected route idea: ${journey.name}`,
    `Route: ${route}`,
    `Indicative duration: ${journey.duration_days}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Number of travellers: ${count}`,
    `Country of residence: ${country || 'Not specified'}`,
    ...(party ? [`Travelling as: ${party}`] : []),
    ...(pace ? [`Preferred pace: ${pace}`] : []),
    `Preferred trip duration: ${duration || 'Flexible'}`,
    `Preferred travel dates: ${dates}`,
    ...(currency ? [`Preferred currency: ${currency} (preference only; any quote will be confirmed directly)`] : []),
    `Approximate budget per person: ${budgetText}`,
    `Accommodation preference: ${accommodationText}`,
    `Route page: ${parsedPageUrl.toString()}`,
    '',
    'Please let me know whether this route can be planned and what current arrangements, inclusions and quotation may be available.',
    '',
    'Thank you.',
  ].join('\n');
  return { message, name, email, travellerCount: count };
};
