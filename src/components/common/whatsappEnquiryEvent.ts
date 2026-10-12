export const OPEN_WHATSAPP_ENQUIRY_EVENT = 'travel4life:open-whatsapp-enquiry';

export function openWhatsAppEnquiry() {
  window.dispatchEvent(new Event(OPEN_WHATSAPP_ENQUIRY_EVENT));
}
