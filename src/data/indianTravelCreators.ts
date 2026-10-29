import importedCreators from './importedTravelCreators.json';

export interface IndianTravelCreator {
  name: string;
  handle: string;
  location: string;
  specialty: string;
  followers: string;
  followersCount: number;
  followersCheckedOn?: string;
  avatarUrl?: string;
  profileUrl: string;
}

const existingCreators: IndianTravelCreator[] = [
  {
    name: 'Anuradha Goyal',
    handle: '@anuradhagoyal',
    location: 'Bengaluru, India',
    specialty: 'Travel writing and cultural stories',
    followers: '29K',
    followersCount: 29000,
    followersCheckedOn: 'October 28, 2026',
    profileUrl: 'https://www.instagram.com/anuradhagoyal/',
  },
  {
    name: 'Lakshmi Sharath',
    handle: '@lakshmisharath',
    location: 'India',
    specialty: 'Travel stories and destination guides',
    followers: '14K',
    followersCount: 14000,
    followersCheckedOn: 'October 28, 2026',
    profileUrl: 'https://www.instagram.com/lakshmisharath/',
  },
  {
    name: 'Seema Gurnani',
    handle: '@pandareviewz',
    location: 'India',
    specialty: 'Food and travel stories',
    followers: '24.8K',
    followersCount: 24800,
    followersCheckedOn: 'October 28, 2026',
    profileUrl: 'https://www.instagram.com/pandareviewz/',
  },
  {
    name: 'Isha',
    handle: '@dawn.traveler',
    location: 'Bengaluru, India',
    specialty: 'Travel, fashion and lifestyle',
    followers: '15.2K',
    followersCount: 15200,
    followersCheckedOn: 'October 28, 2026',
    profileUrl: 'https://www.instagram.com/dawn.traveler/',
  },
  {
    name: 'Karthik Murali H',
    handle: '@hkmurali',
    location: 'India',
    specialty: 'Travel stories',
    followers: '28.3K',
    followersCount: 28300,
    followersCheckedOn: 'October 28, 2026',
    profileUrl: 'https://www.instagram.com/hkmurali/',
  },
];

const importedCreatorList: IndianTravelCreator[] = importedCreators.map((creator) => {
  const locationParts = creator.location
    .split(', ')
    .filter((part, index, parts) => index === 0 || part !== parts[index - 1]);

  return {
    name: creator.name,
    handle: `@${creator.instagram_id}`,
    location: locationParts.join(', ') || 'India',
    specialty: 'Travel creator',
    followers: new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(creator.followers),
    followersCount: creator.followers,
    avatarUrl: creator.avatar_url,
    profileUrl: `https://www.instagram.com/${creator.instagram_id}/`,
  };
});

const creatorsByHandle = new Map<string, IndianTravelCreator>();
for (const creator of [...importedCreatorList, ...existingCreators]) {
  const normalizedHandle = creator.handle.toLowerCase();
  if (!creatorsByHandle.has(normalizedHandle)) {
    creatorsByHandle.set(normalizedHandle, creator);
  }
}

export const INDIAN_TRAVEL_CREATORS = [...creatorsByHandle.values()];
