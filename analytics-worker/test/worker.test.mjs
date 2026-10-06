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
      return { pv: 23, uv: 14, unique_ips: 12, pv_24h: 5, uv_24h: 4 };
    }
    throw new Error(`Unexpected first() query: ${this.sql}`);
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
          city: index % 2 ? "Milan" : "Nanjing",
          latitude: index % 2 ? 45.46 : 32.06,
          longitude: index % 2 ? 9.19 : 118.8,
          path: "/",
          user_agent: "Mock browser"
        }))
      };
    }
    if (this.sql.includes("AS period_start")) {
      this.calls.push({ type: "trend", sql: this.sql });
      return {
        results: [
          { period_start: "2026-09-30", visits: 4, visitors: 3 },
          { period_start: "2026-10-02", visits: 7, visitors: 5 }
        ]
      };
    }
    if (this.sql.includes("AVG(CASE")) {
      return {
        results: [
          { country: "CN", visits: 15, visitors: 9, latitude: 32.06, longitude: 118.8 },
          { country: "IT", visits: 8, visitors: 5, latitude: 45.46, longitude: 9.19 }
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

test("admin page includes the map, interval trend chart, and paginated visit controls", async () => {
  const { env } = createEnv();
  const response = await worker.fetch(new Request("https://analytics.example/admin"), env);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /id="visitor-map"/);
  assert.match(html, /id="visits-trend"/);
  assert.match(html, /data-interval="day"/);
  assert.match(html, /data-interval="year"/);
  assert.match(html, /id="page-numbers"/);
  assert.match(html, /Top Countries\/Regions/);
  assert.match(html, /leaflet@1\.9\.4/);
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
  assert.equal(data.mapCountries[0].visits, 15);
  assert.equal(data.latest, undefined);
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

test("trend endpoint rejects unauthenticated requests", async () => {
  const { env } = createEnv();
  const response = await worker.fetch(new Request("https://analytics.example/api/admin/trend?interval=month"), env);

  assert.equal(response.status, 401);
});
