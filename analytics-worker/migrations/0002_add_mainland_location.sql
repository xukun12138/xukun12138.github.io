ALTER TABLE visits ADD COLUMN region_code TEXT;
ALTER TABLE visits ADD COLUMN edge_ip TEXT;
ALTER TABLE visits ADD COLUMN edge_country TEXT;
ALTER TABLE visits ADD COLUMN edge_region TEXT;
ALTER TABLE visits ADD COLUMN edge_city TEXT;
ALTER TABLE visits ADD COLUMN location_source TEXT NOT NULL DEFAULT 'cloudflare';
ALTER TABLE visits ADD COLUMN mainland_signal INTEGER NOT NULL DEFAULT 0;
ALTER TABLE visits ADD COLUMN client_isp TEXT;

UPDATE visits
SET
  edge_ip = ip,
  edge_country = country,
  edge_region = region,
  edge_city = city,
  location_source = 'cloudflare',
  mainland_signal = CASE
    WHEN country != 'CN' AND client_timezone = 'Asia/Shanghai' THEN 1
    ELSE 0
  END;

CREATE INDEX IF NOT EXISTS idx_visits_region ON visits (country, region);
CREATE INDEX IF NOT EXISTS idx_visits_mainland_signal ON visits (mainland_signal);
