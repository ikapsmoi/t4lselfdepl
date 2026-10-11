import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import type { Journey } from './types';

interface RouteMapProps {
  journey: Journey;
  onPlanJourney: () => void;
}

const stopImages: Record<string, string> = {
  Delhi: 'delhi',
  Agra: 'india',
  Jaipur: 'jaipur',
  Varanasi: 'varanasi',
  Mandawa: 'pushkar',
  Bikaner: 'jaipur',
  Jaisalmer: 'udaipur',
  Jodhpur: 'udaipur',
  Udaipur: 'udaipur',
  Kochi: 'kerala',
  Munnar: 'kerala',
  Thekkady: 'kerala',
  Kumarakom: 'kerala',
  Alleppey: 'kerala',
  Ranthambore: 'india',
  Leh: 'leh',
  'Nubra Valley': 'leh',
  'Pangong Lake': 'leh',
  Mumbai: 'mumbai',
  Goa: 'goa',
  'Port Blair': 'goa',
  'Havelock Island': 'goa',
  'Neil Island': 'goa',
};

const stopDescriptions: Record<string, string> = {
  Delhi: 'Explore a layered capital, from grand boulevards and historic quarters to its food and craft traditions.',
  Agra: 'Make time for the Taj Mahal and the Mughal-era landmarks that give this city its enduring sense of place.',
  Jaipur: 'Discover the Pink City’s palaces, lively bazaars and long-standing craft traditions.',
  Varanasi: 'Spend time beside the Ganges and discover one of India’s most storied cultural centres.',
  Mandawa: 'Look out for painted havelis and the quiet heritage of Shekhawati.',
  Bikaner: 'Explore desert-city architecture, old lanes and the character of north-west Rajasthan.',
  Jaisalmer: 'Discover golden sandstone streets on the edge of the Thar Desert.',
  Jodhpur: 'Take in blue-painted lanes and the dramatic setting of Mehrangarh Fort.',
  Udaipur: 'Slow down beside the lakes and palaces of Rajasthan’s romantic city.',
  Kochi: 'Explore a coastal city shaped by centuries of trade, culture and exchange.',
  Munnar: 'Take in the cool air, tea country and green highland scenery of the Western Ghats.',
  Thekkady: 'Make room for forest landscapes and the distinct flavours of Kerala’s hill country.',
  Kumarakom: 'Settle into the quieter rhythms of Kerala’s backwaters and lakeside villages.',
  Alleppey: 'Experience the canals, waterways and everyday life of the Keralan coast.',
  Ranthambore: 'Add time in a landscape of forests and historic ruins; wildlife sightings are never guaranteed.',
  Leh: 'Discover Ladakh’s high-altitude capital, with time to acclimatise and explore local culture.',
  'Nubra Valley': 'Travel through a striking high-altitude valley; road access and conditions need checking.',
  'Pangong Lake': 'See Ladakh’s celebrated mountain lake; permits and local conditions require confirmation.',
  Mumbai: 'Experience the contrast of colonial-era landmarks, neighbourhoods and a vibrant coastal city.',
  Goa: 'Balance time by the coast with Goa’s distinctive architecture, food and local culture.',
  'Port Blair': 'Begin an island journey with time to understand ferry schedules and local entry requirements.',
  'Havelock Island': 'Make space for island scenery and unhurried time by the sea.',
  'Neil Island': 'Enjoy a slower island stop, subject to boat schedules and seasonal conditions.',
};

const coordinatesForStops = (journey: Journey) => {
  const longitudes = journey.route_stops.map(({ coordinates }) => coordinates[1]);
  const latitudes = journey.route_stops.map(({ coordinates }) => coordinates[0]);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const longitudeSpan = Math.max(maxLongitude - minLongitude, 1);
  const latitudeSpan = Math.max(maxLatitude - minLatitude, 1);

  return journey.route_stops.map(({ coordinates }, index) => ({
    x: 12 + ((coordinates[1] - minLongitude) / longitudeSpan) * 76,
    y: 12 + ((maxLatitude - coordinates[0]) / latitudeSpan) * 76,
    index,
  }));
};

