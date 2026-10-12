export interface AnalyticsEventPayload {
  event_name: string;
  user_id: null;
  session_id: string;
  metadata: Record<string, unknown>;
}

export interface AnalyticsEventPayloadOptions {
  eventName: string;
  sessionId: string;
  metadata: Record<string, unknown>;
  pageUrl: string;
  referrerSource: string;
  timestamp: string;
}

export function createAnalyticsEventPayload(
  options: AnalyticsEventPayloadOptions,
): AnalyticsEventPayload;
