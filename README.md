# WTC Stoomtrein — Routes App

A cycling route manager for WTC Stoomtrein. Upload GPX files, view them on interactive maps, share routes with your group, and leave reviews.

## Tech Stack

- **Vue 3** + TypeScript + Vite
- **Supabase** — database, file storage, authentication
- **Leaflet** — interactive maps
- **Tailwind CSS** + shadcn-vue utilities
- **Netlify** — hosting

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Netlify](https://netlify.com) account (for deployment)

---

## 1. Clone the repo

```bash
git clone https://github.com/KS-Mediacomm/stoomtrein-routes.git
cd stoomtrein-routes/cycling-routes
```

## 2. Install dependencies

```bash
npm install
```

## 3. Set up Supabase

### Create a project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Note your **Project URL** and **anon public key** (Settings → API)

### Run the database migration
1. In your Supabase dashboard go to **SQL Editor**
2. Paste and run the contents of `supabase/migrations/001_initial.sql`

### Create the storage bucket
1. Go to **Storage** → **New bucket**
2. Name: `gpx-files`
3. Toggle **Public bucket** on
4. Add storage policies:
   - **Allow public downloads:** Policy for SELECT, condition: `bucket_id = 'gpx-files'`
   - **Allow authenticated uploads:** Policy for INSERT, condition: `bucket_id = 'gpx-files' AND auth.role() = 'authenticated'`

## 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Run locally

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Deployment (Netlify)

### Option A — Netlify dashboard
1. Push your repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Select your repo
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Trigger a deploy

### Option B — Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_SUPABASE_URL https://your-project-id.supabase.co
netlify env:set VITE_SUPABASE_ANON_KEY your-anon-key
netlify deploy --prod
```

---

## Project Structure

```
cycling-routes/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AppNav.vue
│   │   ├── AllRoutesMap.vue
│   │   ├── ElevationChart.vue
│   │   ├── GPXUploader.vue
│   │   ├── ReviewForm.vue
│   │   ├── ReviewList.vue
│   │   ├── RouteCard.vue
│   │   ├── RouteMap.vue
│   │   ├── ShareButton.vue
│   │   └── StarRating.vue
│   ├── views/             # Page-level views
│   │   ├── AuthView.vue       # Magic link sign in
│   │   ├── HomeView.vue       # Landing page
│   │   ├── MapView.vue        # All routes on one map
│   │   ├── RouteDetailView.vue
│   │   ├── RoutesView.vue     # Route list with filters
│   │   ├── ShareView.vue      # Public shareable route page
│   │   └── UploadView.vue
│   ├── stores/            # Pinia state
│   ├── lib/               # Supabase client, GPX parser, utils
│   ├── router/            # Vue Router config
│   └── types/             # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial.sql    # DB schema + RLS policies
├── .env.example
└── netlify.toml
```

---

## Features

| Feature | Details |
|---|---|
| Upload GPX | Drag-and-drop `.gpx` files, auto-extracts distance & elevation |
| Route map | Each route rendered on an interactive Leaflet map |
| All routes map | All public GPX tracks on a single map, color-coded |
| Elevation profile | Chart showing elevation gain across the route |
| Download GPX | One-click download of any route's GPX file |
| Shareable links | `/share/:token` — no login required to view |
| Reviews | Star rating + comment, requires sign in |
| Authentication | Passwordless magic link via email (Supabase Auth) |

---

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build (type-check + bundle)
npm run preview   # Preview production build locally
```
