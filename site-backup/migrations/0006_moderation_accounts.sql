ALTER TABLE exercise_suggestions ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS exercise_suggestions_user_idx ON exercise_suggestions(user_id,created_at DESC);
ALTER TABLE app_presence ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS app_presence_user_idx ON app_presence(user_id,last_seen DESC);
CREATE TABLE IF NOT EXISTS app_moderation (
 user_id TEXT PRIMARY KEY,
 banned BOOLEAN NOT NULL DEFAULT FALSE,
 reason TEXT NOT NULL DEFAULT '',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_moderation_banned_idx ON app_moderation(banned);