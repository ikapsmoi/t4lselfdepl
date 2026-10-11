import type { IndiaJourneyConcept } from '../catalog.mjs';

export const REGIONS = {
  US: { label: 'United States', currency: 'USD', symbol: '$', country: 'United States' },
  UK: { label: 'United Kingdom', currency: 'GBP', symbol: '£', country: 'United Kingdom' },
  DE: { label: 'Germany', currency: 'EUR', symbol: '€', country: 'Germany' },
  NL: { label: 'Netherlands', currency: 'EUR', symbol: '€', country: 'Netherlands' },
} as const;

export type RegionCode = keyof typeof REGIONS;
export type Journey = IndiaJourneyConcept;
