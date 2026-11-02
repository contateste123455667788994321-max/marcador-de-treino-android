CREATE TABLE IF NOT EXISTS app_presence (
  device_id TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_presence_last_seen_idx ON app_presence(last_seen);
CREATE TABLE IF NOT EXISTS app_daily_devices (
  day DATE NOT NULL,
  device_id TEXT NOT NULL,
  PRIMARY KEY(day,device_id)
);
CREATE INDEX IF NOT EXISTS app_daily_devices_day_idx ON app_daily_devices(day);