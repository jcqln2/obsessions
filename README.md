# Obsessions

A personal obsession collage, time-capsule archive. upload photos of what you're into, have imperfect collages made, and scroll through your obsessions over time.

## Stack

- **Next.js 15** (App Router)
- **Supabase** (Postgres, Auth, Storage)
- **Tailwind CSS** + **Framer Motion**
- Deploy on **Vercel**

## start


### 1. Local env

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

### Waitlist (closed beta)

1. Run `supabase/migrations/004_waitlist.sql` in the Supabase SQL Editor.
2. In **Authentication → Providers → Email**, turn **off** “Allow new users to sign up” so only invited accounts can register.
3. View waitlist emails in **Table Editor → waitlist**. Invite users via **Authentication → Users → Invite user**, then set `status` to `invited`.

Public visitors use **Waitlist** on `/login`; existing users use **Sign in**.

### AI & bot discovery

After deploy, verify these public URLs (no auth):

- `https://obsessions-snowy.vercel.app/llm.txt`
- `https://obsessions-snowy.vercel.app/.well-known/ai-plugin.json`
- `https://obsessions-snowy.vercel.app/skills`

Set `NEXT_PUBLIC_SITE_URL` in Vercel env for correct canonical links.

## Agentic engineering

This repo is set up for **Cursor agents + GitHub Actions** (hybrid, full-auto deploy on green CI).

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](AGENTS.md) | Internal agent contract, invariants, forbidden paths |
| [docs/github-setup.md](docs/github-setup.md) | Branch protection & auto-merge (one-time) |
| [docs/runbooks/incident.md](docs/runbooks/incident.md) | Rollback & incidents |
| [docs/observability.md](docs/observability.md) | Cheap vs medium monitoring |
| [docs/security.md](docs/security.md) | Turnstile, Upstash, GA hardening |
| [docs/k6.md](docs/k6.md) | k6 waitlist smoke & rate-limit tests |
**Agentic CI enabled**

**CI:** lint → test → build → secret scan on every PR and `main`.

**Auto-merge:** PRs labeled `agent-pr` or branch `cursor/*` squash-merge when CI passes (see [auto-merge.yml](.github/workflows/auto-merge.yml)).

**Deploy verify:** Smoke tests `/llm.txt`, `/login`, `/skills`, waitlist API after each `main` deploy.

**k6-rate-limit-test:** Manual workflow — login/Turnstile smoke + 10-concurrent rate-limit test ([docs/k6.md](docs/k6.md)).

**Budget:** ~$0–25/mo (Vercel/Supabase free + Cursor Pro). Medium tier ~$60–130/mo — see [docs/observability.md](docs/observability.md).

## Project structure

```
src/
  app/           # Pages & API routes
  components/    # Timeline, collage, create entry UI
  lib/           # Collage algorithm, Supabase, uploads
  store/         # Zoom/scroll state (Zustand)
supabase/        # SQL migrations & storage policies
.github/         # CI, auto-merge, Dependabot, hygiene
.cursor/         # Cursor rules & deploy skill
docs/            # Runbooks & GitHub setup
```
