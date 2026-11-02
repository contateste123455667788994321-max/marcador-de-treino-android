CREATE TABLE IF NOT EXISTS app_announcements (
 id BIGSERIAL PRIMARY KEY,
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_announcements_active_created ON app_announcements(active, created_at DESC);