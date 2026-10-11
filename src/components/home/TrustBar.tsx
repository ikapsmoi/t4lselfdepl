import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

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

export function TrustBar() {
  const [activeDetail, setActiveDetail] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return undefined;

    const interval = window.setInterval(() => {
      setActiveDetail((active) => (active + 1) % trustPoints[0].details.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

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
