# Cloudflare Worker + D1 Private Visitor Analytics

This Worker stores private visit records for `https://xukun12138.github.io/` and exposes:

- `POST /api/visit` public visit tracking endpoint.
- `GET /api/stats` public aggregate PV/UV endpoint.
- `GET /api/me` public current visitor IP location endpoint.
- `GET /admin` password-protected admin dashboard.

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
  workerUrl: "https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev"
}
```

Then build and push the GitHub Pages site again.

## Admin

Open:

```text
https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev/admin
```

Login with `ADMIN_PASSWORD`.
