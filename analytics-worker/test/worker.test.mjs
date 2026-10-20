import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/worker.js";

class MockStatement {
  constructor(sql, calls) {
    this.sql = sql;
    this.calls = calls;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async first() {
    if (this.sql.includes("COUNT(*) AS total FROM visits")) return { total: 23 };
    if (this.sql.includes("unique_ips")) {
      return {
        pv: 23,
        uv: 14,
        unique_ips: 12,
        first_visit: "2026-09-01T00:00:00.000Z",
        last_visit: "2026-10-02T00:00:00.000Z",
        pv_24h: 5,
        uv_24h: 4,
        today_pv: 3,
        today_uv: 2,
        yesterday_pv: 4,
        yesterday_uv: 3,
        last_7_pv: 11,
        last_7_uv: 8,
        previous_7_pv: 7,
        previous_7_uv: 5,
        last_30_pv: 20,
        last_30_uv: 12,
        previous_30_pv: 3,
        previous_30_uv: 2,
        mainland_visits: 9,
        mainland_visitors: 6,
        mainland_provinces: 2,
        mainland_resolved_visits: 7,
        likely_proxy_visits: 4,
        likely_proxy_visitors: 3
      };
    }
    if (this.sql.includes("COUNT(*) AS pv")) return { pv: 24, uv: 15 };
    throw new Error(`Unexpected first() query: ${this.sql}`);
  }

  async run() {
    this.calls.push({ type: "insert", sql: this.sql, values: this.values });
    return { success: true };
  }

  async all() {
    if (this.sql.includes("LIMIT ? OFFSET ?")) {
      this.calls.push({ type: "visits", values: this.values });
      const offset = this.values[1];
      return {
        results: Array.from({ length: 10 }, (_, index) => ({
          id: 23 - offset - index,
          visited_at: "2026-10-02T00:00:00.000Z",
          visitor_key: `visitor-${offset + index}`,
          ip: `203.0.113.${offset + index + 1}`,
          country: index % 2 ? "IT" : "CN",
          region: index % 2 ? "Lombardy" : "Jiangsu",
          region_code: index % 2 ? "25" : "JS",
          city: index % 2 ? "Milan" : "Nanjing",
          latitude: index % 2 ? 45.46 : 32.06,
          longitude: index % 2 ? 9.19 : 118.8,
          path: "/",
          title: "Mock page",
          referrer: "https://example.edu/",
          user_agent: "Mozilla/5.0 Chrome/124.0",
          as_organization: "Mock Network",
          asn: 64500,
          location_source: "cloudflare-direct",
          is_new: index === 0 ? 1 : 0,
          daily_pageviews: 2
        }))
      };
    }
    if (this.sql.includes("AS period_start")) {
      this.calls.push({ type: "trend", sql: this.sql });
      if (this.sql.includes("substr(visited_at, 1, 13)")) {
        return {
          results: [
            { period_start: "2026-10-02T00:00:00Z", visits: 2, visitors: 2 },
            { period_start: "2026-10-02T02:00:00Z", visits: 3, visitors: 2 }
          ]
        };
      }
      return {
        results: [
          { period_start: "2026-09-30", visits: 4, visitors: 3 },
          { period_start: "2026-10-02", visits: 7, visitors: 5 }
        ]
      };
    }
    if (this.sql.includes("WHERE country = 'CN'")) {
      return {
        results: [
          { region: "Jiangsu", region_code: "JS", visits: 6, visitors: 4, resolved_visits: 5 },
          { region: "Beijing", region_code: "BJ", visits: 3, visitors: 2, resolved_visits: 2 }
        ]
      };
    }
    if (this.sql.includes("AVG(CASE")) {
      return {
        results: [
          { country: "CN", region: "Jiangsu", region_code: "JS", visits: 9, visitors: 6, latitude: 32.06, longitude: 118.8 },
          { country: "IT", region: "", region_code: "", visits: 8, visitors: 5, latitude: 45.46, longitude: 9.19 }
        ]
      };
    }
    if (this.sql.includes("GROUP BY country, location")) {
      return {
        results: [
          { country: "CN", location: "Jiangsu", region: "Jiangsu", city: "", visits: 9, visitors: 6, last_visit: "2026-10-02T00:00:00.000Z" },
          { country: "IT", location: "Milan", region: "Lombardy", city: "Milan", visits: 8, visitors: 5, last_visit: "2026-09-28T00:00:00.000Z" }
        ]
      };
    }
    if (this.sql.includes("AS locations")) {
      return {
        results: [
          { country: "CN", locations: 2, visits: 15, visitors: 9, last_visit: "2026-10-02T00:00:00.000Z" },
          { country: "IT", locations: 1, visits: 8, visitors: 5, last_visit: "2026-09-28T00:00:00.000Z" }
        ]
      };
    }
    if (this.sql.includes("GROUP BY country")) {
      return { results: [{ country: "CN", visits: 15, visitors: 9 }] };
    }
    if (this.sql.includes("GROUP BY path")) {
      return { results: [{ path: "/", visits: 23, visitors: 14 }] };
    }
    throw new Error(`Unexpected all() query: ${this.sql}`);
  }
}

function createEnv() {
  const calls = [];
  return {
    calls,
    env: {
      ADMIN_PASSWORD: "test-password",
      SESSION_SECRET: "test-session-secret-with-sufficient-length",
      SITE_NAME: "Test Analytics",
      DB: {
        prepare(sql) {
          return new MockStatement(sql, calls);
        }
      }
    }
  };
}

async function authenticatedCookie(env) {
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: "test-password" })
  }), env);
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}

