import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowUpRight, BarChart3, CheckCircle2, FileUp, HelpCircle, Loader2, Save, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import {
  getOpportunityScore,
  getPageReadiness,
  normalizeSeoQuery,
  parseSearchConsoleCsv,
  suggestQueryOwner,
} from '../../utils/seoGrowth.mjs';

type SeoCluster = 'tomorrowland' | 'corbett' | 'europe';
type AssignmentCluster = 'brand' | SeoCluster | 'other';
type ImportDimension = 'query' | 'page' | 'search_appearance';
type Priority = 'P1' | 'P2' | 'P3';
type QueryAssignmentDraft = { cluster: AssignmentCluster; targetUrl: string };

interface QueryOwner {
  query_key: string;
  query: string;
  cluster: 'brand' | SeoCluster | 'other';
  destination: string;
  intent: string;
  commercial_value: number;
  target_url: string;
  secondary_url: string | null;
  current_position: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  priority: Priority;
  status: string;
  evidence_status: 'measured' | 'hypothesis';
}

interface GscImport {
  id: string;
  dimension: ImportDimension;
  file_name: string;
  period_start: string | null;
  period_end: string | null;
  row_count: number;
  imported_at: string;
}

interface GscRow {
  import_id: string;
  dimension_value: string;
  value_key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  average_position: number;
}

interface PageScore {
  url: string;
  cluster: SeoCluster;
  intent_match: number | null;
  content_quality: number | null;
  entity_coverage: number | null;
  data_quality: number | null;
  internal_authority: number | null;
  technical_seo: number | null;
  schema_quality: number | null;
  trust_evidence: number | null;
  ctr_potential: number | null;
  conversion: number | null;
  evidence_notes: string;
  assessed_at: string | null;
}

interface ChangeLog {
  id: string;
  changed_on: string;
  url: string;
  query: string | null;
  change: string;
  reason: string;
  baseline: Record<string, unknown>;
  result: Record<string, unknown>;
}

const CLUSTERS: Array<{ id: SeoCluster; label: string; entity: string }> = [
  { id: 'tomorrowland', label: 'Tomorrowland', entity: 'Tomorrowland festival travel' },
  { id: 'corbett', label: 'Jim Corbett', entity: 'Jim Corbett travel' },
  { id: 'europe', label: 'Europe', entity: 'Europe travel' },
];

const READINESS_DIMENSIONS: Array<{ key: keyof PageScore; label: string; max: number }> = [
  { key: 'intent_match', label: 'Search intent match', max: 15 },
  { key: 'content_quality', label: 'Content quality', max: 15 },
  { key: 'entity_coverage', label: 'Entity coverage', max: 10 },
  { key: 'data_quality', label: 'Data quality', max: 10 },
  { key: 'internal_authority', label: 'Internal authority', max: 10 },
  { key: 'technical_seo', label: 'Technical SEO', max: 15 },
  { key: 'schema_quality', label: 'Structured data', max: 5 },
  { key: 'trust_evidence', label: 'Trust and evidence', max: 5 },
  { key: 'ctr_potential', label: 'CTR potential', max: 5 },
  { key: 'conversion', label: 'Conversion path', max: 5 },
];

const CLUSTER_PAGES: Record<SeoCluster, string[]> = {
  tomorrowland: [
    '/tomorrowland/', '/tomorrowland/packages/', '/tomorrowland/from-india/',
    '/tomorrowland/cost-from-india/', '/tomorrowland/belgium/',
    '/tomorrowland/winter/', '/tomorrowland/thailand/',
  ],
  corbett: [
    '/jim-corbett/', '/jim-corbett/resorts/', '/jim-corbett/weddings/', '/jim-corbett/mice/',
  ],
  europe: [
    '/europe/', '/europe/tours-from-india/', '/europe/tour-cost/',
    '/europe/switzerland/', '/europe/france/', '/europe/italy/',
    '/europe/paris-switzerland/', '/europe/france-switzerland-italy/',
  ],
};

const PAGE_SCORE_KEYS: Array<keyof PageScore> = READINESS_DIMENSIONS.map(({ key }) => key);

const numberFormat = new Intl.NumberFormat('en-IN');
const percentageFormat = new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 2 });
const positionFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

const formatMetric = (value: number | null | undefined) => value === null || value === undefined
  ? '—'
  : numberFormat.format(value);
