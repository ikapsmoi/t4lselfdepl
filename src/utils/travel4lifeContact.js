import contact from '../config/travel4life-contact.json' with { type: 'json' };

export const TRAVEL4LIFE_CONTACT = Object.freeze(contact);

const contextualMessages = {
  wedding: ({ destination }) => `Hi Travel4Life, I am planning a destination wedding in ${destination || 'Jim Corbett'}. Please help me with resort options, wedding packages and a customized quote.`,
  'jim-corbett': ({ destination }) => `Hi Travel4Life, I am interested in planning a ${destination || 'Jim Corbett'} trip. Please help me with available packages, resorts and rates.`,
  cost: ({ destination }) => `Hi Travel4Life, I would like an exact quote for ${destination || 'Jim Corbett'} for my dates. Please help me compare current resorts and package prices.`,
  activities: ({ destination }) => `Hi Travel4Life, I am planning a trip to ${destination || 'Jim Corbett'}. Please help me combine resort, safari and activities.`,
  mice: ({ destination, eventType }) => `Hi Travel4Life, I am planning a ${eventType || 'corporate/MICE event'} in ${destination || 'Jim Corbett'}. Please help me with resort options, accommodation, meeting facilities and an event proposal.`,
  corporate: ({ destination }) => `Hi Travel4Life, I am planning a corporate offsite in ${destination || 'Jim Corbett'}. Please help me with packages, resorts and pricing.`,
  resort: ({ destination, resort }) => `Hi Travel4Life, I am interested in ${resort || 'a resort'} in ${destination || 'Jim Corbett'}. Please share the best available rates, packages and availability.`,
  package: ({ destination, package: packageName }) => `Hi Travel4Life, I am interested in the ${packageName || 'travel package'}${destination ? ` in ${destination}` : ''}. Please share availability, current pricing and booking details.`,
  safari: ({ destination }) => `Hi Travel4Life, I am interested in planning a ${destination || 'Jim Corbett'} safari. Please help me with available safari and stay options.`,
  origin: ({ destination, origin }) => `Hi Travel4Life, I am planning a ${destination || 'Jim Corbett'} trip from ${origin || 'my city'}. Please share suitable packages, transport and resort options.`,
  europe: ({ destination, country, city }) => {
    const places = [city, country, destination].filter(Boolean);
    const uniquePlaces = places.filter((place, index) => places.findIndex((candidate) => candidate.toLowerCase() === place.toLowerCase()) === index);
    return `Hi Travel4Life, I am planning a trip to ${uniquePlaces.join(', ') || 'Europe'} from India. Please share suitable trips and current availability.`;
  },
  festival: ({ destination, eventType, tripType }) => {
    const experience = eventType || tripType || 'a festival trip';
    const repeatsDestination = destination && experience.toLowerCase().includes(destination.toLowerCase());
    return `Hi Travel4Life, I am interested in ${experience}${destination && !repeatsDestination ? ` in ${destination}` : ''}. Please share current package availability and booking details.`;
  },
  travel: ({ destination, tripType }) => `Hi Travel4Life, I am interested in planning ${tripType || 'a trip'}${destination ? ` to ${destination}` : ''}. Please help me with available options and current rates.`,
};

export const getTravel4LifeContactContext = ({
  pageType = 'travel',
  destination,
  country,
  city,
  resort,
  package: packageName,
  eventType,
  tripType,
  origin,
  entity,
} = {}) => ({
  pageType,
  destination,
  country,
  city,
  resort,
  package: packageName,
  eventType,
  tripType,
  origin,
  entity: entity || packageName || resort || destination || '',
});

export const getTravel4LifeWhatsAppMessage = (context = {}) => {
  const normalizedContext = getTravel4LifeContactContext(context);
  const messageBuilder = contextualMessages[normalizedContext.pageType] || contextualMessages.travel;
  return messageBuilder(normalizedContext);
};

