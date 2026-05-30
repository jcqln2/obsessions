# Security hardening (GA)

Environment variables for production. Local dev and CI work without optional keys (rate limit and captcha are no-ops when unset).

## Cloudflare Turnstile (waitlist CAPTCHA)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile → Add site
2. Hostnames: `obsessions-snowy.vercel.app`, `localhost` (for local testing)
3. Add to **Vercel** (Production + Preview) and local `.env.local`:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key
```

When `TURNSTILE_SECRET_KEY` is set, `/api/waitlist` requires a valid captcha token.

## Upstash Redis (rate limiting)

1. [Upstash Console](https://console.upstash.com/) → Create Redis database
2. Add to **Vercel** and GitHub Actions (if desired):

```
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

Free tier: 500K commands/month — sufficient for beta.

### Rate limits (when Upstash is configured)

| Route | Limit |
|-------|-------|
| `POST /api/waitlist` | 5 / hour / IP |
| `GET /api/entries` | 120 / minute / user |
| `POST /api/entries` | 30 / hour / user, 50 entries / day |
| `PATCH` / `DELETE /api/entries/[id]` | 60 / hour / user |

## Other controls (no extra env)

- **Storage path validation** — image `storagePath` must be `{userId}/...`
- **Auth callback** — blocks open redirects via `next` param
- **Upload limits** — 10MB max, JPEG/PNG/WebP/GIF only
- **Security headers** — CSP, HSTS, X-Frame-Options, etc. in `next.config.ts`

## Verify

- Waitlist: submit with Turnstile visible; bot traffic gets 429 after limit
- Entries: cannot reference another user's storage path (400)
- Auth: `?next=https://evil.com` redirects to `/` only
