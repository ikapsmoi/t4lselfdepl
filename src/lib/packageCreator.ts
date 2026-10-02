export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'THB';
export type OutputFormat = 'single' | 'multi-page';

export interface StayItem {
  id: string;
  city: string;
  hotel: string;
  nights: number;
  category: string;
  mealPlan: string;
}

export interface InclusionItem {
  id: string;
  value: string;
}

export interface ExclusionItem {
  id: string;
  value: string;
}

export interface ItineraryDay {
  id: string;
  day: number;
  title: string;
  date: string;
  city: string;
  description: string;
  activities: string[];
}

export interface PackageCreatorData {
  packageTitle: string;
  packageReference: string;
  days: number;
  nights: number;
  currency: CurrencyCode;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  template: string;
  outputFormat: OutputFormat;
  showItinerary: boolean;
  stays: StayItem[];
  inclusions: InclusionItem[];
  exclusions: ExclusionItem[];
  additionalInformation: string;
  itinerary: ItineraryDay[];
  coverImage: string;
  galleryImages: string[];
  createdAt: string;
}

export const COMPANY_CONFIG = {
  name: 'TRAVEL4LIFE',
  website: 'https://travel4life.net/',
  websiteDisplay: 'www.travel4life.net',
  gst: '07AIGPK7468L1ZN',
  corporateOffice: 'D-36, R.K.PURAM, SECTOR 6, 110022',
  whatsapp: '+91-9511446642',
  email: 'info@travel4life.net',
  paymentUrl: 'https://razorpay.me/@travel4life',
  logo: '/logo-new.png',
};

export const TEMPLATE_OPTIONS = [
  'TRAVEL4LIFE EDITORIAL',
  'TRAVEL4LIFE LUXE',
  'TRAVEL4LIFE MINIMAL',
  'TRAVEL4LIFE FESTIVAL',
];

export const CURRENCY_OPTIONS: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'THB'];

export const sanitizeText = (value: string): string =>
  value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'travel-package';
};

export const createId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export const formatAmount = (value: number, currency: CurrencyCode): string => {
  const safeValue = Number.isFinite(value) ? value : 0;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: currency === 'INR' || currency === 'AED' || currency === 'THB' ? 0 : 2,
  });

  const formatted = formatter.format(safeValue);

  if (currency === 'INR') {
    return formatted.replace('₹', '₹');
  }

  if (currency === 'USD') {
    return formatted.replace('$', '$');
  }

  if (currency === 'EUR') {
    return formatted.replace('€', '€');
  }

  if (currency === 'GBP') {
    return formatted.replace('£', '£');
  }

  if (currency === 'AED') {
    return formatted.replace('AED', 'AED').replace('د.إ', 'AED');
  }

  if (currency === 'THB') {
    return formatted.replace('฿', '฿');
  }

  return formatted;
};

