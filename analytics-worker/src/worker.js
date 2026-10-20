const SESSION_COOKIE = "kx_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const MAX_BODY_LENGTH = 4096;
const VISITS_PER_PAGE = 10;
const MAX_TREND_POINTS = 5000;
const TREND_BUCKETS = {
  hour: "substr(visited_at, 1, 13) || ':00:00Z'",
  day: "substr(visited_at, 1, 10)",
  week: "date(visited_at, '-' || ((CAST(strftime('%w', visited_at) AS INTEGER) + 6) % 7) || ' days')",
  month: "substr(visited_at, 1, 7)",
  year: "substr(visited_at, 1, 4)"
};
const CHINA_PROVINCES = {
  "北京": { name: "Beijing", code: "BJ", latitude: 39.9042, longitude: 116.4074 },
  "天津": { name: "Tianjin", code: "TJ", latitude: 39.0842, longitude: 117.2 },
  "河北": { name: "Hebei", code: "HE", latitude: 38.0428, longitude: 114.5149 },
  "山西": { name: "Shanxi", code: "SX", latitude: 37.8706, longitude: 112.5489 },
  "内蒙古": { name: "Inner Mongolia", code: "NM", latitude: 40.8175, longitude: 111.7652 },
  "辽宁": { name: "Liaoning", code: "LN", latitude: 41.8057, longitude: 123.4315 },
  "吉林": { name: "Jilin", code: "JL", latitude: 43.8171, longitude: 125.3235 },
  "黑龙江": { name: "Heilongjiang", code: "HL", latitude: 45.8038, longitude: 126.535 },
  "上海": { name: "Shanghai", code: "SH", latitude: 31.2304, longitude: 121.4737 },
  "江苏": { name: "Jiangsu", code: "JS", latitude: 32.0603, longitude: 118.7969 },
  "浙江": { name: "Zhejiang", code: "ZJ", latitude: 30.2741, longitude: 120.1551 },
  "安徽": { name: "Anhui", code: "AH", latitude: 31.8206, longitude: 117.2272 },
  "福建": { name: "Fujian", code: "FJ", latitude: 26.0745, longitude: 119.2965 },
  "江西": { name: "Jiangxi", code: "JX", latitude: 28.682, longitude: 115.8579 },
  "山东": { name: "Shandong", code: "SD", latitude: 36.6512, longitude: 117.1201 },
  "河南": { name: "Henan", code: "HA", latitude: 34.7466, longitude: 113.6254 },
  "湖北": { name: "Hubei", code: "HB", latitude: 30.5928, longitude: 114.3055 },
  "湖南": { name: "Hunan", code: "HN", latitude: 28.2282, longitude: 112.9388 },
  "广东": { name: "Guangdong", code: "GD", latitude: 23.1291, longitude: 113.2644 },
  "广西": { name: "Guangxi", code: "GX", latitude: 22.817, longitude: 108.3665 },
  "海南": { name: "Hainan", code: "HI", latitude: 20.044, longitude: 110.1999 },
  "重庆": { name: "Chongqing", code: "CQ", latitude: 29.563, longitude: 106.5516 },
  "四川": { name: "Sichuan", code: "SC", latitude: 30.5728, longitude: 104.0668 },
  "贵州": { name: "Guizhou", code: "GZ", latitude: 26.647, longitude: 106.6302 },
  "云南": { name: "Yunnan", code: "YN", latitude: 25.0389, longitude: 102.7183 },
  "西藏": { name: "Tibet", code: "XZ", latitude: 29.652, longitude: 91.1721 },
  "陕西": { name: "Shaanxi", code: "SN", latitude: 34.3416, longitude: 108.9398 },
  "甘肃": { name: "Gansu", code: "GS", latitude: 36.0611, longitude: 103.8343 },
  "青海": { name: "Qinghai", code: "QH", latitude: 36.6171, longitude: 101.7782 },
  "宁夏": { name: "Ningxia", code: "NX", latitude: 38.4872, longitude: 106.2309 },
  "新疆": { name: "Xinjiang", code: "XJ", latitude: 43.8256, longitude: 87.6168 }
};

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
        return jsonResponse(await adminSummary(url, env));
      }

      if (url.pathname === "/api/admin/trend" && request.method === "GET") {
        const unauthorized = await unauthorizedResponse(request, env);
        if (unauthorized) return unauthorized;
        return jsonResponse(await adminTrend(url, env));
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
  const edgeVisitor = currentVisitor(request);
  const visitor = resolveVisitLocation(edgeVisitor, body);
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
      visited_at, visitor_key, ip, country, region, region_code, city, latitude, longitude,
      timezone, asn, as_organization, colo, path, title, referrer, user_agent,
      language, screen, client_timezone, edge_ip, edge_country, edge_region, edge_city,
      location_source, mainland_signal, client_isp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    now,
    visitorKey,
    visitor.ip,
    visitor.location.countryCode,
    visitor.location.region,
    visitor.location.regionCode,
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
    truncate(body.timezone, 120),
    edgeVisitor.ip,
    edgeVisitor.location.countryCode,
    edgeVisitor.location.region,
    edgeVisitor.location.city,
    visitor.locationSource,
    visitor.mainlandSignal,
    visitor.clientIsp
  ).run();

  return jsonResponse({ ok: true, stats: await stats(env) });
}

function resolveVisitLocation(edgeVisitor, body) {
  const probe = normalizeMainlandProbe(body.mainlandProbe);
  const browserSignal = hasMainlandBrowserSignal(body);
  const edgeCountry = edgeVisitor.location.countryCode.toUpperCase();
  const edgeProvince = edgeCountry === "CN"
    ? chinaProvince(edgeVisitor.location.region || edgeVisitor.location.regionCode)
    : null;

  if (edgeCountry === "CN" && edgeProvince) {
    return {
      ...edgeVisitor,
      location: {
        ...edgeVisitor.location,
        country: "China",
        countryCode: "CN",
        region: edgeProvince.name,
        regionCode: edgeProvince.code
      },
      locationSource: "cloudflare-direct",
      mainlandSignal: 1,
      clientIsp: ""
    };
  }

  if (probe && browserSignal) {
    return {
      ...edgeVisitor,
      ip: probe.ip,
      location: {
        city: probe.city,
        region: probe.province.name,
        regionCode: probe.province.code,
        country: "China",
        countryCode: "CN",
        continent: "AS",
        postalCode: "",
        latitude: probe.province.latitude,
        longitude: probe.province.longitude,
        timezone: "Asia/Shanghai"
      },
      locationSource: edgeCountry === "CN" ? "cloudflare+ipip" : "ipip-client",
      mainlandSignal: 1,
      clientIsp: probe.isp
    };
  }

  if (edgeCountry === "CN") {
    return {
      ...edgeVisitor,
      location: {
        ...edgeVisitor.location,
        country: "China",
        countryCode: "CN"
      },
      locationSource: "cloudflare-direct",
      mainlandSignal: 1,
      clientIsp: ""
    };
  }

  return {
    ...edgeVisitor,
    locationSource: "cloudflare",
    mainlandSignal: browserSignal && edgeCountry !== "CN" ? 1 : 0,
    clientIsp: ""
  };
}

function normalizeMainlandProbe(value) {
  if (!value || typeof value !== "object" || value.provider !== "ipip") return null;
  const country = clean(value.country).toLowerCase();
  const province = chinaProvince(value.region);
  const ip = normalizeIp(value.ip);
  if (!ip || !province || !["cn", "china", "中国"].includes(country)) return null;
  return {
    ip,
    province,
    city: truncate(value.city, 120),
    isp: truncate(value.isp, 200)
  };
}

function hasMainlandBrowserSignal(body) {
  const timezone = clean(body.timezone);
  const language = clean(body.language).toLowerCase();
  return timezone === "Asia/Shanghai" || language === "zh-cn" || language.startsWith("zh-cn-");
}

function chinaProvince(value) {
  const normalized = clean(value)
    .replace(/壮族自治区$|回族自治区$|维吾尔自治区$|自治区$|特别行政区$|省$|市$/u, "")
    .trim();
  if (!normalized) return null;
  const lowered = normalized.toLowerCase();
  for (const [chineseName, province] of Object.entries(CHINA_PROVINCES)) {
    if (normalized === chineseName || lowered === province.name.toLowerCase() || lowered === province.code.toLowerCase()) {
      return province;
    }
  }
  return null;
}

function normalizeIp(value) {
  const ip = truncate(value, 64);
  if (isIpv4(ip)) return ip;
  if (ip.includes(":") && /^[0-9a-f:]+$/i.test(ip) && ip.length <= 45) return ip.toLowerCase();
  return "";
}

