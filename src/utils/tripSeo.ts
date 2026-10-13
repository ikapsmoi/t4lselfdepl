import type { Trip } from '../types';

export const siteUrl = 'https://travel4life.net';

export const getTripPath = (tripId: string): string => `/trips/${encodeURIComponent(tripId)}/`;

export const getTripCanonicalUrl = (tripId: string): string => `${siteUrl}${getTripPath(tripId)}`;

const formatDate = (date: string): string => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const getTripSeoTitle = (trip: Trip): string =>
  `${trip.title} | Travel Package | Travel4life`;

export const getTripSeoDescription = (trip: Trip): string => {
  const details = [
    trip.destination,
    formatDate(trip.start_date),
    `${trip.duration} days`,
    trip.included.length > 0 ? `Includes ${trip.included.slice(0, 2).join(' and ')}.` : '',
  ].filter(Boolean).join(' • ');

  return `${trip.description.slice(0, 150).trim()}${trip.description.length > 150 ? '...' : ''} ${details}`.trim();
};

export const getTripJsonLd = (trip: Trip, relatedTrips: Trip[]) => {
  const canonicalUrl = getTripCanonicalUrl(trip.id);
  const image = trip.images[0] ? `${siteUrl}${trip.images[0].startsWith('/') ? trip.images[0] : `/${trip.images[0]}`}` : undefined;
  const itemListElements = relatedTrips.map((relatedTrip, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: relatedTrip.title,
    url: getTripCanonicalUrl(relatedTrip.id),
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: trip.title,
      description: trip.description,
      image: image ? [image] : undefined,
      url: canonicalUrl,
      brand: { '@type': 'Brand', name: 'Travel4life' },
      category: trip.type,
      offers: {
        '@type': 'Offer',
        price: trip.price,
        priceCurrency: trip.currency,
        url: canonicalUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Trips', item: `${siteUrl}/trips` },
        { '@type': 'ListItem', position: 3, name: trip.title, item: canonicalUrl },
      ],
    },
    ...(itemListElements.length > 0 ? [{
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Related trips to ${trip.destination}`,
      itemListElement: itemListElements,
    }] : []),
  ];
};
