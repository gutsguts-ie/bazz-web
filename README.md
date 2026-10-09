# Landing (Next.js)

White-label immigration consultancy site. One theme per build, chosen by `NEXT_PUBLIC_SITE_THEME`.

## Develop

```bash
cp .env.example .env   # then fill in values
npm install
npm run dev
```

## Environment

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `API_BASE_URL` | server only | Backend base URL. Never sent to the browser. |
| `NEXT_PUBLIC_SITE_THEME` | public, build time | `averra`, `alpha-bridge`, `global-residency`, `horizon`, `lion-city`, `one-axis`, `pr-bridge`, `prime-residency`, `a1-consultancy` |
| `NEXT_PUBLIC_LIVECHAT_LICENSE` | public, build time | LiveChat licence ID; leave blank to disable. |

## API proxy

The browser only calls same-origin `/api/*` and `/storage/*`. The route handlers in
`src/app/api/[...path]` and `src/app/storage/[...path]` forward those requests to
`API_BASE_URL` (see `src/lib/proxy.js`). On Netlify they run as serverless functions.

The proxy forwards the visitor's IP as `X-Forwarded-For` / `X-Real-IP`; the backend must
trust the proxy for per-user rate limiting to keep working.

## Deploy

One site per theme on either host; set the variables above in each site's settings.

- **Netlify:** builds from `netlify.toml`.
- **AWS Amplify Hosting:** builds from `amplify.yml`. Amplify only exposes env vars at
  build time, so the build writes `API_BASE_URL` into `.env.production` for the server
  runtime. Amplify supports Next.js up to 15, which is why `next` is pinned to 15.5.x.
  Amplify doesn't support response streaming, so proxied responses are buffered.
