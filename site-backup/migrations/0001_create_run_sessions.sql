CREATE TABLE IF NOT EXISTS run_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  started_at_ms BIGINT NOT NULL,
  ended_at_ms BIGINT NOT NULL,
  duration_ms BIGINT NOT NULL,
  distance_meters DOUBLE PRECISION NOT NULL DEFAULT 0,
  calories_est DOUBLE PRECISION NOT NULL DEFAULT 0,
  pace_sec_km INTEGER NOT NULL DEFAULT 0,
  weight_kg DOUBLE PRECISION NOT NULL DEFAULT 70,
  route JSONB NOT NULL DEFAULT '[]'::jsonb,
  point_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT run_sessions_unique_per_user UNIQUE(user_id, started_at_ms)
);
CREATE INDEX IF NOT EXISTS run_sessions_user_time ON run_sessions(user_id, started_at_ms DESC);