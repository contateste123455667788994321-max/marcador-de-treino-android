CREATE TABLE IF NOT EXISTS app_support_threads (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL DEFAULT 'Atendimento',
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('open','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_support_threads_updated_idx ON app_support_threads(updated_at DESC);
CREATE TABLE IF NOT EXISTS app_support_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES app_support_threads(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK(sender_role IN('user','owner')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_support_messages_thread_idx ON app_support_messages(thread_id,created_at DESC);