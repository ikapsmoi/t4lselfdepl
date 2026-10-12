import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalyticsEventPayload } from '../src/utils/analyticsPayload.mjs';

test('analytics payload removes direct identifiers and query-string data recursively', () => {
  const payload = createAnalyticsEventPayload({
    eventName: 'newsletter_enquiry_started',
    sessionId: 'session-123',
    metadata: {
      email: 'traveler@example.com',
      user_id: 'user-123',
      search_query: 'private search text',
      destination: 'Rajasthan',
      nested: {
        phone_number: '+1-555-0100',
        safe_value: 'kept',
      },
      entries: [{ full_name: 'Traveler Name', safe_value: 'also kept' }],
    },
    pageUrl: 'https://travel4life.example/newsletter?email=traveler%40example.com#signup',
    referrerSource: 'organic',
    timestamp: '2026-06-05T12:00:00.000Z',
  });

  assert.deepEqual(payload, {
    event_name: 'newsletter_enquiry_started',
    user_id: null,
    session_id: 'session-123',
    metadata: {
      destination: 'Rajasthan',
      nested: { safe_value: 'kept' },
      entries: [{ safe_value: 'also kept' }],
      url: 'https://travel4life.example/newsletter',
      referrer_source: 'organic',
      timestamp: '2026-06-05T12:00:00.000Z',
    },
  });
  assert.equal(JSON.stringify(payload).includes('traveler@example.com'), false);
  assert.equal(JSON.stringify(payload).includes('private search text'), false);
  assert.equal(JSON.stringify(payload).includes('+1-555-0100'), false);
});
