export interface SearchConsoleRow {
  dimensionValue: string;
  valueKey: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
}

export interface QueryOwnerSuggestion {
  cluster: string;
  targetUrl: string;
  evidenceStatus: 'hypothesis';
  status: 'needs-review';
  pattern?: RegExp;
}

export function normalizeSeoQuery(value: unknown): string;
export function parseCsv(text: string): string[][];
export function parseSearchConsoleCsv(text: string): SearchConsoleRow[];
export function suggestQueryOwner(query: string): QueryOwnerSuggestion;
export function expectedCtrForPosition(position: number): number;
export function getOpportunityScore(input: {
  impressions: number;
  position: number;
  ctr: number;
  commercialValue?: number;
}): number;
export function getPageReadiness(scores: Record<string, number | null | undefined>): {
  total: number | null;
  missing: string[];
  label: string;
};
