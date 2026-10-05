import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import {
  getTravel4LifeContactContext,
  getTravel4LifeWhatsAppUrl,
} from '../../utils/travel4lifeContact.js';
import { trackContactEvent } from '../../utils/analytics';

interface TripEnquiry {
  fullName: string;
  adults: string;
  children: string;
  travelDate: string;
  nights: string;
  destination: string;
}

const getToday = () => {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localToday.toISOString().slice(0, 10);
};

const initialEnquiry: TripEnquiry = {
  fullName: '',
  adults: '1',
  children: '0',
  travelDate: '',
  nights: '1',
  destination: '',
};

export const FloatingWhatsAppEnquiry: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [enquiry, setEnquiry] = useState<TripEnquiry>(initialEnquiry);
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameInput.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const updateField = (field: keyof TripEnquiry, value: string) => {
    setEnquiry((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const destination = enquiry.destination.trim();
    const message = [
      'Hi Travel4Life, I would like help planning a trip.',
      '',
      `Full name: ${enquiry.fullName.trim()}`,
      `Destination: ${destination}`,
      `Date of travel: ${enquiry.travelDate}`,
      `Number of nights: ${enquiry.nights}`,
      `Adults: ${enquiry.adults}`,
      `Children: ${enquiry.children}`,
    ].join('\n');
    const context = getTravel4LifeContactContext({ pageType: 'travel', destination });

    void trackContactEvent('contact_whatsapp_click', context);
    window.open(getTravel4LifeWhatsAppUrl(context, message), '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setEnquiry(initialEnquiry);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-green-600 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
          aria-label="Plan a trip with Travel4Life on WhatsApp"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Plan a trip
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-trip-enquiry-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Travel4Life concierge</p>
                <h2 id="quick-trip-enquiry-title" className="mt-1 text-xl font-bold text-slate-900">Plan your trip</h2>
                <p className="mt-1 text-sm text-slate-600">Share a few details and continue in WhatsApp.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close trip enquiry"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="grid max-h-[calc(100dvh-9rem)] grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</span>
                <input
                  ref={nameInput}
                  autoComplete="name"
                  required
                  value={enquiry.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Your full name"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Adults</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={enquiry.adults}
                  onChange={(event) => updateField('adults', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Children</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={enquiry.children}
                  onChange={(event) => updateField('children', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Date of travel</span>
                <input
                  type="date"
                  min={getToday()}
                  required
                  value={enquiry.travelDate}
                  onChange={(event) => updateField('travelDate', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Number of nights</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={enquiry.nights}
                  onChange={(event) => updateField('nights', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Destination</span>
                <input
                  required
                  value={enquiry.destination}
                  onChange={(event) => updateField('destination', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Where would you like to go?"
                />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 sm:col-span-2"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Send enquiry on WhatsApp
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
};
