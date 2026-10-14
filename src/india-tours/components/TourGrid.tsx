import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { INDIA_JOURNEY_CONCEPTS, JOURNEY_CATEGORIES } from '../catalog.mjs';
import type { Journey } from './types';

interface TourGridProps {
  selectedJourneyId: string;
  onSelectJourney: (journey: Journey) => void;
}

const imageForJourney: Record<string, string> = {
  'golden-triangle': 'jaipur',
  'golden-triangle-varanasi': 'varanasi',
  'royal-rajasthan': 'udaipur',
  'golden-triangle-kerala': 'kerala',
  'golden-triangle-mumbai-goa': 'goa',
  'golden-triangle-ranthambore': 'india',
  'kerala-discovery': 'kerala',
  'ladakh-adventure': 'leh',
  'andaman-islands': 'goa',
  'grand-india': 'india',
};

const TourGrid = ({ selectedJourneyId, onSelectJourney }: TourGridProps) => {
  const [category, setCategory] = useState('all');
  const reduceMotion = useReducedMotion();
  const visibleJourneys = INDIA_JOURNEY_CONCEPTS.filter((journey) => category === 'all' || journey.category === category);

  return (
    <section id="journeys" className="scroll-mt-24 bg-paper px-5 py-10 sm:px-8 md:py-24 lg:px-12" aria-labelledby="journeys-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto mb-10 max-w-[720px] text-center sm:mb-14">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-champagne-dark">A few ways to begin</p>
          <h2 id="journeys-title" className="font-serif text-2xl font-medium leading-tight tracking-tight text-forest-dark sm:text-5xl">Journeys worth lingering over</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base sm:leading-7">
            Explore considered route ideas across India. Each can be adapted around your interests, dates and preferred pace.
          </p>
        </div>

        <div className="scrollbar-hide -mx-4 mb-8 flex items-center gap-2 overflow-x-auto px-4 py-2 md:mx-0 md:justify-center md:px-0" role="group" aria-label="Filter journeys by travel style">
          {JOURNEY_CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${category === id ? 'border-forest bg-forest text-white shadow-sm' : 'border-forest/20 bg-white text-forest-dark hover:border-forest/50'}`}
              aria-pressed={category === id}
              onClick={() => setCategory(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 scrollbar-hide md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:snap-none md:px-0 md:pb-0 lg:grid-cols-3">
          {visibleJourneys.map((journey, index) => {
            const categoryLabel = JOURNEY_CATEGORIES.find(({ id }) => id === journey.category)?.label || 'India';
            const image = imageForJourney[journey.id] || 'india';
            const selected = journey.id === selectedJourneyId;
            return (
              <motion.article
                key={journey.id}
                className={`group relative isolate aspect-[4/3] w-[82vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl border border-forest/10 bg-forest-dark shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-transform duration-150 ease-out active:scale-[0.98] md:aspect-[4/5] md:w-auto md:max-w-none md:snap-none ${selected ? 'ring-2 ring-champagne ring-offset-2' : ''}`}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.14 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : (index % 3) * 0.06 }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
              >
                <motion.img
                  className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={`/trip-thumbnails/${image}.jpg`}
                  alt=""
                  loading="lazy"
                  width="800"
                  height="1000"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#19191b]/95 via-[#19191b]/15 to-[#19191b]/5" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-7">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#ffd0bd]">{categoryLabel}</p>
                  <h3 className="line-clamp-2 max-w-sm font-serif text-base font-medium leading-tight sm:text-3xl">{journey.name}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/80 sm:mt-2 sm:text-sm">{journey.duration_days} · {journey.starting_city} to {journey.ending_city}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/30 pt-2.5 sm:mt-5 sm:pt-4">
                    <span className="text-xs font-semibold text-white/90">Request a tailored quote</span>
                    <button
                      className="inline-flex min-h-12 items-center gap-2 border-b border-[#ffd0bd] pb-1 text-xs font-bold text-[#ffd0bd] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      type="button"
                      aria-label={`View route outline for ${journey.name}`}
                      aria-pressed={selected}
                      onClick={() => {
                        onSelectJourney(journey);
                        document.getElementById('route')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
                      }}
                    >
                      View itinerary <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
          <div aria-hidden="true" className="w-0 shrink-0 pr-5 md:hidden" />
        </div>
        <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-6 text-muted">
          These are illustrative route concepts, not confirmed packages. No starting prices or availability are represented; both are checked for your dates before a proposal.
        </p>
      </div>
    </section>
  );
};

export default TourGrid;
