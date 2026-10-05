import React from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import {
  getTravel4LifeContactContext,
  getTravel4LifeQuoteEvent,
  getTravel4LifeQuoteEvents,
  getTravel4LifeWhatsAppUrl,
  TRAVEL4LIFE_CONTACT,
  type Travel4LifeContactContext,
} from '../../utils/travel4lifeContact.js';
import { trackContactEvent } from '../../utils/analytics';

interface Travel4LifeContactCTAProps {
  context?: Travel4LifeContactContext;
  variant?: 'inline' | 'final';
  className?: string;
}

const getEnquiryLabel = (pageType: string) => ({
  wedding: 'Get my wedding proposal',
  mice: 'Get my corporate proposal',
  resort: 'Check resort availability',
  package: 'Check package availability',
  safari: 'Ask about safari availability',
  origin: 'Plan my trip',
  cost: 'Get my Corbett quote',
  activities: 'Plan my Corbett activities',
}[pageType] || 'Plan my trip');

export const Travel4LifeContactCTA: React.FC<Travel4LifeContactCTAProps> = ({
  context,
  variant = 'inline',
  className = '',
}) => {
  const contactContext = getTravel4LifeContactContext(context);
  const track = (eventName: string, contactChannel?: 'whatsapp' | 'phone' | 'email') => {
    void trackContactEvent(eventName, contactContext);
    if (eventName !== `contact_${contactChannel}_click` && contactChannel) {
      void trackContactEvent(`contact_${contactChannel}_click`, contactContext);
    }
    if (contactChannel === 'whatsapp' && eventName !== 'contact_whatsapp_click') {
      getTravel4LifeQuoteEvents(contactContext.pageType).slice(1).forEach((quoteEvent) => {
        void trackContactEvent(quoteEvent, contactContext);
      });
    }
  };

  const isFinal = variant === 'final';
  const whatsappEvent = isFinal ? getTravel4LifeQuoteEvent(contactContext.pageType) : 'contact_whatsapp_click';

  return (
    <section className={`t4l-contact-panel${isFinal ? ' t4l-contact-panel--final' : ''} ${className}`} aria-label="Contact Travel4Life">
      <div className="t4l-contact-copy">
        <p className="t4l-contact-eyebrow">{isFinal ? 'Personal Travel Concierge' : 'Plan with Travel4Life'}</p>
        <h2>{isFinal ? `Ready to plan${contactContext.destination ? ` ${contactContext.destination}` : ' your trip'}?` : 'Tell us what you have in mind'}</h2>
        <p>Share your dates, group size and priorities. Our team will help you check the right options.</p>
      </div>
      <div className="t4l-contact-buttons">
        <a className="t4l-contact-button t4l-contact-button--primary" href={getTravel4LifeWhatsAppUrl(contactContext)} target="_blank" rel="noopener noreferrer" onClick={() => track(whatsappEvent, 'whatsapp')}>
          <MessageCircle aria-hidden="true" />{isFinal ? getEnquiryLabel(contactContext.pageType || 'travel') : 'WhatsApp us now'}
        </a>
        <a className="t4l-contact-button" href={`tel:${TRAVEL4LIFE_CONTACT.phoneHref}`} onClick={() => track('contact_phone_click', 'phone')}>
          <Phone aria-hidden="true" />Call {TRAVEL4LIFE_CONTACT.phone}
        </a>
        <a className="t4l-contact-email" href={`mailto:${TRAVEL4LIFE_CONTACT.email}`} onClick={() => track('contact_email_click', 'email')}>
          <Mail aria-hidden="true" />Email Travel4Life
        </a>
      </div>
    </section>
  );
};

interface Travel4LifeGlobalContactLayerProps {
  context?: Travel4LifeContactContext;
}

export const Travel4LifeGlobalContactLayer: React.FC<Travel4LifeGlobalContactLayerProps> = ({ context }) => (
  <Travel4LifeContactCTA variant="final" context={context} />
);