export const getTravel4LifeWhatsAppUrl = (context = {}, message = getTravel4LifeWhatsAppMessage(context)) =>
  `https://wa.me/${TRAVEL4LIFE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const getTravel4LifeContactContextFromLocation = (pathname, title = '') => {
  const normalizedPath = pathname.toLowerCase();
  const titleParts = title.split('|')[0].trim();
  const pageLabel = /^travel4life\b/i.test(titleParts) ? '' : titleParts;
  const destination = normalizedPath.includes('/europe')
    ? 'Europe'
    : normalizedPath.includes('/tomorrowland')
      ? 'Tomorrowland'
      : pageLabel || undefined;

  if (/wedding/.test(normalizedPath)) return getTravel4LifeContactContext({ pageType: 'wedding', destination: 'Jim Corbett' });
  if (/mice/.test(normalizedPath)) return getTravel4LifeContactContext({ pageType: 'mice', destination: 'Jim Corbett' });
  if (/offsite/.test(normalizedPath)) return getTravel4LifeContactContext({ pageType: 'corporate', destination: 'Jim Corbett' });
  if (/safari/.test(normalizedPath)) return getTravel4LifeContactContext({ pageType: 'safari', destination: 'Jim Corbett' });
  if (/resort/.test(normalizedPath)) return getTravel4LifeContactContext({ pageType: 'resort', destination: 'Jim Corbett', resort: titleParts });
  if (/from-(delhi|ncr)/.test(normalizedPath)) return getTravel4LifeContactContext({ pageType: 'origin', destination: 'Jim Corbett', origin: 'Delhi/NCR' });
  if (normalizedPath.includes('/jim-corbett')) {
    const corbettPath = normalizedPath.split('/').filter(Boolean);
    const pageSlug = corbettPath.at(-1) || 'jim-corbett';
    if (normalizedPath.includes('/packages/')) {
      const packageName = pageLabel || pageSlug.replaceAll('-', ' ');
      return getTravel4LifeContactContext({ pageType: 'package', destination: 'Jim Corbett', package: packageName });
    }
    if (/cost|price/.test(pageSlug)) return getTravel4LifeContactContext({ pageType: 'cost', destination: 'Jim Corbett' });
    if (/things-to-do|activities/.test(pageSlug)) return getTravel4LifeContactContext({ pageType: 'activities', destination: 'Jim Corbett' });
    return getTravel4LifeContactContext({ pageType: 'jim-corbett', destination: 'Jim Corbett' });
  }
  if (normalizedPath.includes('/europe')) {
    const europeRoute = normalizedPath.split('/').filter(Boolean).at(-1) || 'europe';
    const countryMatch = europeRoute.match(/switzerland|france|italy|belgium|netherlands|austria/)?.[0];
    const country = countryMatch ? `${countryMatch[0].toUpperCase()}${countryMatch.slice(1)}` : undefined;
    const city = europeRoute.startsWith('paris-') ? 'Paris' : undefined;
    return getTravel4LifeContactContext({ pageType: 'europe', destination: country || 'Europe', country, city, entity: europeRoute.replaceAll('-', ' ') });
  }
  if (normalizedPath.includes('/tomorrowland')) {
    return getTravel4LifeContactContext({ pageType: 'festival', destination, eventType: 'Tomorrowland festival trip' });
  }
  if (/^\/trips\/[^/]+/.test(normalizedPath)) {
    return getTravel4LifeContactContext({ pageType: 'package', destination: pageLabel, package: pageLabel });
  }
  return getTravel4LifeContactContext({ pageType: 'travel', destination });
};

export const getTravel4LifeQuoteEvent = (pageType) => ({
  wedding: 'wedding_quote_request',
  mice: 'mice_quote_request',
  resort: 'availability_request',
  package: 'availability_request',
  safari: 'availability_request',
}[pageType] || 'quote_request_click');

export const getTravel4LifeQuoteEvents = (pageType) => {
  const primaryEvent = getTravel4LifeQuoteEvent(pageType);
  const entityEvent = {
    resort: 'resort_enquiry',
    package: 'package_enquiry',
  }[pageType];
  return entityEvent ? [primaryEvent, entityEvent] : [primaryEvent];
};
