# Observability

Obsessions uses the **cheap tier** by default. Upgrade when traffic or complexity grows.

## Cheap tier (default)

| Signal | Source |
|--------|--------|
| CI failures | GitHub Actions email (watch repo) |
| Deploy failures | `deploy-verify` workflow → auto-opens `incident` issue |
| Runtime errors | Vercel → Project → Logs |
| Uptime | Manual or weekly hygiene issue |

### Enable GitHub notifications

1. GitHub repo → **Watch** → Custom → ✅ Actions
2. Settings → Notifications → Actions → email on failed workflows

## Medium tier (optional)

### Sentry (errors)

1. Create project at [sentry.io](https://sentry.io) → Next.js
2. Install: `npx @sentry/wizard@latest -i nextjs`
3. Add `SENTRY_DSN` to Vercel env (do not commit DSN to public repos if concerned — use Vercel only)
4. Update `AGENTS.md` if agents must not touch `sentry.*.config`

Free tier: 5k errors/month — sufficient for beta.

### Uptime (external)

- [Better Stack](https://betterstack.com) or [UptimeRobot](https://uptimerobot.com) free tier
- Monitor:
  - `GET https://obsessions-snowy.vercel.app/login` → 200
  - `GET https://obsessions-snowy.vercel.app/llm.txt` → 200

### Staging

- Second Supabase project (free tier) + Vercel Preview env vars
- Run `deploy-verify` with `workflow_dispatch` against preview URL before promoting

## Incident response

See [runbooks/incident.md](./runbooks/incident.md).