test("admin page includes reference-style overview, filters, maps, trends, and paginated visits", async () => {
  const { env } = createEnv();
  const response = await worker.fetch(new Request("https://analytics.example/admin"), env);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<html lang="en" data-theme="light">/);
  assert.match(html, /id="theme-button"/);
  assert.match(html, /kx_admin_theme/);
  assert.match(html, /:root\[data-theme="dark"\]/);
  assert.doesNotMatch(html, /prefers-color-scheme/);
  assert.match(html, /id="visitor-map"/);
  assert.match(html, /Traffic Overview/);
  assert.match(html, /data-range="30d"/);
  assert.match(html, /id="from-date"/);
  assert.match(html, /id="geography"/);
  assert.match(html, /id="geo-heatmap"/);
  assert.match(html, /id="visits-trend"/);
  assert.match(html, /data-interval="hour"/);
  assert.match(html, /data-interval="day"/);
  assert.match(html, /data-interval="year"/);
  assert.match(html, /id="page-numbers"/);
  assert.match(html, /Audience Geolocation/);
  assert.match(html, /China Mainland Coverage/);
  assert.match(html, /id="provinces"/);
  assert.match(html, /leaflet@1\.9\.4/);
  assert.match(html, /topojson-client@3\.1\.0/);
  assert.match(html, /chart\.js@4\.4\.7/);
  assert.doesNotMatch(html, /<h2>Top Countries<\/h2>/);

  const inlineScripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .filter(Boolean);
  assert.doesNotThrow(() => new Function(inlineScripts.at(-1)));
});

test("visit history returns every record through ten-row pages", async () => {
  const { env, calls } = createEnv();
  const cookie = await authenticatedCookie(env);
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/visits?page=2", {
    headers: { cookie }
  }), env);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.page, 2);
  assert.equal(data.pageSize, 10);
  assert.equal(data.total, 23);
  assert.equal(data.totalPages, 3);
  assert.equal(data.visits.length, 10);
  assert.deepEqual(calls.find((call) => call.type === "visits").values, [10, 10]);
});

test("visit history applies inclusive date-range filters before pagination", async () => {
  const { env, calls } = createEnv();
  const cookie = await authenticatedCookie(env);
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/visits?from=2026-09-01&to=2026-09-30", {
    headers: { cookie }
  }), env);

  assert.equal(response.status, 200);
  assert.deepEqual(calls.find((call) => call.type === "visits").values, [
    "2026-09-01T00:00:00.000Z",
    "2026-10-01T00:00:00.000Z",
    10,
    0
  ]);
});

test("summary map aggregates all historical countries and regions", async () => {
  const { env } = createEnv();
  const cookie = await authenticatedCookie(env);
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/summary", {
    headers: { cookie }
  }), env);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.mapCountries.length, 2);
  assert.equal(data.mapCountries[0].country, "CN");
  assert.equal(data.mapCountries[0].region, "Jiangsu");
  assert.equal(data.mapCountries[0].visits, 9);
  assert.equal(data.mainland.provinces, 2);
  assert.equal(data.provinces[0].region, "Jiangsu");
  assert.deepEqual(data.periods.today, { pv: 3, uv: 2 });
  assert.equal(data.geography.countries.length, 2);
  assert.equal(data.geography.locations[0].location, "Jiangsu");
  assert.equal(data.latest, undefined);
});

