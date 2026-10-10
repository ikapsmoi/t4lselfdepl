export const JOURNEY_CATEGORIES = [
  { id: 'all', label: 'All Journeys' },
  { id: 'heritage-culture', label: 'Heritage & Culture' },
  { id: 'wildlife-safari', label: 'Wildlife & Safari' },
  { id: 'mountains-adventure', label: 'Mountains & Adventure' },
  { id: 'beaches-islands', label: 'Beaches & Islands' },
  { id: 'nature-backwaters', label: 'Nature & Backwaters' },
  { id: 'luxury-extended', label: 'Luxury & Extended Journeys' },
];

export const INDIA_DESTINATIONS = [
  { id: 'delhi', name: 'Delhi', coordinates: [28.6139, 77.209] },
  { id: 'agra', name: 'Agra', coordinates: [27.1767, 78.0081] },
  { id: 'jaipur', name: 'Jaipur', coordinates: [26.9124, 75.7873] },
  { id: 'jodhpur', name: 'Jodhpur', coordinates: [26.2389, 73.0243] },
  { id: 'udaipur', name: 'Udaipur', coordinates: [24.5854, 73.7125] },
  { id: 'varanasi', name: 'Varanasi', coordinates: [25.3176, 82.9739] },
  { id: 'kochi', name: 'Kochi', coordinates: [9.9312, 76.2673] },
  { id: 'munnar', name: 'Munnar', coordinates: [10.0889, 77.0595] },
  { id: 'thekkady', name: 'Thekkady', coordinates: [9.6031, 77.1611] },
  { id: 'kumarakom', name: 'Kumarakom', coordinates: [9.6175, 76.4301] },
  { id: 'alleppey', name: 'Alleppey', coordinates: [9.4981, 76.3388] },
  { id: 'ranthambore', name: 'Ranthambore', coordinates: [26.0173, 76.5026] },
  { id: 'leh', name: 'Leh', coordinates: [34.1526, 77.5771] },
  { id: 'nubra-valley', name: 'Nubra Valley', coordinates: [34.687, 77.562] },
  { id: 'pangong-lake', name: 'Pangong Lake', coordinates: [33.7595, 78.6674] },
  { id: 'mumbai', name: 'Mumbai', coordinates: [19.076, 72.8777] },
  { id: 'goa', name: 'Goa', coordinates: [15.2993, 74.124] },
  { id: 'port-blair', name: 'Port Blair', coordinates: [11.6234, 92.7265] },
  { id: 'havelock-island', name: 'Havelock Island', coordinates: [12.0307, 92.9797] },
  { id: 'neil-island', name: 'Neil Island', coordinates: [11.8311, 93.0456] },
  { id: 'mandawa', name: 'Mandawa', coordinates: [28.0559, 75.148] },
  { id: 'bikaner', name: 'Bikaner', coordinates: [28.0229, 73.3119] },
  { id: 'jaisalmer', name: 'Jaisalmer', coordinates: [26.9157, 70.9083] },
];

const stopsFor = (names) => names.map((name) => {
  const destination = INDIA_DESTINATIONS.find((item) => item.name === name);
  if (!destination) throw new Error(`Journey references an unknown India destination: ${name}`);
  return destination;
});

const defineJourney = ({ id, name, category, shortDescription, duration, route }) => {
  const stops = stopsFor(route);
  return {
    id,
    slug: id,
    name,
    short_description: shortDescription,
    category,
    duration_days: duration,
    duration_nights: null,
    starting_city: stops[0].name,
    ending_city: stops.at(-1).name,
    route_stops: stops,
    itinerary: stops.map((stop, index) => ({
      stop_number: index + 1,
      destination: stop.name,
      description: 'Illustrative route stop only. Day-by-day timing, transport, overnight stays, activities and inclusions require confirmation.',
      activities: [],
      overnight_destination: null,
      transport_mode: null,
      estimated_travel_time: null,
      optional_activities: [],
      included_meals: null,
    })),
    coordinates: stops.map(({ coordinates }) => coordinates),
    inclusions: null,
    exclusions: null,
    accommodation_category: null,
    transport_details: null,
    price_status: 'quote_required',
    supplier_net_cost: null,
    supplier_currency: null,
    selling_price: null,
    selling_currency: null,
    pricing_basis: null,
    price_valid_until: null,
    availability_status: 'unverified',
    minimum_travellers: null,
    maximum_travellers: null,
    last_verified_at: null,
    source_reference: 'User-proposed route concept; no supplier inventory or operational details verified.',
    is_featured: false,
    is_active: false,
    approval_status: 'draft',
    seo_title: null,
    seo_description: null,
  };
};

