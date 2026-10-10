export const DEFAULT_MARKUP_RATE: number;
export function formatCurrency(amount: number, currency: string, locale?: string): string;
export function calculateVerifiedSellingPrice(input: {
  supplierNetCost: number | null;
  supplierCurrency: string;
  quoteObtainedAt: string | null;
  priceValidUntil: string | null;
  priceStatus: string;
  pricingBasis: 'per_person' | 'per_room' | 'group_total' | null;
  occupancyBasis?: string | null;
  markupRate?: number;
  markupAlreadyApplied?: boolean;
  now?: Date;
}): {
  status: 'verified_price' | 'quote_required';
  amount: number | null;
  reason?: string;
  currency?: string;
  basis?: 'per_person' | 'per_room' | 'group_total';
  occupancyBasis?: string | null;
  quoteObtainedAt?: string;
  priceValidUntil?: string;
  markupRate?: number;
};
export function calculateGroupTotal(input: {
  perPersonPrice: number;
  travellerCount: number;
  occupancyBasis?: string | null;
}): number;
