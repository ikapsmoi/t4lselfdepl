import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, Save, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type TripStatus = 'active' | 'cancelled' | 'completed';

interface AdminTrip {
  id: string;
  host_id: string;
  title: string;
  category: string;
  location: string;
  start_date: string;
  end_date: string;
  itinerary: Record<string, unknown> | unknown[] | null;
  price_per_person: number;
  group_size: number;
  nomadic_badge: boolean;
  status: TripStatus;
  created_at: string;
  updated_at: string;
  currency: string;
  top_rated: boolean;
  images: string[] | null;
  difficulty: string | null;
  group_discount: number | null;
}

interface TripDraft {
  host_id: string;
  title: string;
  category: string;
  location: string;
  start_date: string;
  end_date: string;
  itineraryText: string;
  price_per_person: string;
  group_size: string;
  currency: string;
  status: TripStatus;
  nomadic_badge: boolean;
  top_rated: boolean;
  difficulty: string;
  group_discount: string;
  imagesText: string;
}

const PAGE_SIZE = 500;

const getDraft = (trip: AdminTrip): TripDraft => ({
  host_id: trip.host_id,
  title: trip.title,
  category: trip.category,
  location: trip.location,
  start_date: trip.start_date,
  end_date: trip.end_date,
  itineraryText: JSON.stringify(trip.itinerary ?? {}, null, 2),
  price_per_person: String(trip.price_per_person),
  group_size: String(trip.group_size),
  currency: trip.currency,
  status: trip.status,
  nomadic_badge: trip.nomadic_badge,
  top_rated: trip.top_rated,
  difficulty: trip.difficulty ?? '',
  group_discount: String(trip.group_discount ?? 0),
  imagesText: (trip.images ?? []).join('\n'),
});

const fieldClassName = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20';

