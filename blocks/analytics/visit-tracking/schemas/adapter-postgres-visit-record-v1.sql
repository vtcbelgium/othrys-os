-- Reference DDL for PostgreSQL / Supabase storage bridge
-- ORIGIN_SCHEMA_DEBT: Canonical historical page_visits DDL was not found in origin repository.
-- This schema represents a fresh reference implementation fulfilling analytics.visit_ingest@1.

CREATE TABLE IF NOT EXISTS page_visits (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(200) NOT NULL,
    visitor_hash CHAR(64) NOT NULL,
    country VARCHAR(2) DEFAULT NULL,
    referrer_host VARCHAR(100) DEFAULT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for typical analytics aggregation queries (by path, day, unique visitors)
CREATE INDEX IF NOT EXISTS idx_page_visits_occurred_at ON page_visits (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_path_occurred ON page_visits (path, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_occurred ON page_visits (visitor_hash, occurred_at DESC);

-- Comment documenting data hygiene
COMMENT ON TABLE page_visits IS 'Pseudonymous, cookieless page visit logs with zero IP/UA retention.';
