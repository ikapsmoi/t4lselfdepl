import { useEffect, useRef } from 'react';
import { motion, animate, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import type { Trip } from '../../types';

interface TrustBarProps {
  trips: Trip[];
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      count.set(value);
      return undefined;
    }
    const animation = animate(count, value, { duration: 1.2, ease: 'easeOut' });
    return () => animation.stop();
  }, [count, inView, reduceMotion, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function TrustBar({ trips }: TrustBarProps) {
  const destinations = new Set(trips.map(({ destination }) => destination.trim()).filter(Boolean)).size;
  const confirmedTravelers = trips.reduce((total, trip) => total + trip.current_bookings, 0);
  const stats = [
    { value: trips.length, label: 'Active hosted journeys' },
    { value: destinations, label: 'Destinations to explore' },
    { value: confirmedTravelers, label: 'Confirmed travelers on listed trips' },
  ];

  return (
    <section className="relative z-10 border-y border-white/10 bg-gray-950 py-6 text-white sm:py-8" aria-label="Travel4Life trip facts">
      <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/15 px-4 sm:px-6 lg:px-8">
        {stats.map(({ value, label }) => (
          <div key={label} className="px-2 text-center first:pl-0 last:pr-0 sm:px-6">
            <p className="text-2xl font-bold tracking-tight sm:text-3xl">
              <CountUp value={value} />
            </p>
            <p className="mt-1 text-[10px] leading-tight text-white/70 sm:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
