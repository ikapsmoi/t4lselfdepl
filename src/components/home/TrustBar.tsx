import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Plane } from 'lucide-react';
import type { Trip } from '../../types';
import { getCurrencySymbol } from '../../utils/constants';
import { getTripPath } from '../../utils/tripSeo';

const trustPoints = [
  {
    title: 'Since 2014',
    details: [
      'Over a decade of travel experience',
      'Bringing travelers together since 2014',
      'Thoughtful journeys, backed by experience',
    ],
  },
  {
    title: 'Group journeys',
    details: [
      'Planned around your crew',
      'Find a trip that fits your travel style',
      'Explore upcoming group adventures',
    ],
  },
  {
    title: 'Personal support',
    details: [
      'Real people, here to help',
      'Tell us what you have in mind',
      'Get help choosing your next trip',
    ],
  },
];

interface TrustBarProps {
  trips: Trip[];
  onViewAll: () => void;
}

export function TrustBar({ trips, onViewAll }: TrustBarProps) {
  const [activeDetail, setActiveDetail] = useState(0);
  const [activeTripIndex, setActiveTripIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const featuredTrips = trips.filter((trip) => trip.featured);
  const activeTrip = featuredTrips[activeTripIndex];

  useEffect(() => {
    if (reduceMotion || featuredTrips.length < 2 || isPaused) return undefined;

    const interval = window.setInterval(() => {
      setActiveTripIndex((index) => (index + 1) % featuredTrips.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [featuredTrips.length, isPaused, reduceMotion]);

  useEffect(() => {
    if (featuredTrips.length > 0 && activeTripIndex >= featuredTrips.length) {
      setActiveTripIndex(0);
    }
  }, [activeTripIndex, featuredTrips.length]);

  useEffect(() => {
    if (reduceMotion || featuredTrips.length > 0) return undefined;

    const interval = window.setInterval(() => {
      setActiveDetail((active) => (active + 1) % trustPoints[0].details.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [featuredTrips.length, reduceMotion]);

  if (!activeTrip) {
    return (
      <section
        className="site-header-brand-wash relative z-10 border-y border-gray-200/80 py-5 text-gray-900 sm:py-6"
        aria-label="Why travel with Travel4Life"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-gray-200 px-4 sm:px-6 lg:px-8">
          {trustPoints.map(({ title, details }) => (
            <div key={title} className="px-2 text-center first:pl-0 last:pr-0 sm:px-6">
              <p className="whitespace-nowrap text-[12px] font-semibold leading-tight tracking-tight sm:text-base">
                {title}
              </p>
              <div className="relative mt-1 min-h-7">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeDetail}
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: reduceMotion ? 0 : 0.35 }}
                    className="text-[10px] leading-tight text-gray-600 sm:text-sm"
                  >
                    {details[activeDetail]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const changeTrip = (direction: -1 | 1) => {
    setActiveTripIndex((index) => (index + direction + featuredTrips.length) % featuredTrips.length);
  };

  return (
    <>
      <section
        className="relative z-10 isolate overflow-hidden border-y border-slate-200 bg-white text-slate-900"
        aria-label="Featured trips"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
        }}
      >
        <img
          src={activeTrip.images[0] || '/optimized/hero-beach.webp'}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.14] sm:hidden"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-white/90 sm:hidden" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-white via-teal-50/40 to-sky-100/70" aria-hidden="true" />
        <motion.svg
          viewBox="0 0 520 140"
          preserveAspectRatio="none"
          className="pointer-events-none absolute right-0 top-0 h-full w-[75%] text-teal-800/10 sm:w-[58%] sm:text-teal-800/20"
          aria-hidden="true"
        >
          <motion.path
            d="M0 95 C90 15 145 135 240 72 S390 15 520 86"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 8"
            initial={false}
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -52] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          />
          <circle cx="42" cy="73" r="3" fill="currentColor" />
          <circle cx="478" cy="72" r="3" fill="currentColor" />
        </motion.svg>
        <motion.div
          className="pointer-events-none absolute right-[8%] top-1/2 -translate-y-1/2 text-teal-800/10 sm:right-[12%] sm:text-teal-800/20"
          aria-hidden="true"
          initial={false}
          animate={reduceMotion ? undefined : { x: [0, 18, 0], y: [3, -3, 3], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Plane className="h-4 w-4 sm:h-6 sm:w-6" />
        </motion.div>
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <AnimatePresence mode="wait" initial={false}>
              <motion.div
              key={activeTrip.id}
                className="relative z-10 grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2.5 min-[380px]:grid-cols-[4.5rem_minmax(0,1fr)] min-[380px]:gap-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-5"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              <img
                src={activeTrip.images[0] || '/optimized/hero-beach.webp'}
                alt={activeTrip.title}
                className="h-14 w-14 rounded-xl object-cover shadow-sm min-[380px]:h-[4.5rem] min-[380px]:w-[4.5rem] sm:h-24 sm:w-24"
                loading="lazy"
                decoding="async"
              />
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 sm:text-xs">
                    Featured trip
                  </span>
                  {featuredTrips.length > 1 && (
                    <span className="text-xs font-medium tabular-nums text-slate-500">
                      {activeTripIndex + 1} / {featuredTrips.length}
                    </span>
                  )}
                  {featuredTrips.length > 1 && (
                    <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:hidden">
                      <button
                        type="button"
                        onClick={() => changeTrip(-1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                        aria-label="Previous featured trip"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => changeTrip(1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                        aria-label="Next featured trip"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
                <h2 className="mt-1 truncate text-sm font-bold leading-tight text-slate-900 min-[380px]:text-base sm:text-lg">
                  {activeTrip.title}
                </h2>
                <div className="mt-1 flex min-w-0 items-center gap-2 text-xs leading-tight text-slate-600 sm:gap-3 sm:text-sm">
                  <span className="flex min-w-0 items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />
                    <span className="truncate">{activeTrip.destination}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-slate-800">
                    {getCurrencySymbol(activeTrip.currency)}{activeTrip.price.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {featuredTrips.length > 1 && (
                    <div className="hidden items-center gap-1.5 sm:flex">
                      <button
                        type="button"
                        onClick={() => changeTrip(-1)}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                        aria-label="Previous featured trip"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => changeTrip(1)}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                        aria-label="Next featured trip"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onViewAll}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-4 sm:text-sm"
                  >
                    All trips
                  </button>
                  <a
                    href={getTripPath(activeTrip.id)}
                    className="inline-flex min-h-11 min-w-[6rem] flex-1 basis-24 items-center justify-center gap-1 rounded-full bg-slate-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:flex-none sm:px-4 sm:text-sm"
                  >
                    View trip <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
