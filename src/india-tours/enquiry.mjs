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
  travelDates,
  budget,
  accommodation,
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
  const dates = sanitizeEnquiryText(travelDates, 80) || 'Not decided';
  const budgetText = sanitizeEnquiryText(budget, 50) || 'Prefer to discuss';
  const accommodationText = sanitizeEnquiryText(accommodation, 60) || 'Not decided';
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
    `Preferred travel dates: ${dates}`,
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
