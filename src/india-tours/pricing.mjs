export const DEFAULT_MARKUP_RATE = 0.15;

const getCurrencyDigits = (currency) => {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
  } catch (error) {
    throw new RangeError(`Unsupported currency code: ${currency}`, { cause: error });
  }
};

export const formatCurrency = (amount, currency, locale = 'en') => {
  if (!Number.isFinite(amount)) throw new TypeError('Price must be a finite number.');
  getCurrencyDigits(currency);
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const calculateVerifiedSellingPrice = ({
  supplierNetCost,
  supplierCurrency,
  quoteObtainedAt,
  priceValidUntil,
  priceStatus,
  pricingBasis,
  occupancyBasis,
  markupRate = DEFAULT_MARKUP_RATE,
  markupAlreadyApplied = false,
  now = new Date(),
}) => {
  if (priceStatus !== 'verified_price') return { status: 'quote_required', amount: null, reason: 'Price is not verified.' };
  if (supplierNetCost === null || supplierNetCost === undefined) {
    return { status: 'quote_required', amount: null, reason: 'Supplier net cost is missing.' };
  }
  if (!Number.isFinite(supplierNetCost) || supplierNetCost <= 0) throw new RangeError('Supplier net cost must be greater than zero.');
  if (markupAlreadyApplied) throw new Error('Markup must not be applied to a price that already includes markup.');
  if (!quoteObtainedAt || Number.isNaN(Date.parse(quoteObtainedAt))) {
    return { status: 'quote_required', amount: null, reason: 'Supplier quote date is missing or invalid.' };
  }
  if (!priceValidUntil || Number.isNaN(Date.parse(priceValidUntil))) {
    return { status: 'quote_required', amount: null, reason: 'Supplier quote validity is missing or invalid.' };
  }
  if (Date.parse(priceValidUntil) < now.getTime()) {
    return { status: 'quote_required', amount: null, reason: 'Supplier quote has expired.' };
  }
  if (Date.parse(quoteObtainedAt) > now.getTime()) {
    return { status: 'quote_required', amount: null, reason: 'Supplier quote date is in the future.' };
  }
  if (!Number.isFinite(markupRate) || markupRate < 0) throw new RangeError('Markup rate must be a non-negative number.');
  if (!['per_person', 'per_room', 'group_total'].includes(pricingBasis)) {
    return { status: 'quote_required', amount: null, reason: 'Pricing basis is not verified.' };
  }
  if (pricingBasis === 'per_person' && !occupancyBasis) {
    return { status: 'quote_required', amount: null, reason: 'Per-person occupancy basis is missing.' };
  }

  const digits = getCurrencyDigits(supplierCurrency);
  const multiplier = 10 ** digits;
  const amount = Math.round(supplierNetCost * (1 + markupRate) * multiplier) / multiplier;
  return {
    status: 'verified_price',
    amount,
    currency: supplierCurrency,
    basis: pricingBasis,
    occupancyBasis: pricingBasis === 'per_person' ? occupancyBasis : null,
    quoteObtainedAt,
    priceValidUntil,
    markupRate,
  };
};

export const calculateGroupTotal = ({ perPersonPrice, travellerCount, occupancyBasis }) => {
  if (!Number.isFinite(perPersonPrice) || perPersonPrice <= 0) throw new RangeError('Per-person price must be greater than zero.');
  if (!Number.isInteger(travellerCount) || travellerCount < 1 || travellerCount > 40) {
    throw new RangeError('Traveller count must be a whole number between 1 and 40.');
  }
  if (!occupancyBasis) throw new Error('A verified occupancy basis is required for group calculations.');
  return perPersonPrice * travellerCount;
};