export const TripsManager: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TripDraft | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TripStatus>('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTrips = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Trip management is unavailable.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const allTrips: AdminTrip[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error: queryError } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + PAGE_SIZE - 1)
          .returns<AdminTrip[]>();

        if (queryError) throw queryError;
        const page = data ?? [];
        allTrips.push(...page);
        if (page.length < PAGE_SIZE) break;
      }

      setTrips(allTrips);
      setSelectedTripId((current) => {
        if (current && allTrips.some((trip) => trip.id === current)) return current;
        return allTrips[0]?.id ?? null;
      });
    } catch (fetchError) {
      console.error('Failed to load trips for admin management:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load trips. Check Supabase permissions and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') void fetchTrips();
  }, [fetchTrips, user?.role]);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null;

  useEffect(() => {
    setDraft(selectedTrip ? getDraft(selectedTrip) : null);
  }, [selectedTrip]);

  const filteredTrips = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return trips.filter((trip) => {
      if (statusFilter !== 'all' && trip.status !== statusFilter) return false;
      if (!normalizedSearch) return true;
      return [trip.title, trip.location, trip.category, trip.host_id]
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [search, statusFilter, trips]);

  const updateDraft = <Key extends keyof TripDraft>(key: Key, value: TripDraft[Key]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setError('');
    setSuccess('');
  };

  const saveTrip = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTrip || !draft) return;

    let itinerary: AdminTrip['itinerary'];
    try {
      const parsed: unknown = JSON.parse(draft.itineraryText);
      if (parsed === null || typeof parsed !== 'object') {
        throw new Error('Itinerary must be a JSON object or array.');
      }
      itinerary = parsed as Record<string, unknown> | unknown[];
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'Itinerary must contain valid JSON.');
      return;
    }

    const price = Number(draft.price_per_person);
    const groupSize = Number(draft.group_size);
    const groupDiscount = Number(draft.group_discount);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(groupSize) || groupSize < 1 ||
      !Number.isFinite(groupDiscount) || groupDiscount < 0 || groupDiscount > 100) {
      setError('Enter a valid non-negative price, group size of at least 1, and discount between 0 and 100.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const update = {
        host_id: draft.host_id.trim(),
        title: draft.title.trim(),
        category: draft.category.trim(),
        location: draft.location.trim(),
        start_date: draft.start_date,
        end_date: draft.end_date,
        itinerary,
        price_per_person: price,
        group_size: groupSize,
        currency: draft.currency.trim().toUpperCase(),
        status: draft.status,
        nomadic_badge: draft.nomadic_badge,
        top_rated: draft.top_rated,
        difficulty: draft.difficulty.trim() || null,
        group_discount: groupDiscount,
        images: draft.imagesText.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      if (!update.host_id || !update.title || !update.category || !update.location || !update.currency ||
        !update.start_date || !update.end_date || new Date(update.end_date) < new Date(update.start_date)) {
        setError('Host ID, title, category, location, currency, and valid trip dates are required.');
        return;
      }

      const { data, error: updateError } = await supabase
        .from('trips')
        .update(update)
        .eq('id', selectedTrip.id)
        .select('*')
        .single();

      if (updateError) throw updateError;
      const savedTrip = data as AdminTrip;
      setTrips((current) => current.map((trip) => trip.id === savedTrip.id ? savedTrip : trip));
      setDraft(getDraft(savedTrip));
      setSuccess('Trip saved to Supabase.');
    } catch (saveError) {
      console.error('Failed to save trip changes:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this trip. Check Supabase permissions and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center rounded-xl bg-white p-10 text-gray-600"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Checking admin account…</div>;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="font-semibold">Sign in with your Supabase admin account</h2>
        <p className="mt-2 text-sm">Use the Sign In button in the site header. The shared footer password opens the admin area, but Supabase requires an authenticated admin profile to read or edit trip records.</p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h2 className="font-semibold">This account does not have the admin role.</h2>
        <p className="mt-2 text-sm">Sign out and use the Supabase account whose profile has role = admin.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5" aria-label="Manage Supabase trips">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage trips</h2>
          <p className="mt-1 text-sm text-gray-600">Edit trip details stored in the Supabase trips table. Host and record IDs remain unchanged.</p>
        </div>
        <button type="button" onClick={() => void fetchTrips()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh trips
        </button>
      </div>

      {!isSupabaseConfigured && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Supabase is not configured in this environment.</div>}
      {error && <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {success && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.5fr)]">
        <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="space-y-3 border-b border-gray-200 p-4">
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input aria-label="Search trips" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, location, host…" className={`${fieldClassName} mt-0 pl-9`} />
            </div>
            <select aria-label="Filter trips by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className={fieldClassName.replace('mt-1 ', '')}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <p className="text-xs text-gray-500">{filteredTrips.length} of {trips.length} trips</p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loading && trips.length === 0 ? (
              <p className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Loading Supabase trips…</p>
            ) : filteredTrips.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">{trips.length === 0 ? 'No trips found.' : 'No trips match these filters.'}</p>
            ) : filteredTrips.map((trip) => (
              <button
                key={trip.id}
                type="button"
                onClick={() => setSelectedTripId(trip.id)}
                className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-blue-50 ${selectedTripId === trip.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : ''}`}
              >
                <span className="block truncate text-sm font-semibold text-gray-900">{trip.title}</span>
                <span className="mt-1 block truncate text-xs text-gray-600">{trip.location} · {trip.category}</span>
                <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{trip.status}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          {!selectedTrip || !draft ? (
            <p className="py-10 text-center text-sm text-gray-500">Select a trip to review and edit its saved details.</p>
          ) : (
            <form onSubmit={saveTrip} className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Trip details</h3>
                  <p className="mt-1 break-all text-xs text-gray-500">Trip ID (unchangeable): {selectedTrip.id}</p>
                  <p className="mt-1 text-xs text-gray-500">Created {new Date(selectedTrip.created_at).toLocaleString()} · Updated {new Date(selectedTrip.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Host profile ID<input required value={draft.host_id} onChange={(event) => updateDraft('host_id', event.target.value)} className={fieldClassName} /><span className="mt-1 block text-xs font-normal text-gray-500">Must match an existing Supabase profile ID.</span></label>
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Title<input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Category<input required value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Location<input required value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Start date<input required type="date" value={draft.start_date} onChange={(event) => updateDraft('start_date', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">End date<input required type="date" value={draft.end_date} onChange={(event) => updateDraft('end_date', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Price per person<input required type="number" min="0" step="0.01" value={draft.price_per_person} onChange={(event) => updateDraft('price_per_person', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Currency<input required maxLength={3} value={draft.currency} onChange={(event) => updateDraft('currency', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Group capacity<input required type="number" min="1" step="1" value={draft.group_size} onChange={(event) => updateDraft('group_size', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Difficulty<input value={draft.difficulty} onChange={(event) => updateDraft('difficulty', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Group discount (%)<input type="number" min="0" max="100" step="0.01" value={draft.group_discount} onChange={(event) => updateDraft('group_discount', event.target.value)} className={fieldClassName} /></label>
                <label className="text-sm font-medium text-gray-700">Status<select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as TripStatus)} className={fieldClassName}><option value="active">Active</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={draft.nomadic_badge} onChange={(event) => updateDraft('nomadic_badge', event.target.checked)} className="rounded border-gray-300 text-blue-700 focus:ring-blue-600" /> Nomadic badge</label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={draft.top_rated} onChange={(event) => updateDraft('top_rated', event.target.checked)} className="rounded border-gray-300 text-blue-700 focus:ring-blue-600" /> Top rated</label>
              </div>

              <label className="block text-sm font-medium text-gray-700">Image URLs <span className="font-normal text-gray-500">(one URL per line)</span><textarea rows={4} value={draft.imagesText} onChange={(event) => updateDraft('imagesText', event.target.value)} className={fieldClassName} /></label>
              <label className="block text-sm font-medium text-gray-700">Itinerary and additional trip data <span className="font-normal text-gray-500">(JSON)</span><textarea required rows={14} spellCheck={false} value={draft.itineraryText} onChange={(event) => updateDraft('itineraryText', event.target.value)} className={`${fieldClassName} font-mono text-xs`} /></label>

              <div className="flex justify-end border-t border-gray-100 pt-4">
                <button type="submit" disabled={saving || loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save trip changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
