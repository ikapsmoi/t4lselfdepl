import { sanitizeAnalyticsMetadata } from '../../supabase/functions/_shared/analyticsMetadata.mjs';

export const createAnalyticsEventPayload = ({
  eventName,
  sessionId,
  metadata,
  pageUrl,
  referrerSource,
  timestamp,
}) => {
  const page = new URL(pageUrl);

  return {
    event_name: eventName,
    user_id: null,
    session_id: sessionId,
    metadata: {
      ...sanitizeAnalyticsMetadata(metadata),
      url: `${page.origin}${page.pathname}`,
      referrer_source: referrerSource,
      timestamp,
    },
  };
};
