export type DispatchStatus = 'prepared' | 'opened' | 'sent' | 'failed' | 'skipped';

export interface VoucherCustomer {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  bookingReference: string;
  packageName: string;
  destination: string;
  travelDates: string;
  email: string;
  agentName: string;
  status: DispatchStatus;
  createdAt: string;
}

export interface VoucherFile {
  id: string;
  file: File;
  customerId: string;
  addedAt: string;
}

export interface DispatchHistoryEntry {
  id: string;
  customerName: string;
  phone: string;
  packageName: string;
  bookingReference: string;
  voucherNames: string[];
  status: DispatchStatus;
  createdAt: string;
  user: string;
  note: string;
}

export interface PhoneValidation {
  valid: boolean;
  normalized: string;
  message: string;
}

export const VOUCHER_MAX_FILE_SIZE = 20 * 1024 * 1024;
export const VOUCHER_MAX_FILES = 30;
export const DISPATCH_HISTORY_KEY = 'travel4life-voucher-dispatch-history-v1';

export const MESSAGE_TEMPLATES = [
  { id: 'voucher', label: 'Voucher delivery', line: 'Your travel vouchers are ready.' },
  { id: 'hotel', label: 'Hotel voucher', line: 'Your hotel voucher is ready.' },
  { id: 'flight', label: 'Flight documents', line: 'Your flight documents are ready.' },
  { id: 'complete', label: 'Complete travel documents', line: 'Your complete travel documents are ready.' },
  { id: 'festival', label: 'Festival package', line: 'Your festival travel documents are ready.' },
  { id: 'custom', label: 'Custom message', line: '' },
] as const;

const allowedMimeByExtension: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export const validateVoucherFile = async (file: File): Promise<string | null> => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const expectedMime = allowedMimeByExtension[extension];
  if (!expectedMime) return 'Use a PDF, PNG, JPG, JPEG, or WEBP file.';
  if (file.size === 0) return 'This file is empty.';
  if (file.size > VOUCHER_MAX_FILE_SIZE) return 'Files must be 20 MB or smaller.';
  if (file.type && file.type !== expectedMime) return 'The file extension and file type do not match.';

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  const isPdf = extension === 'pdf' && new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  const isPng = extension === 'png' && startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  const isJpeg = (extension === 'jpg' || extension === 'jpeg') && startsWith(0xff, 0xd8, 0xff);
  const isWebp = extension === 'webp'
    && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF'
    && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';

  return isPdf || isPng || isJpeg || isWebp ? null : 'The file contents do not match a supported document type.';
};

export const normalizePhoneNumber = (input: string, countryCode = '+91'): PhoneValidation => {
  const code = countryCode.replace(/\D/g, '');
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith(code)) {
    digits = digits.slice(code.length);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
    if (digits.startsWith(code)) digits = digits.slice(code.length);
  }

  const valid = code === '91'
    ? /^[6-9]\d{9}$/.test(digits)
    : digits.length >= 7 && digits.length <= 14 && /^[1-9]\d+$/.test(digits);
  return {
    valid,
    normalized: valid ? `+${code}${digits}` : '',
    message: valid
      ? 'Valid WhatsApp number format. Registration is not verified.'
      : code === '91'
        ? 'Please enter a valid 10-digit Indian mobile number.'
        : 'Please check the country code and phone number.',
  };
};

export const createVoucherMessage = (
  customer: VoucherCustomer,
  templateId: string,
  customMessage = '',
) => {
  const template = MESSAGE_TEMPLATES.find((item) => item.id === templateId) ?? MESSAGE_TEMPLATES[3];
  const message = templateId === 'custom'
    ? customMessage
    : `Hi {{customer_name}},\n\nGreetings from Travel4Life!\n\n${template.line}\n\nYour documents for {{package_name}} are ready.${customer.destination ? '\nDestination: {{destination}}' : ''}${customer.travelDates ? '\nTravel dates: {{travel_dates}}' : ''}\n\nBooking Reference: {{booking_reference}}\n\nPlease review the documents and let us know if you need any assistance.\n\nWarm regards,\n{{agent_name}}\nTravel4Life\n{{travel4life_website}}\n{{travel4life_phone}}`;

  const variables: Record<string, string> = {
    customer_name: customer.name || 'there',
    package_name: customer.packageName || 'your upcoming trip',
    booking_reference: customer.bookingReference || 'Not provided',
    travel_dates: customer.travelDates || 'Not provided',
    destination: customer.destination || 'Not provided',
    agent_name: customer.agentName || 'Travel4Life Team',
    travel4life_phone: '+91-9511446642',
    travel4life_website: 'www.travel4life.net',
  };

  return message.replace(/{{\s*([a-z_]+)\s*}}/gi, (_, key: string) => variables[key.toLowerCase()] ?? '');
};

export interface WhatsAppProvider {
  prepareMessage: (customer: VoucherCustomer, templateId: string, customMessage?: string) => string;
  openWebHandoff: (normalizedPhone: string, message: string) => boolean;
  sendMessage: () => Promise<'unsupported'>;
  sendDocument: () => Promise<'unsupported'>;
  getDeliveryStatus: () => Promise<'unsupported'>;
}

export const webHandoffProvider: WhatsAppProvider = {
  prepareMessage: createVoucherMessage,
  openWebHandoff: (normalizedPhone, message) => {
    const digits = normalizedPhone.replace(/\D/g, '');
    if (!digits || !message.trim()) return false;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    return true;
  },
  sendMessage: async () => 'unsupported',
  sendDocument: async () => 'unsupported',
  getDeliveryStatus: async () => 'unsupported',
};

export const safeFileName = (value: string) =>
  value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'voucher';

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};