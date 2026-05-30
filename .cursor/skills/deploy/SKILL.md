---
name: deploy
description: Build, test, open PR, and rollback Obsessions on Vercel. Use when shipping agent changes, fixing CI, or recovering from a bad deploy.
---

# Deploy skill — Obsessions

## Pre-flight

1. Read [AGENTS.md](../../../AGENTS.md)
2. Confirm branch is not touching forbidden paths without `human-approved`

## Local verification

```bash
npm run lint
npm run test:run
npm run build
```

If build fails with missing chunk / `543.js` module error:

```bash
rm -rf .next && npm run build
```

## Open PR

1. Branch: `cursor/issue-<number>-<short-name>`
2. Label: `agent-pr`
3. Fill [pull_request_template.md](../../../.github/pull_request_template.md)
4. Push and let CI run

## Auto-merge

Eligible when CI green, label `agent-pr`, no `blocked` / `migration` / `human-required`, no forbidden path changes.

## Post-merge

- Vercel deploys `main` automatically
- Watch GitHub Actions **Deploy Verify** workflow
- Smoke URLs:
  - `https://obsessions-snowy.vercel.app/llm.txt`
  - `https://obsessions-snowy.vercel.app/login`
  - `https://obsessions-snowy.vercel.app/skills`

## Rollback

1. **Fast:** Vercel dashboard → Deployments → previous → Promote to Production
2. **Git:** Revert merge commit on `main`, push
3. **Incidents:** [docs/runbooks/incident.md](../../../docs/runbooks/incident.md)

## Supabase (human only)

Never run migrations from CI. Human runs SQL from `supabase/migrations/` in Supabase SQL Editor.
