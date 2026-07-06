const SESSION_COOKIE = "kx_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const MAX_BODY_LENGTH = 4096;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    try {
      if (url.pathname === "/") {
        return Response.redirect(`${url.origin}/admin`, 302);
      }

      if (url.pathname === "/admin" && request.method === "GET") {
        return htmlResponse(adminPage(env));
      }

      if (url.pathname === "/api/health" && request.method === "GET") {
        return withCors(request, env, jsonResponse({ ok: true, service: env.SITE_NAME || "homepage analytics" }));
      }

      if (url.pathname === "/api/me" && request.method === "GET") {
        return withCors(request, env, jsonResponse(currentVisitor(request)));
      }

      if (url.pathname === "/api/stats" && request.method === "GET") {
        return withCors(request, env, jsonResponse(await stats(env)));
      }

      if (url.pathname === "/api/visit" && request.method === "POST") {
        if (!isAllowedOrigin(request, env)) {
          return withCors(request, env, jsonResponse({ error: "Origin is not allowed." }, 403));
        }
        return withCors(request, env, await recordVisit(request, env));
      }

      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        return await handleLogin(request, env);
      }

      if (url.pathname === "/api/admin/logout" && request.method === "POST") {
        const secure = url.protocol === "https:" ? " Secure;" : "";
        return jsonResponse({ ok: true }, 200, {
          "set-cookie": `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly;${secure} SameSite=Lax`
        });
      }

      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        const session = await readSession(request, env);
        return session.ok ? jsonResponse({ ok: true, expiresAt: session.expiresAt }) : jsonResponse({ ok: false }, 401);
      }

      if (url.pathname === "/api/admin/summary" && request.method === "GET") {
        const unauthorized = await unauthorizedResponse(request, env);
        if (unauthorized) return unauthorized;
        return jsonResponse(await adminSummary(env));
      }

      if (url.pathname === "/api/admin/visits" && request.method === "GET") {
        const unauthorized = await unauthorizedResponse(request, env);
        if (unauthorized) return unauthorized;
        return jsonResponse(await adminVisits(url, env));
      }

      return jsonResponse({ error: "Not found." }, 404);
    } catch (error) {
      return jsonResponse({ error: "Server error.", detail: error.message }, 500);
    }
  }
};

