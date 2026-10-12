import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAnalyticsReportRequest } from '../supabase/functions/_shared/analyticsReportAuthorization.mjs';

const makeClientFactory = ({ user, authError, role = 'traveler', profileError } = {}) => (
  (_url, _key, options) => ({
    auth: {
      getUser: async (token) => {
        assert.equal(token, 'valid-token');
        assert.equal(options.global.headers.Authorization, 'Bearer valid-token');
        return { data: { user }, error: authError };
      },
    },
    from: (table) => {
      assert.equal(table, 'profiles');
      return {
        select: (columns) => {
          assert.equal(columns, 'role');
          return {
            eq: (column, id) => {
              assert.equal(column, 'id');
              assert.equal(id, user.id);
              return {
                maybeSingle: async () => ({ data: { role }, error: profileError }),
              };
            },
          };
        },
      };
    },
  })
);

const requestWithToken = (authorization) => new Request('https://example.test/analytics-report', {
  method: 'POST',
  headers: authorization ? { Authorization: authorization } : {},
});

test('analytics authorization rejects missing and malformed bearer tokens', async () => {
  for (const authorization of [undefined, 'Basic valid-token', 'Bearer ']) {
    const result = await authorizeAnalyticsReportRequest({
      request: requestWithToken(authorization),
      createClient: () => assert.fail('Must not create a client before validating the bearer token.'),
      supabaseUrl: 'https://project.supabase.co',
      anonKey: 'public-anon-key',
    });
    assert.deepEqual(result, { authorized: false, status: 401, error: 'Authentication required.' });
  }
});

test('analytics authorization rejects invalid sessions before checking a profile', async () => {
  const result = await authorizeAnalyticsReportRequest({
    request: requestWithToken('Bearer valid-token'),
    createClient: makeClientFactory({ user: null, authError: new Error('invalid token') }),
    supabaseUrl: 'https://project.supabase.co',
    anonKey: 'public-anon-key',
  });
  assert.equal(result.authorized, false);
  assert.equal(result.status, 401);
});

test('analytics authorization denies authenticated non-admins', async () => {
  const result = await authorizeAnalyticsReportRequest({
    request: requestWithToken('Bearer valid-token'),
    createClient: makeClientFactory({ user: { id: 'traveler-id' }, role: 'traveler' }),
    supabaseUrl: 'https://project.supabase.co',
    anonKey: 'public-anon-key',
  });
  assert.deepEqual(result, { authorized: false, status: 403, error: 'Administrator access required.' });
});

test('analytics authorization allows an authenticated admin only after profile verification', async () => {
  const result = await authorizeAnalyticsReportRequest({
    request: requestWithToken('Bearer valid-token'),
    createClient: makeClientFactory({ user: { id: 'admin-id' }, role: 'admin' }),
    supabaseUrl: 'https://project.supabase.co',
    anonKey: 'public-anon-key',
  });
  assert.deepEqual(result, { authorized: true, userId: 'admin-id' });
});

test('analytics authorization surfaces profile lookup failures instead of granting access', async () => {
  await assert.rejects(
    authorizeAnalyticsReportRequest({
      request: requestWithToken('Bearer valid-token'),
      createClient: makeClientFactory({
        user: { id: 'admin-id' },
        role: 'admin',
        profileError: new Error('database unavailable'),
      }),
      supabaseUrl: 'https://project.supabase.co',
      anonKey: 'public-anon-key',
    }),
    /Unable to verify analytics administrator role/,
  );
});
