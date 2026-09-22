const siteUrl = 'https://travel4life.com/';
const defaultImage = `${siteUrl}/findyourtribe1.jpg`;

type SeoConfig = {
  title: string;
  description: string;
  indexable: boolean;
};

const publicPages: Record<string, SeoConfig> = {
  home: {
    title: 'Travel4life | Group Adventures, Festival Trips and Hosted Travel',
    description: 'Discover curated group adventures, music festival trips, creator journeys and India experiences with Travel4life.',
    indexable: true,
  },
  trips: {
    title: 'Group Adventure Trips and Travel Experiences | Travel4life',
    description: 'Browse Travel4life group adventures, themed journeys, festival trips and cultural experiences hosted by the community.',
    indexable: true,
  },
  'creator-trips': {
    title: 'Creator-Led Group Trips | Travel4life',
    description: 'Explore creator-led group trips and travel experiences from Travel4life hosts and travel creators.',
    indexable: true,
  },
  'how-it-works': {
    title: 'How Travel4life Group Travel Works',
    description: 'Learn how to discover trips, meet fellow travelers, book experiences and host adventures with Travel4life.',
    indexable: true,
  },
  safety: {
    title: 'Safety and Trust for Group Travel | Travel4life',
    description: 'Learn about Travel4life safety tools, host verification and support for group travel experiences.',
    indexable: true,
  },
  reviews: {
    title: 'Traveler Reviews and Experiences | Travel4life',
    description: 'Read traveler reviews and community experiences from Travel4life group trips and adventures.',
    indexable: true,
  },
  stories: {
    title: 'Travel Stories and Adventures | Travel4life',
    description: 'Read stories from the Travel4life community and discover inspiration for your next group adventure.',
    indexable: true,
  },
  blog: {
    title: 'Travel Guides and Advice | Travel4life',
    description: 'Explore Travel4life travel advice, destination ideas and useful guides for planning group adventures.',
    indexable: true,
  },
  about: {
    title: 'About Travel4life | Group Travel Community',
    description: 'Learn about Travel4life and our community for curated group adventures and hosted travel experiences.',
    indexable: true,
  },
  help: {
    title: 'Travel4life Help Center',
    description: 'Find answers and support for using Travel4life, booking trips and joining group travel experiences.',
    indexable: true,
  },
  careers: {
    title: 'Careers at Travel4life',
    description: 'Explore career opportunities with Travel4life and help build better group travel experiences.',
    indexable: true,
  },
  terms: {
    title: 'Terms of Service | Travel4life',
    description: 'Read the Travel4life terms of service for using the platform and its travel experiences.',
    indexable: true,
  },
  privacy: {
    title: 'Privacy Policy | Travel4life',
    description: 'Read how Travel4life handles information when you use the platform and its services.',
    indexable: true,
  },
};

const privatePages = new Set(['host-dashboard', 'traveler-dashboard', 'admin-dashboard']);

const upsertMeta = (selector: string, attributes: Record<string, string>, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const updateLink = (rel: string, href: string | null) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
};

export const updateSeoForPage = (page: string) => {
  const normalizedPage = page.split('?')[0] || 'home';
  const config = publicPages[normalizedPage] || {
    title: 'Travel4life | Group Adventures and Hosted Travel',
    description: 'Discover group adventures and hosted travel experiences with Travel4life.',
    indexable: false,
  };
  const isPrivate = privatePages.has(normalizedPage);
  // Hash routes do not create distinct crawlable documents. Only the root document
  // can be indexed safely; all other views share its canonical URL.
  const indexable = normalizedPage === 'home' && config.indexable && !isPrivate;

  document.title = config.title;
  upsertMeta('meta[name="description"]', { name: 'description' }, config.description);
  upsertMeta('meta[name="robots"]', { name: 'robots' }, indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, config.title);
  upsertMeta('meta[property="og:description"]', { property: 'og:description' }, config.description);
  upsertMeta('meta[property="og:url"]', { property: 'og:url' }, siteUrl);
  upsertMeta('meta[property="og:image"]', { property: 'og:image' }, defaultImage);
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, config.title);
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, config.description);
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, defaultImage);
  updateLink('canonical', siteUrl);
};