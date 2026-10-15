# Cloudflare Worker + D1 Private Visitor Analytics

This Worker stores private visit records for `https://xukun12138.github.io/` and exposes:

- `POST /api/visit` public visit tracking endpoint.
- `GET /api/stats` public aggregate PV/UV endpoint.
- `GET /api/me` public current visitor IP location endpoint.
- `GET /admin` password-protected admin dashboard.
- `GET /api/admin/trend?interval=day|week|month|year` authenticated all-time PV/UV trend endpoint.
- `GET /api/admin/visits?page=N` authenticated visit history endpoint with 10 records per page.
- Province-level China mainland reporting when the optional browser lookup returns a verified mainland result.
- Separate storage of the resolved visitor location and Cloudflare edge/egress location.

The GitHub Pages site keeps the current public counter as a fallback until `SITE_DATA.analytics.workerUrl` is configured.

## Local setup

```powershell
cd C:\Users\Kun\Desktop\xukun12138.github.io\analytics-worker
npm install
Copy-Item .dev.vars.example .dev.vars
```

Edit `.dev.vars` and set:

```text
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=your-long-random-secret
```

## Cloudflare setup

Login:

```powershell
npx wrangler login
```

Create the D1 database:

```powershell
npx wrangler d1 create xukun-homepage-analytics
```

Copy the returned `database_id` into `wrangler.toml`.

Set production secrets:

```powershell
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

Apply the schema to the remote D1 database:

```powershell
npm run d1:migrate:remote
```

Deploy the Worker:

```powershell
npm run deploy
```

After deployment, copy the Worker URL and put it in `assets/js/data.js`:

```js
analytics: {
  workerUrl: "https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev",
  mainlandProbeUrl: "https://myip.ipip.net/json"
}
```

Then build and push the GitHub Pages site again.

## Admin

Open:

```text
https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev/admin
```

Login with `ADMIN_PASSWORD`.

The dashboard includes:

- An all-time visitor map built from every country or region stored in D1.
- A China Mainland Coverage panel with province/region totals and likely proxy exits.
- One all-time PV/UV line chart with Day, Week, Month, and Year interval controls.
- Full country or region names with their ISO codes.
- All visit records in reverse chronological order, paginated at 10 records per page.
- Top Countries/Regions and Top Pages summaries.
- Automatic data refresh every 60 seconds, plus a manual refresh button.

Migration `0002_add_mainland_location.sql` must be applied before deploying this Worker version. It preserves the original Cloudflare-observed IP/location in `edge_*` columns and marks historical non-CN visits with an `Asia/Shanghai` client timezone as likely mainland proxy traffic. It does not invent a province for historical records.

The browser lookup is best effort and has a short timeout. If it fails, tracking continues with Cloudflare's edge-observed location. Set `mainlandProbeUrl` to an empty string to disable the lookup.

See `docs/china-mainland-analytics.md` for accuracy limits and the recommended custom-domain deployment path.