export const getFilenameSafe = (title: string): string => {
  const base = slugify(title || 'travel4life-package');
  return `travel4life-${base}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
};

export const buildShareText = (data: PackageCreatorData): string => {
  const title = sanitizeText(data.packageTitle || 'Travel Package');
  const header = [
    'TRAVEL4LIFE',
    '',
    title,
    `${data.days} Days / ${data.nights} Nights`,
    '',
    `Starting from ${formatAmount(data.adultPrice || 0, data.currency)} per adult.`,
    data.showItinerary === false
      ? 'Accommodation and package inclusions are included in the attached package.'
      : 'Your detailed itinerary, accommodation and package inclusions are included in the attached package.',
  ].join('\n');

  return header;
};

export const getDemoPackageData = (): PackageCreatorData => ({
  packageTitle: 'European Summer Escape',
  packageReference: 'T4L-EUROPE-2027-001',
  days: 7,
  nights: 6,
  currency: 'INR',
  adultPrice: 149999,
  childPrice: 0,
  infantPrice: 0,
  template: 'TRAVEL4LIFE EDITORIAL',
  outputFormat: 'single',
  showItinerary: true,
  stays: [
    {
      id: 'stay-1',
      city: 'Paris',
      hotel: 'Pullman Paris Tour Eiffel',
      nights: 3,
      category: '4 Star',
      mealPlan: 'Breakfast',
    },
    {
      id: 'stay-2',
      city: 'Amsterdam',
      hotel: 'Park Plaza Victoria',
      nights: 2,
      category: '4 Star',
      mealPlan: 'Breakfast',
    },
    {
      id: 'stay-3',
      city: 'Brussels',
      hotel: 'Hotel Indigo',
      nights: 1,
      category: '4 Star',
      mealPlan: 'Breakfast',
    },
  ],
  inclusions: [
    { id: 'inc-1', value: 'Airport transfers' },
    { id: 'inc-2', value: '5 nights accommodation' },
    { id: 'inc-3', value: 'Daily breakfast' },
    { id: 'inc-4', value: 'City tour' },
    { id: 'inc-5', value: 'Private transportation' },
  ],
  exclusions: [
    { id: 'exc-1', value: 'International flights' },
    { id: 'exc-2', value: 'Visa fees' },
    { id: 'exc-3', value: 'Personal expenses' },
    { id: 'exc-4', value: 'Travel insurance' },
  ],
  additionalInformation: 'Booking conditions: Passport valid for minimum 6 months. Visa guidance provided as per destination requirements. Please carry a printout of booking confirmation for transfers and hotel check-ins.\n\nBANK ACCOUNT\n50200116350847\n\nIFSC\nHDFC0002076\n\nACCOUNT NAME BRANCH\nTravel4life Global\nBRANCH: MANGAL BAZAAR',
  itinerary: [
    {
      id: 'day-1',
      day: 1,
      title: 'DAY 01 — ARRIVAL IN PARIS',
      date: '12 Jun 2027',
      city: 'Paris',
      description: 'Arrive at Paris Charles de Gaulle Airport. Meet your representative and transfer to the hotel. Evening at leisure.',
      activities: ['Airport arrival', 'Private transfer', 'Hotel check-in', 'Evening at leisure'],
    },
    {
      id: 'day-2',
      day: 2,
      title: 'DAY 02 — ART & ICONIC SIGHTS',
      date: '13 Jun 2027',
      city: 'Paris',
      description: 'Begin with a guided city orientation and iconic landmarks including the Eiffel Tower and Seine River. Enjoy curated dining recommendations in the evening.',
      activities: ['City tour', 'Seine cruise', 'Local dining'],
    },
    {
      id: 'day-3',
      day: 3,
      title: 'DAY 03 — PARIS AT LEISURE',
      date: '14 Jun 2027',
      city: 'Paris',
      description: 'Full day to explore Paris at your own pace. Optional museum entry or shopping in Le Marais and a private evening dinner.',
      activities: ['Museum visit', 'Shopping', 'Private dinner'],
    },
    {
      id: 'day-4',
      day: 4,
      title: 'DAY 04 — AMSTERDAM TRANSFER',
      date: '15 Jun 2027',
      city: 'Amsterdam',
      description: 'Travel to Amsterdam after breakfast and check in at the hotel. Spend the evening discovering the city canals and dining district.',
      activities: ['Transfer', 'Hotel check-in', 'Canal walk'],
    },
    {
      id: 'day-5',
      day: 5,
      title: 'DAY 05 — AMSTERDAM DISCOVERY',
      date: '16 Jun 2027',
      city: 'Amsterdam',
      description: 'Explore Amsterdam with a city overview, heritage streets, and optional bike ride near the waterfront.',
      activities: ['City visit', 'Bike ride', 'Canal cruise'],
    },
    {
      id: 'day-6',
      day: 6,
      title: 'DAY 06 — BRUSSELS',
      date: '17 Jun 2027',
      city: 'Brussels',
      description: 'Travel to Brussels for a relaxed city experience with architecture, grand squares, and chocolate tasting.',
      activities: ['Transfer', 'Grand Place visit', 'Chocolate tasting'],
    },
    {
      id: 'day-7',
      day: 7,
      title: 'DAY 07 — DEPARTURE',
      date: '18 Jun 2027',
      city: 'Brussels',
      description: 'Departure transfer to the airport with final memories from an elegant European holiday.',
      activities: ['Airport transfer', 'Departure'],
    },
  ],
  coverImage: '',
  galleryImages: [],
  createdAt: new Date().toISOString(),
});