async function recordVisit(request, env) {
  const body = await readJsonBody(request);
  const visitor = currentVisitor(request);
  const now = new Date().toISOString();
  const userAgent = truncate(request.headers.get("user-agent"), 500);
  const visitorKey = truncate(body.visitorId, 120) || await sha256([
    env.SESSION_SECRET || "homepage-analytics",
    visitor.ip,
    userAgent,
    now.slice(0, 10)
  ].join("|"));

  await env.DB.prepare(`
    INSERT INTO visits (
      visited_at, visitor_key, ip, country, region, city, latitude, longitude,
      timezone, asn, as_organization, colo, path, title, referrer, user_agent,
      language, screen, client_timezone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    now,
    visitorKey,
    visitor.ip,
    visitor.location.countryCode,
    visitor.location.region,
    visitor.location.city,
    visitor.location.latitude,
    visitor.location.longitude,
    visitor.location.timezone,
    visitor.network.asn,
    visitor.network.organization,
    visitor.network.colo,
    truncate(body.path, 300),
    truncate(body.title, 200),
    truncate(body.referrer, 500),
    userAgent,
    truncate(body.language, 80),
    truncate(body.screen, 80),
    truncate(body.timezone, 120)
  ).run();

  return jsonResponse({ ok: true, stats: await stats(env) });
}

function currentVisitor(request) {
  const cf = request.cf || {};
  const ip = firstIp(
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    ""
  );

  return {
    ip,
    location: {
      city: clean(cf.city),
      region: clean(cf.region),
      regionCode: clean(cf.regionCode),
      country: clean(cf.country),
      countryCode: clean(cf.country),
      continent: clean(cf.continent),
      postalCode: clean(cf.postalCode),
      latitude: numberOrNull(cf.latitude),
      longitude: numberOrNull(cf.longitude),
      timezone: clean(cf.timezone)
    },
    network: {
      asn: Number.isFinite(Number(cf.asn)) ? Number(cf.asn) : null,
      organization: clean(cf.asOrganization),
      colo: clean(cf.colo)
    }
  };
}

async function stats(env) {
  const row = await env.DB.prepare(`
    SELECT
      COUNT(*) AS pv,
      COUNT(DISTINCT visitor_key) AS uv
    FROM visits
  `).first();

  return {
    pv: Number(row?.pv || 0),
    uv: Number(row?.uv || 0)
  };
}

async function adminSummary(env) {
  const totals = await env.DB.prepare(`
    SELECT
      COUNT(*) AS pv,
      COUNT(DISTINCT visitor_key) AS uv,
      COUNT(DISTINCT ip) AS unique_ips,
      SUM(CASE WHEN visited_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') THEN 1 ELSE 0 END) AS pv_24h,
      COUNT(DISTINCT CASE WHEN visited_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') THEN visitor_key END) AS uv_24h
    FROM visits
  `).first();

  const countries = await env.DB.prepare(`
    SELECT country, COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS visitors
    FROM visits
    WHERE country IS NOT NULL AND country != ''
    GROUP BY country
    ORDER BY visits DESC
    LIMIT 10
  `).all();

  const pages = await env.DB.prepare(`
    SELECT path, COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS visitors
    FROM visits
    WHERE path IS NOT NULL AND path != ''
    GROUP BY path
    ORDER BY visits DESC
    LIMIT 10
  `).all();

  const latest = await env.DB.prepare(`
    SELECT id, visited_at, ip, country, region, city, latitude, longitude, timezone, asn,
           as_organization, colo, path, referrer, user_agent, language, screen, client_timezone
    FROM visits
    ORDER BY id DESC
    LIMIT 10
  `).all();

  return {
    totals: {
      pv: Number(totals?.pv || 0),
      uv: Number(totals?.uv || 0),
      uniqueIps: Number(totals?.unique_ips || 0),
      pv24h: Number(totals?.pv_24h || 0),
      uv24h: Number(totals?.uv_24h || 0)
    },
    countries: countries.results || [],
    pages: pages.results || [],
    latest: latest.results || []
  };
}

async function adminVisits(url, env) {
  const limit = clamp(Number(url.searchParams.get("limit") || 50), 1, 200);
  const offset = clamp(Number(url.searchParams.get("offset") || 0), 0, 1000000);
  const rows = await env.DB.prepare(`
    SELECT id, visited_at, visitor_key, ip, country, region, city, latitude, longitude,
           timezone, asn, as_organization, colo, path, title, referrer, user_agent,
           language, screen, client_timezone
    FROM visits
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  return { visits: rows.results || [], limit, offset };
}

async function handleLogin(request, env) {
  const body = await readJsonBody(request);
  const expected = env.ADMIN_PASSWORD || "";

  if (!expected || body.password !== expected) {
    return jsonResponse({ error: "Invalid password." }, 401);
  }

  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  const token = await signSession({ exp: expiresAt }, env);
  const secure = new URL(request.url).protocol === "https:" ? " Secure;" : "";
  return jsonResponse({ ok: true, expiresAt }, 200, {
    "set-cookie": `${SESSION_COOKIE}=${token}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly;${secure} SameSite=Lax`
  });
}

async function unauthorizedResponse(request, env) {
  const session = await readSession(request, env);
  return session.ok ? null : jsonResponse({ error: "Unauthorized." }, 401);
}

async function readSession(request, env) {
  const token = cookieValue(request.headers.get("cookie") || "", SESSION_COOKIE);
  if (!token) return { ok: false };
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return { ok: false };
  const expectedSignature = await hmac(payloadPart, env.SESSION_SECRET || "");
  if (!safeEqual(signature, expectedSignature)) return { ok: false };

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart));
    if (!payload.exp || Date.now() > payload.exp) return { ok: false };
    return { ok: true, expiresAt: payload.exp };
  } catch (error) {
    return { ok: false };
  }
}

