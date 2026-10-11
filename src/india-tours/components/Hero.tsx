import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';

const Hero = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="inbound-hero relative isolate flex min-h-[650px] items-end overflow-hidden bg-forest-dark text-white sm:min-h-[740px] lg:min-h-[min(790px,calc(100svh-76px))]" aria-labelledby="inbound-title">
      <img
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        src="/trip-thumbnails/jaipur.jpg"
        alt=""
        width="1600"
        height="1000"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10271f]/90 via-[#10271f]/58 to-[#10271f]/15" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#10271f]/50 via-transparent to-[#10271f]/10" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-24 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
        <div className="max-w-[780px]">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[.24em] text-[#f1d7af] sm:text-xs">Private India journeys · Thoughtfully planned</p>
          <motion.h1
            id="inbound-title"
            className="max-w-[750px] font-serif text-[clamp(3.25rem,8vw,7.4rem)] font-medium leading-[.99] tracking-[-.055em] text-white"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            India. Your Way.
            <span className="mt-2 block text-[#f1d7af]">One Remarkable Journey.</span>
          </motion.h1>
          <p className="mt-7 max-w-[580px] text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
            Discover India at your own pace, with a journey shaped around the places, details and moments that matter to you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex min-h-14 items-center justify-center gap-3 rounded-sm bg-champagne px-6 text-sm font-bold text-forest-dark transition-colors hover:bg-[#f5dfbd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="#plan">
              Start designing my trip <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="inline-flex min-h-14 items-center justify-center gap-3 rounded-sm border border-white/70 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="#journeys">
              Explore curated itineraries <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <p className="mt-5 text-xs text-white/65">Every route is a starting point. Availability and a tailored quote are confirmed with you.</p>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-white/25" aria-hidden="true" />
    </section>
  );
};

export default Hero;
