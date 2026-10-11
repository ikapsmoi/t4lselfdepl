import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { getTravel4LifeContactContext, getTravel4LifeWhatsAppUrl } from '../../utils/travel4lifeContact.js';
import { trackContactEvent } from '../../utils/analytics';
import { MobileBottomBar } from '../common/MobileBottomBar';
import { OPEN_PLANNER_EVENT, openTravelPlanner, type PlannerEventDetail } from './tripPlannerEvent';

const DESTINATIONS = ['Tomorrowland', 'EDC', 'India', 'Somewhere else'];
const CREW_SIZES = ['Just me', '2–3', '4–6', '7+'];

export function FloatingAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [crew, setCrew] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(!entry.isIntersecting), { threshold: 0.05 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const { destination: initialDestination } = (event as CustomEvent<PlannerEventDetail>).detail || {};
      if (initialDestination) setDestination(initialDestination);
      else setDestination('');
      setIsOtherSelected(false);
      setCrew('');
      setName('');
      setPhone('');
      setStep(0);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_PLANNER_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_PLANNER_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus.current?.focus();
      previousFocus.current = null;
    };
  }, [isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const context = getTravel4LifeContactContext({
      pageType: /tomorrowland|edc|festival/i.test(destination) ? 'festival' : 'travel',
      destination,
      tripType: 'group travel',
      entity: destination,
    });
    const message = [
      'Hi Travel4Life, I would like help planning a trip.',
      '',
      `Destination or experience: ${destination}`,
      `Group size: ${crew}`,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
    ].join('\n');
    void trackContactEvent('conversation_planner_submit', context);
    window.open(getTravel4LifeWhatsAppUrl(context, message), '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const canContinue = step === 0 ? Boolean(destination.trim()) : step === 1 ? Boolean(crew) : true;
  const show = <button
    type="button"
    onClick={openTravelPlanner}
    className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-500 px-6 text-sm font-semibold text-white shadow-lg shadow-green-900/20 transition-transform duration-150 ease-out hover:scale-[1.02] hover:bg-green-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2"
  >
    Design My VIP Trip
  </button>;

  return (
    <>
      {isVisible && (
        <>
          <div className="fixed bottom-6 right-6 z-40 hidden md:block">{show}</div>
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-gray-200/80 bg-white/95 p-3.5 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg md:hidden">
            <p className="min-w-0 text-xs font-medium text-gray-600">Planning something unforgettable?</p>
            {show}
          </div>
        </>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsOpen(false);
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="vip-planner-title"
              className="relative h-dvh max-h-dvh w-full max-w-xl overflow-y-auto rounded-none bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] shadow-2xl sm:h-auto sm:max-h-[88vh] sm:rounded-3xl sm:p-8"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 30 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">Your trip, your way</p>
                  <h2 id="vip-planner-title" className="mt-2 text-2xl font-bold leading-tight text-gray-900">Let’s make a plan</h2>
                </div>
                <button ref={closeRef} type="button" onClick={() => setIsOpen(false)} aria-label="Close trip planner" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mb-7 flex gap-2" aria-label={`Step ${step + 1} of 3`}>
                {[0, 1, 2].map((index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-teal-700' : 'bg-gray-200'}`} />)}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -18 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
                  {step === 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Where do you want to feel the bass?</h3>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {DESTINATIONS.map((option) => (
                          <button key={option} type="button" onClick={() => {
                            setIsOtherSelected(option === 'Somewhere else');
                            setDestination(option === 'Somewhere else' ? '' : option);
                          }} aria-pressed={option === 'Somewhere else' ? isOtherSelected : destination === option} className={`min-h-12 rounded-2xl border p-3.5 text-left text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${(option === 'Somewhere else' ? isOtherSelected : destination === option) ? 'border-teal-700 bg-teal-700 text-white' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'}`}>
                            {option}
                          </button>
                        ))}
                      </div>
                      {isOtherSelected && (
                        <label className="mt-4 block text-sm font-medium text-gray-700">
                          Tell us where
                          <input autoFocus value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="City, country or experience" className="mt-2 h-12 w-full rounded-2xl border border-gray-300 px-4 text-sm text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                        </label>
                      )}
                    </div>
                  ) : step === 1 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">How many in your crew?</h3>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {CREW_SIZES.map((option) => (
                          <button key={option} type="button" onClick={() => setCrew(option)} aria-pressed={crew === option} className={`min-h-12 rounded-2xl border p-3.5 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${crew === option ? 'border-teal-700 bg-teal-700 text-white' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'}`}>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Let’s secure your access.</h3>
                      <p className="mt-1 text-sm text-gray-500">Add your details and continue the conversation with our team.</p>
                      <form id="vip-planner-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Your name
                          <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-300 px-4 text-sm text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                        </label>
                        <label className="block text-sm font-medium text-gray-700">Phone number
                          <input required type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-300 px-4 text-sm text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                        </label>
                      </form>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 active:scale-[0.98]">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                  </button>
                ) : <span />}
                {step < 2 ? (
                  <button type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gray-900 px-6 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                    Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button type="submit" form="vip-planner-form" className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-500 px-6 text-sm font-semibold text-white shadow-md transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-95">
                    Continue in WhatsApp
                  </button>
                )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