async function signSession(payload, env) {
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(payloadPart, env.SESSION_SECRET || "");
  return `${payloadPart}.${signature}`;
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret || "missing-session-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncodeBytes(new Uint8Array(signed));
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64UrlEncodeBytes(new Uint8Array(digest));
}

async function readJsonBody(request) {
  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) throw new Error("Request body is too large.");
  if (!text) return {};
  return JSON.parse(text);
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

function htmlResponse(html) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function withCors(request, env, response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request, env))) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const headers = {
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };

  if (origin && isAllowedOrigin(request, env)) {
    headers["access-control-allow-origin"] = origin;
  }

  return headers;
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowed = String(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed.includes("*") || allowed.includes(origin);
}

function cookieValue(cookieHeader, name) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

function base64UrlEncode(value) {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

function truncate(value, length) {
  return clean(value).slice(0, length);
}

function clean(value) {
  return value == null ? "" : String(value).trim();
}

function firstIp(value) {
  return clean(value).split(",")[0].trim();
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function adminPage(env) {
  const title = env.SITE_NAME || "Homepage Analytics";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} Admin</title>
  <style>
    :root { color-scheme: light dark; --bg: #f7f8f6; --ink: #17211d; --muted: #63706a; --line: #dbe2dd; --card: #ffffff; --accent: #0f766e; }
    @media (prefers-color-scheme: dark) { :root { --bg: #101412; --ink: #f4f7f5; --muted: #aab5af; --line: #2d3833; --card: #161c19; --accent: #5eead4; } }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 48px; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-size: clamp(26px, 4vw, 42px); letter-spacing: 0; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    p { color: var(--muted); }
    button, input { font: inherit; }
    button { border: 0; border-radius: 8px; padding: 10px 14px; color: #fff; background: var(--accent); cursor: pointer; }
    button.secondary { color: var(--ink); background: transparent; border: 1px solid var(--line); }
    input { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; background: var(--card); color: var(--ink); }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 18px; box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08); }
    .login { max-width: 420px; margin: 12vh auto; display: grid; gap: 14px; }
    .hidden { display: none !important; }
    .stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .stat strong { display: block; font-size: 28px; }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.45fr); gap: 16px; align-items: start; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 8px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; }
    code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 16px; }
    .list-row { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line); padding: 8px 0; }
    @media (max-width: 860px) { .stats, .grid { grid-template-columns: 1fr; } header { align-items: start; flex-direction: column; } }
  </style>
