import React, { useState } from 'react';
import { ArrowRight, MessageCircle, X, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getTravel4LifeContactContext, getTravel4LifeWhatsAppUrl } from '../../utils/travel4lifeContact.js';
import { trackContactEvent } from '../../utils/analytics';

export const FestivalReleaseCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [festival, setFestival] = useState('Tomorrowland');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [bookingWindow, setBookingWindow] = useState('As soon as possible');

  React.useEffect(() => {
    if (sessionStorage.getItem('travel4life:festival-release-dismissed') === 'true') {
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(true), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('travel4life:festival-release-dismissed', 'true');
  };

  const openWhatsApp = () => {
    const message = [
      'Hi Travel4life! I want to check Festival Release availability.',
      `Festival: ${festival} | Quantity: ${quantity}`,
      `Name: ${name.trim() || 'Not provided'} | Email: ${email.trim()}`,
      `Booking timeline: ${bookingWindow}`,
      'Please share the available package details and next steps.'
    ].join('\n');

    const context = getTravel4LifeContactContext({ pageType: 'festival', eventType: festival, tripType: 'festival travel', destination: festival });
    const personalizedUrl = getTravel4LifeWhatsAppUrl(context, message);
    window.open(personalizedUrl, '_blank', 'noopener,noreferrer');
    void trackContactEvent('contact_whatsapp_click', context);
    setIsOpen(false);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <>
      <aside className="fixed bottom-20 left-4 right-20 md:left-auto md:right-24 md:bottom-6 md:w-80 z-30">
        <div className="relative rounded-2xl border border-amber-200/80 bg-white/95 p-4 shadow-xl shadow-gray-900/10 backdrop-blur-md">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Festival Releases</p>
              <h2 className="mt-1 text-sm font-bold text-gray-900">Buy Back Packages</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">Find cancelled festival packages at lower rates.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss Festival Releases"
            className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-amber-100 transition-all duration-200 hover:bg-gray-800 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            Check release availability
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <a
            href={getTravel4LifeWhatsAppUrl(getTravel4LifeContactContext({ pageType: 'festival', eventType: festival, tripType: 'festival travel', destination: festival }))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackContactEvent('contact_whatsapp_click', getTravel4LifeContactContext({ pageType: 'festival', eventType: festival, tripType: 'festival travel', destination: festival }))}
            className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-green-700 hover:text-green-800"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp festival concierge
          </a>
        </div>
      </aside>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Check Festival Release" maxWidth="max-w-md">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-gray-600">
            Tell us what you are looking for and we will check current availability with the concierge.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-gray-700">
              Festival
              <select
                value={festival}
                onChange={(event) => setFestival(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option>Tomorrowland</option>
                <option>Ultra Miami</option>
                <option>EDC</option>
                <option>Coachella</option>
                <option>Other festival</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
              <select
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'traveler' : 'travelers'}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="font-normal text-gray-400">(optional)</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            How soon do you plan to book?
            <select
              value={bookingWindow}
              onChange={(event) => setBookingWindow(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option>As soon as possible</option>
              <option>Within 7 days</option>
              <option>Within 30 days</option>
              <option>Just researching</option>
            </select>
          </label>
          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" />
            Check availability on WhatsApp
          </button>
        </div>
      </Modal>
    </>
  );
};
