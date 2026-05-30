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


## Project structure

```
src/
  app/           # Pages & API routes
  components/    # Timeline, collage, create entry UI
  lib/           # Collage algorithm, Supabase, uploads
  store/         # Zoom/scroll state (Zustand)
supabase/        # SQL migrations & storage policies
```
