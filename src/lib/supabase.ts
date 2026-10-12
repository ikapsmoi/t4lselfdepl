import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const mockError = {
  code: 'SUPABASE_NOT_CONFIGURED',
  message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live data.',
};

const createMockQueryBuilder = () => {
  const query = {
    select: () => query,
    eq: () => query,
    neq: () => query,
    gt: () => query,
    gte: () => query,
    lt: () => query,
    lte: () => query,
    like: () => query,
    ilike: () => query,
    order: () => query,
    limit: () => query,
    range: () => query,
    maybeSingle: async () => ({ data: null, error: mockError }),
    single: async () => ({ data: null, error: mockError }),
    insert: async () => ({ data: null, error: mockError }),
    update: async () => ({ data: null, error: mockError }),
    upsert: async () => ({ data: null, error: mockError }),
    delete: async () => ({ data: null, error: mockError }),
  };

  return query;
};

const createFallbackSupabaseClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => undefined,
        },
      },
    }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: mockError }),
    signUp: async () => ({ data: { user: null, session: null }, error: mockError }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: mockError }),
  },
  from: () => createMockQueryBuilder(),
  functions: {
    invoke: async () => ({ data: null, error: mockError }),
  },
  channel: () => ({
    on: () => ({ subscribe: () => ({ unsubscribe: () => undefined }) }),
    subscribe: () => ({ unsubscribe: () => undefined }),
  }),
  removeChannel: () => undefined,
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: mockError }),
      download: async () => ({ data: null, error: mockError }),
      list: async () => ({ data: [], error: mockError }),
      remove: async () => ({ data: null, error: mockError }),
    }),
  },
});

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured; the app will run in read-only fallback mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live data.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      global: { headers: {} },
    })
  : createFallbackSupabaseClient();