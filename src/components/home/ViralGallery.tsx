import { useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useGallery, type GalleryImage } from '../../hooks/useGallery';
import { useSlowMobileCarousel } from '../../hooks/useSlowMobileCarousel';
import { openWhatsAppEnquiry } from '../common/whatsappEnquiryEvent';

function ReelCard({ image, index }: { image: GalleryImage; index: number }) {
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const destination = image.location || image.trip_title || 'a group adventure';

  return (
    <motion.article
      className="group relative aspect-[9/16] w-[72vw] max-w-[250px] shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-950 shadow-sm sm:w-[230px] md:w-auto md:max-w-none"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
    >
      {image.video_url ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={image.video_url}
          poster={image.image_url}
          muted
          playsInline
          loop
          preload="none"
          aria-label={`${destination} travel reel`}
          onTimeUpdate={(event) => {
            const { currentTime, duration } = event.currentTarget;
            setProgress(duration ? (currentTime / duration) * 100 : 0);
          }}
          onMouseEnter={(event) => {
            void event.currentTarget.play().catch((error: unknown) => {
              console.error('Could not play gallery preview:', error);
            });
          }}
          onMouseLeave={(event) => {
            event.currentTarget.pause();
            setProgress(0);
          }}
        />
      ) : (
        <img
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          src={image.image_url}
          alt={`${image.client_name || 'Travelers'} at ${destination}`}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="flex items-center gap-1.5 text-xs text-white/80">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{destination}</span>
        </p>
        {image.client_name && <p className="mt-1 truncate text-sm font-semibold">{image.client_name}</p>}
        <button
          type="button"
          onClick={openWhatsAppEnquiry}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-150 ease-out hover:bg-white/25 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Join the hype <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {image.video_url && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25" aria-hidden="true">
          <div className="h-full origin-left bg-white" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      )}
    </motion.article>
  );
}

export function ViralGallery() {
  const { images, loading } = useGallery();
  const reelsCarousel = useSlowMobileCarousel<HTMLDivElement>();
  const reels = images.slice(0, 8);

  if (loading || reels.length === 0) return null;

  return (
    <section className="overflow-hidden bg-gray-50 py-8 md:py-20" aria-labelledby="viral-gallery-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Shared by our travelers</p>
            <h2 id="viral-gallery-title" className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">The feeling of being there</h2>
            <p className="mt-2 text-sm text-gray-500">Real moments from journeys we’ve shared.</p>
          </div>
        </div>
        <div
          ref={reelsCarousel.carouselRef}
          onPointerEnter={reelsCarousel.onPointerEnter}
          onPointerLeave={reelsCarousel.onPointerLeave}
          onFocusCapture={reelsCarousel.onFocusCapture}
          onBlurCapture={reelsCarousel.onBlurCapture}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0"
        >
          {reels.map((image, index) => <ReelCard key={image.id} image={image} index={index} />)}
          <div aria-hidden="true" className="w-0 shrink-0 pr-4 md:hidden" />
        </div>
      </div>
    </section>
  );
}
