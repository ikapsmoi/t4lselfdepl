CREATE TABLE IF NOT EXISTS public.seo_query_ownership (
  query_key text PRIMARY KEY,
  query text NOT NULL,
  cluster text NOT NULL CHECK (cluster IN ('brand', 'tomorrowland', 'corbett', 'europe', 'other')),
  destination text NOT NULL,
  intent text NOT NULL,
  commercial_value smallint NOT NULL DEFAULT 3 CHECK (commercial_value BETWEEN 1 AND 5),
  target_url text NOT NULL,
  secondary_url text,
  current_position numeric(8, 2),
  impressions bigint,
  clicks bigint,
  ctr numeric(8, 6),
  priority text NOT NULL DEFAULT 'P2' CHECK (priority IN ('P1', 'P2', 'P3')),
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'monitor', 'needs-review', 'reposition', 'merge', 'redirect', 'noindex')),
  evidence_status text NOT NULL DEFAULT 'hypothesis'
    CHECK (evidence_status IN ('measured', 'hypothesis')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (query_key = lower(regexp_replace(trim(query), '\s+', ' ', 'g'))),
  CHECK (secondary_url IS NULL OR secondary_url <> target_url)
);

CREATE TABLE IF NOT EXISTS public.seo_gsc_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension text NOT NULL CHECK (dimension IN ('query', 'page', 'search_appearance')),
  file_name text NOT NULL,
  period_start date,
  period_end date,
  row_count integer NOT NULL CHECK (row_count >= 0),
  imported_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  imported_at timestamptz NOT NULL DEFAULT now(),
  CHECK (period_start IS NULL OR period_end IS NULL OR period_start <= period_end)
);

CREATE TABLE IF NOT EXISTS public.seo_gsc_rows (
  import_id uuid NOT NULL REFERENCES public.seo_gsc_imports(id) ON DELETE CASCADE,
  dimension_value text NOT NULL,
  value_key text NOT NULL,
  clicks bigint NOT NULL CHECK (clicks >= 0),
  impressions bigint NOT NULL CHECK (impressions >= 0),
  ctr numeric(8, 6) NOT NULL CHECK (ctr BETWEEN 0 AND 1),
  average_position numeric(8, 2) NOT NULL CHECK (average_position >= 0),
  PRIMARY KEY (import_id, value_key)
);

CREATE INDEX IF NOT EXISTS seo_gsc_imports_dimension_date_idx
  ON public.seo_gsc_imports (dimension, imported_at DESC);
CREATE INDEX IF NOT EXISTS seo_gsc_rows_value_key_idx
  ON public.seo_gsc_rows (value_key);
CREATE INDEX IF NOT EXISTS seo_query_ownership_cluster_idx
  ON public.seo_query_ownership (cluster, priority);
CREATE INDEX IF NOT EXISTS seo_query_ownership_target_idx
  ON public.seo_query_ownership (target_url);

