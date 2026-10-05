export interface SearchConsoleObservation {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
  country: string;
  device: string;
}

export interface SearchConsoleSnapshot {
  id: string;
  snapshotDate: string;
  importedAt: string;
  fileName: string;
  rowCount: number;
  observations: SearchConsoleObservation[];
}

export interface EnrichmentProperty {
  id: string;
  slug: string;
  name: string;
  category: string;
  completenessScore: number;
  missingFields: string[];
  enrichmentStatus: string;
  seoStatus: string;
  propertyExistenceStatus: 'SOURCE_LISTED_UNVERIFIED' | 'VERIFIED';
  availabilityStatus: 'CONTACT_TO_CHECK';
  pageReadiness: {
    basic: boolean;
    wedding: boolean;
    mice: boolean;
    price: boolean;
  };
  source?: { file?: string; sheet?: string; row?: number };
  fieldEvidence?: Record<string, { sourceUrl?: string; verifiedAt?: string; verifiedBy?: string; verified?: boolean }>;
}

export interface EnrichmentQueue {
  schemaVersion: number;
  generatedAt: string;
  scoring: {
    threshold: number;
    denominator: number;
    weights: Record<string, number>;
    pageTypes: Record<string, string[]>;
  };
  summary: {
    total: number;
    readyForReview: number;
    verified: number;
    needsEnrichment: number;
    needsReview: number;
    inactive: number;
    averageCompleteness: number;
    weddingReady: number;
    miceReady: number;
    priceReady: number;
  };
  missingFieldCounts: Record<string, number>;
  properties: EnrichmentProperty[];
}

export interface CorbettPageRegistry {
  pages: Array<{
    url: string;
    pageType: string;
    qualityStatus: string;
    indexable: boolean;
    technicalScore?: number;
    page1Status?: 'GREEN' | 'AMBER' | 'RED';
    page1Reasons?: string[];
  }>;
  page1Readiness?: {
    auditDate: string;
    overallScore: number;
    status: 'GREEN' | 'AMBER' | 'RED';
    statusLabel: string;
    method: string;
  };
  enrichmentSummary?: { readyForReview?: number; verified?: number };
}

export function parseCsv(text: string): string[][];
export function parseSearchConsoleCsv(text: string, snapshotDate: string): SearchConsoleObservation[];
export function createSearchConsoleSnapshot(text: string, snapshotDate: string, fileName: string): SearchConsoleSnapshot;
export function isCorbettPageIndexable(page: { indexable: boolean; qualityStatus: string; page1Status?: string }, readinessScore: number): boolean;
export function analyzeSearchConsole(snapshots: SearchConsoleSnapshot[], registry: CorbettPageRegistry, options?: { minimumImpressions?: number }): {
  latestDate: string;
  priorDate: string;
  importedObservations: number;
  metrics: Record<string, number>;
  queries: Array<Record<string, unknown>>;
  opportunities: Array<Record<string, unknown>>;
  lowCtr: Array<Record<string, unknown>>;
  cannibalization: Array<Record<string, unknown>>;
  wrongPage: Array<Record<string, unknown>>;
  lostQueries: Array<Record<string, unknown>>;
  alerts: Array<Record<string, string>>;
  topicalCoverage: Array<Record<string, string | number | boolean>>;
  nextActions: Array<{ title: string; targetUrl: string; reason: string; priority: number }>;
  pageScores: Array<{ url: string; pageType: string; technicalScore: number; indexable: boolean }>;
};