</head>
<body>
  <main>
    <section id="login" class="card login">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p>Private visitor analytics dashboard.</p>
      </div>
      <label>
        <span class="muted">Admin password</span>
        <input id="password" type="password" autocomplete="current-password">
      </label>
      <button id="login-button" type="button">Log in</button>
      <p id="login-error" class="muted"></p>
    </section>

    <section id="dashboard" class="hidden">
      <header>
        <div>
          <h1>${escapeHtml(title)}</h1>
          <p>Visitor IPs, approximate locations, pages, referrers, and recent visits.</p>
        </div>
        <div>
          <button id="refresh-button" type="button">Refresh</button>
          <button id="logout-button" type="button" class="secondary">Log out</button>
        </div>
      </header>

      <section class="stats">
        <article class="card stat"><span class="muted">PV</span><strong id="pv">0</strong></article>
        <article class="card stat"><span class="muted">UV</span><strong id="uv">0</strong></article>
        <article class="card stat"><span class="muted">Unique IPs</span><strong id="ips">0</strong></article>
        <article class="card stat"><span class="muted">PV 24h</span><strong id="pv24">0</strong></article>
        <article class="card stat"><span class="muted">UV 24h</span><strong id="uv24">0</strong></article>
      </section>

      <section class="grid">
        <article class="card">
          <h2>Recent Visits</h2>
          <div style="overflow:auto">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>IP</th>
                  <th>Location</th>
                  <th>Page</th>
                  <th>Network</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody id="visits"></tbody>
            </table>
          </div>
        </article>
        <aside class="stack">
          <article class="card">
            <h2>Top Countries</h2>
            <div id="countries"></div>
          </article>
          <article class="card">
            <h2>Top Pages</h2>
            <div id="pages"></div>
          </article>
        </aside>
      </section>
    </section>
  </main>
  <script>
    const $ = (selector) => document.querySelector(selector);
    const number = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));
    const text = (value) => value || "-";
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));

    async function api(path, options = {}) {
      const response = await fetch(path, {
        ...options,
        headers: { "content-type": "application/json", ...(options.headers || {}) }
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || response.statusText);
      return response.json();
    }

    function setLoggedIn(value) {
      $("#login").classList.toggle("hidden", value);
      $("#dashboard").classList.toggle("hidden", !value);
    }

    function renderList(selector, rows, labelKey) {
      $(selector).innerHTML = rows.length
        ? rows.map((row) => '<div class="list-row"><code>' + escapeHtml(row[labelKey] || "-") + '</code><strong>' + number(row.visits) + '</strong></div>').join("")
        : '<p class="muted">No data yet.</p>';
    }

    function renderSummary(data) {
      $("#pv").textContent = number(data.totals.pv);
      $("#uv").textContent = number(data.totals.uv);
      $("#ips").textContent = number(data.totals.uniqueIps);
      $("#pv24").textContent = number(data.totals.pv24h);
      $("#uv24").textContent = number(data.totals.uv24h);
      renderList("#countries", data.countries, "country");
      renderList("#pages", data.pages, "path");
      $("#visits").innerHTML = data.latest.length
        ? data.latest.map((visit) => {
            const location = [visit.city, visit.region, visit.country].filter(Boolean).join(", ");
            const network = [visit.as_organization, visit.asn ? "AS" + visit.asn : "", visit.colo].filter(Boolean).join(" / ");
            return '<tr>' +
              '<td><code>' + escapeHtml(visit.visited_at) + '</code></td>' +
              '<td><code>' + escapeHtml(visit.ip) + '</code></td>' +
              '<td>' + escapeHtml(location || "-") + '<br><span class="muted">' + escapeHtml([visit.latitude, visit.longitude].filter(Boolean).join(", ")) + '</span></td>' +
              '<td><code>' + escapeHtml(visit.path) + '</code><br><span class="muted">' + escapeHtml(visit.referrer || "") + '</span></td>' +
              '<td>' + escapeHtml(network || "-") + '</td>' +
              '<td class="muted">' + escapeHtml(visit.user_agent || "-") + '</td>' +
            '</tr>';
          }).join("")
        : '<tr><td colspan="6" class="muted">No visits recorded yet.</td></tr>';
    }

    async function refresh() {
      renderSummary(await api("/api/admin/summary"));
    }

    $("#login-button").addEventListener("click", async () => {
      $("#login-error").textContent = "";
      try {
        await api("/api/admin/login", {
          method: "POST",
          body: JSON.stringify({ password: $("#password").value })
        });
        setLoggedIn(true);
        await refresh();
      } catch (error) {
        $("#login-error").textContent = error.message;
      }
    });

    $("#password").addEventListener("keydown", (event) => {
      if (event.key === "Enter") $("#login-button").click();
    });

    $("#refresh-button").addEventListener("click", refresh);
    $("#logout-button").addEventListener("click", async () => {
      await api("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => {});
      setLoggedIn(false);
    });

    api("/api/admin/session")
      .then(async () => { setLoggedIn(true); await refresh(); })
      .catch(() => setLoggedIn(false));
  </script>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