const formatPosition = (value: number | null | undefined) => value === null || value === undefined
  ? '—'
  : positionFormat.format(value);
const formatCtr = (value: number | null | undefined) => value === null || value === undefined
  ? '—'
  : percentageFormat.format(value);

const cardClass = 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm';
const inputClass = 'mt-1 min-h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20';

const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export const SeoGrowthWarRoom: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [cluster, setCluster] = useState<SeoCluster>('tomorrowland');
  const [owners, setOwners] = useState<QueryOwner[]>([]);
  const [imports, setImports] = useState<GscImport[]>([]);
  const [queryRows, setQueryRows] = useState<GscRow[]>([]);
  const [pageRows, setPageRows] = useState<GscRow[]>([]);
  const [readinessRows, setReadinessRows] = useState<PageScore[]>([]);
  const [changeRows, setChangeRows] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingReadiness, setSavingReadiness] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dimension, setDimension] = useState<ImportDimension>('query');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [selectedScoreUrl, setSelectedScoreUrl] = useState(CLUSTER_PAGES.tomorrowland[0]);
  const [scoreDraft, setScoreDraft] = useState<PageScore | null>(null);
  const [changeDraft, setChangeDraft] = useState({ url: '', query: '', change: '', reason: '' });
  const [querySearch, setQuerySearch] = useState('');
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, QueryAssignmentDraft>>({});

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured || user?.role !== 'admin') return;
    setLoading(true);
    setError('');
    try {
      const [ownerResult, importResult, readinessResult, changeResult] = await Promise.all([
        supabase.from('seo_query_ownership').select('*').order('priority').order('query'),
        supabase.from('seo_gsc_imports').select('*').order('imported_at', { ascending: false }).limit(30),
        supabase.from('seo_page_readiness').select('*').order('url'),
        supabase.from('seo_change_log').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      if (ownerResult.error) throw ownerResult.error;
      if (importResult.error) throw importResult.error;
      if (readinessResult.error) throw readinessResult.error;
      if (changeResult.error) throw changeResult.error;

      const loadedImports = (importResult.data ?? []) as GscImport[];
      setOwners((ownerResult.data ?? []) as QueryOwner[]);
      setImports(loadedImports);
      setReadinessRows((readinessResult.data ?? []) as PageScore[]);
      setChangeRows((changeResult.data ?? []) as ChangeLog[]);

      const latestQueryImport = loadedImports.find((item) => item.dimension === 'query');
      const latestPageImport = loadedImports.find((item) => item.dimension === 'page');
      const [latestQueryResult, latestPageResult] = await Promise.all([
        latestQueryImport
          ? supabase.from('seo_gsc_rows').select('*').eq('import_id', latestQueryImport.id)
          : Promise.resolve({ data: [], error: null }),
        latestPageImport
          ? supabase.from('seo_gsc_rows').select('*').eq('import_id', latestPageImport.id)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (latestQueryResult.error) throw latestQueryResult.error;
      if (latestPageResult.error) throw latestPageResult.error;
      setQueryRows((latestQueryResult.data ?? []) as GscRow[]);
      setPageRows((latestPageResult.data ?? []) as GscRow[]);
    } catch (loadError) {
      console.error('Failed to load SEO war room data:', loadError);
      setError(errorMessage(loadError, 'Could not load SEO data from Supabase.'));
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setSelectedScoreUrl(CLUSTER_PAGES[cluster][0]);
  }, [cluster]);

  const ownersForCluster = useMemo(
    () => owners.filter((owner) => owner.cluster === cluster),
    [cluster, owners],
  );
  const ownerByKey = useMemo(
    () => new Map(owners.map((owner) => [owner.query_key, owner])),
    [owners],
  );
  const measuredRows = useMemo(() => {
    if (cluster === 'tomorrowland') {
      return queryRows.filter((row) => ownerByKey.get(row.value_key)?.cluster === cluster);
    }
    return queryRows.filter((row) => ownerByKey.get(row.value_key)?.cluster === cluster);
  }, [cluster, ownerByKey, queryRows]);

  const visibleRows = useMemo(() => {
    const search = normalizeSeoQuery(querySearch);
    return measuredRows
      .filter((row) => !search || row.dimension_value.toLocaleLowerCase('en').includes(search))
      .map((row) => {
        const owner = ownerByKey.get(row.value_key);
        return { row, owner, score: owner ? getOpportunityScore({
          impressions: row.impressions,
          position: row.average_position,
          ctr: row.ctr,
          commercialValue: owner.commercial_value,
        }) : 0 };
      })
      .sort((left, right) => right.score - left.score || right.row.impressions - left.row.impressions);
  }, [measuredRows, ownerByKey, querySearch]);

  const pageReadinessMap = useMemo(
    () => new Map(readinessRows.map((row) => [row.url, row])),
    [readinessRows],
  );
  const selectedReadiness = pageReadinessMap.get(selectedScoreUrl);

  useEffect(() => {
    const existing = selectedReadiness;
    setScoreDraft(existing ? { ...existing } : {
      url: selectedScoreUrl,
      cluster,
      intent_match: null,
      content_quality: null,
      entity_coverage: null,
      data_quality: null,
      internal_authority: null,
      technical_seo: null,
      schema_quality: null,
      trust_evidence: null,
      ctr_potential: null,
      conversion: null,
      evidence_notes: '',
      assessed_at: null,
    });
  }, [cluster, selectedReadiness, selectedScoreUrl]);

  const currentImport = imports.find((item) => item.dimension === 'query');
  const pagesImport = imports.find((item) => item.dimension === 'page');
  const clusterScores = CLUSTER_PAGES[cluster].map((url) => {
    const score = pageReadinessMap.get(url);
    return { url, result: score ? getPageReadiness(score) : getPageReadiness({}) };
  });
  const priorityOpportunity = visibleRows.find(({ row }) =>
    row.impressions >= 5 && row.average_position >= 4 && row.average_position <= 20)
    ?? visibleRows.find(({ row }) => row.impressions >= 5 && row.average_position <= 10);
  const unmappedRows = queryRows.filter((row) => !ownerByKey.has(row.value_key));
  const clusterPageRows = pageRows.filter((row) => {
    const rawUrl = row.dimension_value.toLocaleLowerCase('en');
    return rawUrl.includes(`/${cluster === 'corbett' ? 'jim-corbett' : cluster}/`);
  });
  const homepageVariants = pageRows.filter((row) => {
    try {
      const parsed = new URL(row.dimension_value);
      return parsed.pathname === '/' || parsed.pathname === '/index.php';
    } catch {
      return false;
    }
  });

  const importCsv = async (file: File | undefined) => {
    if (!file || !user || user.role !== 'admin') return;
    setUploading(true);
    setError('');
    setNotice('');
    let importId: string | null = null;
    try {
      if (periodStart && periodEnd && periodStart > periodEnd) {
        throw new Error('The report start date must be before its end date.');
      }
      const parsedRows = parseSearchConsoleCsv(await file.text());
      if (parsedRows.length > 10000) throw new Error('Import is limited to 10,000 rows per file.');
      const { data: importRecord, error: importError } = await supabase
        .from('seo_gsc_imports')
        .insert({
          dimension,
          file_name: file.name,
          period_start: periodStart || null,
          period_end: periodEnd || null,
          row_count: parsedRows.length,
          imported_by: user.id,
        })
        .select('*')
        .single();
      if (importError) throw importError;
      importId = (importRecord as GscImport).id;

      const rowsToInsert = parsedRows.map((row) => ({
        import_id: importId,
        dimension_value: row.dimensionValue,
        value_key: row.valueKey,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        average_position: row.averagePosition,
      }));

      for (let offset = 0; offset < rowsToInsert.length; offset += 500) {
        const { error: rowError } = await supabase.from('seo_gsc_rows').insert(rowsToInsert.slice(offset, offset + 500));
        if (rowError) throw rowError;
      }

      let ownerUpdateCount = 0;
      if (dimension === 'query') {
        const ownersByKey = new Map(owners.map((owner) => [owner.query_key, owner]));
        const updatedOwners = parsedRows.flatMap((row) => {
          const owner = ownersByKey.get(row.valueKey);
          if (!owner) return [];
          ownerUpdateCount += 1;
          return [{
            ...owner,
            current_position: row.averagePosition,
            impressions: row.impressions,
            clicks: row.clicks,
            ctr: row.ctr,
            evidence_status: 'measured',
            updated_at: new Date().toISOString(),
          }];
        });
        if (updatedOwners.length) {
          const { error: ownerError } = await supabase
            .from('seo_query_ownership')
            .upsert(updatedOwners, { onConflict: 'query_key' });
          if (ownerError) throw ownerError;
        }
      }

      setNotice(`Imported ${parsedRows.length} ${dimension.replace('_', ' ')} rows. ${ownerUpdateCount} mapped queries now have measured metrics.`);
      await loadData();
    } catch (importError) {
      if (importId) {
        const { error: cleanupError } = await supabase.from('seo_gsc_imports').delete().eq('id', importId);
        if (cleanupError) console.error('Unable to roll back incomplete Search Console import:', cleanupError);
      }
      console.error('Search Console CSV import failed:', importError);
      setError(errorMessage(importError, 'Search Console CSV import failed.'));
    } finally {
      setUploading(false);
    }
  };

  const getAssignmentDraft = (row: GscRow): QueryAssignmentDraft => {
    const suggestion = suggestQueryOwner(row.dimension_value);
    const matchedCluster = CLUSTERS.find(({ id }) => id === suggestion.cluster)?.id;
    return assignmentDrafts[row.value_key] ?? {
      cluster: suggestion.cluster === 'brand' ? 'brand' : matchedCluster ?? 'other',
      targetUrl: suggestion.cluster === 'other' ? '' : suggestion.targetUrl,
    };
  };

  const updateAssignmentDraft = (row: GscRow, updates: Partial<QueryAssignmentDraft>) => {
    setAssignmentDrafts((current) => ({
      ...current,
      [row.value_key]: { ...getAssignmentDraft(row), ...updates },
    }));
  };

  const assignQuery = async (row: GscRow) => {
    const draft = getAssignmentDraft(row);
    const targetUrl = draft.targetUrl.trim();
    if (!targetUrl.startsWith('/') || targetUrl.startsWith('//') || targetUrl.includes('..') || targetUrl.includes('#')) {
      setError('Choose a valid same-site target path before assigning this query.');
      return;
    }

    try {
      const { error: saveError } = await supabase.from('seo_query_ownership').insert({
        query_key: row.value_key,
        query: row.dimension_value,
        cluster: draft.cluster,
        destination: draft.cluster === 'brand'
          ? 'Travel4Life'
          : CLUSTERS.find((item) => item.id === draft.cluster)?.entity ?? 'Other / needs review',
        intent: 'Search Console query; manually assigned after intent review.',
        commercial_value: 3,
        target_url: targetUrl,
        priority: 'P2',
        status: 'needs-review',
        evidence_status: 'measured',
        current_position: row.average_position,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: row.ctr,
      });
      if (saveError) throw saveError;
    } catch (saveError) {
      console.error('Failed to save Search Console query ownership:', saveError);
      setError(errorMessage(saveError, 'Could not assign a page owner to this query.'));
      return;
    }
    setAssignmentDrafts((current) => {
      const next = { ...current };
      delete next[row.value_key];
      return next;
    });
    setNotice(`Assigned "${row.dimension_value}" to ${targetUrl} for review.`);
    await loadData();
  };

  const saveReadiness = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scoreDraft || !user) return;
    if (!scoreDraft.evidence_notes.trim()) {
      setError('Add evidence notes describing what was reviewed before saving the readiness assessment.');
      return;
    }
    const readiness = getPageReadiness(scoreDraft);
    if (readiness.total === null) {
      setError('Score all ten dimensions before saving the readiness assessment.');
      return;
    }
    setSavingReadiness(true);
    setError('');
    setNotice('');
    const payload = {
      url: scoreDraft.url,
      cluster,
      ...Object.fromEntries(PAGE_SCORE_KEYS.map((key) => [key, scoreDraft[key]])),
      evidence_notes: scoreDraft.evidence_notes.trim(),
      assessed_by: user.id,
      assessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      const { error: saveError } = await supabase.from('seo_page_readiness').upsert(payload, { onConflict: 'url' });
      if (saveError) throw saveError;
      setNotice('Readiness score and evidence notes saved.');
      await loadData();
    } catch (saveError) {
      console.error('Failed to save SEO readiness score:', saveError);
      setError(errorMessage(saveError, 'Could not save the readiness score.'));
    } finally {
      setSavingReadiness(false);
    }
  };

  const saveChangeLog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !changeDraft.url || !changeDraft.change || !changeDraft.reason) return;
    try {
      const { error: saveError } = await supabase.from('seo_change_log').insert({
        url: changeDraft.url,
        query: changeDraft.query.trim() || null,
        change: changeDraft.change.trim(),
        reason: changeDraft.reason.trim(),
        created_by: user.id,
        baseline: {},
        result: {},
      });
      if (saveError) throw saveError;
    } catch (saveError) {
      console.error('Failed to record SEO change:', saveError);
      setError(errorMessage(saveError, 'Could not add the SEO change log entry.'));
      return;
    }
    setChangeDraft({ url: '', query: '', change: '', reason: '' });
    setNotice('SEO change recorded. Add later Search Console imports to measure the result.');
    await loadData();
  };

  if (authLoading) {
    return <div className="flex items-center justify-center rounded-xl bg-white p-8 text-gray-600"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Checking account…</div>;
  }
  if (!isSupabaseConfigured) {
    return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Supabase is not configured. The SEO command center requires the protected Supabase tables.</div>;
  }
  if (!user) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><h2 className="font-semibold">Sign in with a Supabase admin account</h2><p className="mt-1">The footer password opens the dashboard; Search Console data and SEO assessments are restricted to the authenticated Supabase admin role.</p></div>;
  }
  if (user.role !== 'admin') {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900"><h2 className="font-semibold">Admin profile required</h2><p className="mt-1">Sign in with the Supabase account whose profile role is admin.</p></div>;
  }

  return (
    <section className="space-y-6" aria-labelledby="seo-war-room-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Travel4Life Organic Growth Command Center</p>
          <h2 id="seo-war-room-title" className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">SEO War Room</h2>
          <p className="mt-1 text-sm text-gray-600">Measured Search Console data, one primary query owner, and evidence-based next actions.</p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          <BarChart3 className="h-4 w-4" /> {loading ? 'Refreshing…' : 'Refresh data'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="tablist" aria-label="SEO destination cluster">
        {CLUSTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={cluster === item.id}
            onClick={() => setCluster(item.id)}
            className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition ${cluster === item.id ? 'border-blue-700 bg-blue-700 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div role="status" className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}
      {loading && <div className="sr-only" aria-live="polite">Refreshing SEO data</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tracked query owners</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{ownersForCluster.length}</p>
          <p className="mt-1 text-xs text-gray-500">{ownersForCluster.filter((item) => item.evidence_status === 'measured').length} measured · {ownersForCluster.filter((item) => item.evidence_status === 'hypothesis').length} hypotheses</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Latest query export</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{currentImport ? numberFormat.format(measuredRows.length) : '—'}</p>
          <p className="mt-1 text-xs text-gray-500">{currentImport ? `${currentImport.file_name} · ${currentImport.period_start || 'period not set'}` : 'No Search Console query CSV imported yet'}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Positions 4–20</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{numberFormat.format(measuredRows.filter((row) => row.impressions >= 5 && row.average_position >= 4 && row.average_position <= 20).length)}</p>
          <p className="mt-1 text-xs text-gray-500">At least 5 impressions in the imported query rows</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Page readiness</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{clusterScores.filter(({ result }) => result.total !== null).length}/{clusterScores.length}</p>
          <p className="mt-1 text-xs text-gray-500">Manual evidence scorecards complete</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-2 text-blue-950"><Sparkles aria-hidden="true" className="h-5 w-5" /><h3 className="font-semibold">Next best action</h3></div>
          {priorityOpportunity?.owner ? (
            <>
              <p className="mt-3 text-lg font-bold text-gray-900">Improve “{priorityOpportunity.row.dimension_value}” on {priorityOpportunity.owner.target_url}</p>
              <p className="mt-2 text-sm text-gray-700">{priorityOpportunity.row.impressions} impressions, position {formatPosition(priorityOpportunity.row.average_position)}, {formatCtr(priorityOpportunity.row.ctr)} CTR, commercial value {priorityOpportunity.owner.commercial_value}/5.</p>
              <p className="mt-2 text-xs text-gray-600">Internal opportunity score: {priorityOpportunity.score}/100. This prioritization heuristic is not a ranking forecast.</p>
              <a href={priorityOpportunity.owner.target_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-800 underline">Review target page <ArrowUpRight className="h-4 w-4" /></a>
            </>
          ) : (
            <p className="mt-3 text-sm text-blue-950">Import a current Queries.csv export to identify measured position 4–20 and low-CTR opportunities in this cluster. Existing planned queries are explicitly unverified.</p>
          )}
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-950"><HelpCircle aria-hidden="true" className="h-5 w-5" /><h3 className="font-semibold">Historical baseline caveat</h3></div>
          <p className="mt-2 text-sm text-amber-950">The supplied brief states about 52 clicks and 1,113 impressions over 12 months. The attached export instead has 92 daily rows (22 Jun–21 Sep 2026), 56 clicks/680 impressions in Chart.csv, 27/292 across its 47 query rows, and 56/882 across four page rows.</p>
          <p className="mt-2 text-xs text-amber-900">These dimensions do not reconcile to one baseline. No Tomorrowland, Corbett, or Europe query/page row appears in the supplied exports. Never combine these counts as if they were one report total.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.75fr)_minmax(0,1.5fr)]">
        <div className={cardClass}>
          <h3 className="font-semibold text-gray-900">Import Search Console CSV</h3>
          <p className="mt-1 text-xs leading-5 text-gray-600">Upload Queries.csv, Pages.csv, or Search appearance.csv. Data is stored in the admin-only Supabase tables with the selected reporting period.</p>
          <label className="mt-4 block text-sm font-medium text-gray-700">Report dimension
            <select value={dimension} onChange={(event) => setDimension(event.target.value as ImportDimension)} className={inputClass}>
              <option value="query">Queries</option>
              <option value="page">Pages</option>
              <option value="search_appearance">Search appearance</option>
            </select>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-gray-700">Period start<input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className={inputClass} /></label>
            <label className="text-sm font-medium text-gray-700">Period end<input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} className={inputClass} /></label>
          </div>
          <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {uploading ? 'Importing…' : 'Choose CSV and import'}
            <input type="file" accept=".csv,text/csv" disabled={uploading} className="sr-only" onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              void importCsv(file);
            }} />
          </label>
          <p className="mt-3 text-xs text-gray-500">Imports are retained as dated snapshots. Rows omitted by Search Console privacy thresholds do not prove a query has zero demand.</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Measured query opportunities</h3>
              <p className="mt-1 text-xs text-gray-500">Latest imported Queries.csv rows with an assigned primary URL. CTR expectations in the score are internal heuristics.</p>
            </div>
            <label className="relative block sm:w-64"><span className="sr-only">Filter measured queries</span><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={querySearch} onChange={(event) => setQuerySearch(event.target.value)} placeholder="Filter query text" className={`${inputClass} mt-0 pl-9`} /></label>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-4 py-3">Query → primary owner</th><th className="px-3 py-3">Clicks</th><th className="px-3 py-3">Impr.</th><th className="px-3 py-3">CTR</th><th className="px-3 py-3">Position</th><th className="px-3 py-3">Score</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleRows.map(({ row, owner, score }) => (
                  <tr key={row.value_key}>
                    <td className="px-4 py-3"><span className="block font-medium text-gray-900">{row.dimension_value}</span><span className="mt-1 block text-xs text-gray-500">{owner?.target_url ?? 'Unassigned'}</span></td>
                    <td className="px-3 py-3">{formatMetric(row.clicks)}</td>
                    <td className="px-3 py-3">{formatMetric(row.impressions)}</td>
                    <td className="px-3 py-3">{formatCtr(row.ctr)}</td>
                    <td className="px-3 py-3">{formatPosition(row.average_position)}</td>
                    <td className="px-3 py-3 font-semibold">{score || '—'}</td>
                  </tr>
                ))}
                {visibleRows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">{currentImport ? 'No matching destination queries in the latest export. This is not evidence of zero demand.' : 'Import a query CSV to show observed Search Console performance.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {unmappedRows.length > 0 && (
        <div className={cardClass}>
          <h3 className="font-semibold text-gray-900">Queries needing an owner</h3>
          <p className="mt-1 text-sm text-gray-600">These rows occur in the latest report but do not yet have a primary page assignment. Suggestions need human review before saving.</p>
          <div className="mt-3 divide-y divide-gray-100">
            {unmappedRows.slice(0, 20).map((row) => {
              const suggestion = suggestQueryOwner(row.dimension_value);
              const draft = getAssignmentDraft(row);
              return (
                <div key={row.value_key} className="grid gap-3 border-b border-gray-100 py-3 md:grid-cols-[minmax(180px,1fr)_minmax(150px,0.7fr)_minmax(180px,1fr)_auto] md:items-end">
                  <div><p className="text-sm font-medium text-gray-900">{row.dimension_value}</p><p className="text-xs text-gray-500">{row.impressions} impressions · position {formatPosition(row.average_position)} · suggestion: {suggestion.targetUrl} ({suggestion.cluster})</p></div>
                  <label className="text-xs font-medium text-gray-700">Reviewed cluster
                    <select value={draft.cluster} onChange={(event) => updateAssignmentDraft(row, { cluster: event.currentTarget.value as AssignmentCluster })} className={inputClass}>
                      <option value="brand">Brand</option>
                      {CLUSTERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                      <option value="other">Other / needs review</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-gray-700">Primary target path
                    <input value={draft.targetUrl} onChange={(event) => updateAssignmentDraft(row, { targetUrl: event.currentTarget.value })} placeholder="/destination/page/" className={inputClass} />
                  </label>
                  <button type="button" onClick={() => void assignQuery(row)} className="min-h-10 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Save reviewed owner</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={cardClass}>
          <h3 className="font-semibold text-gray-900">Query ownership map</h3>
          <p className="mt-1 text-xs text-gray-500">One primary page per planned query. Hypotheses are not measured Search Console demand.</p>
          <div className="mt-3 max-h-[380px] overflow-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-3 py-2">Query</th><th className="px-3 py-2">Intent</th><th className="px-3 py-2">Primary URL</th><th className="px-3 py-2">Evidence</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {ownersForCluster.map((owner) => <tr key={owner.query_key}><td className="px-3 py-2 font-medium text-gray-900">{owner.query}</td><td className="px-3 py-2 text-gray-600">{owner.intent}</td><td className="px-3 py-2"><a className="text-blue-700 underline" href={owner.target_url} target="_blank" rel="noreferrer">{owner.target_url}</a></td><td className="px-3 py-2"><span className={`rounded-full px-2 py-1 text-xs ${owner.evidence_status === 'measured' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{owner.evidence_status}</span></td></tr>)}
                {ownersForCluster.length === 0 && <tr><td colSpan={4} className="px-3 py-5 text-center text-sm text-gray-500">No query owners are stored. Apply the SEO growth migration.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold text-gray-900">Landing pages in the latest Pages.csv</h3>
          <p className="mt-1 text-xs text-gray-500">Page totals are a separate Search Console dimension and are not added to query totals.</p>
          <div className="mt-3 max-h-[250px] overflow-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-3 py-2">URL</th><th className="px-3 py-2">Clicks</th><th className="px-3 py-2">Impr.</th><th className="px-3 py-2">Position</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{clusterPageRows.map((row) => <tr key={row.value_key}><td className="max-w-[300px] truncate px-3 py-2 text-gray-700">{row.dimension_value}</td><td className="px-3 py-2">{formatMetric(row.clicks)}</td><td className="px-3 py-2">{formatMetric(row.impressions)}</td><td className="px-3 py-2">{formatPosition(row.average_position)}</td></tr>)}
                {clusterPageRows.length === 0 && <tr><td colSpan={4} className="px-3 py-5 text-center text-sm text-gray-500">{pagesImport ? 'No matching destination landing-page rows in the latest page report.' : 'Import Pages.csv to show landing-page performance.'}</td></tr>}
              </tbody>
            </table>
          </div>
          {homepageVariants.length > 0 && <div className="mt-4 rounded-lg bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-950">Homepage URL variants in the latest export</p>{homepageVariants.map((row) => <p key={row.value_key} className="mt-1 break-all text-xs text-amber-900">{row.dimension_value} · {row.impressions} impressions</p>)}</div>}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className={cardClass}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h3 className="font-semibold text-gray-900">Page-1 competitive readiness scorecard</h3><p className="mt-1 text-xs text-gray-500">Manual evidence assessment; the supplied dimension weights total 95 points, and this is not a ranking prediction.</p></div>
            <label className="min-w-64 text-sm font-medium text-gray-700">Tier-1 page<select value={selectedScoreUrl} onChange={(event) => setSelectedScoreUrl(event.target.value)} className={inputClass}>{CLUSTER_PAGES[cluster].map((url) => <option key={url} value={url}>{url}</option>)}</select></label>
          </div>
          {scoreDraft && (
            <form onSubmit={(event) => void saveReadiness(event)} className="mt-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {READINESS_DIMENSIONS.map(({ key, label, max }) => (
                  <label key={key} className="text-xs font-medium text-gray-700">{label} (0–{max})<input required type="number" min="0" max={max} step="1" value={scoreDraft[key] ?? ''} onChange={(event) => {
                    const value = event.target.value === '' ? null : Number(event.target.value);
                    setScoreDraft((current) => current ? { ...current, [key]: value } : current);
                  }} className={inputClass} /></label>
                ))}
              </div>
              <label className="mt-3 block text-sm font-medium text-gray-700">Evidence / reasons<textarea required rows={3} value={scoreDraft.evidence_notes} onChange={(event) => setScoreDraft((current) => current ? { ...current, evidence_notes: event.target.value } : current)} className={inputClass} placeholder="Record what was checked and any gaps; do not score from keyword assumptions." /></label>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-700">Total: <strong>{getPageReadiness(scoreDraft).total ?? 'Incomplete'}</strong>/95 · {getPageReadiness(scoreDraft).label}</p>
                <button type="submit" disabled={savingReadiness} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{savingReadiness ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save scorecard</button>
              </div>
            </form>
          )}
          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cluster scorecards</p>
            <div className="mt-2 flex flex-wrap gap-2">{clusterScores.map(({ url, result }) => <button key={url} type="button" onClick={() => setSelectedScoreUrl(url)} className={`rounded-full px-3 py-1.5 text-xs ${selectedScoreUrl === url ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-700'}`}>{url}: {result.total === null ? 'not assessed' : `${result.total} · ${result.label}`}</button>)}</div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={cardClass}>
            <h3 className="font-semibold text-gray-900">SEO change control</h3>
            <p className="mt-1 text-xs text-gray-500">Log one material change at a time, then import a later GSC period to measure. The comparison window is not a causal experiment.</p>
            <form onSubmit={(event) => void saveChangeLog(event)} className="mt-3 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Page URL<select required value={changeDraft.url} onChange={(event) => setChangeDraft((current) => ({ ...current, url: event.target.value }))} className={inputClass}><option value="">Choose page</option>{CLUSTER_PAGES[cluster].map((url) => <option key={url} value={url}>{url}</option>)}</select></label>
              <label className="block text-sm font-medium text-gray-700">Related query (optional)<input value={changeDraft.query} onChange={(event) => setChangeDraft((current) => ({ ...current, query: event.target.value }))} className={inputClass} /></label>
              <label className="block text-sm font-medium text-gray-700">Change<input required value={changeDraft.change} onChange={(event) => setChangeDraft((current) => ({ ...current, change: event.target.value }))} className={inputClass} placeholder="Updated title, internal links, or verified page content" /></label>
              <label className="block text-sm font-medium text-gray-700">Reason<input required value={changeDraft.reason} onChange={(event) => setChangeDraft((current) => ({ ...current, reason: event.target.value }))} className={inputClass} /></label>
              <button type="submit" className="min-h-10 w-full rounded-lg border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50">Record change</button>
            </form>
          </div>
          <div className={cardClass}>
            <h3 className="font-semibold text-gray-900">Recent SEO changes</h3>
            <ul className="mt-3 space-y-3">{changeRows.filter((item) => item.url.startsWith(`/${cluster === 'corbett' ? 'jim-corbett' : cluster}/`)).slice(0, 5).map((item) => <li key={item.id} className="border-l-2 border-blue-200 pl-3"><p className="text-sm font-medium text-gray-900">{item.change}</p><p className="text-xs text-gray-600">{item.url} · {item.changed_on}</p><p className="text-xs text-gray-500">{item.reason}</p></li>)}
              {changeRows.filter((item) => item.url.startsWith(`/${cluster === 'corbett' ? 'jim-corbett' : cluster}/`)).length === 0 && <li className="text-sm text-gray-500">No changes logged for this cluster.</li>}
            </ul>
          </div>
        </div>
      </div>

      <details className={cardClass}>
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">Import history and evidence limits</summary>
        <ul className="mt-3 space-y-2 text-xs text-gray-600">{imports.slice(0, 12).map((item) => <li key={item.id}>{item.dimension} · {item.file_name} · {item.row_count} rows · {item.period_start ?? 'date not entered'} to {item.period_end ?? 'date not entered'} · imported {new Date(item.imported_at).toLocaleString()}</li>)}
          {imports.length === 0 && <li>No Search Console CSVs imported yet.</li>}
        </ul>
        <p className="mt-3 text-xs text-gray-500">Search Console row omissions, short reporting windows, filters, and query privacy thresholds can make exports incomplete. A missing query in one export is not proof of lost rankings or zero search demand.</p>
      </details>
    </section>
  );
};