function isIpv4(value) {
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
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

async function adminSummary(url, env) {
  const range = readDateRange(url);
  const rangeFilter = visitRangeFilter(range);
  const totals = await queryFirst(env, `
    SELECT
      COUNT(*) AS pv,
      COUNT(DISTINCT visitor_key) AS uv,
      COUNT(DISTINCT ip) AS unique_ips,
      MIN(visited_at) AS first_visit,
      MAX(visited_at) AS last_visit,
      SUM(CASE WHEN datetime(visited_at) >= datetime('now', '-1 day') THEN 1 ELSE 0 END) AS pv_24h,
      COUNT(DISTINCT CASE WHEN datetime(visited_at) >= datetime('now', '-1 day') THEN visitor_key END) AS uv_24h,
      SUM(CASE WHEN substr(visited_at, 1, 10) = date('now') THEN 1 ELSE 0 END) AS today_pv,
      COUNT(DISTINCT CASE WHEN substr(visited_at, 1, 10) = date('now') THEN visitor_key END) AS today_uv,
      SUM(CASE WHEN substr(visited_at, 1, 10) = date('now', '-1 day') THEN 1 ELSE 0 END) AS yesterday_pv,
      COUNT(DISTINCT CASE WHEN substr(visited_at, 1, 10) = date('now', '-1 day') THEN visitor_key END) AS yesterday_uv,
      SUM(CASE WHEN substr(visited_at, 1, 10) >= date('now', '-7 days') AND substr(visited_at, 1, 10) < date('now') THEN 1 ELSE 0 END) AS last_7_pv,
      COUNT(DISTINCT CASE WHEN substr(visited_at, 1, 10) >= date('now', '-7 days') AND substr(visited_at, 1, 10) < date('now') THEN visitor_key END) AS last_7_uv,
      SUM(CASE WHEN substr(visited_at, 1, 10) >= date('now', '-14 days') AND substr(visited_at, 1, 10) < date('now', '-7 days') THEN 1 ELSE 0 END) AS previous_7_pv,
      COUNT(DISTINCT CASE WHEN substr(visited_at, 1, 10) >= date('now', '-14 days') AND substr(visited_at, 1, 10) < date('now', '-7 days') THEN visitor_key END) AS previous_7_uv,
      SUM(CASE WHEN substr(visited_at, 1, 10) >= date('now', '-30 days') AND substr(visited_at, 1, 10) < date('now') THEN 1 ELSE 0 END) AS last_30_pv,
      COUNT(DISTINCT CASE WHEN substr(visited_at, 1, 10) >= date('now', '-30 days') AND substr(visited_at, 1, 10) < date('now') THEN visitor_key END) AS last_30_uv,
      SUM(CASE WHEN substr(visited_at, 1, 10) >= date('now', '-60 days') AND substr(visited_at, 1, 10) < date('now', '-30 days') THEN 1 ELSE 0 END) AS previous_30_pv,
      COUNT(DISTINCT CASE WHEN substr(visited_at, 1, 10) >= date('now', '-60 days') AND substr(visited_at, 1, 10) < date('now', '-30 days') THEN visitor_key END) AS previous_30_uv
    FROM visits
  `);

  const rangeTotals = await queryFirst(env, `
    SELECT
      COUNT(*) AS pv,
      COUNT(DISTINCT visitor_key) AS uv,
      COUNT(DISTINCT ip) AS unique_ips,
      MIN(visited_at) AS first_visit,
      MAX(visited_at) AS last_visit,
      SUM(CASE WHEN country = 'CN' THEN 1 ELSE 0 END) AS mainland_visits,
      COUNT(DISTINCT CASE WHEN country = 'CN' THEN visitor_key END) AS mainland_visitors,
      COUNT(DISTINCT CASE WHEN country = 'CN' AND region IS NOT NULL AND region != '' THEN region END) AS mainland_provinces,
      SUM(CASE WHEN country = 'CN' AND location_source IN ('ipip-client', 'cloudflare+ipip') THEN 1 ELSE 0 END) AS mainland_resolved_visits,
      SUM(CASE WHEN mainland_signal = 1 AND country != 'CN' THEN 1 ELSE 0 END) AS likely_proxy_visits,
      COUNT(DISTINCT CASE WHEN mainland_signal = 1 AND country != 'CN' THEN visitor_key END) AS likely_proxy_visitors
    FROM visits
    ${rangeFilter.sql}
  `, rangeFilter.values);

  const countriesFilter = visitRangeFilter(range, ["country IS NOT NULL", "country != ''"]);
  const pagesFilter = visitRangeFilter(range, ["path IS NOT NULL", "path != ''"]);
  const pages = await queryAll(env, `
    SELECT path, COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS visitors, MAX(visited_at) AS last_visit
    FROM visits
    ${pagesFilter.sql}
    GROUP BY path
    ORDER BY visits DESC, path ASC
    LIMIT 10
  `, pagesFilter.values);

  const provincesFilter = visitRangeFilter(range, ["country = 'CN'", "region IS NOT NULL", "region != ''"]);
  const provinces = await queryAll(env, `
    SELECT
      region,
      MAX(region_code) AS region_code,
      COUNT(*) AS visits,
      COUNT(DISTINCT visitor_key) AS visitors,
      MAX(visited_at) AS last_visit,
      SUM(CASE WHEN location_source IN ('ipip-client', 'cloudflare+ipip') THEN 1 ELSE 0 END) AS resolved_visits
    FROM visits
    ${provincesFilter.sql}
    GROUP BY region
    ORDER BY visits DESC, region ASC
  `, provincesFilter.values);

  const mapFilter = visitRangeFilter(range, ["country IS NOT NULL", "country != ''"]);
  const mapCountries = await queryAll(env, `
    SELECT
      country,
      CASE WHEN country = 'CN' THEN region ELSE '' END AS region,
      MAX(CASE WHEN country = 'CN' THEN region_code ELSE '' END) AS region_code,
      COUNT(*) AS visits,
      COUNT(DISTINCT visitor_key) AS visitors,
      COUNT(DISTINCT COALESCE(NULLIF(city, ''), NULLIF(region, ''), country)) AS locations,
      MAX(visited_at) AS last_visit,
      AVG(CASE
        WHEN latitude BETWEEN -90 AND 90
          AND longitude BETWEEN -180 AND 180
          AND (latitude != 0 OR longitude != 0)
        THEN latitude
      END) AS latitude,
      AVG(CASE
        WHEN latitude BETWEEN -90 AND 90
          AND longitude BETWEEN -180 AND 180
          AND (latitude != 0 OR longitude != 0)
        THEN longitude
      END) AS longitude
    FROM visits
    ${mapFilter.sql}
    GROUP BY
      country,
      CASE WHEN country = 'CN' THEN region ELSE '' END
    ORDER BY visits DESC
  `, mapFilter.values);

  const geographyCountries = await queryAll(env, `
    SELECT
      country,
      COUNT(DISTINCT CASE
        WHEN country = 'CN' THEN COALESCE(NULLIF(region, ''), country)
        ELSE COALESCE(NULLIF(city, ''), NULLIF(region, ''), country)
      END) AS locations,
      COUNT(*) AS visits,
      COUNT(DISTINCT visitor_key) AS visitors,
      MAX(visited_at) AS last_visit
    FROM visits
    ${countriesFilter.sql}
    GROUP BY country
    ORDER BY visits DESC, country ASC
  `, countriesFilter.values);

  const locationsFilter = visitRangeFilter(range, ["country IS NOT NULL", "country != ''"]);
  const geographyLocations = await queryAll(env, `
    SELECT
      country,
      CASE
        WHEN country = 'CN' THEN COALESCE(NULLIF(region, ''), 'Unknown location')
        ELSE COALESCE(NULLIF(city, ''), NULLIF(region, ''), 'Unknown location')
      END AS location,
      MAX(region) AS region,
      CASE WHEN country = 'CN' THEN '' ELSE MAX(city) END AS city,
      COUNT(*) AS visits,
      COUNT(DISTINCT visitor_key) AS visitors,
      MAX(visited_at) AS last_visit
    FROM visits
    ${locationsFilter.sql}
    GROUP BY country, location
    ORDER BY visits DESC, country ASC, location ASC
    LIMIT 500
  `, locationsFilter.values);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      pv: Number(totals?.pv || 0),
      uv: Number(totals?.uv || 0),
      uniqueIps: Number(totals?.unique_ips || 0),
      pv24h: Number(totals?.pv_24h || 0),
      uv24h: Number(totals?.uv_24h || 0),
      firstVisit: clean(totals?.first_visit),
      lastVisit: clean(totals?.last_visit)
    },
    periods: {
      today: periodValues(totals, "today"),
      yesterday: periodValues(totals, "yesterday"),
      last7: periodValues(totals, "last_7"),
      previous7: periodValues(totals, "previous_7"),
      last30: periodValues(totals, "last_30"),
      previous30: periodValues(totals, "previous_30")
    },
    range: {
      from: range.from,
      to: range.to,
      pv: Number(rangeTotals?.pv || 0),
      uv: Number(rangeTotals?.uv || 0),
      uniqueIps: Number(rangeTotals?.unique_ips || 0),
      firstVisit: clean(rangeTotals?.first_visit),
      lastVisit: clean(rangeTotals?.last_visit)
    },
    mainland: {
      visits: Number(rangeTotals?.mainland_visits || 0),
      visitors: Number(rangeTotals?.mainland_visitors || 0),
      provinces: Number(rangeTotals?.mainland_provinces || 0),
      resolvedVisits: Number(rangeTotals?.mainland_resolved_visits || 0),
      likelyProxyVisits: Number(rangeTotals?.likely_proxy_visits || 0),
      likelyProxyVisitors: Number(rangeTotals?.likely_proxy_visitors || 0)
    },
    provinces: provinces.results || [],
    pages: pages.results || [],
    mapCountries: mapCountries.results || [],
    geography: {
      countries: geographyCountries.results || [],
      locations: geographyLocations.results || []
    }
  };
}

