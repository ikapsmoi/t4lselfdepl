const directIdentifierKeys = new Set([
  'email',
  'emailaddress',
  'phone',
  'phonenumber',
  'mobile',
  'userid',
  'referreruserid',
  'newuserid',
  'firstname',
  'lastname',
  'fullname',
  'address',
  'ipaddress',
  'searchquery',
]);

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return sanitizeAnalyticsMetadata(value);
  }

  return value;
};

export const sanitizeAnalyticsMetadata = (metadata) => Object.fromEntries(
  Object.entries(metadata).flatMap(([key, value]) => {
    const normalizedKey = key.replace(/[^a-z]/gi, '').toLowerCase();
    return directIdentifierKeys.has(normalizedKey)
      ? []
      : [[key, sanitizeValue(value)]];
  }),
);
