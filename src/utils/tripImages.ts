import { TRIP_CITY_IMAGE_CREDITS, type TripCityImageCredit } from './tripCityImageCredits';

export interface ResolvedTripImage {
  src: string;
  credit?: TripCityImageCredit;
}

const titleAliases: Array<readonly [string, string]> = [
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
  ['amsterdam', 'amsterdam'],
  ['paris', 'paris'],
  ['salzburg', 'salzburg'],
];

const normalize = (value: string): string =>
  ` ${value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;

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
  if (match.city === 'amsterdam') return { src: '/amster1.jpeg' };
  if (match.city === 'salzburg') return { src: '/salzburg1.jpeg' };

  const credit = TRIP_CITY_IMAGE_CREDITS[match.city];
  return credit ? { src: credit.asset, credit } : undefined;
};

const isPlaceholderImage = (image: string): boolean =>
  /\/pkg\d+\.png(?:[?#].*)?$/i.test(image)
  || /images\.pexels\.com\/photos\/(?:1371360|8185807)\//i.test(image);

export const resolveTripImage = (
  title: string,
  destination: string,
  category: string,
  images: string[] | undefined,
  fallbackImage: string
): ResolvedTripImage => {
  const existingImage = images?.find(Boolean);
  if (isFestivalSpecial(category)) return { src: existingImage || fallbackImage };
  const normalizedTitle = normalize(title);
  if (normalizedTitle.includes(' kerala ') || normalizedTitle.includes(' kerela ')) {
    return { src: '/trip-thumbnails/kerala.jpg' };
  }
  if (existingImage && !isPlaceholderImage(existingImage)) {
    const credit = Object.values(TRIP_CITY_IMAGE_CREDITS).find((item) => item.asset === existingImage);
    return { src: existingImage, credit };
  }
  return findCityImage(title, destination) || { src: existingImage || fallbackImage };
};
