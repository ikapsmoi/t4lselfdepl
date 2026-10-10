import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './india-tours.css';
import {
  INDIA_DESTINATIONS,
  INDIA_JOURNEY_CONCEPTS,
  JOURNEY_CATEGORIES,
  getJourneysMatchingDestination,
  type IndiaDestination,
  type IndiaJourneyConcept,
} from './catalog.mjs';
import { createIndiaEnquiryMessage } from './enquiry.mjs';
import { trackContactEvent } from '../utils/analytics';
import {
  getTravel4LifeContactContext,
  getTravel4LifeWhatsAppUrl,
  TRAVEL4LIFE_CONTACT,
} from '../utils/travel4lifeContact.js';

const requiredElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`India tours page is missing required element #${id}.`);
  return element as T;
};

const journeyById = new Map(INDIA_JOURNEY_CONCEPTS.map((journey) => [journey.id, journey]));
const mapElement = requiredElement<HTMLDivElement>('india-map');
const mapStatus = requiredElement<HTMLParagraphElement>('map-status');
const categoryButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-category]')];
const journeyCards = [...document.querySelectorAll<HTMLElement>('[data-journey-id]')];
const explorerLayout = requiredElement<HTMLDivElement>('explorer-layout');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const analyticsContext = (journey?: IndiaJourneyConcept, city?: string) => getTravel4LifeContactContext({
  pageType: 'india-tours',
  destination: 'India',
  city,
  package: journey?.name,
  entity: journey?.id || city || 'india-tours',
});
const track = (eventName: string, journey?: IndiaJourneyConcept, city?: string) => {
  void trackContactEvent(eventName, analyticsContext(journey, city));
};

let selectedCategory = 'all';
let selectedJourney = journeyById.get('golden-triangle');
if (!selectedJourney) throw new Error('The initial Golden Triangle route concept is missing from the journey catalogue.');
let selectedStopIndex = 0;
let selectedDestination: string | null = null;
let routeTimer: number | null = null;
let routeLines: L.Polyline[] = [];

const map = L.map(mapElement, {
  center: [22.5, 79.3],
  zoom: 4,
  minZoom: 3,
  maxZoom: 12,
  scrollWheelZoom: false,
  zoomControl: true,
});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
  crossOrigin: true,
}).addTo(map);

let routeStopMarkers: L.Marker[] = [];

