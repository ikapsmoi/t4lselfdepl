const destinations = new Set(['Thailand', 'Winter', 'Belgium']);
const cleanText = (value) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80);

export const createTomorrowlandWhatsAppUrl = ({
  destination,
  whatsappNumber,
  departureCity = '',
  travelMonth = '',
  travellers = '',
}) => {
  if (!destinations.has(destination)) {
    throw new TypeError('A supported Tomorrowland destination is required.');
  }
  if (!/^\d{8,15}$/.test(whatsappNumber)) {
    throw new TypeError('A valid WhatsApp contact number is required.');
  }
  if (travellers && (!/^\d+$/.test(String(travellers)) || Number(travellers) < 1 || Number(travellers) > 40)) {
    throw new RangeError('Traveller count must be a whole number from 1 to 40.');
  }

  const details = [
    ['Departure city', cleanText(departureCity)],
    ['Preferred travel month', cleanText(travelMonth)],
  ].filter(([, value]) => value);
  const travellerCount = Number(travellers);
  if (Number.isInteger(travellerCount) && travellerCount >= 1 && travellerCount <= 40) {
    details.push(['Travellers', String(travellerCount)]);
  }

  const message = [
    `Hello Travel4life, I am interested in Tomorrowland ${destination} travel options from India.`,
    ...details.map(([label, value]) => `${label}: ${value}`),
    'Please let me know what travel options may be available.',
  ].join('\n');
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-tomorrowland-enquiry]').forEach((panel) => {
    const button = panel.querySelector('[data-tomorrowland-enquiry-submit]');
    if (!button) throw new Error('Tomorrowland enquiry panel is missing its WhatsApp action.');

    button.addEventListener('click', (event) => {
      try {
        const url = createTomorrowlandWhatsAppUrl({
          destination: panel.dataset.destination,
          whatsappNumber: panel.dataset.whatsappNumber,
          departureCity: panel.querySelector('[data-enquiry-departure]')?.value,
          travelMonth: panel.querySelector('[data-enquiry-month]')?.value,
          travellers: panel.querySelector('[data-enquiry-travellers]')?.value,
        });
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.append(link);
        link.click();
        link.remove();
      } catch (error) {
        const invalidTravellerCount = error instanceof RangeError;
        event.preventDefault();
        event.stopPropagation();
        const status = panel.querySelector('.enquiry-status');
        if (status) {
          status.textContent = invalidTravellerCount
            ? 'Enter a traveller count from 1 to 40, or leave it blank.'
            : 'WhatsApp could not be prepared. Use the direct WhatsApp or phone contact on this page.';
          status.hidden = false;
        }
        document.dispatchEvent(new CustomEvent('travel4life:contact-form-error', { detail: { panel } }));
        if (!invalidTravellerCount) console.error('Unable to prepare Tomorrowland WhatsApp enquiry.', error);
      }
    });
  });
}
