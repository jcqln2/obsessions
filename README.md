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

Open [http://localhost:3000](http://localhost:3000), sign up, and create your first entry


## Project structure

```
src/
  app/           # Pages & API routes
  components/    # Timeline, collage, create entry UI
  lib/           # Collage algorithm, Supabase, uploads
  store/         # Zoom/scroll state (Zustand)
supabase/        # SQL migrations & storage policies
```
