const cleanField = (value, limit = 120) => String(value || '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, limit);

export const createTomorrowlandB2BWhatsAppUrl = (details, whatsappNumber) => {
  const number = String(whatsappNumber || '');
  if (!/^\d{8,15}$/.test(number)) {
    throw new Error('A valid WhatsApp contact number is required.');
  }

  const agency = cleanField(details.agency);
  const destination = cleanField(details.destination, 40);
  if (!agency || !['Belgium', 'Winter', 'Thailand', 'Not sure yet'].includes(destination)) {
    throw new Error('Agency name and a supported destination are required.');
  }

  const travellers = cleanField(details.travellers, 4);
  if (travellers && !/^[1-9]\d{0,3}$/.test(travellers)) {
    throw new Error('Traveller count must be a whole number from 1 to 9999.');
  }

  const components = Array.isArray(details.components)
    ? details.components.map((item) => cleanField(item, 40)).filter((item) =>
      ['Flights', 'Accommodation', 'Transfers', 'Festival access'].includes(item))
    : [];
  const lines = [
    'Hi Travel4life, I am a travel agent requesting a Tomorrowland B2B travel quote from India.',
    `Agency: ${agency}`,
    `Destination: ${destination}`,
  ];
  const departureCity = cleanField(details.departureCity);
  const travelWindow = cleanField(details.travelWindow, 40);
  if (departureCity) lines.push(`Departure city: ${departureCity}`);
  if (travelWindow) lines.push(`Travel window: ${travelWindow}`);
  if (travellers) lines.push(`Estimated travellers: ${travellers}`);
  if (components.length) lines.push(`Requested components: ${components.join(', ')}`);
  lines.push('Please confirm current availability, price and applicable terms.');

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
};

if (typeof document !== 'undefined') {
  const form = document.querySelector('[data-b2b-enquiry-form]');
  const status = document.querySelector('[data-b2b-enquiry-status]');
  const link = document.querySelector('[data-b2b-enquiry-link]');

  if (form && status && link) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const components = formData.getAll('components');
      link.href = createTomorrowlandB2BWhatsAppUrl({
        agency: formData.get('agency'),
        destination: formData.get('destination'),
        departureCity: formData.get('departureCity'),
        travelWindow: formData.get('travelWindow'),
        travellers: formData.get('travellers'),
        components,
      }, form.dataset.whatsappNumber);
      status.hidden = false;
      link.hidden = false;
    });
  }
}
