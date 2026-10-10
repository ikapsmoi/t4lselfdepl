import type { IndiaJourneyConcept } from './catalog.mjs';

export function sanitizeEnquiryText(value: string | number | null | undefined, maxLength: number): string;
export function createIndiaEnquiryMessage(input: {
  journey: IndiaJourneyConcept;
  travellerName: string;
  travellerEmail: string;
  travellerCount: number | string;
  travelDates?: string;
  budget?: string;
  accommodation?: string;
  pageUrl?: string;
}): {
  message: string;
  name: string;
  email: string;
  travellerCount: number;
};
