import {
  getTravel4LifeContactContext,
  getTravel4LifeQuoteEvent,
  getTravel4LifeQuoteEvents,
  getTravel4LifeWhatsAppUrl,
  TRAVEL4LIFE_CONTACT,
} from '../src/utils/travel4lifeContact.js';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const contextAttributes = (context) => Object.entries(context)
  .filter(([, value]) => Boolean(value))
  .map(([key, value]) => ` data-contact-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`)
  .join('');
const setAttribute = (tag, name, value) => {
  const attribute = new RegExp(`\\s${name}="[^"]*"`, 'i');
  const replacement = ` ${name}="${escapeHtml(value)}"`;
  return attribute.test(tag)
    ? tag.replace(attribute, replacement)
    : tag.replace(/>$/, `${replacement}>`);
};
const hasSpecificWhatsappMessage = (tag) => {
  const href = tag.match(/\bhref="(https:\/\/wa\.me\/[^"]*)"/i)?.[1];
  if (!href) return false;
  const message = new URL(href.replaceAll('&amp;', '&')).searchParams.get('text')?.trim();
  return Boolean(message && !/^(hi|hello)[!.]*$/i.test(message));
};
const contextualizeWhatsappAnchor = (html, className, context, label) => html.replace(
  new RegExp(`<a\\b(?=[^>]*\\bclass="[^"]*\\b${className}\\b[^"]*")[^>]*>[\\s\\S]*?<\\/a>`, 'i'),
  (anchor) => {
    const openingTagEnd = anchor.indexOf('>') + 1;
    let output = anchor.slice(0, openingTagEnd);
    let content = anchor.slice(openingTagEnd, -4);
    if (!hasSpecificWhatsappMessage(output)) {
      output = output.replace(/\bhref="[^"]*"/i, `href="${escapeHtml(getTravel4LifeWhatsAppUrl(context))}"`);
    }
    output = setAttribute(output, 'aria-label', `Ask Travel4Life about ${context.destination || context.entity || 'your trip'} on WhatsApp`);
    output = setAttribute(output, 'data-contact-event', 'contact_whatsapp_click');
    output = setAttribute(output, 'data-contact-secondary-event', getTravel4LifeQuoteEvent(context.pageType));
    if (label) content = content.replace(/(<span>)[\s\S]*?(<\/span>)/i, `$1${escapeHtml(label)}$2`);
    for (const [key, value] of Object.entries(context)) {
      if (value) output = setAttribute(output, `data-contact-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value);
    }
    return `${output}${content}</a>`;
  },
);

const contextualizeWhatsappCtas = (html, context) => html.replace(
  /<a\b[^>]*>[\s\S]*?<\/a>/gi,
  (anchor) => {
    const openingTagEnd = anchor.indexOf('>') + 1;
    let openingTag = anchor.slice(0, openingTagEnd);
    if (!/\bhref="https:\/\/wa\.me\//i.test(openingTag)) return anchor;

    if (!hasSpecificWhatsappMessage(openingTag)) {
      openingTag = openingTag.replace(/\bhref="[^"]*"/i, `href="${escapeHtml(getTravel4LifeWhatsAppUrl(context))}"`);
    }
    openingTag = setAttribute(openingTag, 'target', '_blank');
    openingTag = setAttribute(openingTag, 'rel', 'noopener noreferrer');
    openingTag = setAttribute(openingTag, 'data-contact-event', 'contact_whatsapp_click');
    if (!/\baria-label="/i.test(openingTag)) {
      openingTag = setAttribute(openingTag, 'aria-label', `Ask Travel4Life about ${context.destination || context.entity || 'your trip'} on WhatsApp`);
    }
    for (const [key, value] of Object.entries(context)) {
      if (value) openingTag = setAttribute(openingTag, `data-contact-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value);
    }

    const visibleLabel = `${anchor.slice(openingTagEnd, -4).replace(/<[^>]*>/g, ' ')} ${openingTag.match(/\baria-label="([^"]*)"/i)?.[1] || ''}`;
    if (!/\bdata-contact-secondary-event="/i.test(openingTag)
      && /\b(?:quote|enquir(?:y|e)|proposal|availability|booking)\b/i.test(visibleLabel)) {
      const quoteEvents = getTravel4LifeQuoteEvents(context.pageType);
      openingTag = setAttribute(openingTag, 'data-contact-secondary-event', quoteEvents[0]);
      if (quoteEvents.length > 1) {
        openingTag = setAttribute(openingTag, 'data-contact-extra-event', quoteEvents.slice(1).join(','));
      }
    }

    return `${openingTag}${anchor.slice(openingTagEnd)}`;
  },
);