const markerIcon = (
  destination: IndiaDestination,
  stopNumber?: number,
  isStart = false,
  isEnd = false,
  isCurrent = false,
  occurrence = 0,
) => {
  const classNames = [
    'india-map-marker',
    stopNumber ? 'india-map-marker--route' : 'india-map-marker--place',
    isStart ? 'is-start' : '',
    isEnd ? 'is-end' : '',
    isCurrent ? 'is-current' : '',
  ].filter(Boolean).join(' ');
  const label = stopNumber ? `<span>${stopNumber}</span>` : '<span aria-hidden="true"></span>';
  return L.divIcon({
    className: 'india-map-marker-wrap',
    html: `<span class="${classNames}">${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17 + occurrence * 23, 17],
    tooltipAnchor: [0, -18],
  });
};

const getJourneyStops = (journey: IndiaJourneyConcept) => journey.route_stops;
const setCurrentStop = (index: number, panToStop = false) => {
  const journey = selectedJourney;
  if (!journey) return;
  selectedStopIndex = Math.max(0, Math.min(index, journey.route_stops.length - 1));
  document.querySelectorAll<HTMLButtonElement>('#itinerary-list button').forEach((button, buttonIndex) => {
    if (buttonIndex === selectedStopIndex) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  if (panToStop) {
    const stop = journey.route_stops[selectedStopIndex];
    map.flyTo(stop.coordinates, Math.max(map.getZoom(), 6), { duration: reducedMotion.matches ? 0 : 0.5 });
  }
  journey.route_stops.forEach((stop, index) => {
    const marker = routeStopMarkers[index];
    if (marker) marker.setIcon(markerIcon(
      stop,
      index + 1,
      index === 0,
      index === journey.route_stops.length - 1,
      index === selectedStopIndex,
      index > 0 && journey.route_stops[index - 1].id === stop.id ? 1 : 0,
    ));
  });
};

const clearRouteTimer = () => {
  if (routeTimer !== null) {
    window.clearInterval(routeTimer);
    routeTimer = null;
  }
  requiredElement<HTMLButtonElement>('route-pause').disabled = true;
};

const clearRouteLines = () => {
  routeLines.forEach((line) => line.remove());
  routeLines = [];
};

const showRouteProgress = (journey: IndiaJourneyConcept, lastVisibleSegment: number, updateActiveStop = true) => {
  clearRouteLines();
  const stops = getJourneyStops(journey);
  for (let index = 0; index < Math.min(lastVisibleSegment + 1, stops.length - 1); index += 1) {
    routeLines.push(L.polyline(
      [stops[index].coordinates, stops[index + 1].coordinates],
      { color: '#a66635', weight: 4, opacity: 0.86, dashArray: '5 7', lineCap: 'round' },
    ).addTo(map));
  }
  routeStopMarkers.forEach((marker, index) => {
    marker.setOpacity(index <= lastVisibleSegment + 1 ? 1 : 0.38);
  });
  if (updateActiveStop && lastVisibleSegment >= 0) setCurrentStop(lastVisibleSegment + 1, true);
};

const showFullRoute = (fit = false) => {
  clearRouteTimer();
  const journey = selectedJourney;
  if (!journey) return;
  showRouteProgress(journey, journey.route_stops.length - 1, false);
  setCurrentStop(Math.min(selectedStopIndex, journey.route_stops.length - 1));
  if (fit) fitCurrentRoute();
};

function fitCurrentRoute() {
  const journey = selectedJourney;
  if (!journey) return;
  const points = journey.route_stops.map(({ coordinates }) => L.latLng(coordinates[0], coordinates[1]));
  if (points.length === 1) map.setView(points[0], 7);
  else map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 7 });
}

const playRoute = (restart = false) => {
  clearRouteTimer();
  const journey = selectedJourney;
  if (!journey) return;
  track('india_tours_route_play', journey);
  if (reducedMotion.matches) {
    showFullRoute(true);
    return;
  }
  if (restart || selectedStopIndex >= journey.route_stops.length - 1) {
    selectedStopIndex = 0;
    showRouteProgress(journey, -1);
    setCurrentStop(0);
    map.flyTo(journey.route_stops[0].coordinates, 6, { duration: 0.35 });
  }
  requiredElement<HTMLButtonElement>('route-pause').disabled = false;
  let lastSegment = restart ? -1 : Math.max(-1, selectedStopIndex - 1);
  routeTimer = window.setInterval(() => {
    lastSegment += 1;
    showRouteProgress(journey, lastSegment);
    if (lastSegment >= journey.route_stops.length - 1) clearRouteTimer();
  }, 850);
};

INDIA_DESTINATIONS.forEach((destination) => {
  const marker = L.marker(destination.coordinates, {
    title: `${destination.name} — show route ideas`,
    alt: `${destination.name} destination marker`,
    keyboard: true,
    icon: markerIcon(destination),
  });
  marker.bindTooltip(destination.name, { direction: 'top', opacity: 0.96 });
  marker.on('click', () => showDestinationOptions(destination));
  marker.addTo(map);
});

map.on('tileerror', () => {
  mapStatus.textContent = 'Map tiles are temporarily unavailable. The route, destination list and itinerary remain available below.';
  mapStatus.classList.add('is-warning');
});
map.on('tileload', () => {
  mapStatus.textContent = 'Map route lines are schematic, not navigation directions. Transport modes and journey times are not verified.';
  mapStatus.classList.remove('is-warning');
});

const renderItinerary = (journey: IndiaJourneyConcept) => {
  requiredElement<HTMLHeadingElement>('map-journey-name').textContent = journey.name;
  requiredElement<HTMLHeadingElement>('itinerary-title').textContent = journey.name;
  requiredElement<HTMLParagraphElement>('journey-summary').textContent = journey.short_description;
  requiredElement<HTMLParagraphElement>('journey-category').textContent = `${JOURNEY_CATEGORIES.find(({ id }) => id === journey.category)?.label || 'India'} · route idea`;
  requiredElement<HTMLElement>('journey-duration').textContent = journey.duration_days;
  requiredElement<HTMLElement>('journey-endpoints').textContent = `${journey.starting_city} → ${journey.ending_city}`;
  requiredElement<HTMLInputElement>('selected-journey-id').value = journey.id;

  const routeStops = requiredElement<HTMLOListElement>('route-stop-list');
  routeStops.replaceChildren(...journey.itinerary.map(({ destination, stop_number }) => {
    const item = document.createElement('li');
    item.textContent = `${destination} (stop ${stop_number})`;
    return item;
  }));

  const itinerary = requiredElement<HTMLOListElement>('itinerary-list');
  itinerary.replaceChildren(...journey.itinerary.map((stop, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.stopIndex = String(index);
    button.setAttribute('aria-label', `Focus ${stop.destination}, route stop ${stop.stop_number}`);
    const number = document.createElement('span');
    number.textContent = String(stop.stop_number).padStart(2, '0');
    const name = document.createElement('strong');
    name.textContent = stop.destination;
    const description = document.createElement('span');
    description.className = 'stop-description';
    description.textContent = 'Illustrative route stop';
    button.append(number, name, description);
    button.addEventListener('click', () => {
      clearRouteTimer();
      setCurrentStop(index, true);
      track('india_tours_itinerary_open', journey, stop.destination);
    });
    item.append(button);
    return item;
  }));

  requiredElement<HTMLButtonElement>('itinerary-quote').dataset.journeyId = journey.id;
};

const renderSelectedJourney = (journey: IndiaJourneyConcept, trackSelection = true) => {
  clearRouteTimer();
  selectedJourney = journey;
  selectedStopIndex = 0;
  routeStopMarkers.forEach((marker) => marker.remove());
  const occurrenceCounts = new Map<string, number>();
  routeStopMarkers = journey.route_stops.map((stop, index) => {
    const occurrence = occurrenceCounts.get(stop.id) || 0;
    occurrenceCounts.set(stop.id, occurrence + 1);
    const marker = L.marker(stop.coordinates, {
      title: `Stop ${index + 1}: ${stop.name} — show route ideas`,
      alt: `Route stop ${index + 1}: ${stop.name}`,
      keyboard: true,
      riseOnHover: true,
      icon: markerIcon(
        stop,
        index + 1,
        index === 0,
        index === journey.route_stops.length - 1,
        index === 0,
        occurrence,
      ),
    });
    marker.bindTooltip(`Stop ${index + 1}: ${stop.name}`, { direction: 'top', opacity: 0.96 });
    marker.on('click', () => {
      setCurrentStop(index, true);
      showDestinationOptions(stop);
    });
    marker.addTo(map);
    return marker;
  });
  renderItinerary(journey);
  journeyCards.forEach((card) => {
    const selected = card.dataset.journeyId === journey.id;
    card.classList.toggle('is-selected', selected);
    const button = card.querySelector<HTMLButtonElement>('[data-select-journey]');
    if (button) button.setAttribute('aria-pressed', String(selected));
  });
  showFullRoute(true);
  if (trackSelection) track('india_tours_package_select', journey);
};

const applyFilters = () => {
  let visibleCount = 0;
  journeyCards.forEach((card) => {
    const journey = journeyById.get(card.dataset.journeyId || '');
    const categoryMatches = selectedCategory === 'all' || journey?.category === selectedCategory;
    const destinationMatches = !selectedDestination || journey?.route_stops.some(({ name }) => name === selectedDestination);
    const visible = Boolean(categoryMatches && destinationMatches);
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  requiredElement<HTMLParagraphElement>('filter-empty').hidden = visibleCount > 0;
};

const showDestinationOptions = (destination: IndiaDestination) => {
  selectedDestination = destination.name;
  const options = getJourneysMatchingDestination(destination.name)
    .filter(({ category }) => selectedCategory === 'all' || category === selectedCategory);
  const results = requiredElement<HTMLDivElement>('destination-results');
  const heading = document.createElement('h4');
  heading.textContent = `Route ideas including ${destination.name}`;
  const description = document.createElement('p');
  description.textContent = options.length
    ? 'Select an idea to explore it. Choosing a marker will not select a journey or open WhatsApp.'
    : 'No route ideas match the active category filter. Choose All Journeys to see other options.';
  const list = document.createElement('div');
  list.className = 'destination-option-list';
  options.forEach((journey) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'destination-option';
    button.textContent = `${journey.name} · ${journey.duration_days}`;
    button.addEventListener('click', () => {
      renderSelectedJourney(journey);
      results.hidden = true;
      requiredElement<HTMLDivElement>('explorer-layout').dataset.mobileView = 'itinerary';
      document.querySelector('[data-mobile-view="itinerary"]')?.setAttribute('aria-pressed', 'true');
      document.querySelector('[data-mobile-view="map"]')?.setAttribute('aria-pressed', 'false');
    });
    list.append(button);
  });
  results.replaceChildren(heading, description, list);
  results.hidden = false;
  applyFilters();
  track('india_tours_map_select', undefined, destination.name);
};

categoryButtons.forEach((button) => button.addEventListener('click', () => {
  selectedCategory = button.dataset.category || 'all';
  categoryButtons.forEach((candidate) => {
    const active = candidate === button;
    candidate.classList.toggle('is-active', active);
    candidate.setAttribute('aria-pressed', String(active));
  });
  applyFilters();
  if (selectedDestination) {
    const destination = INDIA_DESTINATIONS.find(({ name }) => name === selectedDestination);
    if (destination) showDestinationOptions(destination);
  }
}));

journeyCards.forEach((card) => {
  const journey = journeyById.get(card.dataset.journeyId || '');
  if (!journey) throw new Error(`Journey card does not match the route catalogue: ${card.dataset.journeyId || '(empty)'}`);
  const button = card.querySelector<HTMLButtonElement>('[data-select-journey]');
  if (!button) throw new Error(`Journey card is missing its route selection button: ${journey.id}`);
  button.addEventListener('click', () => renderSelectedJourney(journey));
});

requiredElement<HTMLButtonElement>('fit-route').addEventListener('click', fitCurrentRoute);
requiredElement<HTMLButtonElement>('route-play').addEventListener('click', () => playRoute());
requiredElement<HTMLButtonElement>('route-pause').addEventListener('click', clearRouteTimer);
requiredElement<HTMLButtonElement>('route-replay').addEventListener('click', () => playRoute(true));
requiredElement<HTMLButtonElement>('route-full').addEventListener('click', () => showFullRoute(true));

document.querySelectorAll<HTMLButtonElement>('[data-mobile-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.mobileView;
    if (view !== 'map' && view !== 'itinerary') return;
    explorerLayout.dataset.mobileView = view;
    document.querySelectorAll<HTMLButtonElement>('[data-mobile-view]').forEach((candidate) => {
      candidate.setAttribute('aria-pressed', String(candidate === button));
    });
    if (view === 'map') window.setTimeout(() => map.invalidateSize(), 50);
  });
});

requiredElement<HTMLButtonElement>('itinerary-quote').addEventListener('click', () => {
  track('india_tours_quote_click', selectedJourney);
});

const enquiryForm = requiredElement<HTMLFormElement>('india-enquiry-form');
let formStarted = false;
enquiryForm.addEventListener('input', () => {
  if (formStarted) return;
  formStarted = true;
  track('lead_form_start', selectedJourney);
});
enquiryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = requiredElement<HTMLInputElement>('traveller-name').value.trim();
  const email = requiredElement<HTMLInputElement>('traveller-email').value.trim();
  const countText = requiredElement<HTMLInputElement>('traveller-count').value;
  const count = Number(countText);
  const error = requiredElement<HTMLParagraphElement>('form-error');
  const invalidField = !name
    ? requiredElement<HTMLInputElement>('traveller-name')
    : !email || !requiredElement<HTMLInputElement>('traveller-email').validity.valid
      ? requiredElement<HTMLInputElement>('traveller-email')
      : !Number.isInteger(count) || count < 1 || count > 40
        ? requiredElement<HTMLInputElement>('traveller-count')
        : null;
  if (invalidField) {
    error.textContent = invalidField === requiredElement<HTMLInputElement>('traveller-name')
      ? 'Please enter your name.'
      : invalidField === requiredElement<HTMLInputElement>('traveller-email')
        ? 'Please enter a valid email address.'
        : 'Please enter a whole number of travellers from 1 to 40.';
    error.hidden = false;
    invalidField.focus();
    track('lead_form_error', selectedJourney);
    return;
  }

  const journey = selectedJourney;
  if (!journey) throw new Error('A route concept must be selected before preparing an enquiry.');
  const { message } = createIndiaEnquiryMessage({
    journey,
    travellerName: name,
    travellerEmail: email,
    travellerCount: count,
    travelDates: requiredElement<HTMLInputElement>('travel-dates').value,
    budget: requiredElement<HTMLSelectElement>('travel-budget').value,
    accommodation: requiredElement<HTMLSelectElement>('accommodation').value,
  });
  const whatsappLink = requiredElement<HTMLAnchorElement>('whatsapp-draft');
  const emailLink = requiredElement<HTMLAnchorElement>('email-draft');
  const subject = `India trip enquiry: ${journey.name}`;
  const contact = getTravel4LifeContactContext({
    pageType: 'india-tours',
    destination: 'India',
    package: journey.name,
    entity: journey.id,
  });
  whatsappLink.href = getTravel4LifeWhatsAppUrl(contact, message);
  emailLink.href = `mailto:${TRAVEL4LIFE_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  requiredElement<HTMLDivElement>('draft-actions').hidden = false;
  error.hidden = true;
  track('lead_form_draft_prepared', journey);
});

['direct-whatsapp', 'whatsapp-draft'].forEach((id) => {
  requiredElement<HTMLAnchorElement>(id).addEventListener('click', () => {
    track('contact_whatsapp_click', selectedJourney);
    track('india_tours_quote_click', selectedJourney);
  });
});
['direct-email', 'email-draft'].forEach((id) => {
  requiredElement<HTMLAnchorElement>(id).addEventListener('click', () => track('contact_email_click', selectedJourney));
});
requiredElement<HTMLAnchorElement>('direct-phone').addEventListener('click', () => track('contact_phone_click', selectedJourney));

const highlights = document.getElementById('hero-highlights');
const highlightsToggle = document.getElementById('highlights-toggle');
if (!(highlights instanceof HTMLDivElement) || !(highlightsToggle instanceof HTMLButtonElement)) {
  throw new Error('India tours page is missing the highlights animation controls.');
}
const reducedMotionForHighlights = window.matchMedia('(prefers-reduced-motion: reduce)');
const syncHighlightsControl = () => {
  highlightsToggle.hidden = reducedMotionForHighlights.matches;
  if (reducedMotionForHighlights.matches) {
    highlights.classList.remove('is-paused');
    highlightsToggle.setAttribute('aria-pressed', 'false');
    highlightsToggle.textContent = 'Pause highlights';
  }
};
highlightsToggle.addEventListener('click', () => {
  const paused = highlights.classList.toggle('is-paused');
  highlightsToggle.setAttribute('aria-pressed', String(paused));
  highlightsToggle.textContent = paused ? 'Play highlights' : 'Pause highlights';
});
reducedMotionForHighlights.addEventListener('change', syncHighlightsControl);
syncHighlightsControl();

window.addEventListener('pagehide', clearRouteTimer, { once: true });
renderSelectedJourney(selectedJourney, false);
mapStatus.textContent = 'Map route lines are schematic, not navigation directions. Transport modes and journey times are not verified.';
track('india_tours_page_view');