CREATE TABLE IF NOT EXISTS public.seo_page_readiness (
  url text PRIMARY KEY,
  cluster text NOT NULL CHECK (cluster IN ('tomorrowland', 'corbett', 'europe')),
  intent_match smallint CHECK (intent_match BETWEEN 0 AND 15),
  content_quality smallint CHECK (content_quality BETWEEN 0 AND 15),
  entity_coverage smallint CHECK (entity_coverage BETWEEN 0 AND 10),
  data_quality smallint CHECK (data_quality BETWEEN 0 AND 10),
  internal_authority smallint CHECK (internal_authority BETWEEN 0 AND 10),
  technical_seo smallint CHECK (technical_seo BETWEEN 0 AND 15),
  schema_quality smallint CHECK (schema_quality BETWEEN 0 AND 5),
  trust_evidence smallint CHECK (trust_evidence BETWEEN 0 AND 5),
  ctr_potential smallint CHECK (ctr_potential BETWEEN 0 AND 5),
  conversion smallint CHECK (conversion BETWEEN 0 AND 5),
  evidence_notes text NOT NULL DEFAULT '',
  assessed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assessed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seo_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_on date NOT NULL DEFAULT CURRENT_DATE,
  url text NOT NULL,
  query text,
  change text NOT NULL,
  reason text NOT NULL,
  baseline jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_query_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_gsc_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_gsc_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_page_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_change_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.seo_query_ownership,
  public.seo_gsc_imports,
  public.seo_gsc_rows,
  public.seo_page_readiness,
  public.seo_change_log
FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.seo_query_ownership,
  public.seo_gsc_imports,
  public.seo_gsc_rows,
  public.seo_page_readiness,
  public.seo_change_log
TO authenticated;

DROP POLICY IF EXISTS "SEO admins manage query ownership" ON public.seo_query_ownership;
CREATE POLICY "SEO admins manage query ownership"
  ON public.seo_query_ownership FOR ALL TO authenticated
  USING (public.is_travel4life_admin())
  WITH CHECK (public.is_travel4life_admin());

DROP POLICY IF EXISTS "SEO admins manage GSC imports" ON public.seo_gsc_imports;
CREATE POLICY "SEO admins manage GSC imports"
  ON public.seo_gsc_imports FOR ALL TO authenticated
  USING (public.is_travel4life_admin())
  WITH CHECK (public.is_travel4life_admin());

DROP POLICY IF EXISTS "SEO admins manage GSC rows" ON public.seo_gsc_rows;
CREATE POLICY "SEO admins manage GSC rows"
  ON public.seo_gsc_rows FOR ALL TO authenticated
  USING (public.is_travel4life_admin())
  WITH CHECK (public.is_travel4life_admin());

DROP POLICY IF EXISTS "SEO admins manage page readiness" ON public.seo_page_readiness;
CREATE POLICY "SEO admins manage page readiness"
  ON public.seo_page_readiness FOR ALL TO authenticated
  USING (public.is_travel4life_admin())
  WITH CHECK (public.is_travel4life_admin());

DROP POLICY IF EXISTS "SEO admins manage change log" ON public.seo_change_log;
CREATE POLICY "SEO admins manage change log"
  ON public.seo_change_log FOR ALL TO authenticated
  USING (public.is_travel4life_admin())
  WITH CHECK (public.is_travel4life_admin());

INSERT INTO public.seo_query_ownership
  (query_key, query, cluster, destination, intent, commercial_value, target_url, priority, status, evidence_status)
VALUES
  ('travel4life', 'travel4life', 'brand', 'Travel4Life', 'Brand navigation', 3, '/', 'P1', 'active', 'measured'),
  ('travel 4 life', 'travel 4 life', 'brand', 'Travel4Life', 'Brand navigation', 3, '/', 'P1', 'active', 'measured'),
  ('tomorrowland', 'Tomorrowland', 'tomorrowland', 'Tomorrowland', 'Festival destination discovery', 3, '/tomorrowland/', 'P1', 'active', 'hypothesis'),
  ('tomorrowland packages', 'Tomorrowland packages', 'tomorrowland', 'Tomorrowland', 'Package commercial investigation', 5, '/tomorrowland/packages/', 'P1', 'planned', 'hypothesis'),
  ('tomorrowland packages from india', 'Tomorrowland packages from India', 'tomorrowland', 'Tomorrowland', 'India-origin package commercial intent', 5, '/tomorrowland/packages/', 'P1', 'planned', 'hypothesis'),
  ('tomorrowland trip from india', 'Tomorrowland trip from India', 'tomorrowland', 'Tomorrowland', 'India-origin trip planning', 4, '/tomorrowland/from-india/', 'P1', 'planned', 'hypothesis'),
  ('tomorrowland holiday from india', 'Tomorrowland holiday from India', 'tomorrowland', 'Tomorrowland', 'India-origin trip planning', 4, '/tomorrowland/from-india/', 'P2', 'planned', 'hypothesis'),
  ('tomorrowland 2027', 'Tomorrowland 2027', 'tomorrowland', 'Tomorrowland', 'Edition-year research', 3, '/tomorrowland/', 'P2', 'monitor', 'hypothesis'),
  ('tomorrowland ticket price in indian rupees', 'Tomorrowland ticket price in Indian rupees', 'tomorrowland', 'Tomorrowland', 'Ticket and trip cost research', 4, '/tomorrowland/cost-from-india/', 'P1', 'planned', 'hypothesis'),
  ('tomorrowland ticket price inr', 'Tomorrowland ticket price INR', 'tomorrowland', 'Tomorrowland', 'Ticket and trip cost research', 4, '/tomorrowland/cost-from-india/', 'P1', 'planned', 'hypothesis'),
  ('tomorrowland cost from india', 'Tomorrowland cost from India', 'tomorrowland', 'Tomorrowland', 'Trip budget research', 4, '/tomorrowland/cost-from-india/', 'P1', 'planned', 'hypothesis'),
  ('tomorrowland expenses from india', 'Tomorrowland expenses from India', 'tomorrowland', 'Tomorrowland', 'Trip budget research', 4, '/tomorrowland/cost-from-india/', 'P1', 'planned', 'hypothesis'),
  ('tomorrowland camping', 'Tomorrowland camping', 'tomorrowland', 'Tomorrowland', 'Accommodation research', 3, '/tomorrowland/accommodation/', 'P2', 'planned', 'hypothesis'),
  ('tomorrowland belgium', 'Tomorrowland Belgium', 'tomorrowland', 'Tomorrowland Belgium', 'Belgium destination planning', 4, '/tomorrowland/belgium/', 'P1', 'active', 'hypothesis'),
  ('tomorrowland belgium packages', 'Tomorrowland Belgium packages', 'tomorrowland', 'Tomorrowland Belgium', 'Belgium package investigation', 5, '/tomorrowland/belgium/packages/', 'P1', 'active', 'hypothesis'),
  ('tomorrowland winter', 'Tomorrowland Winter', 'tomorrowland', 'Tomorrowland Winter', 'Winter edition planning', 4, '/tomorrowland/winter/', 'P1', 'active', 'hypothesis'),
  ('tomorrowland winter packages', 'Tomorrowland Winter packages', 'tomorrowland', 'Tomorrowland Winter', 'Winter package investigation', 5, '/tomorrowland/winter/', 'P2', 'planned', 'hypothesis'),
  ('tomorrowland thailand', 'Tomorrowland Thailand', 'tomorrowland', 'Tomorrowland Thailand', 'Thailand destination planning', 4, '/tomorrowland/thailand/', 'P1', 'active', 'hypothesis'),
  ('tomorrowland thailand packages from india', 'Tomorrowland Thailand packages from India', 'tomorrowland', 'Tomorrowland Thailand', 'India-origin Thailand package intent', 5, '/tomorrowland/thailand/', 'P1', 'planned', 'hypothesis'),
  ('jim corbett', 'Jim Corbett', 'corbett', 'Jim Corbett', 'Destination discovery', 3, '/jim-corbett/', 'P1', 'active', 'hypothesis'),
  ('jim corbett resorts', 'Jim Corbett resorts', 'corbett', 'Jim Corbett', 'Resort discovery', 5, '/jim-corbett/resorts/', 'P1', 'monitor', 'hypothesis'),
  ('jim corbett packages', 'Jim Corbett packages', 'corbett', 'Jim Corbett', 'Package commercial intent', 5, '/jim-corbett/', 'P1', 'planned', 'hypothesis'),
  ('jim corbett hotels', 'Jim Corbett hotels', 'corbett', 'Jim Corbett', 'Hotel discovery', 4, '/jim-corbett/resorts/', 'P2', 'monitor', 'hypothesis'),
  ('jim corbett resort prices', 'Jim Corbett resort prices', 'corbett', 'Jim Corbett', 'Price comparison', 4, '/jim-corbett/resorts/', 'P2', 'monitor', 'hypothesis'),
  ('jim corbett safari', 'Jim Corbett safari', 'corbett', 'Jim Corbett', 'Safari information', 4, '/jim-corbett/', 'P2', 'planned', 'hypothesis'),
  ('jim corbett wedding', 'Jim Corbett wedding', 'corbett', 'Jim Corbett', 'Wedding venue planning', 5, '/jim-corbett/weddings/', 'P1', 'active', 'hypothesis'),
  ('jim corbett wedding resorts', 'Jim Corbett wedding resorts', 'corbett', 'Jim Corbett', 'Wedding venue discovery', 5, '/jim-corbett/weddings/', 'P1', 'active', 'hypothesis'),
  ('jim corbett mice', 'Jim Corbett MICE', 'corbett', 'Jim Corbett', 'Corporate event planning', 5, '/jim-corbett/mice/', 'P1', 'active', 'hypothesis'),
  ('jim corbett corporate offsite', 'Jim Corbett corporate offsite', 'corbett', 'Jim Corbett', 'Corporate offsite planning', 5, '/jim-corbett/mice/', 'P1', 'active', 'hypothesis'),
  ('jim corbett weekend', 'Jim Corbett weekend', 'corbett', 'Jim Corbett', 'Weekend trip planning', 4, '/jim-corbett/', 'P2', 'planned', 'hypothesis'),
  ('jim corbett from delhi', 'Jim Corbett from Delhi', 'corbett', 'Jim Corbett', 'Origin and route planning', 4, '/jim-corbett/', 'P2', 'planned', 'hypothesis'),
  ('europe tours from india', 'Europe tours from India', 'europe', 'Europe', 'India-origin tour commercial intent', 5, '/europe/tours-from-india/', 'P1', 'active', 'hypothesis'),
  ('europe tour packages', 'Europe tour packages', 'europe', 'Europe', 'Tour package commercial intent', 5, '/europe/', 'P1', 'active', 'hypothesis'),
  ('europe trip cost', 'Europe trip cost', 'europe', 'Europe', 'Trip budget research', 4, '/europe/tour-cost/', 'P1', 'active', 'hypothesis'),
  ('europe honeymoon', 'Europe honeymoon', 'europe', 'Europe', 'Honeymoon package intent', 5, '/europe/honeymoon/', 'P1', 'active', 'hypothesis'),
  ('europe family tour', 'Europe family tour', 'europe', 'Europe', 'Family package intent', 5, '/europe/family-tours/', 'P1', 'active', 'hypothesis'),
  ('europe luxury tour', 'Europe luxury tour', 'europe', 'Europe', 'Luxury package intent', 5, '/europe/', 'P2', 'planned', 'hypothesis'),
  ('switzerland tours', 'Switzerland tours', 'europe', 'Switzerland', 'Country tour discovery', 4, '/europe/switzerland/', 'P1', 'active', 'hypothesis'),
  ('france tours', 'France tours', 'europe', 'France', 'Country tour discovery', 4, '/europe/france/', 'P2', 'active', 'hypothesis'),
  ('italy tours', 'Italy tours', 'europe', 'Italy', 'Country tour discovery', 4, '/europe/italy/', 'P2', 'active', 'hypothesis'),
  ('paris switzerland', 'Paris + Switzerland', 'europe', 'Europe', 'Multi-country route planning', 4, '/europe/paris-switzerland/', 'P2', 'active', 'hypothesis'),
  ('france switzerland italy', 'France + Switzerland + Italy', 'europe', 'Europe', 'Multi-country route planning', 4, '/europe/france-switzerland-italy/', 'P2', 'active', 'hypothesis')
ON CONFLICT (query_key) DO NOTHING;

UPDATE public.seo_query_ownership
SET current_position = 2.37,
    impressions = 109,
    clicks = 24,
    ctr = 0.2202,
    evidence_status = 'measured',
    status = 'active'
WHERE query_key = 'travel4life'
  AND evidence_status = 'measured';

UPDATE public.seo_query_ownership
SET current_position = 3.46,
    impressions = 48,
    clicks = 3,
    ctr = 0.0625,
    evidence_status = 'measured',
    status = 'active'
WHERE query_key = 'travel 4 life'
  AND evidence_status = 'measured';

INSERT INTO public.seo_page_readiness (url, cluster)
VALUES
  ('/tomorrowland/', 'tomorrowland'),
  ('/tomorrowland/packages/', 'tomorrowland'),
  ('/tomorrowland/from-india/', 'tomorrowland'),
  ('/tomorrowland/cost-from-india/', 'tomorrowland'),
  ('/tomorrowland/belgium/', 'tomorrowland'),
  ('/tomorrowland/winter/', 'tomorrowland'),
  ('/tomorrowland/thailand/', 'tomorrowland'),
  ('/jim-corbett/', 'corbett'),
  ('/jim-corbett/resorts/', 'corbett'),
  ('/jim-corbett/weddings/', 'corbett'),
  ('/jim-corbett/mice/', 'corbett'),
  ('/europe/', 'europe'),
  ('/europe/tours-from-india/', 'europe'),
  ('/europe/tour-cost/', 'europe'),
  ('/europe/switzerland/', 'europe'),
  ('/europe/france/', 'europe'),
  ('/europe/italy/', 'europe'),
  ('/europe/paris-switzerland/', 'europe')
ON CONFLICT (url) DO NOTHING;
