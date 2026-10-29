import { TRIP_CITY_IMAGE_CREDITS, type TripCityImageCredit } from './tripCityImageCredits';

export interface ResolvedTripImage {
  src: string;
  credit?: TripCityImageCredit;
}

const titleAliases: Array<readonly [string, string]> = [
  ['corbett', 'corbett'],
  ['uttarakhand', 'corbett'],
  ['nainital', 'corbett'],
  ['mussoorie', 'corbett'],
  ['ranikhet', 'corbett'],
  ['united kingdom', 'united-kingdom'],
  ['london', 'united-kingdom'],
  ['scotland', 'united-kingdom'],
  ['edinburgh', 'united-kingdom'],
  ['glasgow', 'united-kingdom'],
  ['england', 'united-kingdom'],
  ['norway', 'norway'],
  ['oslo', 'norway'],
  ['bergen', 'norway'],
  ['tromso', 'norway'],
  ['greece', 'greece'],
  ['athens', 'greece'],
  ['mykonos', 'greece'],
  ['santorini', 'greece'],
  ['crete', 'greece'],
  ['switzerland', 'switzerland'],
  ['lucerne', 'switzerland'],
  ['zurich', 'switzerland'],
  ['interlaken', 'switzerland'],
  ['geneva', 'switzerland'],
  ['spain', 'spain'],
  ['barcelona', 'spain'],
  ['madrid', 'spain'],
  ['seville', 'spain'],
  ['portugal', 'portugal'],
  ['lisbon', 'portugal'],
  ['porto', 'portugal'],
  ['algarve', 'portugal'],
  ['faro', 'portugal'],
  ['italy', 'italy'],
  ['rome', 'italy'],
  ['florence', 'italy'],
  ['venice', 'italy'],
  ['milan', 'italy'],
  ['iceland', 'iceland'],
  ['reykjavik', 'iceland'],
  ['finland', 'finland'],
  ['sweden', 'sweden'],
  ['stockholm', 'sweden'],
  ['denmark', 'denmark'],
  ['copenhagen', 'denmark'],
  ['helsinki', 'finland'],
  ['rovaniemi', 'finland'],
  ['turku', 'finland'],
  ['oulu', 'finland'],
  ['germany', 'germany'],
  ['berlin', 'germany'],
  ['prague', 'prague'],
  ['czech republic', 'prague'],
  ['czechia', 'prague'],
  ['budapest', 'budapest'],
  ['hungary', 'budapest'],
  ['vienna', 'salzburg'],
  ['south korea', 'seoul'],
  ['hong kong', 'hong-kong'],
  ['mount abu', 'mount-abu'],
  ['bandar seri begawan', 'bandar-seri-begawan'],
  ['antigua guatemala', 'antigua-guatemala'],
  ['bosnia and herzegovina', 'sarajevo'],
  ['north macedonia', 'skopje'],
  ['kuala lumpur', 'kuala-lumpur'],
  ['phnom penh', 'phnom-penh'],
  ['tamil nadu', 'chennai'],
  ['tamilnadu', 'chennai'],
  ['south pacific', 'apia'],
  ['himachal pradesh', 'shimla'],
  ['himachal', 'shimla'],
  ['kashmir', 'srinagar'],
  ['kerala', 'kochi'],
  ['rajasthan', 'jaipur'],
  ['southern escapes', 'madurai'],
  ['spiti valley', 'kaza'],
  ['bolivia', 'la-paz'],
  ['macau', 'macau'],
  ['korea', 'seoul'],
  ['taiwan', 'taipei'],
  ['china', 'beijing'],
  ['japan', 'tokyo'],
  ['oman', 'muscat'],
  ['rwanda', 'kigali'],
  ['uganda', 'kampala'],
  ['namibia', 'windhoek'],
  ['botswana', 'gaborone'],
  ['madagascar', 'antananarivo'],
  ['bhutan', 'thimphu'],
  ['nepal', 'kathmandu'],
  ['sri lanka', 'colombo'],
  ['malaysia', 'kuala-lumpur'],
  ['vietnam', 'hanoi'],
  ['cambodia', 'phnom-penh'],
  ['indonesia', 'denpasar'],
  ['bali', 'denpasar'],
  ['laos', 'vientiane'],
  ['bangladesh', 'dhaka'],
  ['azerbaijan', 'baku'],
  ['kazakhstan', 'almaty'],
  ['albania', 'tirana'],
  ['philippines', 'manila'],
  ['armenia', 'yerevan'],
  ['maldives', 'male'],
  ['georgia', 'tbilisi'],
  ['uzbekistan', 'samarkand'],
  ['kyrgyzstan', 'bishkek'],
  ['brunei', 'bandar-seri-begawan'],
  ['tajikistan', 'dushanbe'],
  ['mongolia', 'ulaanbaatar'],
  ['thailand', 'bangkok'],
  ['pattaya', 'pattaya'],
  ['singapore', 'singapore'],
  ['montenegro', 'kotor'],
  ['bosnia', 'sarajevo'],
  ['moldova', 'chisinau'],
  ['romania', 'bucharest'],
  ['jordan', 'amman'],
  ['morocco', 'marrakesh'],
  ['kenya', 'nairobi'],
  ['tanzania', 'arusha'],
  ['ghana', 'accra'],
  ['senegal', 'dakar'],
  ['zambia', 'livingstone'],
  ['samoa', 'apia'],
  ['vanuatu', 'port-vila'],
  ['guyana', 'georgetown'],
  ['suriname', 'paramaribo'],
  ['paraguay', 'asuncion'],
  ['ecuador', 'quito'],
  ['guatemala', 'antigua-guatemala'],
  ['manali', 'manali'],
  ['kaza', 'kaza'],
  ['shimla', 'shimla'],
  ['srinagar', 'srinagar'],
  ['kochi', 'kochi'],
  ['jaipur', 'jaipur'],
  ['chennai', 'chennai'],
  ['madurai', 'madurai'],
  ['netherlands', 'amsterdam'],
  ['holland', 'amsterdam'],
  ['france', 'paris'],
  ['austria', 'salzburg'],
  ['belgium', 'belgium'],
  ['amsterdam', 'amsterdam'],
  ['paris', 'paris'],
  ['salzburg', 'salzburg'],
];

