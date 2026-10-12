import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Heart, Users, UserRound, UsersRound } from 'lucide-react';
import { createIndiaEnquiryMessage } from '../enquiry.mjs';
import { trackContactEvent } from '../../utils/analytics';
import { getTravel4LifeContactContext, getTravel4LifeWhatsAppUrl, TRAVEL4LIFE_CONTACT } from '../../utils/travel4lifeContact.js';
import { REGIONS, type Journey, type RegionCode } from './types';

interface TripDesignerWizardProps {
  journey: Journey;
  region: RegionCode;
}

const travelPartyOptions = [
  { id: 'Solo', icon: UserRound, detail: 'Just me' },
  { id: 'Couple', icon: Heart, detail: 'A shared escape' },
  { id: 'Family', icon: Users, detail: 'Room for everyone' },
  { id: 'Group', icon: UsersRound, detail: 'Friends or a special interest' },
];
const paceOptions = [
  { id: 'Relaxed', detail: 'Time to settle in and savour each stop' },
  { id: 'Balanced', detail: 'A little discovery, with room to breathe' },
  { id: 'Fast-paced', detail: 'See more places in a shorter time' },
];
const countryCodeByRegion: Record<RegionCode, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
};

const TripDesignerWizard = ({ journey, region }: TripDesignerWizardProps) => {
  const [step, setStep] = useState(0);
  const [party, setParty] = useState('');
  const [pace, setPace] = useState('');
  const [travelMonth, setTravelMonth] = useState('');
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [travellers, setTravellers] = useState('2');
  const [error, setError] = useState('');
  const [preparedLinks, setPreparedLinks] = useState<{ whatsapp: string; email: string } | null>(null);
  const reduceMotion = useReducedMotion();
  const market = REGIONS[region];

  useEffect(() => {
    if (!isTransitioning) return undefined;
    const transitionTimeout = window.setTimeout(() => setIsTransitioning(false), reduceMotion ? 0 : 500);
    return () => window.clearTimeout(transitionTimeout);
  }, [isTransitioning, reduceMotion]);

  const track = (eventName: string) => {
    void trackContactEvent(eventName, getTravel4LifeContactContext({
      pageType: 'india-tours',
      destination: 'India',
      country: market.country,
      package: journey.name,
      entity: journey.id,
    }));
  };

  const advance = () => {
    const selectionMissing = (step === 0 && !party) || (step === 1 && !pace);
    if (selectionMissing) {
      setError('Choose an option to continue.');
      return;
    }
    setError('');
    setIsTransitioning(true);
    setStep((current) => Math.min(current + 1, 3));
  };

  const prepareEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 3) {
      advance();
      return;
    }
    const count = Number(travellers);
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!Number.isInteger(count) || count < 1 || count > 40) {
      setError('Please enter a whole number of travellers from 1 to 40.');
      return;
    }

    const { message } = createIndiaEnquiryMessage({
      journey,
      travellerName: name,
      travellerEmail: email,
      travellerCount: count,
      travellerCountry: countryCodeByRegion[region],
      travelDates: flexibleDates
        ? 'Flexible'
        : travelMonth
          ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
            .format(new Date(`${travelMonth}-01T12:00:00Z`))
          : 'Not decided',
      travellerPace: pace,
      travellerType: party,
      currencyPreference: market.currency,
    });
    const contact = getTravel4LifeContactContext({
      pageType: 'india-tours',
      destination: 'India',
      country: market.country,
      package: journey.name,
      entity: journey.id,
    });
    const subject = `India trip enquiry: ${journey.name}`;
    setPreparedLinks({
      whatsapp: getTravel4LifeWhatsAppUrl(contact, message),
      email: `mailto:${TRAVEL4LIFE_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
    });
    setError('');
    track('quote_form_draft_prepared');
  };

  const moveToStep = (nextStep: number) => {
    setIsTransitioning(true);
    setStep(nextStep);
    setError('');
  };

  return (
    <section id="plan" className="scroll-mt-24 bg-white px-5 py-10 sm:px-8 md:py-24 lg:px-12" aria-labelledby="plan-title">
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div>
          <div className="mb-9 max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-champagne-dark">A personal conversation, not a formality</p>
            <h2 id="plan-title" className="font-serif text-2xl font-medium leading-tight tracking-tight text-forest-dark sm:text-5xl">Let’s design your India</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">A few thoughtful details help our team understand the trip you have in mind. Your information stays in a message draft until you choose to send it.</p>
          </div>

          <div className="rounded-sm border border-forest/12 bg-paper p-5 sm:p-8">
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-forest-dark">
                <span>Step {step + 1} of 4</span>
                <span>{['Your travellers', 'Your pace', 'Your dates', 'Your details'][step]}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-forest/10" role="progressbar" aria-label="Trip planner progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}>
                <motion.div
                  className="h-full rounded-full bg-forest"
                  initial={false}
                  animate={{ width: `${((step + 1) / 4) * 100}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                />
              </div>
            </div>

            <form onSubmit={prepareEnquiry} noValidate>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  aria-live="polite"
                >
                  {step === 0 && (
                    <fieldset>
                      <legend className="font-serif text-2xl leading-tight text-forest-dark sm:text-3xl">Who is travelling?</legend>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">Choose the closest fit. You can always tell us more later.</p>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {travelPartyOptions.map(({ id, icon: Icon, detail }) => (
                          <button className={`flex min-h-24 items-center gap-4 rounded-sm border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${party === id ? 'border-forest bg-[#edf2ed]' : 'border-forest/15 bg-white hover:border-forest/40'}`} type="button" key={id} aria-pressed={party === id} disabled={isTransitioning} onClick={() => { setParty(id); setError(''); }}>
                            <Icon className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                            <span><span className="block text-sm font-bold text-forest-dark">{id}</span><span className="mt-1 block text-xs text-muted">{detail}</span></span>
                            {party === id && <Check className="ml-auto h-4 w-4 text-forest" aria-hidden="true" />}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {step === 1 && (
                    <fieldset>
                      <legend className="font-serif text-2xl text-forest-dark sm:text-3xl">What is your preferred pace?</legend>
                      <p className="mt-2 text-sm text-muted">We’ll use this to shape the rhythm of your route.</p>
                      <div className="mt-6 grid gap-3">
                        {paceOptions.map(({ id, detail }) => (
                          <button className={`flex min-h-16 items-center justify-between gap-4 rounded-sm border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${pace === id ? 'border-forest bg-[#edf2ed]' : 'border-forest/15 bg-white hover:border-forest/40'}`} type="button" key={id} aria-pressed={pace === id} disabled={isTransitioning} onClick={() => { setPace(id); setError(''); }}>
                            <span><span className="block text-sm font-bold text-forest-dark">{id}</span><span className="mt-1 block text-xs text-muted">{detail}</span></span>
                            {pace === id && <Check className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="font-serif text-2xl text-forest-dark sm:text-3xl">When are you looking to go?</h3>
                      <p className="mt-2 text-sm text-muted">A month is a helpful starting point. Exact dates can come later.</p>
                      <label className="mt-6 block max-w-sm text-xs font-bold text-forest-dark" htmlFor="travel-month">Preferred month <span className="font-normal text-muted">(optional)</span></label>
                      <input className="inbound-input mt-2" id="travel-month" type="month" value={travelMonth} disabled={isTransitioning || flexibleDates} onChange={(event) => { setTravelMonth(event.target.value); setError(''); }} />
                      <label className="mt-5 flex max-w-md items-start gap-3 text-sm text-forest-dark">
                        <input className="mt-1 h-4 w-4 accent-forest" type="checkbox" checked={flexibleDates} disabled={isTransitioning} onChange={(event) => { setFlexibleDates(event.target.checked); setError(''); }} />
                        <span><span className="font-semibold">My dates are flexible</span><span className="mt-1 block text-xs leading-5 text-muted">We can explore the best season for the places you have in mind.</span></span>
                      </label>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 className="font-serif text-2xl text-forest-dark sm:text-3xl">Where can we reach you?</h3>
                      <p className="mt-2 text-sm text-muted">We’ll prepare a private enquiry draft for you to review.</p>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-bold text-forest-dark" htmlFor="traveller-name">Your name
                          <input className="inbound-input mt-2" id="traveller-name" autoComplete="name" maxLength={100} required disabled={isTransitioning} value={name} onChange={(event) => setName(event.target.value)} />
                        </label>
                        <label className="text-xs font-bold text-forest-dark" htmlFor="traveller-email">Email address
                          <input className="inbound-input mt-2" id="traveller-email" type="email" autoComplete="email" maxLength={254} required disabled={isTransitioning} value={email} onChange={(event) => setEmail(event.target.value)} />
                        </label>
                        <label className="text-xs font-bold text-forest-dark" htmlFor="traveller-count">Number of travellers
                          <input className="inbound-input mt-2" id="traveller-count" type="number" inputMode="numeric" min={1} max={40} required disabled={isTransitioning} value={travellers} onChange={(event) => setTravellers(event.target.value)} />
                        </label>
                        <div className="flex items-end text-xs leading-5 text-muted">
                          Market: {market.label} · Preferred currency: {market.currency}
                          <span className="sr-only">Currency preference only; any final quote is confirmed directly.</span>
                        </div>
                      </div>
                      <p className="mt-4 text-xs leading-5 text-muted">Your details are placed in a draft only. Nothing is sent or saved until you choose to send your enquiry.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && <p className="mt-5 text-sm font-semibold text-red-800" role="alert">{error}</p>}
              <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-forest/10 pt-5 sm:flex-row">
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-forest/20 px-5 text-sm font-semibold text-forest-dark hover:bg-forest/5 disabled:invisible" type="button" onClick={() => moveToStep(Math.max(0, step - 1))} disabled={step === 0 || isTransitioning}>
                  <ArrowLeft size={16} aria-hidden="true" /> Back
                </button>
                {step < 3 ? (
                  <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-forest-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:cursor-wait disabled:opacity-60" type="button" disabled={isTransitioning} onClick={advance}>
                    Continue <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-forest-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isTransitioning}>
                    Prepare my enquiry <ArrowRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </form>

            {preparedLinks && (
              <div className="mt-6 rounded-sm border border-forest/20 bg-[#edf2ed] p-5" role="status">
                <p className="font-semibold text-forest-dark">Your enquiry draft is ready.</p>
                <p className="mt-1 text-xs leading-5 text-muted">Review the details in your chosen app; this page has not sent your message.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a className="inline-flex min-h-11 items-center justify-center rounded-sm bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-dark" href={preparedLinks.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => track('contact_whatsapp_click')}>Review WhatsApp draft</a>
                  <a className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-semibold text-forest underline underline-offset-4" href={preparedLinks.email} onClick={() => track('contact_email_click')}>Open email draft</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-sm bg-forest-dark p-6 text-white sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#f1d7af]">Personal travel concierge</p>
          <h3 className="mt-3 font-serif text-2xl">A real conversation, at your pace.</h3>
          <p className="mt-3 text-sm leading-6 text-white/75">Your selected starting point: <strong className="font-semibold text-white">{journey.name}</strong>. We’ll confirm what can be arranged before you make a decision.</p>
          <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
            <a className="block text-[#f1d7af] hover:text-white" href="tel:+919511446642">Call +91 95114 46642</a>
            <a className="block text-[#f1d7af] hover:text-white" href={`mailto:${TRAVEL4LIFE_CONTACT.email}`}>{TRAVEL4LIFE_CONTACT.email}</a>
            <a className="block text-[#f1d7af] hover:text-white" href={getTravel4LifeWhatsAppUrl({ pageType: 'india-tours', destination: 'India' })} target="_blank" rel="noopener noreferrer">WhatsApp our India team</a>
          </div>
          <p className="mt-5 text-[11px] leading-5 text-white/55">International line · +91 95114 46642. We do not advertise unverified local toll-free numbers.</p>
        </aside>
      </div>
    </section>
  );
};

export default TripDesignerWizard;