const makeLink = (channel, context, label, className, eventName = `contact_${channel}_click`) => {
  const href = channel === 'whatsapp'
    ? getTravel4LifeWhatsAppUrl(context)
    : channel === 'phone'
      ? `tel:${TRAVEL4LIFE_CONTACT.phoneHref}`
      : `mailto:${TRAVEL4LIFE_CONTACT.email}`;
  const target = channel === 'whatsapp' ? ' target="_blank" rel="noopener noreferrer"' : '';
  const icon = {
    whatsapp: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.5 8.5 0 0 1-12.9 7.3L3 20l1.2-4.7A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.8 8.6c.4 2.3 2.3 4.2 4.6 4.6"/></svg>',
    phone: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.7 9.7a16 16 0 0 0 6.6 6.6l1.3-1.3a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>',
    email: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  }[channel];
  const content = channel === 'phone'
    ? `${icon}<span>${escapeHtml(label)} ${escapeHtml(TRAVEL4LIFE_CONTACT.phone)}</span>`
    : `${icon}<span>${escapeHtml(label)}</span>`;
  const quoteEvent = channel === 'whatsapp' && /quote|availability|proposal|plan/i.test(label)
    ? ` data-contact-secondary-event="${escapeHtml(getTravel4LifeQuoteEvent(context.pageType))}"`
    : '';
  const extraQuoteEvents = channel === 'whatsapp' && quoteEvent
    ? getTravel4LifeQuoteEvents(context.pageType).slice(1)
    : [];
  const extraEvent = extraQuoteEvents.length
    ? ` data-contact-extra-event="${escapeHtml(extraQuoteEvents.join(','))}"`
    : '';
  return `<a class="${escapeHtml(className)}" href="${escapeHtml(href)}"${target} aria-label="${escapeHtml(channel === 'phone' ? `Call Travel4Life at ${TRAVEL4LIFE_CONTACT.phone}` : channel === 'email' ? `Email Travel4Life at ${TRAVEL4LIFE_CONTACT.email}` : `WhatsApp Travel4Life about ${context.destination || context.entity || 'your trip'}`)}" data-contact-event="${escapeHtml(eventName)}"${contextAttributes(context)}${quoteEvent}${extraEvent}>${content}</a>`;
};

const getEnquiryLabel = (pageType, destination) => ({
  wedding: 'Get my wedding proposal',
  mice: 'Get my corporate proposal',
  resort: 'Check availability',
  package: 'Check package availability',
  safari: 'Ask about safari availability',
  origin: 'Plan my trip',
  cost: 'Get my Corbett quote',
  activities: 'Plan my Corbett activities',
  festival: `Ask about ${(destination || 'festival').replace(/^Tomorrowland\s+/i, '')} travel options`,
}[pageType] || 'Plan my trip');

export const createContactPanelMarkup = (context, variant = 'inline') => {
  const isFinal = variant === 'final';
  const primaryLabel = isFinal ? getEnquiryLabel(context.pageType, context.destination) : 'WhatsApp us now';
  return `<section class="t4l-contact-panel${isFinal ? ' t4l-contact-panel--final' : ''}" aria-label="Contact Travel4Life">
    <div class="t4l-contact-copy">
      <p class="t4l-contact-eyebrow">${isFinal ? 'Personal Travel Concierge' : 'Plan with Travel4Life'}</p>
      <h2>${isFinal ? `Ready to plan ${escapeHtml(context.destination || 'your trip')}?` : 'Tell us what you have in mind'}</h2>
      <p>Share your dates, group size and priorities. Our team will help you check the right options.</p>
    </div>
    <div class="t4l-contact-buttons">
      ${makeLink('whatsapp', context, primaryLabel, 't4l-contact-button t4l-contact-button--primary')}
      ${makeLink('phone', context, 'Call', 't4l-contact-button')}
      ${makeLink('email', context, 'Email Travel4Life', 't4l-contact-email')}
    </div>
  </section>`;
};

export const injectContactLayerHtml = (html, context, analyticsConfig = {}) => {
  const contactContext = getTravel4LifeContactContext(context);
  let output = html
    .replaceAll('+91 9871-621-921', TRAVEL4LIFE_CONTACT.phone)
    .replaceAll('919871621921', TRAVEL4LIFE_CONTACT.whatsappNumber);
  const destination = (contactContext.destination || '').replace(/^Tomorrowland\s+/i, '');
  const isFestivalContext = contactContext.pageType === 'festival';
  output = contextualizeWhatsappAnchor(output, 'whatsapp-button', contactContext, isFestivalContext ? `Ask about ${destination}` : '');
  output = contextualizeWhatsappAnchor(output, 'floating-whatsapp', contactContext, isFestivalContext ? `Ask about ${destination} options` : '');
  if (isFestivalContext && /tomorrowland/i.test(contactContext.destination || '')) {
    output = contextualizeWhatsappCtas(output, contactContext);
  }
  if (!output.includes('data-t4l-contact-layer')) {
    const firstSectionEnd = output.match(/<\/h2>[\s\S]*?<\/p>/i);
    if (firstSectionEnd?.index !== undefined) {
      const end = firstSectionEnd.index + firstSectionEnd[0].length;
      output = `${output.slice(0, end)}${createContactPanelMarkup(contactContext)}${output.slice(end)}`;
    }
    output = output.replace(/<\/main>/i, () => `${createContactPanelMarkup(contactContext, 'final')}</main>`);
  }

  const analyticsMeta = analyticsConfig.url && analyticsConfig.anonKey
    ? `<meta name="t4l-contact-analytics" data-supabase-url="${escapeHtml(analyticsConfig.url)}" data-supabase-anon-key="${escapeHtml(analyticsConfig.anonKey)}">`
    : '';
  const assets = `${analyticsMeta}<link rel="stylesheet" href="/travel4life-contact.css"><script src="/travel4life-contact-analytics.js" defer></script>`;
  if (/<\/head>/i.test(output)) {
    output = output.replace(/<\/head>/i, () => `${assets}</head>`);
  } else {
    throw new Error('SEO page is missing </head>; cannot add the global contact layer.');
  }
  return output;
};
