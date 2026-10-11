import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, MapPin, X } from 'lucide-react';
import { useGallery, type GalleryImage } from '../../hooks/useGallery';
import { OptimizedImage } from '../ui/OptimizedImage';

const FEATURED_VISIBLE_COUNT = 8;
const CATEGORIES = ['All memories', 'Festivals', 'Group adventures', 'India'] as const;
type GalleryCategory = typeof CATEGORIES[number];

const getCategory = (image: GalleryImage): Exclude<GalleryCategory, 'All memories'> => {
  const details = `${image.location || ''} ${image.trip_title || ''}`.toLowerCase();
  if (/india|rajasthan|goa|kasol|pushkar/.test(details)) return 'India';
  if (/tomorrowland|ultra|edc|coachella|festival/.test(details)) return 'Festivals';
  return 'Group adventures';
};

export function ClientGallery() {
  const { images, loading } = useGallery();
  const [category, setCategory] = useState<GalleryCategory>('All memories');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const galleryCloseButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const categorizedImages = useMemo(
    () => images.map((image) => ({ image, category: getCategory(image) })),
    [images],
  );
  const filteredImages = categorizedImages
    .filter(({ category: imageCategory }) => category === 'All memories' || imageCategory === category)
    .map(({ image }) => image);
  const visibleImages = filteredImages.slice(0, FEATURED_VISIBLE_COUNT);

  useEffect(() => {
    if (!selectedImage && !isGalleryOpen) {
      document.body.style.overflow = '';
      previouslyFocusedElement.current?.focus();
      previouslyFocusedElement.current = null;
      return undefined;
    }

    if (!previouslyFocusedElement.current) {
      previouslyFocusedElement.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    }
    document.body.style.overflow = 'hidden';
    (selectedImage ? closeButtonRef.current : galleryCloseButtonRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedImage) setSelectedImage(null);
        else setIsGalleryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, isGalleryOpen]);

  if (loading) {
    return (
      <section className="bg-gray-50 py-16 md:py-24" aria-label="Loading captured memories" aria-busy="true">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-56 animate-pulse rounded bg-gray-200" />
          <div className="flex snap-x snap-mandatory gap-4 overflow-hidden lg:grid lg:h-[600px] lg:grid-cols-4 lg:grid-rows-3">
            {Array.from({ length: FEATURED_VISIBLE_COUNT }, (_, index) => (
              <div
                key={index}
                className={`aspect-[4/3] w-[82vw] max-w-sm shrink-0 animate-pulse rounded-2xl bg-gray-200 lg:h-auto lg:w-auto lg:max-w-none ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-2 lg:aspect-auto' : 'lg:aspect-square'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) return null;

  return (
    <>
      <section className="relative overflow-hidden bg-gray-50 py-16 md:py-24" aria-labelledby="captured-memories-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-6 md:mb-9 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-teal-700">Shared by our travelers</p>
              <h2 id="captured-memories-title" className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Captured Memories
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 md:text-base">
                A few favourite moments from the journeys we’ve shared.
              </p>
            </div>

            <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-2 md:mx-0 md:px-0" role="group" aria-label="Filter memories by trip type">
              {CATEGORIES.map((item) => {
                const active = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setCategory(item);
                    }}
                    className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium whitespace-nowrap transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                      active
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-teal-600/50 hover:text-teal-800'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:grid-rows-3 lg:gap-4">
            <AnimatePresence mode="popLayout">
              {visibleImages.map((image, index) => (
                <motion.button
                  key={image.id}
                  type="button"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : (index % 3) * 0.035 }}
                  onClick={() => {
                    if (index === 3 && filteredImages.length > 4 && window.matchMedia('(max-width: 767px)').matches) {
                      setIsGalleryOpen(true);
                    } else {
                      setSelectedImage(image);
                    }
                  }}
                  aria-label={index === 3 && filteredImages.length > 4 && window.matchMedia('(max-width: 767px)').matches
                    ? `View all ${filteredImages.length} memories`
                    : `View ${image.client_name || 'traveler'} in ${image.location || image.trip_title || 'a travel memory'}`}
                  className={`group relative isolate aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-200 text-left shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out hover:shadow-lg active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 ${
                    index >= 4 ? 'hidden md:block' : ''
                  } ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                >
                  <OptimizedImage
                    src={image.image_url}
                    alt={`${image.client_name || 'Traveler'} at ${image.location || image.trip_title || 'a travel experience'}`}
                    className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
                    loading={index < 3 ? 'eager' : 'lazy'}
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/5 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 text-left sm:p-4">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">
                        {image.client_name || 'Travel4Life traveler'}
                      </span>
                      {image.location && (
                        <span className="mt-1 flex items-center gap-1 text-xs text-white/80">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{image.location}</span>
                        </span>
                      )}
                    </span>
                    <span className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                  {index === 3 && filteredImages.length > 4 && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-950/70 px-3 text-center text-sm font-bold leading-tight text-white md:hidden">
                      +{filteredImages.length - 4} More Memories
                    </span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {filteredImages.length === 0 && (
            <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500" role="status">
              No memories in this collection yet. Try another category.
            </p>
          )}

          {filteredImages.length > FEATURED_VISIBLE_COUNT && (
            <div className="mt-8 hidden justify-center md:flex">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-700 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                View All Memories ({filteredImages.length})
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsGalleryOpen(false);
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="all-memories-title"
              className="relative flex h-[88dvh] max-h-[88dvh] w-full max-w-none flex-col overflow-hidden rounded-t-[28px] bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:h-[90vh] sm:max-h-[90vh] sm:max-w-6xl sm:rounded-2xl sm:p-8"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              <div className="mx-auto mb-5 h-1 w-12 shrink-0 rounded-full bg-gray-200 sm:hidden" aria-hidden="true" />
              <div className="mb-5 flex shrink-0 items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Travel4Life</p>
                  <h2 id="all-memories-title" className="mt-1 text-2xl font-bold text-gray-900">All Memories</h2>
                </div>
                <button
                  ref={galleryCloseButtonRef}
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                  aria-label="Close all memories"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="scrollbar-hide -mx-4 flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:flex-none sm:grid-cols-3 sm:overflow-y-auto sm:overflow-x-hidden sm:px-0 lg:grid-cols-4">
                {filteredImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View ${image.client_name || 'traveler'} in ${image.location || image.trip_title || 'a travel memory'}`}
                    className="group relative h-full w-full shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-gray-200 text-left shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:aspect-[4/3] sm:h-auto sm:w-auto"
                  >
                    <OptimizedImage
                      src={image.image_url}
                      alt={`${image.client_name || 'Traveler'} at ${image.location || image.trip_title || 'a travel experience'}`}
                      className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-gray-950/80 to-transparent px-3 pb-3 pt-8 text-sm font-semibold text-white">
                      {image.location || image.trip_title || 'Travel memory'}
                    </span>
                  </button>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}

        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedImage(null);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedImage.client_name || 'Traveler'} at ${selectedImage.location || selectedImage.trip_title || 'a travel experience'}`}
              className="relative flex h-[88dvh] max-h-[88dvh] w-full max-w-none items-center justify-center overflow-hidden rounded-t-[28px] bg-black [&_img]:object-contain sm:h-[min(90vh,800px)] sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              <span className="absolute left-1/2 top-3 z-10 h-1 w-12 -translate-x-1/2 rounded-full bg-white/50 sm:hidden" aria-hidden="true" />
              <OptimizedImage
                src={selectedImage.image_url}
                alt={`${selectedImage.client_name || 'Traveler'} at ${selectedImage.location || selectedImage.trip_title || 'a travel experience'}`}
                className="max-h-[88dvh] w-full object-contain sm:max-h-[90vh]"
                loading="eager"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-white sm:p-7 sm:pt-20">
                <p className="font-semibold">{selectedImage.client_name || 'Travel4Life traveler'}</p>
                {selectedImage.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {selectedImage.location}
                  </p>
                )}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Close memory"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="sr-only">Use Escape to close this image.</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