async function adminVisits(url, env) {
  const requestedPage = clamp(Number(url.searchParams.get("page") || 1), 1, 1000000);
  const range = readDateRange(url);
  const totalFilter = visitRangeFilter(range);
  const totalRow = await queryFirst(env, `SELECT COUNT(*) AS total FROM visits ${totalFilter.sql}`, totalFilter.values);
  const total = Number(totalRow?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / VISITS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * VISITS_PER_PAGE;
  const rowFilter = visitRangeFilter(range, [], "v.visited_at");
  const rows = await queryAll(env, `
    SELECT v.id, v.visited_at, v.visitor_key, v.ip, v.country, v.region, v.region_code, v.city, v.latitude, v.longitude,
           v.timezone, v.asn, v.as_organization, v.colo, v.path, v.title, v.referrer, v.user_agent,
           v.language, v.screen, v.client_timezone, v.edge_ip, v.edge_country, v.edge_region, v.edge_city,
           v.location_source, v.mainland_signal, v.client_isp,
           CASE WHEN v.id = (SELECT MIN(first_visit.id) FROM visits first_visit WHERE first_visit.visitor_key = v.visitor_key) THEN 1 ELSE 0 END AS is_new,
           (SELECT COUNT(*) FROM visits daily_visit
             WHERE daily_visit.visitor_key = v.visitor_key
               AND substr(daily_visit.visited_at, 1, 10) = substr(v.visited_at, 1, 10)) AS daily_pageviews
    FROM visits v
    ${rowFilter.sql}
    ORDER BY v.id DESC
    LIMIT ? OFFSET ?
  `, [...rowFilter.values, VISITS_PER_PAGE, offset]);

  return {
    visits: rows.results || [],
    page,
    pageSize: VISITS_PER_PAGE,
    total,
    totalPages,
    range
  };
}

async function adminTrend(url, env) {
  const requestedInterval = String(url.searchParams.get("interval") || "day").toLowerCase();
  const interval = Object.hasOwn(TREND_BUCKETS, requestedInterval) ? requestedInterval : "day";
  const bucket = TREND_BUCKETS[interval];
  const range = readDateRange(url);
  const filter = interval === "hour"
    ? { sql: "WHERE visited_at IS NOT NULL AND visited_at != '' AND datetime(visited_at) >= datetime('now', '-24 hours')", values: [] }
    : visitRangeFilter(range, ["visited_at IS NOT NULL", "visited_at != ''"]);
  const rows = await queryAll(env, `
    SELECT
      ${bucket} AS period_start,
      COUNT(*) AS visits,
      COUNT(DISTINCT visitor_key) AS visitors
    FROM visits
    ${filter.sql}
    GROUP BY period_start
    ORDER BY period_start ASC
  `, filter.values);

  return {
    interval,
    range,
    scope: interval === "hour" ? "last-24-hours" : "selected-range",
    points: fillTrendPoints(rows.results || [], interval)
  };
}

function periodValues(row, prefix) {
  return {
    pv: Number(row?.[`${prefix}_pv`] || 0),
    uv: Number(row?.[`${prefix}_uv`] || 0)
  };
}

function readDateRange(url) {
  let from = validDateKey(url.searchParams.get("from"));
  let to = validDateKey(url.searchParams.get("to"));
  if (from && to && from > to) [from, to] = [to, from];
  return { from, to };
}

function validDateKey(value) {
  const candidate = clean(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return "";
  const date = new Date(`${candidate}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== candidate ? "" : candidate;
}

function visitRangeFilter(range, extraClauses = [], column = "visited_at") {
  const clauses = [...extraClauses];
  const values = [];
  if (range.from) {
    clauses.push(`${column} >= ?`);
    values.push(`${range.from}T00:00:00.000Z`);
  }
  if (range.to) {
    const exclusive = new Date(`${range.to}T00:00:00.000Z`);
    exclusive.setUTCDate(exclusive.getUTCDate() + 1);
    clauses.push(`${column} < ?`);
    values.push(exclusive.toISOString());
  }
  return {
    sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values
  };
}

function queryStatement(env, sql, values) {
  const statement = env.DB.prepare(sql);
  return values.length ? statement.bind(...values) : statement;
}

function queryFirst(env, sql, values = []) {
  return queryStatement(env, sql, values).first();
}

function queryAll(env, sql, values = []) {
  return queryStatement(env, sql, values).all();
}

function fillTrendPoints(rows, interval) {
  const activePoints = rows
    .map((row) => ({
      period: clean(row.period_start),
      visits: Number(row.visits || 0),
      visitors: Number(row.visitors || 0)
    }))
    .filter((row) => row.period)
    .sort((left, right) => left.period.localeCompare(right.period));

  if (activePoints.length < 2) return activePoints;

  const firstDate = trendPeriodDate(activePoints[0].period, interval);
  const lastDate = trendPeriodDate(activePoints.at(-1).period, interval);
  if (!firstDate || !lastDate) return activePoints;

  const byPeriod = new Map(activePoints.map((point) => [point.period, point]));
  const filled = [];
  let current = firstDate;

  while (current <= lastDate) {
    const period = trendPeriodKey(current, interval);
    filled.push(byPeriod.get(period) || { period, visits: 0, visitors: 0 });
    if (filled.length > MAX_TREND_POINTS) return activePoints;
    current = nextTrendPeriod(current, interval);
  }

  return filled;
}

function trendPeriodDate(period, interval) {
  const value = interval === "hour"
    ? period
    : interval === "year"
    ? `${period}-01-01T00:00:00Z`
    : interval === "month"
      ? `${period}-01T00:00:00Z`
      : `${period}T00:00:00Z`;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function trendPeriodKey(date, interval) {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  if (interval === "hour") return `${year}-${month}-${day}T${String(date.getUTCHours()).padStart(2, "0")}:00:00Z`;
  if (interval === "year") return year;
  if (interval === "month") return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

function nextTrendPeriod(date, interval) {
  const next = new Date(date);
  if (interval === "hour") next.setUTCHours(next.getUTCHours() + 1);
  else if (interval === "year") next.setUTCFullYear(next.getUTCFullYear() + 1);
  else if (interval === "month") next.setUTCMonth(next.getUTCMonth() + 1);
  else next.setUTCDate(next.getUTCDate() + (interval === "week" ? 7 : 1));
  return next;
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
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta id="theme-color" name="theme-color" content="#f5f7f6">
  <title>${escapeHtml(title)} Admin</title>
  <script>
    (() => {
      try {
        document.documentElement.dataset.theme = localStorage.getItem("kx_admin_theme") === "dark" ? "dark" : "light";
      } catch (error) {
        document.documentElement.dataset.theme = "light";
      }
    })();
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css">
  <style>
    :root { color-scheme: light; --bg: #f5f7f6; --ink: #16201c; --muted: #66736d; --line: #d8dfdb; --line-strong: #c4cec8; --card: #ffffff; --soft: #eef3f0; --accent: #0f766e; --accent-dark: #0b514c; --accent-2: #b45309; --alert: #c2413a; --chart-grid: rgba(99, 112, 106, 0.18); }
    :root[data-theme="dark"] { color-scheme: dark; --bg: #101412; --ink: #f4f7f5; --muted: #aab5af; --line: #2d3833; --line-strong: #425048; --card: #161c19; --soft: #1d2521; --accent: #5eead4; --accent-dark: #2dd4bf; --accent-2: #fbbf24; --alert: #fb7185; --chart-grid: rgba(170, 181, 175, 0.16); }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1280px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 48px; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 30px; letter-spacing: 0; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    p { color: var(--muted); }
    button, input { font: inherit; }
    button { border: 0; border-radius: 8px; padding: 10px 14px; color: #fff; background: var(--accent); cursor: pointer; }
    button.secondary { color: var(--ink); background: transparent; border: 1px solid var(--line); }
    button:disabled { cursor: not-allowed; opacity: 0.45; }
    input { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; background: var(--card); color: var(--ink); }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 18px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.045); }
    .login { max-width: 420px; margin: 12vh auto; display: grid; gap: 14px; }
    .hidden { display: none !important; }
    .stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .stat strong { display: block; font-size: 28px; }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.45fr); gap: 16px; align-items: start; }
    .grid > * { min-width: 0; }
    .map-card { margin-bottom: 16px; padding: 0; overflow: hidden; }
    .map-heading, .section-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .map-heading { padding: 18px; }
    .map-heading h2, .section-head h2 { margin-bottom: 2px; }
    .map-heading p, .section-head p { margin: 0; }
    .map-badge { flex: 0 0 auto; padding: 5px 8px; border: 1px solid var(--line); border-radius: 6px; color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; }
    #visitor-map { width: 100%; height: 400px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: #dce9e5; }
    .map-legend { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 18px 18px; }
    .map-chip { display: inline-flex; gap: 7px; align-items: center; padding: 5px 8px; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); background: var(--bg); font-size: 12px; }
    .map-chip strong { color: var(--accent); }
    .leaflet-container { color: #17211d; font: inherit; }
    .trend-card { margin-bottom: 16px; }
    .mainland-card { margin-bottom: 16px; }
    .mainland-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 18px 0 12px; }
    .mainland-metric { padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); }
    .mainland-metric strong { display: block; margin-top: 2px; font-size: 24px; }
    .province-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 16px; }
    .source-tag { display: inline-flex; align-items: center; margin-top: 5px; padding: 2px 6px; border: 1px solid var(--line); border-radius: 5px; color: var(--muted); background: var(--bg); font-size: 11px; font-weight: 700; }
    .source-tag.inferred { color: var(--accent-2); border-color: var(--accent-2); }
    .visit-meta { display: block; margin-top: 4px; color: var(--muted); font-size: 12px; }
    .trend-controls { display: inline-flex; flex: 0 0 auto; gap: 2px; padding: 3px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); }
    .trend-controls button { min-width: 62px; padding: 7px 10px; border-radius: 6px; color: var(--muted); background: transparent; }
    .trend-controls button[aria-pressed="true"] { color: #fff; background: var(--accent); }
    .trend-chart-wrap { position: relative; width: 100%; height: 340px; margin-top: 18px; }
    .trend-empty { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; text-align: center; }
    .table-scroll { max-width: 100%; overflow-x: auto; }
    table { width: 100%; min-width: 740px; border-collapse: collapse; }
    th, td { padding: 10px 8px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; }
    code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
    .muted { color: var(--muted); }
    .stack { display: grid; gap: 16px; }
    .list-row { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line); padding: 8px 0; }
    .pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; }
    .pagination-controls, .page-numbers { display: flex; align-items: center; gap: 6px; }
    .pagination button { min-width: 38px; height: 38px; padding: 0 10px; }
    .pagination button[aria-current="page"] { color: #fff; border-color: var(--accent); background: var(--accent); }
    .page-ellipsis { padding: 0 3px; color: var(--muted); }
    .eyebrow { display: block; margin-bottom: 4px; color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: 0; text-transform: uppercase; }
    .header-actions { display: flex; gap: 8px; }
    .theme-button { min-width: 104px; }
    .overview-card { margin-bottom: 16px; padding: 0; overflow: hidden; }
    .overview-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 18px; border-bottom: 1px solid var(--line); }
    .overview-head h2, .overview-head p { margin: 0; }
    .overview-strip { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
    .overview-item { min-width: 0; padding: 16px 14px 18px; border-right: 1px solid var(--line); text-align: center; }
    .overview-item:last-child { border-right: 0; }
    .overview-item span { display: block; min-height: 36px; color: var(--muted); font-size: 12px; }
    .overview-item strong { display: block; margin: 2px 0; font-size: 28px; font-weight: 650; font-variant-numeric: tabular-nums; }
    .overview-item small { display: block; min-height: 30px; color: var(--muted); font-size: 11px; line-height: 1.35; }
    .overview-item .positive { color: var(--accent); }
    .overview-item .negative { color: var(--alert); }
    .range-bar { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 12px; padding: 12px 18px; border-top: 1px solid var(--line); background: var(--soft); }
    .range-presets, .custom-range { display: flex; flex-wrap: wrap; align-items: end; gap: 6px; }
    .range-presets { padding: 3px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
    .range-presets button { min-width: 64px; padding: 7px 10px; border-radius: 6px; color: var(--muted); background: transparent; }
    .range-presets button[aria-pressed="true"] { color: #fff; background: var(--accent); }
    .date-field { display: grid; gap: 3px; color: var(--muted); font-size: 11px; font-weight: 700; }
    .date-field input { width: 142px; padding: 7px 9px; border-radius: 6px; background: var(--card); }
    .range-error { width: 100%; margin: 0; color: var(--alert); font-size: 12px; }
    .map-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 18px 16px; }
    .map-legend { padding: 0; }
    .legend-item { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12px; }
    .legend-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); }
    .legend-dot.recent { background: var(--alert); }
    .activity-card, .geo-card { margin-bottom: 16px; }
    .activity-card .section-head, .geo-card .section-head { margin-bottom: 10px; }
    .activity-table { min-width: 860px; }
    .activity-table th:last-child, .activity-table td:last-child { width: 46px; text-align: right; }
    .activity-table tr.visit-detail td { padding: 0; border-bottom: 1px solid var(--line-strong); background: var(--soft); text-align: left; }
    .detail-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 24px; padding: 16px 18px 18px 48px; }
    .detail-item { min-width: 0; }
    .detail-item span { display: block; margin-bottom: 3px; color: var(--muted); font-size: 11px; font-weight: 750; text-transform: uppercase; }
    .detail-item strong, .detail-item code { overflow-wrap: anywhere; font-weight: 500; }
    .visit-identity { display: flex; gap: 10px; align-items: flex-start; }
    .country-code { display: inline-grid; width: 34px; height: 24px; flex: 0 0 34px; place-items: center; border: 1px solid var(--line); border-radius: 4px; color: var(--muted); background: var(--soft); font-size: 10px; font-weight: 800; }
    .visit-label { min-width: 0; }
    .visit-label strong { display: block; }
    .visit-label span { display: block; margin-top: 2px; color: var(--muted); font-size: 12px; }
    .new-tag { display: inline-block !important; width: fit-content; margin: 0 5px 0 0 !important; padding: 1px 5px; border-radius: 4px; color: #7c3f05 !important; background: #fef3c7; font-size: 10px !important; font-weight: 800; text-transform: uppercase; }
    .location-button { margin: 0; padding: 0; border: 0; color: var(--accent); background: transparent; text-align: left; }
    .expand-button { width: 32px; height: 32px; padding: 0; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); background: transparent; font-size: 18px; line-height: 1; }
    .expand-button:hover { border-color: var(--accent); color: var(--accent); }
    .time-cell { white-space: nowrap; }
    .time-cell strong, .time-cell span { display: block; }
    .time-cell span { color: var(--muted); font-size: 12px; }
    .ua-cell strong, .ua-cell span { display: block; }
    .ua-cell span { margin-top: 2px; color: var(--muted); font-size: 12px; }
    .trend-card { padding: 18px; }
    .geo-scale { display: flex; width: 180px; height: 7px; overflow: hidden; border-radius: 4px; background: linear-gradient(90deg, #d9ebe8, var(--accent)); }
    .geo-head-meta { display: grid; justify-items: end; gap: 8px; }
    #geo-heatmap { position: relative; width: 100%; height: 300px; margin: 4px 0 14px; overflow: hidden; border: 1px solid var(--line); border-radius: 6px; background: var(--soft); }
    #geo-heatmap.leaflet-container { background: var(--soft); }
    .geo-map-status { position: absolute; inset: 0; z-index: 500; display: grid; place-items: center; margin: 0; background: var(--soft); text-align: center; }
    .geo-table { min-width: 900px; }
    .geo-table .numeric { text-align: right; font-variant-numeric: tabular-nums; }
    .geo-country-row { cursor: pointer; }
    .geo-country-row:hover { background: var(--soft); }
    .geo-toggle { display: inline-flex; align-items: center; gap: 9px; color: var(--ink); }
    .geo-location-row td { color: var(--muted); background: var(--soft); }
    .geo-location-row td:first-child { padding-left: 56px; }
    .share-track { width: 86px; height: 5px; overflow: hidden; border-radius: 3px; background: var(--line); }
    .share-fill { display: block; height: 100%; background: var(--accent); }
    .secondary-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr); gap: 16px; align-items: start; }
    .rank-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--line); }
    .rank-row:last-child { border-bottom: 0; }
    .rank-row code { overflow-wrap: anywhere; }
    .rank-meta { display: block; margin-top: 2px; color: var(--muted); font-size: 11px; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    :root[data-theme="dark"] .leaflet-tile-pane { filter: brightness(0.72) saturate(0.72); }
    @media (max-width: 1040px) { .overview-strip { grid-template-columns: repeat(4, minmax(0, 1fr)); } .overview-item:nth-child(4) { border-right: 0; } .overview-item:nth-child(n+5) { border-top: 1px solid var(--line); } }
    @media (max-width: 860px) { .stats, .grid, .mainland-metrics, .secondary-grid { grid-template-columns: 1fr; } .province-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } header, .map-heading, .section-head, .overview-head { align-items: start; flex-direction: column; } #visitor-map { height: 320px; } .trend-chart-wrap { height: 300px; } .detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); padding-left: 18px; } }
    @media (max-width: 620px) { .province-list { grid-template-columns: 1fr; } }
    @media (max-width: 620px) { main { width: min(100% - 20px, 1280px); padding-top: 18px; } .overview-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); } .overview-item { border-top: 1px solid var(--line); } .overview-item:nth-child(-n+2) { border-top: 0; } .overview-item:nth-child(even) { border-right: 0; } .overview-item:nth-child(4) { border-right: 0; } .custom-range { width: 100%; } .date-field { flex: 1; } .date-field input { width: 100%; } .activity-table { min-width: 0; } .activity-table th:nth-child(2), .activity-table th:nth-child(3), .activity-table th:nth-child(4), .activity-table .visit-main td:nth-child(2), .activity-table .visit-main td:nth-child(3), .activity-table .visit-main td:nth-child(4) { display: none; } .activity-table th:nth-child(5), .activity-table .visit-main td:nth-child(5) { width: 112px; } .detail-grid { grid-template-columns: 1fr; padding: 15px 12px; } #geo-heatmap { height: 235px; } }
    @media (max-width: 520px) { .trend-controls { width: 100%; } .trend-controls button { min-width: 0; flex: 1; padding-inline: 6px; } .range-presets { width: 100%; } .range-presets button { min-width: 0; flex: 1; } .header-actions { width: 100%; } .header-actions button { flex: 1; } }
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
          <span class="eyebrow">Private analytics</span>
          <h1>${escapeHtml(title)}</h1>
          <p>Live and historical visitor intelligence for the academic homepage.</p>
        </div>
        <div class="header-actions">
          <button id="theme-button" type="button" class="secondary theme-button" aria-pressed="false" title="Switch to dark background">Dark mode</button>
          <button id="refresh-button" type="button">Refresh</button>
          <button id="logout-button" type="button" class="secondary">Log out</button>
        </div>
      </header>

      <section class="card overview-card" aria-labelledby="overview-title">
        <div class="overview-head">
          <div>
            <h2 id="overview-title">Traffic Overview</h2>
            <p>Page views with unique visitors shown beneath each period.</p>
          </div>
          <p id="last-refresh" class="muted">Waiting for the first refresh.</p>
        </div>
        <div class="overview-strip">
          <div class="overview-item"><span>Today</span><strong id="today-pv">0</strong><small id="today-meta">0 unique visitors</small></div>
          <div class="overview-item"><span>Yesterday</span><strong id="yesterday-pv">0</strong><small id="yesterday-meta">0 unique visitors</small></div>
          <div class="overview-item"><span>Last 7 days</span><strong id="last7-pv">0</strong><small id="last7-meta">0 unique visitors</small></div>
          <div class="overview-item"><span>Previous 7 days</span><strong id="previous7-pv">0</strong><small id="previous7-meta">0 unique visitors</small></div>
          <div class="overview-item"><span>Last 30 days</span><strong id="last30-pv">0</strong><small id="last30-meta">0 unique visitors</small></div>
          <div class="overview-item"><span>Previous 30 days</span><strong id="previous30-pv">0</strong><small id="previous30-meta">0 unique visitors</small></div>
          <div class="overview-item"><span>Total page views</span><strong id="total-pv">0</strong><small id="total-meta">No visits yet</small></div>
        </div>
      </section>

      <article class="card map-card">
        <div class="map-heading">
          <div>
            <h2>Visitor Map</h2>
            <p id="map-summary">Loading mapped visitor locations...</p>
          </div>
          <span id="range-label" class="map-badge">All time</span>
        </div>
        <div class="range-bar">
          <div id="range-presets" class="range-presets" role="group" aria-label="Date range">
            <button type="button" data-range="today" aria-pressed="false">Today</button>
            <button type="button" data-range="7d" aria-pressed="false">7 days</button>
            <button type="button" data-range="30d" aria-pressed="false">30 days</button>
            <button type="button" data-range="year" aria-pressed="false">This year</button>
            <button type="button" data-range="all" aria-pressed="true">All time</button>
          </div>
          <div class="custom-range">
            <label class="date-field">From <input id="from-date" type="date" aria-label="Start date"></label>
            <label class="date-field">To <input id="to-date" type="date" aria-label="End date"></label>
            <button id="apply-range" type="button">Apply</button>
          </div>
          <p id="range-error" class="range-error hidden" role="alert"></p>
        </div>
        <div id="visitor-map" role="img" aria-label="World map showing visitor countries and regions"></div>
        <div class="map-footer">
          <div id="map-legend" class="map-legend" aria-label="Map legend"></div>
          <span id="range-summary" class="muted">No range data loaded.</span>
        </div>
      </article>

      <article class="card activity-card">
        <div class="section-head">
          <div>
            <h2>Visitor Activity</h2>
            <p id="visit-range">Loading visit records...</p>
          </div>
        </div>
        <div class="table-scroll">
          <table class="activity-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Browser</th>
                <th>OS</th>
                <th>IP</th>
                <th>Time</th>
                <th><span class="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody id="visits"></tbody>
          </table>
        </div>
        <nav class="pagination" aria-label="Visit record pages">
          <div class="pagination-controls">
            <button id="previous-page" type="button" class="secondary" aria-label="Previous page" title="Previous page">&larr;</button>
            <div id="page-numbers" class="page-numbers"></div>
            <button id="next-page" type="button" class="secondary" aria-label="Next page" title="Next page">&rarr;</button>
          </div>
          <span id="page-summary" class="muted"></span>
        </nav>
      </article>

      <article class="card trend-card">
        <div class="section-head">
          <div>
            <h2>Visit Trend</h2>
            <p id="trend-summary" aria-live="polite">Loading visit activity...</p>
          </div>
          <div id="trend-controls" class="trend-controls" role="group" aria-label="Trend interval">
            <button type="button" data-interval="hour" aria-pressed="false">Live</button>
            <button type="button" data-interval="day" aria-pressed="true">Day</button>
            <button type="button" data-interval="week" aria-pressed="false">Week</button>
            <button type="button" data-interval="month" aria-pressed="false">Month</button>
            <button type="button" data-interval="year" aria-pressed="false">Year</button>
          </div>
        </div>
        <div class="trend-chart-wrap">
          <canvas id="visits-trend" role="img" aria-label="Line chart of page views and unique visitors over time"></canvas>
          <p id="trend-empty" class="trend-empty muted hidden">No visit activity has been recorded yet.</p>
        </div>
      </article>

      <article class="card geo-card">
        <div class="section-head">
          <div>
            <h2>Audience Geolocation</h2>
            <p id="geo-summary">Loading countries, regions, and visit depth...</p>
          </div>
          <div class="geo-head-meta">
            <span id="geo-range" class="map-badge">All time</span>
            <div class="geo-scale" aria-hidden="true"></div>
          </div>
        </div>
        <div id="geo-heatmap" role="img" aria-label="World heatmap showing visits by country or region">
          <p id="geo-map-status" class="geo-map-status muted">Loading geographic heatmap...</p>
        </div>
        <div class="table-scroll">
          <table class="geo-table">
            <thead>
              <tr>
                <th>Country/Region</th>
                <th class="numeric">Locations</th>
                <th class="numeric">Visits</th>
                <th class="numeric">Uniques</th>
                <th class="numeric">Visit depth</th>
                <th>Share</th>
                <th>Last visit</th>
              </tr>
            </thead>
            <tbody id="geography"></tbody>
          </table>
        </div>
      </article>

      <section class="secondary-grid">
        <article class="card mainland-card">
          <div class="section-head">
            <div>
              <h2>China Mainland Coverage</h2>
              <p>Verified mainland locations are separated from Cloudflare edge exits and proxy indicators.</p>
            </div>
            <span class="map-badge">Best effort</span>
          </div>
          <div class="mainland-metrics">
            <div class="mainland-metric"><span class="muted">Mainland visits</span><strong id="mainland-visits">0</strong></div>
            <div class="mainland-metric"><span class="muted">Resolved visitors</span><strong id="mainland-visitors">0</strong></div>
            <div class="mainland-metric"><span class="muted">Provinces/regions</span><strong id="mainland-provinces">0</strong></div>
            <div class="mainland-metric"><span class="muted">Likely via proxy</span><strong id="mainland-proxy">0</strong></div>
          </div>
          <p id="mainland-note" class="muted">Loading mainland coverage...</p>
          <div id="provinces" class="province-list"></div>
        </article>
        <article class="card">
          <h2>Top Pages</h2>
          <div id="pages"></div>
        </article>
      </section>
    </section>
  </main>
  <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <script>
    const $ = (selector) => document.querySelector(selector);
    const number = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
    const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
    const specialRegions = { A1: "Anonymous proxy", A2: "Satellite provider", O1: "Other country or region", T1: "Tor network", XX: "Unknown country or region" };
    const mainlandCityNames = {
      "北京": "Beijing", "北京市": "Beijing", "上海": "Shanghai", "上海市": "Shanghai",
      "天津": "Tianjin", "天津市": "Tianjin", "重庆": "Chongqing", "重庆市": "Chongqing",
      "南京": "Nanjing", "南京市": "Nanjing", "广州": "Guangzhou", "广州市": "Guangzhou",
      "深圳": "Shenzhen", "深圳市": "Shenzhen", "杭州": "Hangzhou", "杭州市": "Hangzhou",
      "武汉": "Wuhan", "武汉市": "Wuhan", "成都": "Chengdu", "成都市": "Chengdu",
      "西安": "Xi'an", "西安市": "Xi'an"
    };
    const trendNames = { hour: "hour", day: "day", week: "week", month: "month", year: "year" };
    const rangeNames = { today: "Today", "7d": "Last 7 days", "30d": "Last 30 days", year: "This year", all: "All time", custom: "Custom range" };
    const worldTopologyUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
    const geographicAliases = {
      "united states": "united states of america",
      "russia": "russian federation",
      "czechia": "czech republic",
      "north korea": "democratic people s republic of korea",
      "south korea": "korea",
      "tanzania": "united republic of tanzania",
      "vietnam": "viet nam",
      "laos": "lao people s democratic republic",
      "moldova": "republic of moldova",
      "brunei": "brunei darussalam"
    };
    const state = {
      page: 1,
      totalPages: 1,
      map: null,
      markerLayer: null,
      mapMarkers: [],
      heatMap: null,
      heatLayer: null,
      heatCountries: null,
      worldGeoJson: null,
      worldGeoJsonPromise: null,
      heatRequest: 0,
      trendChart: null,
      lastTrendData: null,
      trendInterval: "day",
      trendRequest: 0,
      theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      range: { from: "", to: "", preset: "all" },
      refreshTimer: null,
      refreshing: false,
      pendingRefresh: false
    };

    const themeStorageKey = "kx_admin_theme";

    function updateThemeControl() {
      const dark = state.theme === "dark";
      const button = $("#theme-button");
      button.textContent = dark ? "Light mode" : "Dark mode";
      button.setAttribute("aria-pressed", String(dark));
      button.title = dark ? "Switch to light background" : "Switch to dark background";
      $("#theme-color").content = dark ? "#101412" : "#f5f7f6";
    }

    function applyTheme(theme, persist = true) {
      state.theme = theme === "dark" ? "dark" : "light";
      document.documentElement.dataset.theme = state.theme;
      if (persist) {
        try {
          localStorage.setItem(themeStorageKey, state.theme);
        } catch (error) {
          // Theme switching still works when browser storage is unavailable.
        }
      }
      updateThemeControl();
      if (state.lastTrendData) renderTrend(state.lastTrendData);
      if (state.heatCountries) renderHeatMap(state.heatCountries);
      window.requestAnimationFrame(() => {
        if (state.map) state.map.invalidateSize();
        if (state.heatMap) state.heatMap.invalidateSize();
      });
    }

    async function api(path, options = {}) {
      const response = await fetch(path, {
        ...options,
        headers: { "content-type": "application/json", ...(options.headers || {}) }
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || response.statusText);
      return response.json();
    }

    function countryLabel(value) {
      const code = String(value || "").trim().toUpperCase();
      if (!code) return "Unknown country or region";
      if (specialRegions[code]) return specialRegions[code] + " (" + code + ")";
      if (regionNames && /^[A-Z]{2}$/.test(code)) {
        try {
          const name = regionNames.of(code);
          if (name && name !== code) return name + " (" + code + ")";
        } catch (error) {
          // Fall through to a readable code when the runtime does not recognize it.
        }
      }
      return code;
    }

    function mapLocationLabel(row) {
      const country = countryLabel(row.country);
      return String(row.country || "").toUpperCase() === "CN" && row.region
        ? row.region + ", " + country
        : country;
    }

    function mainlandCityLabel(value) {
      const city = String(value || "").trim();
      if (!city) return "";
      if (mainlandCityNames[city]) return mainlandCityNames[city];
      const containsHan = Array.from(city).some((char) => {
        const code = char.codePointAt(0);
        return code >= 0x3400 && code <= 0x9fff;
      });
      return containsHan ? "" : city;
    }

    function locationSourceLabel(visit) {
      const labels = {
        "cloudflare-direct": "Direct Cloudflare location",
        "cloudflare+ipip": "Cloudflare + mainland lookup",
        "ipip-client": "Mainland browser lookup",
        cloudflare: "Cloudflare edge location"
      };
      if (Number(visit.mainland_signal) === 1 && String(visit.country || "").toUpperCase() !== "CN") {
        return "Likely mainland via proxy";
      }
      return labels[visit.location_source] || "Stored location";
    }

    function dateKey(date) {
      return date.toISOString().slice(0, 10);
    }

    function shiftedDate(days) {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() + days);
      return dateKey(date);
    }

    function formatDate(value, options = {}) {
      if (!value) return "";
      const normalized = /^\\d{4}-\\d{2}-\\d{2}$/.test(value) ? value + "T00:00:00Z" : value;
      const date = new Date(normalized);
      if (Number.isNaN(date.valueOf())) return value;
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: options.short ? "short" : "long",
        day: "numeric",
        ...(options.time ? { hour: "numeric", minute: "2-digit", second: "2-digit" } : {})
      }).format(date);
    }

    function relativeTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.valueOf())) return "Unknown";
      const seconds = Math.round((date.valueOf() - Date.now()) / 1000);
      const ranges = [
        { limit: 60, unit: "second", size: 1 },
        { limit: 3600, unit: "minute", size: 60 },
        { limit: 86400, unit: "hour", size: 3600 },
        { limit: 604800, unit: "day", size: 86400 },
        { limit: 2629800, unit: "week", size: 604800 },
        { limit: 31557600, unit: "month", size: 2629800 },
        { limit: Infinity, unit: "year", size: 31557600 }
      ];
      const range = ranges.find((item) => Math.abs(seconds) < item.limit) || ranges.at(-1);
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(seconds / range.size), range.unit);
    }

    function rangeQuery() {
      const params = new URLSearchParams();
      if (state.range.from) params.set("from", state.range.from);
      if (state.range.to) params.set("to", state.range.to);
      return params.toString();
    }

    function withRange(path) {
      const query = rangeQuery();
      if (!query) return path;
      return path + (path.includes("?") ? "&" : "?") + query;
    }

    function activeRangeLabel() {
      if (state.range.preset !== "custom") return rangeNames[state.range.preset] || rangeNames.all;
      if (state.range.from && state.range.to) return formatDate(state.range.from, { short: true }) + " - " + formatDate(state.range.to, { short: true });
      if (state.range.from) return "Since " + formatDate(state.range.from, { short: true });
      if (state.range.to) return "Through " + formatDate(state.range.to, { short: true });
      return rangeNames.all;
    }

    function syncRangeControls() {
      $("#from-date").value = state.range.from;
      $("#to-date").value = state.range.to;
      document.querySelectorAll("#range-presets button[data-range]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.range === state.range.preset));
      });
      const label = activeRangeLabel();
      $("#range-label").textContent = label;
      $("#geo-range").textContent = label;
    }

    function rangeForPreset(preset) {
      const today = shiftedDate(0);
      if (preset === "today") return { from: today, to: today, preset };
      if (preset === "7d") return { from: shiftedDate(-6), to: today, preset };
      if (preset === "30d") return { from: shiftedDate(-29), to: today, preset };
      if (preset === "year") return { from: today.slice(0, 4) + "-01-01", to: today, preset };
      return { from: "", to: "", preset: "all" };
    }

    async function selectRange(range) {
      state.range = range;
      state.page = 1;
      $("#range-error").classList.add("hidden");
      syncRangeControls();
      await refresh();
    }

    function setLoggedIn(value) {
      $("#login").classList.toggle("hidden", value);
      $("#dashboard").classList.toggle("hidden", !value);
      if (value && !state.refreshTimer) {
        state.refreshTimer = window.setInterval(() => refresh().catch(() => {}), 60000);
      }
      if (!value && state.refreshTimer) {
        window.clearInterval(state.refreshTimer);
        state.refreshTimer = null;
      }
    }

    function renderList(selector, rows, labelForRow) {
      $(selector).innerHTML = rows.length
        ? rows.map((row) => '<div class="rank-row"><div><span>' + escapeHtml(labelForRow(row)) + '</span>' +
            '<small class="rank-meta">' + number(row.visitors) + ' unique visitors</small></div>' +
            '<strong>' + number(row.visits) + '</strong></div>').join("")
        : '<p class="muted">No data yet.</p>';
    }

    function initializeMap() {
      if (state.map || !window.L) return state.map;
      state.map = L.map("visitor-map", {
        minZoom: 1,
        maxZoom: 9,
        worldCopyJump: true,
        zoomControl: true
      }).setView([20, 0], 2);
      const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 9,
        noWrap: false
      }).addTo(state.map);
      const humanitarian = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles by HOT',
        maxZoom: 9,
        noWrap: false
      });
      L.control.layers({ "Street map": street, "Humanitarian map": humanitarian }, null, { position: "topright" }).addTo(state.map);
      state.markerLayer = L.layerGroup().addTo(state.map);
      return state.map;
    }

    function renderMap(rows) {
      const totalVisits = rows.reduce((sum, row) => sum + Number(row.visits || 0), 0);
      $("#map-summary").textContent = rows.length
        ? number(rows.length) + " mapped country or region groups across " + number(totalVisits) + " visits."
        : "No geolocated visits recorded yet.";
      $("#map-legend").innerHTML = rows.length
        ? '<span class="legend-item"><span class="legend-dot recent"></span>Active within 24 hours</span>' +
          '<span class="legend-item"><span class="legend-dot"></span>Historical activity</span>'
        : '<span class="muted">Locations will appear after visits are recorded.</span>';

      const map = initializeMap();
      if (!map) {
        $("#visitor-map").innerHTML = '<p class="muted" style="padding:18px">Map tiles are temporarily unavailable. All country and region totals remain listed below.</p>';
        return;
      }

      state.markerLayer.clearLayers();
      state.mapMarkers = [];
      const bounds = [];
      rows.forEach((row) => {
        const latitude = Number(row.latitude);
        const longitude = Number(row.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) return;
        const visits = Number(row.visits || 0);
        const visitors = Number(row.visitors || 0);
        const coordinates = [latitude, longitude];
        const isRecent = row.last_visit && Date.now() - new Date(row.last_visit).valueOf() <= 86400000;
        const fillColor = isRecent ? "#c2413a" : "#0f766e";
        bounds.push(coordinates);
        const marker = L.circleMarker(coordinates, {
          radius: Math.min(22, 7 + Math.log2(visits + 1) * 2.4),
          color: isRecent ? "#8f2d28" : "#0b514c",
          weight: 2,
          fillColor,
          fillOpacity: 0.72
        }).bindPopup(
          "<strong>" + escapeHtml(mapLocationLabel(row)) + "</strong><br>" +
          number(visits) + " visits &middot; " + number(visitors) + " unique visitors<br>" +
          number(row.locations) + " recorded locations<br>" +
          '<span style="color:#63706a">Last visit ' + escapeHtml(relativeTime(row.last_visit)) + "</span>"
        ).addTo(state.markerLayer);
        state.mapMarkers.push({ latitude, longitude, marker });
      });

      if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds), { padding: [32, 32], maxZoom: 4 });
      else if (bounds.length === 1) map.setView(bounds[0], 4);
      else map.setView([20, 0], 2);
      window.requestAnimationFrame(() => map.invalidateSize());
    }

    function focusMap(latitude, longitude, label) {
      const map = initializeMap();
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!map || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
      map.setView([lat, lng], Math.max(map.getZoom(), 6), { animate: true });
      const match = state.mapMarkers.find((item) => Math.abs(item.latitude - lat) < 0.2 && Math.abs(item.longitude - lng) < 0.2);
      if (match) match.marker.openPopup();
      else L.popup().setLatLng([lat, lng]).setContent("<strong>" + escapeHtml(label || "Visitor location") + "</strong>").openOn(map);
      $("#visitor-map").scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function renderPeriod(id, current, comparison, comparisonLabel) {
      const value = current || { pv: 0, uv: 0 };
      const previous = comparison || null;
      $("#" + id + "-pv").textContent = number(value.pv);
      const meta = $("#" + id + "-meta");
      let text = number(value.uv) + " unique";
      meta.className = "";
      if (previous) {
        const difference = Number(value.pv || 0) - Number(previous.pv || 0);
        if (difference) {
          text += " / " + (difference > 0 ? "+" : "") + number(difference) + " vs " + comparisonLabel;
          meta.classList.add(difference > 0 ? "positive" : "negative");
        }
      }
      meta.textContent = text;
    }

    function normalizedGeoName(value) {
      return String(value || "")
        .toLowerCase()
        .replaceAll("&", " and ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    }

    function countryGeoName(code) {
      const normalizedCode = String(code || "").toUpperCase();
      const label = countryLabel(normalizedCode);
      const suffix = " (" + normalizedCode + ")";
      const name = label.endsWith(suffix) ? label.slice(0, -suffix.length) : label;
      const normalized = normalizedGeoName(name);
      return geographicAliases[normalized] || normalized;
    }

    function heatColor(visits, maximum, dark) {
      if (!visits) return dark ? "#26312c" : "#edf1ef";
      const ratio = visits / Math.max(1, maximum);
      if (ratio >= 0.75) return dark ? "#5eead4" : "#0b514c";
      if (ratio >= 0.45) return dark ? "#2dd4bf" : "#0f766e";
      if (ratio >= 0.2) return dark ? "#5eead4" : "#57aaa1";
      return dark ? "#99f6e4" : "#b7dcd7";
    }

    function initializeHeatMap() {
      if (state.heatMap || !window.L) return state.heatMap;
      state.heatMap = L.map("geo-heatmap", {
        minZoom: 1,
        maxZoom: 4,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false
      }).setView([18, 0], 1);
      return state.heatMap;
    }

    async function renderHeatMap(countries) {
      state.heatCountries = countries;
      const requestId = ++state.heatRequest;
      const status = $("#geo-map-status");
      const map = initializeHeatMap();
      if (!map || !window.topojson) {
        status.textContent = "The geographic heatmap is temporarily unavailable.";
        status.classList.remove("hidden");
        return;
      }

      status.textContent = "Loading geographic heatmap...";
      status.classList.remove("hidden");
      if (!state.worldGeoJsonPromise) {
        state.worldGeoJsonPromise = fetch(worldTopologyUrl)
          .then((response) => {
            if (!response.ok) throw new Error("World map data could not be loaded.");
            return response.json();
          })
          .then((topology) => window.topojson.feature(topology, topology.objects.countries));
      }

      try {
        const world = await state.worldGeoJsonPromise;
        if (requestId !== state.heatRequest) return;
        state.worldGeoJson = world;
        const visitsByName = new Map();
        countries.forEach((row) => visitsByName.set(countryGeoName(row.country), Number(row.visits || 0)));
        const maximum = Math.max(1, ...countries.map((row) => Number(row.visits || 0)));
        const dark = state.theme === "dark";
        if (state.heatLayer) state.heatLayer.remove();
        state.heatLayer = L.geoJSON(world, {
          style(feature) {
            const visits = visitsByName.get(normalizedGeoName(feature.properties?.name)) || 0;
            return {
              color: dark ? "#48564f" : "#cbd5d0",
              weight: 0.7,
              fillColor: heatColor(visits, maximum, dark),
              fillOpacity: 1
            };
          },
          onEachFeature(feature, layer) {
            const name = feature.properties?.name || "Unknown country or region";
            const visits = visitsByName.get(normalizedGeoName(name)) || 0;
            if (visits) layer.bindTooltip("<strong>" + escapeHtml(name) + "</strong><br>" + number(visits) + " visits");
          }
        }).addTo(map);
        map.fitBounds(state.heatLayer.getBounds(), { padding: [4, 4], maxZoom: 2 });
        status.classList.add("hidden");
        window.requestAnimationFrame(() => map.invalidateSize());
      } catch (error) {
        state.worldGeoJsonPromise = null;
        status.textContent = "The heatmap could not be loaded; geographic totals remain available below.";
        status.classList.remove("hidden");
      }
    }

    function renderGeography(geography) {
      const countries = Array.isArray(geography?.countries) ? geography.countries : [];
      const locations = Array.isArray(geography?.locations) ? geography.locations : [];
      const locationsByCountry = new Map();
      locations.forEach((row) => {
        const code = String(row.country || "").toUpperCase();
        if (!locationsByCountry.has(code)) locationsByCountry.set(code, []);
        locationsByCountry.get(code).push(row);
      });
      const maxVisits = Math.max(1, ...countries.map((row) => Number(row.visits || 0)));
      const totalVisits = countries.reduce((sum, row) => sum + Number(row.visits || 0), 0);
      renderHeatMap(countries);
      $("#geo-summary").textContent = countries.length
        ? number(countries.length) + " countries/regions, " + number(locations.length) + " locations, and " + number(totalVisits) + " visits."
        : "No geolocation data is available for this range.";

      $("#geography").innerHTML = countries.length
        ? countries.map((row) => {
            const code = String(row.country || "XX").toUpperCase();
            const visits = Number(row.visits || 0);
            const visitors = Number(row.visitors || 0);
            const depth = visitors ? (visits / visitors).toFixed(2) : "0.00";
            const share = Math.max(3, Math.round((visits / maxVisits) * 100));
            const childRows = (locationsByCountry.get(code) || []).map((location) => {
              const city = code === "CN" ? mainlandCityLabel(location.city) : location.city;
              const parts = [city, location.region].filter((value, index, values) => value && values.indexOf(value) === index);
              const label = parts.join(", ") || location.location || "Unknown location";
              const locationVisitors = Number(location.visitors || 0);
              const locationDepth = locationVisitors ? (Number(location.visits || 0) / locationVisitors).toFixed(2) : "0.00";
              return '<tr class="geo-location-row hidden" data-parent="' + escapeHtml(code) + '">' +
                '<td>' + escapeHtml(label) + '</td>' +
                '<td class="numeric">-</td>' +
                '<td class="numeric">' + number(location.visits) + '</td>' +
                '<td class="numeric">' + number(location.visitors) + '</td>' +
                '<td class="numeric">' + locationDepth + '</td>' +
                '<td></td>' +
                '<td>' + escapeHtml(relativeTime(location.last_visit)) + '</td>' +
              '</tr>';
            }).join("");
            return '<tr class="geo-country-row">' +
              '<td><button type="button" class="location-button geo-toggle" data-country="' + escapeHtml(code) + '" aria-expanded="false">' +
                '<span class="country-code">' + escapeHtml(code) + '</span><strong>' + escapeHtml(countryLabel(code)) + '</strong></button></td>' +
              '<td class="numeric">' + number(row.locations) + '</td>' +
              '<td class="numeric">' + number(visits) + '</td>' +
              '<td class="numeric">' + number(visitors) + '</td>' +
              '<td class="numeric">' + depth + '</td>' +
              '<td><div class="share-track" title="' + number(visits) + ' visits"><span class="share-fill" style="width:' + share + '%"></span></div></td>' +
              '<td>' + escapeHtml(relativeTime(row.last_visit)) + '</td>' +
            '</tr>' + childRows;
          }).join("")
        : '<tr><td colspan="7" class="muted">No geolocation data is available for this range.</td></tr>';
    }

    function renderSummary(data) {
      const periods = data.periods || {};
      renderPeriod("today", periods.today, periods.yesterday, "yesterday");
      renderPeriod("yesterday", periods.yesterday);
      renderPeriod("last7", periods.last7, periods.previous7, "previous period");
      renderPeriod("previous7", periods.previous7);
      renderPeriod("last30", periods.last30, periods.previous30, "previous period");
      renderPeriod("previous30", periods.previous30);
      $("#total-pv").textContent = number(data.totals?.pv);
      $("#total-meta").textContent = data.totals?.firstVisit
        ? "Since " + formatDate(data.totals.firstVisit, { short: true })
        : "No visits yet";
      $("#last-refresh").textContent = "Updated " + formatDate(data.generatedAt, { short: true, time: true });
      const selected = data.range || {};
      $("#range-summary").textContent = number(selected.pv) + " page views / " +
        number(selected.uv) + " unique visitors / " + number(selected.uniqueIps) + " IPs";

      const mainland = data.mainland || {};
      $("#mainland-visits").textContent = number(mainland.visits);
      $("#mainland-visitors").textContent = number(mainland.visitors);
      $("#mainland-provinces").textContent = number(mainland.provinces);
      $("#mainland-proxy").textContent = number(mainland.likelyProxyVisits);
      $("#mainland-note").textContent = number(mainland.resolvedVisits) +
        " visits were resolved by the mainland lookup; " + number(mainland.likelyProxyVisitors) +
        " visitors currently have only a mainland browser signal and a non-CN edge exit.";
      renderMap(data.mapCountries || []);
      renderGeography(data.geography || {});
      renderList("#provinces", data.provinces || [], (row) => {
        const code = row.region_code ? " (" + row.region_code + ")" : "";
        return (row.region || "Unknown province/region") + code;
      });
      renderList("#pages", data.pages || [], (row) => row.path || "Unknown page");
    }

    function trendPeriodLabel(value, interval) {
      const source = interval === "hour" ? value : interval === "year" ? value + "-01-01" : interval === "month" ? value + "-01" : value + "T00:00:00Z";
      const date = new Date(source);
      if (Number.isNaN(date.valueOf())) return value;
      const options = interval === "hour"
        ? { month: "short", day: "numeric", hour: "numeric", timeZone: "UTC" }
        : interval === "year"
        ? { year: "numeric", timeZone: "UTC" }
        : interval === "month"
          ? { month: "short", year: "numeric", timeZone: "UTC" }
          : { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" };
      const label = new Intl.DateTimeFormat("en-US", options).format(date);
      return interval === "week" ? "Week of " + label : label;
    }

    function setTrendControls(interval, busy) {
      document.querySelectorAll("#trend-controls button[data-interval]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.interval === interval));
        button.disabled = Boolean(busy);
      });
    }

    function renderTrend(data) {
      state.lastTrendData = data;
      const interval = trendNames[data.interval] ? data.interval : "day";
      const points = Array.isArray(data.points) ? data.points : [];
      const canvas = $("#visits-trend");
      const empty = $("#trend-empty");
      state.trendInterval = interval;
      setTrendControls(interval, false);

      if (state.trendChart) {
        state.trendChart.destroy();
        state.trendChart = null;
      }

      if (!points.length) {
        canvas.classList.add("hidden");
        empty.textContent = interval === "hour" ? "No visits were recorded in the last 24 hours." : "No visit activity was recorded in this range.";
        empty.classList.remove("hidden");
        $("#trend-summary").textContent = interval === "hour" ? "No visit activity in the last 24 hours." : "No stored visits are available for this trend.";
        return;
      }

      if (!window.Chart) {
        canvas.classList.add("hidden");
        empty.textContent = "The trend chart is temporarily unavailable.";
        empty.classList.remove("hidden");
        $("#trend-summary").textContent = "Visit totals remain available in the dashboard summary.";
        return;
      }

      const labels = points.map((point) => trendPeriodLabel(point.period, interval));
      const first = labels[0];
      const last = labels[labels.length - 1];
      $("#trend-summary").textContent = interval === "hour"
        ? "Live view of the last 24 hours, grouped by hour."
        : points.length === 1
          ? "Selected visits grouped by " + trendNames[interval] + " for " + first + "."
          : "Selected visits grouped by " + trendNames[interval] + " from " + first + " to " + last + ".";
      canvas.classList.remove("hidden");
      empty.classList.add("hidden");

      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue("--accent").trim() || "#0f766e";
      const accentTwo = styles.getPropertyValue("--accent-2").trim() || "#b45309";
      const ink = styles.getPropertyValue("--ink").trim() || "#17211d";
      const muted = styles.getPropertyValue("--muted").trim() || "#63706a";
      const grid = styles.getPropertyValue("--chart-grid").trim() || "rgba(99, 112, 106, 0.18)";
      const pointRadius = points.length > 48 ? 0 : 2.5;

      state.trendChart = new Chart(canvas, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Page views (PV)",
              data: points.map((point) => Number(point.visits || 0)),
              borderColor: accent,
              backgroundColor: accent,
              pointBackgroundColor: accent,
              pointRadius,
              pointHoverRadius: 4,
              borderWidth: 2.5,
              order: 2,
              tension: 0.26
            },
            {
              label: "Unique visitors (UV)",
              data: points.map((point) => Number(point.visitors || 0)),
              borderColor: accentTwo,
              backgroundColor: accentTwo,
              pointBackgroundColor: accentTwo,
              pointRadius,
              pointHoverRadius: 4,
              borderWidth: 2.5,
              borderDash: [7, 5],
              order: 1,
              tension: 0.26
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 260 },
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              align: "end",
              labels: {
                color: ink,
                usePointStyle: true,
                pointStyle: "line",
                padding: 18,
                sort: (left, right) => left.datasetIndex - right.datasetIndex
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => context.dataset.label + ": " + number(context.parsed.y)
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: muted, autoSkip: true, maxRotation: 0, maxTicksLimit: 10 }
            },
            y: {
              beginAtZero: true,
              grid: { color: grid },
              ticks: { color: muted, precision: 0, callback: (value) => number(value) }
            }
          }
        }
      });
    }

    async function loadTrend(requestedInterval) {
      const interval = trendNames[requestedInterval] ? requestedInterval : "day";
      const requestId = ++state.trendRequest;
      state.trendInterval = interval;
      setTrendControls(interval, true);
      $("#trend-summary").textContent = "Loading visit activity grouped by " + trendNames[interval] + "...";
      try {
        const data = await api(withRange("/api/admin/trend?interval=" + encodeURIComponent(interval)));
        if (requestId === state.trendRequest) renderTrend(data);
      } catch (error) {
        if (requestId === state.trendRequest) {
          $("#trend-summary").textContent = error.message;
          setTrendControls(interval, false);
        }
      }
    }

    function pageItems(current, total) {
      const pages = new Set([1, total]);
      for (let page = Math.max(1, current - 2); page <= Math.min(total, current + 2); page += 1) pages.add(page);
      const sorted = Array.from(pages).filter((page) => page >= 1 && page <= total).sort((left, right) => left - right);
      const items = [];
      sorted.forEach((page, index) => {
        if (index && page - sorted[index - 1] > 1) items.push("ellipsis-" + index);
        items.push(page);
      });
      return items;
    }

    function renderPagination(data) {
      state.page = data.page;
      state.totalPages = data.totalPages;
      $("#previous-page").disabled = data.page <= 1;
      $("#next-page").disabled = data.page >= data.totalPages || data.total === 0;
      $("#page-summary").textContent = "Page " + number(data.page) + " of " + number(data.totalPages);
      $("#page-numbers").innerHTML = pageItems(data.page, data.totalPages).map((item) => {
        if (typeof item === "string") return '<span class="page-ellipsis" aria-hidden="true">&hellip;</span>';
        const current = item === data.page ? ' aria-current="page"' : "";
        return '<button type="button" class="secondary" data-page="' + item + '"' + current + ' aria-label="Page ' + item + '">' + item + '</button>';
      }).join("");
    }

    function browserName(userAgent) {
      const value = String(userAgent || "");
      if (/HeadlessChrome/i.test(value)) return "Headless Chrome";
      if (/EdgA|EdgiOS|Edg\\//i.test(value)) return "Microsoft Edge";
      if (/OPR\\//i.test(value)) return "Opera";
      if (/Firefox|FxiOS/i.test(value)) return "Firefox";
      if (/CriOS|Chrome/i.test(value)) return "Chrome";
      if (/Version\\/[\\d.]+.*Safari/i.test(value)) return "Safari";
      if (/bot|crawler|spider/i.test(value)) return "Bot";
      return "Other";
    }

    function operatingSystem(userAgent) {
      const value = String(userAgent || "");
      if (/Windows NT 10/i.test(value)) return "Windows";
      if (/Windows NT/i.test(value)) return "Windows";
      if (/Android/i.test(value)) return "Android";
      if (/iPhone|iPad|iPod/i.test(value)) return "iOS / iPadOS";
      if (/Mac OS X/i.test(value)) return "macOS";
      if (/CrOS/i.test(value)) return "ChromeOS";
      if (/Linux/i.test(value)) return "Linux";
      if (/bot|crawler|spider/i.test(value)) return "Automated";
      return "Other";
    }

    function deviceType(userAgent) {
      const value = String(userAgent || "");
      if (/bot|crawler|spider|Headless/i.test(value)) return "Automated";
      if (/iPad|Tablet/i.test(value)) return "Tablet";
      if (/Mobile|Android|iPhone|iPod/i.test(value)) return "Mobile";
      return "Desktop";
    }

    function renderVisits(data) {
      const start = data.total ? (data.page - 1) * data.pageSize + 1 : 0;
      const end = Math.min(data.total, data.page * data.pageSize);
      $("#visit-range").textContent = data.total
        ? "Showing " + number(start) + "-" + number(end) + " of " + number(data.total) + " visits in " + activeRangeLabel().toLowerCase() + "."
        : "No visits recorded yet.";
      $("#visits").innerHTML = data.visits.length
        ? data.visits.map((visit) => {
            const city = String(visit.country || "").toUpperCase() === "CN" ? mainlandCityLabel(visit.city) : visit.city;
            const location = [city, visit.region, countryLabel(visit.country)].filter(Boolean).join(", ");
            const network = [visit.as_organization, visit.asn ? "AS" + visit.asn : "", visit.colo].filter(Boolean).join(" / ");
            const coordinates = [visit.latitude, visit.longitude].filter((value) => value !== null && value !== undefined && value !== "").join(", ");
            const edgeLocation = [visit.edge_city, visit.edge_region, countryLabel(visit.edge_country)].filter(Boolean).join(", ");
            const edgeDiffers = visit.edge_country && (
              String(visit.edge_country).toUpperCase() !== String(visit.country || "").toUpperCase() ||
              visit.edge_region !== visit.region ||
              visit.edge_city !== visit.city
            );
            const sourceClass = Number(visit.mainland_signal) === 1 && String(visit.country || "").toUpperCase() !== "CN" ? " inferred" : "";
            const browser = browserName(visit.user_agent);
            const os = operatingSystem(visit.user_agent);
            const device = deviceType(visit.user_agent);
            const countryCode = String(visit.country || "XX").toUpperCase();
            const detailId = "visit-detail-" + Number(visit.id || 0);
            const newTag = Number(visit.is_new) === 1 ? '<span class="new-tag">New</span>' : "";
            const locationControl = coordinates
              ? '<button type="button" class="location-button" data-map-lat="' + escapeHtml(visit.latitude) + '" data-map-lng="' + escapeHtml(visit.longitude) + '" data-map-label="' + escapeHtml(location || "Visitor location") + '">' + escapeHtml(location || "Unknown location") + '</button>'
              : '<strong>' + escapeHtml(location || "Unknown location") + '</strong>';
            const edgeRoute = edgeDiffers
              ? (edgeLocation || visit.edge_country || "Unknown edge") + (visit.edge_ip ? " / " + visit.edge_ip : "")
              : "Same as resolved location";
            const client = [visit.language, visit.screen, visit.client_timezone].filter(Boolean).join(" / ");
            const networkDetail = [network, visit.client_isp ? "Client ISP: " + visit.client_isp : ""].filter(Boolean).join(" / ");
            return '<tr class="visit-main">' +
              '<td><div class="visit-identity"><span class="country-code">' + escapeHtml(countryCode) + '</span><div class="visit-label">' +
                locationControl + '<span>' + newTag + number(visit.daily_pageviews || 1) + (Number(visit.daily_pageviews || 1) === 1 ? ' page view' : ' page views') + '</span></div></div></td>' +
              '<td class="ua-cell"><strong>' + escapeHtml(browser) + '</strong><span>' + escapeHtml(device) + '</span></td>' +
              '<td class="ua-cell"><strong>' + escapeHtml(os) + '</strong><span>' + escapeHtml(visit.client_timezone || visit.timezone || "") + '</span></td>' +
              '<td><code>' + escapeHtml(visit.ip || "-") + '</code></td>' +
              '<td class="time-cell"><strong>' + escapeHtml(relativeTime(visit.visited_at)) + '</strong><span>' + escapeHtml(formatDate(visit.visited_at, { short: true, time: true })) + '</span></td>' +
              '<td><button type="button" class="expand-button" data-detail="' + detailId + '" aria-expanded="false" title="Show visit details">+</button></td>' +
            '</tr>' +
            '<tr id="' + detailId + '" class="visit-detail hidden"><td colspan="6"><div class="detail-grid">' +
              '<div class="detail-item"><span>Page</span><code>' + escapeHtml(visit.path || "-") + '</code></div>' +
              '<div class="detail-item"><span>Page title</span><strong>' + escapeHtml(visit.title || "-") + '</strong></div>' +
              '<div class="detail-item"><span>Referrer</span><code>' + escapeHtml(visit.referrer || "Direct / unavailable") + '</code></div>' +
              '<div class="detail-item"><span>Browser and OS</span><strong>' + escapeHtml(browser + " / " + os + " / " + device) + '</strong></div>' +
              '<div class="detail-item"><span>IP address</span><code>' + escapeHtml(visit.ip || "-") + '</code></div>' +
              '<div class="detail-item"><span>Network</span><strong>' + escapeHtml(networkDetail || "-") + '</strong></div>' +
              '<div class="detail-item"><span>Coordinates</span><code>' + escapeHtml(coordinates || "-") + '</code></div>' +
              '<div class="detail-item"><span>Location source</span><strong class="source-tag' + sourceClass + '">' + escapeHtml(locationSourceLabel(visit)) + '</strong></div>' +
              '<div class="detail-item"><span>Edge route</span><strong>' + escapeHtml(edgeRoute) + '</strong></div>' +
              '<div class="detail-item"><span>Client</span><strong>' + escapeHtml(client || "-") + '</strong></div>' +
              '<div class="detail-item"><span>User agent</span><code>' + escapeHtml(visit.user_agent || "-") + '</code></div>' +
            '</div></td></tr>';
          }).join("")
        : '<tr><td colspan="6" class="muted">No visits recorded yet.</td></tr>';
      renderPagination(data);
    }

    async function loadVisits(page) {
      const data = await api(withRange("/api/admin/visits?page=" + encodeURIComponent(page)));
      renderVisits(data);
    }

    async function refresh() {
      if (state.refreshing) {
        state.pendingRefresh = true;
        return;
      }
      state.refreshing = true;
      state.pendingRefresh = false;
      $("#refresh-button").disabled = true;
      const trendInterval = state.trendInterval;
      const trendRequest = ++state.trendRequest;
      setTrendControls(trendInterval, true);
      try {
        const results = await Promise.all([
          api(withRange("/api/admin/summary")),
          api(withRange("/api/admin/visits?page=" + encodeURIComponent(state.page))),
          api(withRange("/api/admin/trend?interval=" + encodeURIComponent(trendInterval)))
        ]);
        renderSummary(results[0]);
        renderVisits(results[1]);
        if (trendRequest === state.trendRequest) renderTrend(results[2]);
      } finally {
        const rerun = state.pendingRefresh;
        state.refreshing = false;
        state.pendingRefresh = false;
        $("#refresh-button").disabled = false;
        if (trendRequest === state.trendRequest) setTrendControls(state.trendInterval, false);
        if (rerun) refresh().catch((error) => { $("#visit-range").textContent = error.message; });
      }
    }

    $("#login-button").addEventListener("click", async () => {
      $("#login-error").textContent = "";
      try {
        await api("/api/admin/login", {
          method: "POST",
          body: JSON.stringify({ password: $("#password").value })
        });
        state.page = 1;
        setLoggedIn(true);
        await refresh();
      } catch (error) {
        $("#login-error").textContent = error.message;
      }
    });

    $("#password").addEventListener("keydown", (event) => {
      if (event.key === "Enter") $("#login-button").click();
    });

    $("#previous-page").addEventListener("click", () => loadVisits(Math.max(1, state.page - 1)));
    $("#next-page").addEventListener("click", () => loadVisits(Math.min(state.totalPages, state.page + 1)));
    $("#page-numbers").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-page]");
      if (button) loadVisits(Number(button.dataset.page));
    });
    $("#visits").addEventListener("click", (event) => {
      const detailButton = event.target.closest("button[data-detail]");
      if (detailButton) {
        const detail = document.getElementById(detailButton.dataset.detail);
        if (!detail) return;
        const expanded = detailButton.getAttribute("aria-expanded") === "true";
        detailButton.setAttribute("aria-expanded", String(!expanded));
        detailButton.textContent = expanded ? "+" : "-";
        detailButton.title = expanded ? "Show visit details" : "Hide visit details";
        detail.classList.toggle("hidden", expanded);
        return;
      }
      const mapButton = event.target.closest("button[data-map-lat]");
      if (mapButton) focusMap(mapButton.dataset.mapLat, mapButton.dataset.mapLng, mapButton.dataset.mapLabel);
    });
    $("#geography").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-country]");
      if (!button) return;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      document.querySelectorAll("#geography tr[data-parent]").forEach((row) => {
        if (row.dataset.parent === button.dataset.country) row.classList.toggle("hidden", expanded);
      });
    });
    $("#range-presets").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-range]");
      if (button) selectRange(rangeForPreset(button.dataset.range)).catch((error) => {
        $("#range-error").textContent = error.message;
        $("#range-error").classList.remove("hidden");
      });
    });
    $("#apply-range").addEventListener("click", () => {
      const from = $("#from-date").value;
      const to = $("#to-date").value;
      if (from && to && from > to) {
        $("#range-error").textContent = "The start date must not be after the end date.";
        $("#range-error").classList.remove("hidden");
        return;
      }
      const range = from || to ? { from, to, preset: "custom" } : rangeForPreset("all");
      selectRange(range).catch((error) => {
        $("#range-error").textContent = error.message;
        $("#range-error").classList.remove("hidden");
      });
    });
    $("#trend-controls").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-interval]");
      if (button && button.dataset.interval !== state.trendInterval) loadTrend(button.dataset.interval);
    });
    $("#theme-button").addEventListener("click", () => {
      applyTheme(state.theme === "dark" ? "light" : "dark");
    });
    $("#refresh-button").addEventListener("click", () => refresh().catch((error) => {
      $("#visit-range").textContent = error.message;
    }));
    $("#logout-button").addEventListener("click", async () => {
      await api("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => {});
      setLoggedIn(false);
    });

    updateThemeControl();
    syncRangeControls();
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
