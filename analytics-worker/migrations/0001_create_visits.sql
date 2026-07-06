CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visited_at TEXT NOT NULL,
  visitor_key TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude REAL,
  longitude REAL,
  timezone TEXT,
  asn INTEGER,
  as_organization TEXT,
  colo TEXT,
  path TEXT,
  title TEXT,
  referrer TEXT,
  user_agent TEXT,
  language TEXT,
  screen TEXT,
  client_timezone TEXT
);

CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_key ON visits (visitor_key);
CREATE INDEX IF NOT EXISTS idx_visits_ip ON visits (ip);
CREATE INDEX IF NOT EXISTS idx_visits_country ON visits (country);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits (path);
