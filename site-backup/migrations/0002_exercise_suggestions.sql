CREATE TABLE IF NOT EXISTS exercise_suggestions (
 id BIGSERIAL PRIMARY KEY,
 exercise_name TEXT NOT NULL,
 comment TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS exercise_suggestions_status_date ON exercise_suggestions(status,created_at DESC);