test("mainland browser lookup stores the province while preserving the Cloudflare edge route", async () => {
  const { env, calls } = createEnv();
  const request = new Request("https://analytics.example/api/visit", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.9",
      "user-agent": "Mock browser"
    },
    body: JSON.stringify({
      visitorId: "mainland-visitor",
      path: "/",
      language: "en-US",
      timezone: "Asia/Shanghai",
      mainlandProbe: {
        provider: "ipip",
        ip: "123.123.123.123",
        country: "中国",
        region: "江苏省",
        city: "南京市",
        isp: "China Telecom"
      }
    })
  });
  Object.defineProperty(request, "cf", {
    value: {
      country: "SG",
      region: "Singapore",
      city: "Singapore",
      latitude: "1.3521",
      longitude: "103.8198",
      timezone: "Asia/Singapore",
      asn: 13335,
      asOrganization: "Cloudflare",
      colo: "SIN"
    }
  });

  const response = await worker.fetch(request, env);
  const result = await response.json();
  const insert = calls.find((call) => call.type === "insert");

  assert.equal(response.status, 200);
  assert.deepEqual(result.stats, { pv: 24, uv: 15 });
  assert.ok(insert);
  assert.equal(insert.values[2], "123.123.123.123");
  assert.equal(insert.values[3], "CN");
  assert.equal(insert.values[4], "Jiangsu");
  assert.equal(insert.values[5], "JS");
  assert.equal(insert.values[6], "南京市");
  assert.equal(insert.values[20], "203.0.113.9");
  assert.equal(insert.values[21], "SG");
  assert.equal(insert.values[24], "ipip-client");
  assert.equal(insert.values[25], 1);
  assert.equal(insert.values[26], "China Telecom");
});

test("mainland browser signal keeps a non-CN edge visit as an explicit proxy candidate", async () => {
  const { env, calls } = createEnv();
  const request = new Request("https://analytics.example/api/visit", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10" },
    body: JSON.stringify({ visitorId: "proxy-visitor", path: "/", language: "zh-CN", timezone: "Asia/Shanghai" })
  });
  Object.defineProperty(request, "cf", { value: { country: "SG", city: "Singapore" } });

  const response = await worker.fetch(request, env);
  const insert = calls.find((call) => call.type === "insert");

  assert.equal(response.status, 200);
  assert.equal(insert.values[3], "SG");
  assert.equal(insert.values[24], "cloudflare");
  assert.equal(insert.values[25], 1);
});

test("trend endpoint groups authenticated history and fills empty periods", async () => {
  const { env, calls } = createEnv();
  const cookie = await authenticatedCookie(env);
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/trend?interval=day", {
    headers: { cookie }
  }), env);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.interval, "day");
  assert.deepEqual(data.points, [
    { period: "2026-09-30", visits: 4, visitors: 3 },
    { period: "2026-10-01", visits: 0, visitors: 0 },
    { period: "2026-10-02", visits: 7, visitors: 5 }
  ]);
  assert.match(calls.find((call) => call.type === "trend").sql, /substr\(visited_at, 1, 10\)/);
});

test("live trend endpoint groups the last 24 hours and fills missing hours", async () => {
  const { env, calls } = createEnv();
  const cookie = await authenticatedCookie(env);
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/trend?interval=hour", {
    headers: { cookie }
  }), env);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.interval, "hour");
  assert.equal(data.scope, "last-24-hours");
  assert.deepEqual(data.points, [
    { period: "2026-10-02T00:00:00Z", visits: 2, visitors: 2 },
    { period: "2026-10-02T01:00:00Z", visits: 0, visitors: 0 },
    { period: "2026-10-02T02:00:00Z", visits: 3, visitors: 2 }
  ]);
  assert.match(calls.find((call) => call.type === "trend").sql, /datetime\('now', '-24 hours'\)/);
});

test("trend endpoint rejects unauthenticated requests", async () => {
  const { env } = createEnv();
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/trend?interval=month"), env);

  assert.equal(response.status, 401);
});
