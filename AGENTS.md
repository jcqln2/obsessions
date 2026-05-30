# AGENTS.md — Internal engineering contract

This file governs **Cursor agents and automated PR bots** working on Obsessions. External AI bots should read [`public/llm.txt`](public/llm.txt) and [`/skills`](src/app/skills/page.tsx).

## Project

- **App:** Next.js 15 + Supabase + Vercel — visual timeline / collage archive
- **Production:** `https://obsessions-snowy.vercel.app`
- **Access model:** Waitlist-only (invite-only beta). Public sign-up is disabled.

## Agent roles

| Role | Responsibility |
|------|----------------|
| **Implementer** | Feature/fix branches, tests, PRs |
| **CI gate** | GitHub Actions — lint, test, build |
| **Deploy** | Vercel auto-deploy on merge to `main` |
| **Human on-call** | Supabase SQL, secrets, schema approval, incidents |

## Non-negotiable invariants

1. **Waitlist-only** — Do not re-enable public sign-up in UI, API, or docs. Login page has **Sign in** + **Waitlist** tabs only.
2. **RLS** — Row Level Security must stay enabled on `entries`, `images`, `waitlist`. Never weaken policies.
3. **Auth** — All `/api/entries*` routes must verify `supabase.auth.getUser()`. Middleware protects app routes except public paths listed below.
4. **Secrets** — Never commit `.env`, service role keys, or API secrets. Never log keys.
5. **Quality gate** — Before opening a PR, run: `npm run lint && npm run test:run && npm run build`
6. **ESLint** — Fix `react/no-unescaped-entities` (use template strings or entities in JSX text).
7. **Fonts** — Do not change `public/fonts/` or Cute Notes usage without an explicit issue (licensing).

## Public routes (no auth)

- `/login`, `/auth/*`, `/skills`, `/llm.txt`, `/.well-known/*`, `/api/waitlist`, `/setup`

## Auto-merge allowed

Agents may auto-merge (via GitHub Actions) when **all** are true:

- PR labeled `agent-pr` OR branch name starts with `cursor/`
- CI checks pass (lint, test, build, secret scan)
- PR does **not** have labels: `blocked`, `migration`, `human-required`
- PR does **not** touch **forbidden paths** (see below)

## Forbidden paths (never auto-merge)

Requires label `human-approved` and human merge:

| Path | Reason |
|------|--------|
| `supabase/migrations/**` | SQL applied manually in Supabase dashboard |
| `supabase/storage-policies.sql` | RLS / storage |
| `.env.example` (new keys) | Secret surface |
| `src/lib/supabase/middleware.ts` | Auth boundary |
| `src/middleware.ts` | Auth boundary |
| `src/app/auth/**` | Auth flow |
| `public/fonts/**` | License |

## Branch naming

- Agent work: `cursor/issue-<number>-<short-description>`
- Dependabot: auto branches

## PR requirements

Use [`.github/pull_request_template.md`](.github/pull_request_template.md). Include:

- Summary (why)
- Test plan checklist
- Note if UI changed (screenshot helpful)

## Commands

```bash
npm install
npm run dev          # local dev
npm run lint
npm run test:run
npm run build
```

## Deploy flow

1. Merge to `main` → Vercel production deploy (automatic)
2. GitHub Actions `deploy-verify` smoke-tests production URLs
3. On failure: see [`docs/runbooks/incident.md`](docs/runbooks/incident.md)

## Database / Supabase

- **Never** run migrations against production from CI or agents
- Add new SQL files under `supabase/migrations/` in PRs; human runs them in SQL Editor
- Storage bucket: `entry-images` (private)

## Rollback

- **Code:** Revert commit on `main` or Vercel → Deployments → Promote previous
- **Cache:** Delete `.next` locally; on Vercel, redeploy
- **DB:** Forward-only manual fixes; no agent-driven rollback

## External AI manifest

Keep in sync when changing access policy:

- [`public/llm.txt`](public/llm.txt)
- [`public/.well-known/ai-plugin.json`](public/.well-known/ai-plugin.json)
- [`src/app/skills/page.tsx`](src/app/skills/page.tsx)
