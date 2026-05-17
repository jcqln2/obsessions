# Obsessions

A personal aesthetic archive — upload screenshot collections, auto-generate imperfect collages, and scroll through your taste over time.

## Stack

- **Next.js 15** (App Router)
- **Supabase** (Postgres, Auth, Storage)
- **Tailwind CSS** + **Framer Motion**
- Deploy on **Vercel**

## Quick start

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/migrations/001_schema.sql`.
3. In **Storage**, create a bucket named `entry-images` (private).
4. Run `supabase/storage-policies.sql` in the SQL Editor.
5. Under **Authentication → Providers**, enable Email.
6. Copy **Project URL** and **anon key** from Settings → API.

### 2. Local env

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and create your first entry.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In Supabase → Authentication → URL Configuration, add your Vercel URL to **Site URL** and **Redirect URLs** (`https://your-app.vercel.app/**`).

## MVP features

- Upload 1–8 images per entry with drag & drop
- Auto collage layout (rotation, overlap, varied scale)
- Vertical timeline (newest at top)
- Zoom (+/- or pinch), scroll, Space+drag pan
- Timeline scrubber with year/month jumps
- Keyboard: arrows, Page Up/Down, Home/End, R to reset zoom

## Project structure

```
src/
  app/           # Pages & API routes
  components/    # Timeline, collage, create entry UI
  lib/           # Collage algorithm, Supabase, uploads
  store/         # Zoom/scroll state (Zustand)
supabase/        # SQL migrations & storage policies
```