const normalize = (value: string | null | undefined): string =>
  ` ${(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;

const isFestivalSpecial = (category: string): boolean => {
  const normalizedCategory = normalize(category);
  return normalizedCategory === ' festival '
    || normalizedCategory.includes(' festival special ');
};

const findCityImage = (title: string, destination: string): ResolvedTripImage | undefined => {
  const searchableText = normalize(`${destination} ${title}`);
  let match: { index: number; termLength: number; city: string } | undefined;

  for (const [term, city] of titleAliases) {
    const index = searchableText.indexOf(normalize(term).trim());
    if (index >= 0 && (!match || index < match.index || (index === match.index && term.length > match.termLength))) {
      match = { index, termLength: term.length, city };
    }
  }

  if (!match) return undefined;
  if (match.city === 'kochi') return { src: '/trip-thumbnails/kerala.jpg' };
  if (match.city === 'amsterdam') return { src: '/optimized/amster1.webp' };
  if (match.city === 'salzburg') return { src: '/optimized/salzburg1.webp' };
  if (match.city === 'belgium') return { src: '/trip-thumbnails/belgium.jpg' };
  if (match.city === 'paris') return { src: '/trip-thumbnails/paris.jpg' };

  const credit = TRIP_CITY_IMAGE_CREDITS[match.city];
  return credit ? { src: credit.asset, credit } : undefined;
};

const isPlaceholderImage = (image: string): boolean =>
  /\/pkg\d+\.(?:png|webp)(?:[?#].*)?$/i.test(image)
  || /images\.pexels\.com\/photos\/(?:1371360|8185807)\//i.test(image);

export const resolveTripThumbnail = (
  title: string,
  destination: string,
  category: string,
  images: string[] | undefined,
  fallbackImage: string
): ResolvedTripImage => {
  if (normalize(category) === ' europe ') {
    return { src: '/europa.png' };
  }

  return resolveTripImage(title, destination, category, images, fallbackImage);
};

export const resolveTripImage = (
  title: string,
  destination: string,
  category: string,
  images: string[] | undefined,
  fallbackImage: string
): ResolvedTripImage => {
  const normalizedTitle = normalize(title);
  if (normalizedTitle.includes(' bavarian castles ') && normalizedTitle.includes(' venetian canals ')) {
    return {
      src: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
    };
  }

  const existingImage = images?.find(Boolean);
  if (isFestivalSpecial(category)) return { src: existingImage || fallbackImage };
  if (existingImage && !isPlaceholderImage(existingImage)) {
    const credit = Object.values(TRIP_CITY_IMAGE_CREDITS).find((item) => item.asset === existingImage);
    return { src: existingImage, credit };
  }
  if (normalizedTitle.includes(' kerala ') || normalizedTitle.includes(' kerela ')) {
    return { src: '/trip-thumbnails/kerala.jpg' };
  }
  const cityImage = findCityImage(title, destination);
  if (cityImage) return cityImage;
  if (normalize(category) === ' wildlife ') {
    return {
      src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    };
  }
  return { src: existingImage || fallbackImage };
};
