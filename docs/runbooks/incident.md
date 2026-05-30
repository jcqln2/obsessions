# Incident runbook

## Severity

| Level | Example | Action |
|-------|---------|--------|
| P1 | Site down, auth broken | Rollback immediately |
| P2 | Feature broken, site up | Fix-forward PR or rollback |
| P3 | CI flake, non-user-facing | Fix workflow |

## P1 — Site down or 500 on `/`

1. Check [Vercel Deployments](https://vercel.com) — last deploy status
2. **Rollback:** Promote previous successful deployment
3. If rollback insufficient, revert last commit on `main`:
   ```bash
   git revert HEAD && git push origin main
   ```
4. Open GitHub Issue with label `incident`

## Build / module errors (`Cannot find module './543.js'`)

Stale Next.js cache:

```bash
rm -rf .next node_modules && npm install && npm run build
```

On Vercel: Redeploy with "Clear cache" or push empty commit after fix.

## Auth / waitlist broken

1. Supabase dashboard → Authentication → Providers — confirm sign-up **disabled**
2. Verify env vars on Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Check [`src/lib/supabase/middleware.ts`](../../src/lib/supabase/middleware.ts) public routes
4. Test `/login` waitlist tab → `POST /api/waitlist`

## Database / RLS errors

1. Confirm migrations applied: `001_schema.sql`, `002_api_grants.sql`, `004_waitlist.sql`
2. Storage: bucket `entry-images` + policies from `storage-policies.sql`
3. **Do not** let agents run SQL in production — human applies fixes

## CI failing

1. GitHub → Actions → failed workflow log
2. Reproduce locally: `npm run lint && npm run test:run && npm run build`
3. Secret scan failure: remove leaked credentials from PR history

## Observability (cheap tier)

- **Alerts:** GitHub email on workflow failure (watch repo → Actions)
- **Logs:** Vercel → Project → Logs
- **Optional (medium tier):** Sentry — see [docs/observability.md](../observability.md)

## Contacts

- Repo: https://github.com/jcqln2/obsessions
- Production: https://obsessions-snowy.vercel.app