export const INDIA_JOURNEY_CONCEPTS = [
  defineJourney({
    id: 'golden-triangle',
    name: 'Golden Triangle',
    category: 'heritage-culture',
    shortDescription: 'A north India route idea linking Delhi, Agra and Jaipur.',
    duration: '5–6 days',
    route: ['Delhi', 'Agra', 'Jaipur', 'Delhi'],
  }),
  defineJourney({
    id: 'golden-triangle-varanasi',
    name: 'Golden Triangle + Varanasi',
    category: 'heritage-culture',
    shortDescription: 'A heritage route concept with a Varanasi extension.',
    duration: '6–7 days',
    route: ['Delhi', 'Agra', 'Jaipur', 'Varanasi', 'Delhi'],
  }),
  defineJourney({
    id: 'royal-rajasthan',
    name: 'Royal Rajasthan',
    category: 'luxury-extended',
    shortDescription: 'A longer Rajasthan route concept through historic towns and cities.',
    duration: '10–12 days',
    route: ['Delhi', 'Mandawa', 'Bikaner', 'Jaisalmer', 'Jodhpur', 'Udaipur', 'Jaipur', 'Agra', 'Delhi'],
  }),
  defineJourney({
    id: 'golden-triangle-kerala',
    name: 'Golden Triangle + Kerala',
    category: 'nature-backwaters',
    shortDescription: 'A north-to-south route idea pairing heritage cities with Kerala landscapes.',
    duration: '12–14 days',
    route: ['Delhi', 'Agra', 'Jaipur', 'Kochi', 'Munnar', 'Thekkady', 'Kumarakom', 'Alleppey'],
  }),
  defineJourney({
    id: 'golden-triangle-mumbai-goa',
    name: 'Golden Triangle + Mumbai + Goa',
    category: 'beaches-islands',
    shortDescription: 'A multi-region route concept from north India to the west coast.',
    duration: '10–12 days',
    route: ['Delhi', 'Agra', 'Jaipur', 'Mumbai', 'Goa'],
  }),
  defineJourney({
    id: 'golden-triangle-ranthambore',
    name: 'Golden Triangle + Ranthambore',
    category: 'wildlife-safari',
    shortDescription: 'A heritage route concept with a wildlife-area extension; sightings are never guaranteed.',
    duration: '8–10 days',
    route: ['Delhi', 'Agra', 'Ranthambore', 'Jaipur', 'Delhi'],
  }),
  defineJourney({
    id: 'kerala-discovery',
    name: 'Kerala Discovery',
    category: 'nature-backwaters',
    shortDescription: 'A Kerala route idea through hill country and backwater destinations.',
    duration: '7–9 days',
    route: ['Kochi', 'Munnar', 'Thekkady', 'Kumarakom', 'Alleppey', 'Kochi'],
  }),
  defineJourney({
    id: 'ladakh-adventure',
    name: 'Ladakh Adventure',
    category: 'mountains-adventure',
    shortDescription: 'A high-altitude route concept; acclimatisation and local conditions need careful planning.',
    duration: '7–10 days',
    route: ['Leh', 'Nubra Valley', 'Pangong Lake', 'Leh'],
  }),
  defineJourney({
    id: 'andaman-islands',
    name: 'Andaman Islands',
    category: 'beaches-islands',
    shortDescription: 'An island-hopping route idea; boat schedules and permits require date-specific checks.',
    duration: '6–7 days',
    route: ['Port Blair', 'Havelock Island', 'Neil Island', 'Port Blair'],
  }),
  defineJourney({
    id: 'grand-india',
    name: 'Grand India',
    category: 'luxury-extended',
    shortDescription: 'An extended north-and-south route concept; routing and timing are not operationally verified.',
    duration: '14–18 days',
    route: ['Delhi', 'Agra', 'Jaipur', 'Varanasi', 'Kochi', 'Munnar', 'Thekkady', 'Alleppey'],
  }),
];

export const getApprovedActivePackages = (journeys = INDIA_JOURNEY_CONCEPTS) => journeys.filter((journey) => (
  journey.approval_status === 'approved'
  && journey.is_active === true
  && ['verified_price', 'quote_required'].includes(journey.price_status)
  && journey.availability_status === 'available'
));

export const getJourneysMatchingDestination = (destinationName, journeys = INDIA_JOURNEY_CONCEPTS) => journeys.filter(
  ({ route_stops }) => route_stops.some(({ name }) => name === destinationName),
);

export const validateJourneyCatalogue = (journeys = INDIA_JOURNEY_CONCEPTS) => {
  const failures = [];
  const ids = new Set();
  const slugs = new Set();
  const destinationIds = new Set(INDIA_DESTINATIONS.map(({ id }) => id));

  for (const journey of journeys) {
    if (!journey.id || ids.has(journey.id)) failures.push(`Missing or duplicate journey id: ${journey.id || '(empty)'}`);
    if (!journey.slug || slugs.has(journey.slug)) failures.push(`Missing or duplicate journey slug: ${journey.slug || '(empty)'}`);
    if (!JOURNEY_CATEGORIES.some(({ id }) => id === journey.category)) failures.push(`${journey.id}: unknown category.`);
    if (!journey.route_stops.length || journey.starting_city !== journey.route_stops[0].name) failures.push(`${journey.id}: route start does not match starting city.`);
    if (journey.ending_city !== journey.route_stops.at(-1)?.name) failures.push(`${journey.id}: route end does not match ending city.`);
    if (journey.coordinates.length !== journey.route_stops.length) failures.push(`${journey.id}: route coordinates and stops do not match.`);
    if (journey.route_stops.some(({ id, coordinates }) => (
      !destinationIds.has(id) || coordinates.length !== 2 || coordinates.some((value) => !Number.isFinite(value))
    ))) failures.push(`${journey.id}: route contains an invalid mapped stop.`);
    if (journey.itinerary.some(({ stop_number }, index) => stop_number !== index + 1)) failures.push(`${journey.id}: itinerary stops are not ordered.`);
    if (journey.price_status !== 'verified_price' && journey.selling_price !== null) failures.push(`${journey.id}: unverified price status must not contain a selling price.`);
    if (journey.approval_status !== 'approved' && journey.is_active) failures.push(`${journey.id}: an unapproved journey cannot be active.`);
    ids.add(journey.id);
    slugs.add(journey.slug);
  }
  return failures;
};
