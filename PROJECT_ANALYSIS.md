# Cycling Routes App — Project Analysis

## Overview

A web application for a cycling group to upload, manage, share, and review GPX routes on an interactive map.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | **Vue 3** (Composition API + TypeScript) | Reactive, lightweight, excellent ecosystem |
| Build tool | **Vite** | Fast HMR, native ESM, great Vue integration |
| UI components | **shadcn-vue** | Headless, accessible, fully customizable |
| State management | **Pinia** | Official Vue store, simple and typed |
| Routing | **Vue Router 4** | Standard Vue SPA routing |
| Maps | **Leaflet + vue-leaflet** | Open-source, no API key needed, great GPX rendering |
| GPX parsing | **@tmcw/togeojson** | Converts GPX → GeoJSON for Leaflet |
| Backend / DB | **Supabase** | Postgres DB + file storage + auth + realtime |
| Hosting | **Netlify** | Best Vue SPA support, `_redirects` for SPA fallback, free tier, easy CI/CD from GitHub |

### Why Netlify over Vercel

- Netlify's free tier includes form handling, identity, and generous bandwidth
- `netlify.toml` makes SPA redirect config (`/* → /index.html`) trivial
- Vercel is more Next.js/SSR oriented; Netlify is the go-to for static Vue SPAs
- Both are excellent but Netlify has a simpler DX for this use case

---

## Supabase Architecture

### Tables

#### `routes`
```
id              uuid        PK, default gen_random_uuid()
created_at      timestamptz default now()
user_id         uuid        FK → auth.users (nullable for anonymous upload)
name            text        NOT NULL
description     text
distance_km     numeric
elevation_gain  int
difficulty      text        CHECK (easy | moderate | hard | expert)
gpx_path        text        path in storage bucket
share_token     text        UNIQUE, used for shareable links
is_public       bool        default true
```

#### `reviews`
```
id          uuid        PK
route_id    uuid        FK → routes
user_id     uuid        FK → auth.users (nullable)
rating      int         CHECK (1..5)
comment     text
created_at  timestamptz default now()
```

### Storage

- Bucket: `gpx-files` (public read, authenticated write)
- Path pattern: `{user_id}/{route_id}.gpx`

### Row Level Security

- `routes`: public rows readable by all; insert/update restricted to owner
- `reviews`: readable by all; insert/update restricted to author
- `gpx-files` bucket: public download; upload requires auth

---

## Application Features

### 1. GPX Upload
- Drag-and-drop or file picker for `.gpx` files
- Client-side GPX parsing to extract distance, elevation gain
- Upload to Supabase Storage
- Save route metadata to `routes` table
- Auto-generate `share_token` (nanoid)

### 2. Route List
- Paginated card grid of all public routes
- Filter by difficulty, distance range
- Sort by date, rating, distance

### 3. Route Detail
- Interactive Leaflet map rendering the GPX track
- Elevation profile chart (Chart.js)
- Route metadata (distance, elevation, difficulty)
- Reviews section with star rating and comments
- Share button → copy shareable link to clipboard

### 4. Shareable Links
- URL format: `/share/{share_token}`
- No login required to view a shared route
- Copy-to-clipboard button with toast feedback

### 5. GPX Download
- Download button on route detail page
- Fetches file directly from Supabase Storage public URL

### 6. All Routes Map
- Single Leaflet map showing all public GPX tracks
- Each track colored differently
- Click a track → shows route name popup, link to detail

### 7. Authentication (optional / progressive)
- Supabase Auth (email/magic link)
- Auth required only to upload or review
- Viewing and sharing are fully public

---

## Project Structure

```
cycling-routes/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                    # shadcn-vue components
│   │   ├── AppNav.vue
│   │   ├── RouteCard.vue
│   │   ├── RouteMap.vue           # Single GPX map
│   │   ├── AllRoutesMap.vue       # All GPX on one map
│   │   ├── GPXUploader.vue
│   │   ├── ElevationChart.vue
│   │   ├── ReviewForm.vue
│   │   ├── ReviewList.vue
│   │   └── ShareButton.vue
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── RoutesView.vue         # Route list
│   │   ├── RouteDetailView.vue
│   │   ├── UploadView.vue
│   │   ├── MapView.vue            # All routes map
│   │   ├── ShareView.vue          # Public share page
│   │   └── AuthView.vue
│   ├── stores/
│   │   ├── routes.ts
│   │   ├── reviews.ts
│   │   └── auth.ts
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── gpx.ts                 # GPX parse helpers
│   │   └── utils.ts
│   ├── router/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── .env.example
├── netlify.toml
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Routes

| Path | View | Auth |
|---|---|---|
| `/` | HomeView | public |
| `/routes` | RoutesView | public |
| `/routes/:id` | RouteDetailView | public |
| `/upload` | UploadView | required |
| `/map` | MapView | public |
| `/share/:token` | ShareView | public |
| `/auth` | AuthView | public |

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Deployment (Netlify)

1. Push repo to GitHub
2. Connect repo in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set env vars in Netlify UI
6. `netlify.toml` handles SPA redirect

---

## Key Dependencies

```json
{
  "vue": "^3.4",
  "vue-router": "^4.3",
  "pinia": "^2.1",
  "@supabase/supabase-js": "^2.44",
  "leaflet": "^1.9",
  "@vue-leaflet/vue-leaflet": "^0.10",
  "@tmcw/togeojson": "^5.8",
  "chart.js": "^4.4",
  "vue-chartjs": "^5.3",
  "nanoid": "^5.0",
  "tailwindcss": "^3.4",
  "class-variance-authority": "^0.7",
  "clsx": "^2.1",
  "lucide-vue-next": "^0.400"
}
```

---

## Development Milestones

1. **Foundation** — Vite scaffold, Tailwind, shadcn-vue, router, Pinia, Supabase client
2. **DB + Storage** — Run migrations, configure RLS policies, test storage bucket
3. **Upload flow** — GPX uploader component + route create store action
4. **Map display** — Single route map + all-routes map
5. **Reviews** — Review form + list + star rating
6. **Sharing** — Share token generation + public share view
7. **Auth** — Magic link login, guard upload route
8. **Polish** — Elevation chart, filters, loading states, error handling
9. **Deploy** — Netlify CI/CD, env vars, domain

---

## Notes

- GPX files are parsed **client-side** — no server needed for processing
- All Supabase interactions go through the anon key with RLS for security
- The app works without auth for read/view; auth gates only write operations
- Leaflet is chosen over Mapbox/Google Maps to avoid API key costs
