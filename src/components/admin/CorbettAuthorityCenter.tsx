import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowDownToLine, ArrowUpFromLine, BarChart3, CheckCircle2,
  Database, ExternalLink, FileSpreadsheet, HelpCircle, Search, ShieldCheck,
} from 'lucide-react';
import {
  analyzeSearchConsole,
  createSearchConsoleSnapshot,
} from '../../../scripts/corbett-authority.mjs';
import type {
  CorbettPageRegistry,
  EnrichmentQueue,
  SearchConsoleSnapshot,
} from '../../utils/corbettAuthority';

const STORAGE_KEY = 'travel4life.corbett-search-console-snapshots.v1';
const today = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

const downloadFile = (fileName: string, content: string, mimeType: string) => {
  const objectUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
};

const csvEscape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatPosition = (value: number) => value ? value.toFixed(1) : '—';

export const CorbettAuthorityCenter: React.FC = () => {
  const [section, setSection] = useState<'overview' | 'enrichment' | 'search'>('overview');
  const [queue, setQueue] = useState<EnrichmentQueue | null>(null);
  const [registry, setRegistry] = useState<CorbettPageRegistry | null>(null);
  const [snapshots, setSnapshots] = useState<SearchConsoleSnapshot[]>([]);
  const [snapshotDate, setSnapshotDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [queueResponse, registryResponse] = await Promise.all([
          fetch('/jim-corbett/enrichment-queue.json'),
          fetch('/jim-corbett/page-registry.json'),
        ]);
        if (!queueResponse.ok) throw new Error(`Enrichment queue request failed with HTTP ${queueResponse.status}.`);
        if (!registryResponse.ok) throw new Error(`Corbett page registry request failed with HTTP ${registryResponse.status}.`);
        const [queueData, registryData] = await Promise.all([queueResponse.json(), registryResponse.json()]);
        if (active) {
          setQueue(queueData as EnrichmentQueue);
          setRegistry(registryData as CorbettPageRegistry);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load Corbett authority data.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchConsoleSnapshot[];
        if (!Array.isArray(parsed)) throw new Error('Saved Search Console history has an invalid format.');
        setSnapshots(parsed);
      }
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : 'Unable to read local Search Console history.');
    }
    return () => { active = false; };
  }, []);

  const analysis = useMemo(() => (
    registry ? analyzeSearchConsole(snapshots, registry) : null
  ), [registry, snapshots]);

  const filteredProperties = useMemo(() => {
    if (!queue) return [];
    const normalizedSearch = searchText.trim().toLowerCase();
    return [...queue.properties]
      .filter((property) => statusFilter === 'ALL' || property.enrichmentStatus === statusFilter)
      .filter((property) => !normalizedSearch || `${property.name} ${property.slug}`.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => left.completenessScore - right.completenessScore || left.name.localeCompare(right.name));
  }, [queue, searchText, statusFilter]);

  const commitSnapshot = (snapshot: SearchConsoleSnapshot) => {
    const nextSnapshots = [...snapshots, snapshot].sort((left, right) => left.snapshotDate.localeCompare(right.snapshotDate) || left.importedAt.localeCompare(right.importedAt));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSnapshots));
      setSnapshots(nextSnapshots);
      setError('');
      setNotice(`Added ${snapshot.rowCount} observations from ${snapshot.fileName} as a new ${snapshot.snapshotDate} snapshot. Existing history was retained.`);
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : 'Unable to save the Search Console snapshot in this browser.');
    }
  };

  const handleSearchConsoleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const snapshot = createSearchConsoleSnapshot(await file.text(), snapshotDate, file.name);
      if (snapshots.some(({ id }) => id === snapshot.id)) {
        setNotice('This exact CSV and snapshot date have already been imported; history was left unchanged.');
        return;
      }
      commitSnapshot(snapshot);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Unable to import the Search Console CSV.');
    }
  };

  const exportEnrichmentWorksheet = () => {
    if (!queue) return;
    const headers = [
      'resort_slug', 'name', 'property_existence_verified', 'property_type', 'brand', 'locality', 'zone', 'gate', 'address',
      'description', 'website', 'phone', 'email', 'latitude', 'longitude', 'room_count', 'room_types',
      'capacity', 'amenities', 'images', 'pool', 'spa', 'restaurant', 'parking', 'wifi', 'safari_support',
      'wedding_facilities', 'wedding_capacity', 'conference_facilities', 'conference_capacity',
      'corporate_facilities', 'event_facilities', 'event_capacity', 'price_from', 'price_to',
      'price_unit', 'price_basis', 'source_url', 'verified_at', 'verified_by',
    ];
    const lines = [
      headers.join(','),
      ...queue.properties.map((property) => [
        property.slug, property.name, ...Array(headers.length - 2).fill(''),
      ].map(csvEscape).join(',')),
    ];
    downloadFile('corbett-enrichment-worksheet.csv', lines.join('\r\n'), 'text/csv;charset=utf-8');
    setNotice(`Downloaded the ${queue.summary.total}-entity enrichment worksheet. Import verified rows with \`npm run corbett:enrichment:import -- <file.csv>\`.`);
  };

  const exportSearchHistory = () => {
    downloadFile(
      'corbett-search-console-history.json',
      `${JSON.stringify({ schemaVersion: 1, snapshots }, null, 2)}\n`,
      'application/json',
    );
  };

  const handleRestoreHistory = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text()) as { schemaVersion?: number; snapshots?: SearchConsoleSnapshot[] };
      if (imported.schemaVersion !== 1 || !Array.isArray(imported.snapshots)) {
        throw new Error('History backup must use schemaVersion 1 and contain a snapshots array.');
      }
      const unique = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
      imported.snapshots.forEach((snapshot) => {
        if (!snapshot.id || !snapshot.snapshotDate || !Array.isArray(snapshot.observations)) {
          throw new Error('History backup contains a malformed Search Console snapshot.');
        }
        unique.set(snapshot.id, snapshot);
      });
      const restored = [...unique.values()].sort((left, right) => left.snapshotDate.localeCompare(right.snapshotDate));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      setSnapshots(restored);
      setError('');
      setNotice(`Restored history without removing existing snapshots. ${restored.length} distinct snapshots are now saved in this browser.`);
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : 'Unable to restore Search Console history.');
    }
  };

  const statuses = ['ALL', 'ENRICHMENT_REQUIRED', 'PARTIALLY_VERIFIED', 'PUBLISH_READY', 'NEEDS_REVIEW', 'INACTIVE'];

  return (
    <section className="space-y-6" aria-labelledby="corbett-authority-title">
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-900 p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">First-party data · human review · controlled indexation</p>
            <h2 id="corbett-authority-title" className="text-3xl font-bold tracking-tight sm:text-4xl">Corbett Google Command Center</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">Turn verified property facts and Search Console exports into a traceable improvement queue. No auto-publishing, guessed property details or automatic metadata changes.</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
            <span className="block text-xs text-emerald-100/70">Search Console snapshots</span>
            <strong className="text-2xl">{snapshots.length}</strong>
            <span className="ml-2 text-emerald-100/80">stored in this browser</span>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          ['overview', 'Authority loop'],
          ['enrichment', 'Resort enrichment'],
          ['search', 'Search intelligence'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id as 'overview' | 'enrichment' | 'search')}
            aria-pressed={section === id}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${section === id ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <p className="rounded-xl bg-white p-6 text-sm text-gray-600">Loading the current Corbett registry and enrichment queue…</p>}

      {!isLoading && section === 'overview' && queue && analysis && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Resort entities', value: queue.summary.total, sub: `${queue.summary.needsEnrichment} need enrichment`, icon: Database },
              { label: 'Ready for editorial review', value: queue.summary.readyForReview, sub: 'No automatic publication', icon: ShieldCheck },
              { label: 'Approved indexable routes', value: analysis.metrics.approvedIndexablePages, sub: 'Not a Google index count', icon: CheckCircle2 },
              { label: 'Search Console snapshots', value: snapshots.length, sub: snapshots.length ? `Latest ${analysis.latestDate}` : 'Import first-party query data', icon: BarChart3 },
            ].map(({ label, value, sub, icon: Icon }) => (
              <article key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-gray-500">{label}</p><Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" /></div>
                <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{sub}</p>
              </article>
            ))}
          </div>

          {registry?.page1Readiness && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Page-1 readiness · editorial assessment, not a ranking prediction</p>
                  <h3 className="mt-1 text-2xl font-bold text-amber-950">
                    {registry.page1Readiness.overallScore}/100 · {registry.page1Readiness.status} — {registry.page1Readiness.statusLabel}
                  </h3>
                </div>
                <span className="text-xs text-amber-800">Audited {registry.page1Readiness.auditDate}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {registry.pages.map((page) => (
                  <article key={page.url} className="rounded-lg border border-amber-200/80 bg-white/80 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm text-gray-900">{page.url}</strong>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${page.page1Status === 'RED' ? 'bg-red-100 text-red-800' : page.page1Status === 'GREEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                        {page.page1Status} · {page.indexable ? 'INDEXABLE' : 'NOINDEX'}
                      </span>
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-gray-600">
                      {(page.page1Reasons || []).map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-amber-900">{registry.page1Readiness.method}</p>
            </section>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2"><ArrowDownToLine className="h-5 w-5 text-emerald-800" /><h3 className="text-lg font-bold text-gray-900">What should we improve next?</h3></div>
              {analysis.nextActions.length ? (
                <ol className="space-y-3">
                  {analysis.nextActions.slice(0, 5).map((action, index) => (
                    <li key={`${action.targetUrl}-${action.title}`} className="flex gap-3 rounded-lg bg-gray-50 p-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs font-bold text-white">{index + 1}</span>
                      <div><p className="text-sm font-semibold text-gray-900">{action.title}</p><p className="mt-1 text-xs leading-5 text-gray-600">{action.reason}</p></div>
                    </li>
                  ))}
                </ol>
              ) : <p className="text-sm text-gray-600">No open improvement actions are available.</p>}
              <p className="mt-4 text-xs text-gray-500">Opportunity scoring is a prioritisation heuristic, not a ranking promise. Page 1 opportunities require impressions and average positions 4–20.</p>
            </article>

            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-800" /><h3 className="text-lg font-bold text-gray-900">Topical coverage</h3></div>
              <div className="space-y-4">
                {analysis.topicalCoverage.map((cluster) => (
                  <div key={cluster.cluster}>
                    <div className="mb-1 flex justify-between gap-3 text-xs"><span className="font-semibold text-gray-800">{cluster.cluster}</span><span className="text-gray-500">{cluster.coverageScore}/100 · {cluster.queryCount} tracked queries</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${cluster.coverageScore}%` }} /></div>
                    <p className="mt-1 text-[11px] text-gray-500">{cluster.pageUrl}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3"><HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" /><div><h3 className="text-sm font-bold text-amber-950">Competitor gaps need a real SERP review</h3><p className="mt-1 text-xs leading-5 text-amber-900">This dashboard does not scrape search results or infer competitor quality from rankings alone. Compare current results for content depth, locality proof, verified facilities, pricing basis, trust evidence, internal links and mobile experience; record evidence before changing page ownership.</p></div></div>
          </div>
        </div>
      )}

      {!isLoading && section === 'enrichment' && queue && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ['Total entities', queue.summary.total],
              ['Average completeness', `${queue.summary.averageCompleteness}%`],
              ['Verified', queue.summary.verified],
              ['Wedding-ready', queue.summary.weddingReady],
              ['MICE-ready', queue.summary.miceReady],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-xs text-gray-500">{label}</p><strong className="mt-1 block text-2xl text-gray-900">{value}</strong></div>)}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div><h3 className="text-lg font-bold text-gray-900">Verification queue</h3><p className="mt-1 text-sm text-gray-600">Only facts supported by a source URL, verification date and named verifier can move a record forward.</p></div>
              <button type="button" onClick={exportEnrichmentWorksheet} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"><ArrowDownToLine className="h-4 w-4" />Download verification worksheet</button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_230px]">
              <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><span className="sr-only">Search resort entities</span><input value={searchText} onChange={(event) => setSearchText(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm" placeholder="Search name or resort slug" /></label>
              <label><span className="sr-only">Filter enrichment status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm">{statuses.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'All workflow stages' : status.replaceAll('_', ' ')}</option>)}</select></label>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead><tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500"><th className="px-3 py-3">Resort entity</th><th className="px-3 py-3">Completeness</th><th className="px-3 py-3">Missing verified fields</th><th className="px-3 py-3">Stage</th><th className="px-3 py-3">SEO decision</th></tr></thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="border-b border-gray-100 align-top hover:bg-gray-50">
                      <td className="px-3 py-3"><strong className="block text-gray-900">{property.name}</strong><span className="text-xs text-gray-500">{property.category} · {property.slug}</span></td>
                      <td className="px-3 py-3"><div className="flex items-center gap-2"><span className="font-bold">{property.completenessScore}%</span><div className="h-1.5 w-20 rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${property.completenessScore}%` }} /></div></div></td>
                      <td className="max-w-[290px] px-3 py-3 text-xs leading-5 text-gray-600">{property.missingFields.length ? property.missingFields.join(', ') : 'Core page fields complete; editorial review still required.'}</td>
                      <td className="px-3 py-3"><span className="inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">{property.enrichmentStatus.replaceAll('_', ' ')}</span><span className="mt-1 block text-[10px] text-gray-500">{property.propertyExistenceStatus === 'VERIFIED' ? 'Property existence verified' : 'Source listed · existence not verified'} · availability contact to check</span></td>
                      <td className="px-3 py-3 text-xs"><strong>{property.pageReadiness.basic ? 'PUBLISH REVIEW' : 'NOINDEX DETAIL'}</strong><span className="mt-1 block text-gray-500">{property.pageReadiness.wedding ? 'Wedding ready · ' : ''}{property.pageReadiness.mice ? 'MICE ready' : 'No event page'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredProperties.length && <p className="p-6 text-center text-sm text-gray-500">No resort entities match this filter.</p>}
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-xs leading-5 text-gray-600">
              <strong className="text-gray-800">Current source status:</strong> {queue.summary.total} names imported; {queue.summary.verified} verified; {queue.summary.readyForReview} publish-ready for human review; {queue.summary.needsEnrichment} require enrichment. Verified prices additionally need a dated source and explicit room/occupancy/meal/tax basis. The enrichment CLI validates rows but does not generate or index resort detail pages.
            </div>
          </div>
        </div>
      )}

      {!isLoading && section === 'search' && analysis && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Organic clicks', analysis.metrics.clicks],
              ['Impressions', analysis.metrics.impressions.toLocaleString('en-IN')],
              ['CTR', formatPercent(analysis.metrics.ctr)],
              ['Average position', formatPosition(analysis.metrics.averagePosition)],
              ['Top 3 queries', analysis.metrics.topThreeQueries],
              ['Page 1 queries', analysis.metrics.pageOneQueries],
              ['Positions 4–20', analysis.metrics.opportunities],
              ['Query displacement', analysis.metrics.cannibalization],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-xs text-gray-500">{label}</p><strong className="mt-1 block text-2xl text-gray-900">{value}</strong></div>)}
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><div className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-emerald-800" /><h3 className="text-lg font-bold">Import a dated Search Console export</h3></div><p className="mt-1 max-w-2xl text-xs leading-5 text-gray-600">Query exports require Query (or Top queries), Clicks, Impressions and Position. Page, CTR, Date, Country and Device columns are optional. CSV snapshots are append-only and stored only in this browser profile.</p></div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-gray-600">Snapshot date
                  <input type="date" max={today()} value={snapshotDate} onChange={(event) => setSnapshotDate(event.target.value)} className="mt-1 block min-h-10 rounded-lg border border-gray-300 px-3 text-sm" />
                </label>
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-emerald-900 px-4 text-sm font-semibold text-white hover:bg-emerald-800"><ArrowUpFromLine className="h-4 w-4" />Import CSV<input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void handleSearchConsoleFile(event)} /></label>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={exportSearchHistory} disabled={!snapshots.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"><ArrowDownToLine className="h-4 w-4" />Export history backup</button>
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"><ArrowUpFromLine className="h-4 w-4" />Restore/merge backup<input type="file" accept=".json,application/json" className="sr-only" onChange={(event) => void handleRestoreHistory(event)} /></label>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-gray-500">The CSV is processed in the browser and is not uploaded to Travel4life or Google. Back up snapshots before changing devices or clearing browser storage. Re-importing the identical file for the same date is detected and skipped.</p>
          </section>

          {!snapshots.length ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center"><BarChart3 className="mx-auto h-8 w-8 text-gray-400" /><h3 className="mt-3 font-semibold text-gray-900">No Search Console data imported yet</h3><p className="mx-auto mt-1 max-w-xl text-sm text-gray-600">The opportunity, cannibalization and trend panels will populate after a dated export is imported. No rankings or search volume are fabricated.</p></div>
          ) : (
            <>
              <div className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-base font-bold">Page 1 breakthrough opportunities</h3>
                  <p className="mb-4 text-xs text-gray-500">Queries with at least 100 impressions and an average position between 4 and 20. Scoring is heuristic; recommendations need human approval.</p>
                  <div className="space-y-3">
                    {analysis.opportunities.slice(0, 8).map((query) => <div key={query.query} className="border-b border-gray-100 pb-3 last:border-0"><div className="flex justify-between gap-2"><strong className="text-sm">{query.query}</strong><span className="shrink-0 text-xs font-bold text-emerald-800">{query.opportunityScore}/100</span></div><p className="mt-1 text-xs text-gray-600">{query.position.toFixed(1)} avg position · {query.impressions.toLocaleString('en-IN')} impressions · {formatPercent(query.ctr)} CTR</p><p className="mt-1 text-xs text-gray-500">{query.recommendation}</p></div>)}
                    {!analysis.opportunities.length && <p className="text-sm text-gray-500">No queries meet the current impression and position threshold.</p>}
                  </div>
                </article>
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-base font-bold">Query ownership & displacement</h3>
                  <div className="max-h-[440px] space-y-3 overflow-auto">
                    {analysis.wrongPage.slice(0, 8).map((query) => <div key={query.query} className="rounded-lg bg-amber-50 p-3"><strong className="text-sm">{query.query}</strong><p className="mt-1 break-all text-xs text-gray-600">Observed: {query.observedPages.join(', ') || 'page dimension not in export'}</p><p className="mt-1 text-xs font-semibold text-amber-900">Owner: {query.targetUrl} · review, reposition or consolidate—never redirect automatically.</p></div>)}
                    {analysis.cannibalization.slice(0, 8).map((query) => <div key={`cannibal-${query.query}`} className="rounded-lg bg-red-50 p-3"><strong className="text-sm">{query.query}</strong><p className="mt-1 break-all text-xs text-gray-700">{query.observedPages.join(' · ')}</p><p className="mt-1 text-xs font-semibold text-red-900">Multiple URLs appear for this query. Human ownership review required.</p></div>)}
                    {!analysis.wrongPage.length && !analysis.cannibalization.length && <p className="text-sm text-gray-500">No displacement or multi-URL query was detected in this snapshot.</p>}
                  </div>
                </article>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-base font-bold">High impressions, low CTR</h3>
                  <p className="mb-3 text-xs text-gray-500">The CTR comparison uses a conservative internal position benchmark—not Google data. Recommendations do not change page metadata.</p>
                  {analysis.lowCtr.slice(0, 6).map((query) => <div key={query.query} className="border-b border-gray-100 py-2 last:border-0"><strong className="text-sm">{query.query}</strong><p className="mt-1 text-xs text-gray-600">{query.impressions.toLocaleString('en-IN')} impressions · {formatPercent(query.ctr)} CTR · position {query.position.toFixed(1)}</p><p className="mt-1 text-xs text-gray-500">Review title, description, intent match and rich-result eligibility; test one approved change at a time.</p></div>)}
                  {!analysis.lowCtr.length && <p className="text-sm text-gray-500">No high-impression low-CTR query detected.</p>}
                </article>
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-700" /><h3 className="text-base font-bold">Change alerts</h3></div>
                  <p className="mb-3 text-xs text-gray-500">Compares imported snapshots; it does not monitor Google continuously or read indexation status.</p>
                  {analysis.alerts.slice(0, 10).map((alert, index) => <div key={`${alert.type}-${alert.query}-${index}`} className="border-b border-gray-100 py-2 last:border-0"><span className="mr-2 rounded bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase">{alert.type}</span><strong className="text-sm">{alert.query}</strong><p className="mt-1 text-xs text-gray-600">{alert.recommendation}</p></div>)}
                  {!analysis.alerts.length && <p className="text-sm text-gray-500">No ranking-change alerts for the available snapshots. Import a previous and current period to compare.</p>}
                </article>
              </div>

              <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-base font-bold">Tracked queries · latest imported period {analysis.latestDate}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-xs">
                    <thead><tr className="border-b text-[10px] uppercase tracking-wide text-gray-500"><th className="py-2 pr-3">Query</th><th className="py-2 pr-3">Position bucket</th><th className="py-2 pr-3">Position</th><th className="py-2 pr-3">Impressions</th><th className="py-2 pr-3">CTR</th><th className="py-2 pr-3">Intended URL</th><th className="py-2">Review</th></tr></thead>
                    <tbody>{analysis.queries.slice(0, 100).map((query) => <tr key={query.query} className="border-b border-gray-100"><td className="py-2 pr-3 font-semibold text-gray-800">{query.query}</td><td className="py-2 pr-3">{query.positionBucket}</td><td className="py-2 pr-3">{formatPosition(query.position)}</td><td className="py-2 pr-3">{query.impressions.toLocaleString('en-IN')}</td><td className="py-2 pr-3">{formatPercent(query.ctr)}</td><td className="py-2 pr-3">{query.targetUrl}</td><td className="py-2">{query.wrongPage ? 'Wrong page' : query.cannibalization ? 'Multi-URL' : query.lowCtr ? 'CTR review' : '—'}</td></tr>)}</tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px] text-gray-500">Position buckets: 1–3 defend; 4–10 high-priority; 11–20 page-one breakthrough; 21–50 improve; 50+ investigate. Page-owned intent rules are an editable starting hypothesis.</p>
              </article>
            </>
          )}

          {snapshots.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-base font-bold">Append-only snapshot history</h3>
              <div className="mt-3 space-y-2">
                {[...snapshots].reverse().map((snapshot) => <div key={snapshot.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs"><span><strong>{snapshot.snapshotDate}</strong> · {snapshot.fileName}</span><span>{snapshot.rowCount} observations · imported {new Date(snapshot.importedAt).toLocaleString()}</span></div>)}
              </div>
            </section>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <a href="/jim-corbett/" className="inline-flex items-center gap-1 font-semibold text-emerald-900 hover:underline">View public Corbett hub <ExternalLink className="h-3.5 w-3.5" /></a>
        <span>Search Console CSV is never uploaded. Enrichment changes require a verified source and rebuild.</span>
      </div>
    </section>
  );
};