const RouteMap = ({ journey, onPlanJourney }: RouteMapProps) => {
  const [activeStop, setActiveStop] = useState(0);
  const points = useMemo(() => coordinatesForStops(journey), [journey]);
  const routePath = points.map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ');

  useEffect(() => {
    setActiveStop(0);
  }, [journey.id]);

  useEffect(() => {
    const stops = document.querySelectorAll<HTMLElement>('[data-route-stop]');
    if (!('IntersectionObserver' in window) || stops.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (visible) setActiveStop(Number((visible.target as HTMLElement).dataset.routeStop));
    }, { rootMargin: '-42% 0px -42% 0px', threshold: [0, 0.5, 1] });
    stops.forEach((stop) => observer.observe(stop));
    return () => observer.disconnect();
  }, [journey.id]);

  const selectedStop = journey.route_stops[activeStop] || journey.route_stops[0];

  return (
    <section id="route" className="scroll-mt-24 bg-[#f3f0e8] px-5 py-20 sm:px-8 sm:py-28 lg:px-12" aria-labelledby="route-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 max-w-[680px]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-champagne-dark">A journey, stop by stop</p>
          <h2 id="route-title" className="font-serif text-4xl font-medium tracking-tight text-forest-dark sm:text-5xl">See where the story takes you</h2>
          <p className="mt-4 text-sm leading-7 text-muted">Explore an illustrative route. Select a stop or scroll to see its place on the map.</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-16">
          <aside className="inbound-route-map top-24 self-start overflow-hidden rounded-sm bg-[#17372c] p-5 text-white shadow-xl sm:p-8 lg:sticky" aria-label={`Illustrative map for ${journey.name}`}>
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e3c59b]">Illustrative route · India</p>
                <h3 className="mt-2 font-serif text-2xl sm:text-3xl">{journey.name}</h3>
              </div>
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#e3c59b]" aria-hidden="true" />
            </div>
            <div className="relative mt-5 aspect-[1.4/1] overflow-hidden rounded-sm border border-white/10 bg-[radial-gradient(ellipse_at_center,_#315646_0%,_#17372c_72%)]">
              <div className="absolute inset-0 opacity-25" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#b9c8b2 0.7px, transparent 0.7px)', backgroundSize: '18px 18px' }} />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Schematic route connecting ${journey.route_stops.map(({ name }) => name).join(', ')}`}>
                <defs>
                  <linearGradient id="route-line" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ecd0a4" />
                    <stop offset="100%" stopColor="#dca866" />
                  </linearGradient>
                </defs>
                <path d={routePath} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.4" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                <path d={points.slice(0, activeStop + 1).map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ')} fill="none" stroke="url(#route-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {points.map(({ x, y, index }) => (
                  <g key={`${journey.route_stops[index].id}-${index}`} aria-hidden="true">
                    {index === activeStop && <circle cx={x} cy={y} r="5.2" fill="none" stroke="#f1d7af" strokeWidth="1.1" opacity=".75" />}
                    <circle cx={x} cy={y} r={index === activeStop ? '2.8' : '1.8'} fill={index <= activeStop ? '#f1d7af' : '#91a99b'} stroke="#17372c" strokeWidth="1.1" />
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] uppercase tracking-[.16em] text-white/55">
                <span>Route concept</span><span>Not to scale</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div aria-live="polite" aria-atomic="true">
                <p className="text-[10px] uppercase tracking-[.16em] text-white/55">Currently exploring</p>
                <p className="mt-1 font-serif text-xl text-[#f1d7af]">{selectedStop?.name}</p>
              </div>
              <a className="inline-flex items-center gap-2 text-xs font-semibold text-white/85 hover:text-[#f1d7af]" href="#plan">
                Plan this route <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <p className="mt-4 border-t border-white/15 pt-3 text-[10px] leading-5 text-white/55">Indicative route only. Daily schedules, transport, permits and availability need date-specific confirmation.</p>
          </aside>

          <div className="relative">
            <div className="absolute bottom-8 left-[19px] top-8 w-px bg-forest/15" aria-hidden="true" />
            <ol className="space-y-5" aria-label={`${journey.name} route stops`}>
              {journey.route_stops.map((stop, index) => (
                <li
                  className="relative scroll-mt-32 pl-12"
                  data-route-stop={index}
                  key={`${stop.id}-${index}`}
                  onMouseEnter={() => setActiveStop(index)}
                  onFocus={() => setActiveStop(index)}
                >
                  <button
                    type="button"
                    className={`absolute left-0 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${activeStop === index ? 'border-forest bg-forest text-white' : 'border-forest/20 bg-paper text-forest-dark'}`}
                    aria-label={`Show route stop ${index + 1}: ${stop.name} on map`}
                    aria-current={activeStop === index ? 'step' : undefined}
                    onClick={() => {
                      setActiveStop(index);
                      document.querySelector(`[data-route-stop="${index}"]`)?.scrollIntoView({
                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                        block: 'center',
                      });
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                  <article className={`overflow-hidden rounded-sm border bg-white transition-shadow ${activeStop === index ? 'border-forest/30 shadow-md' : 'border-forest/10'}`}>
                    <img
                      className="h-44 w-full object-cover sm:h-52"
                      src={`/trip-thumbnails/${stopImages[stop.name] || 'india'}.jpg`}
                      alt={`A view of ${stop.name}, India`}
                      loading="lazy"
                      width="900"
                      height="500"
                    />
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-champagne-dark">Route stop {index + 1}</p>
                        {activeStop === index && <span className="text-[10px] font-semibold text-forest">On the map</span>}
                      </div>
                      <h3 className="mt-2 font-serif text-2xl font-medium text-forest-dark">{stop.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {stopDescriptions[stop.name] || 'Take time to explore the landscapes, histories and everyday life of this part of India.'}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex items-center gap-2 pl-12 text-xs text-muted"><ArrowDown size={14} aria-hidden="true" /> Scroll to follow the route</p>
            <button className="ml-12 mt-5 text-sm font-semibold text-forest underline decoration-champagne underline-offset-4 hover:text-forest-dark" type="button" onClick={onPlanJourney}>
              Make this journey your own
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RouteMap;
