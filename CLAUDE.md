@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This project runs **Next.js 16.2.4** with **React 19.2.4**. APIs and conventions differ from earlier Next.js versions you may have memorized. Before writing non-trivial Next.js or React code, consult `node_modules/next/dist/docs/` for the relevant guide and respect deprecation notices. Do not assume App Router behavior from older versions.

## Commands

- `npm run dev` — start dev server on port 3000
- `npm run build` — production build (also the fastest way to surface type errors, since there is no separate `tsc` script)
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test suite.

## Architecture

A Japanese-language personal review app for restaurants (`restaurants`), hotels (`hotels`), and tourist spots (`spots`), plus a recommendations view (`/plan`) and favorites (`/favorites`).

### Data layer (intentionally minimal)

- **Storage is a single JSON file** at `data/db.json`, read/written synchronously via `fs` in `lib/db.ts`. There is no real database, no migrations, no connection pool. Every mutation rewrites the entire file.
- `lib/db.ts` exports three repos (`restaurantRepo`, `hotelRepo`, `spotRepo`) with identical CRUD shape. When adding a new entity, mirror this pattern rather than introducing an ORM.
- Because writes hit the filesystem and the dev server runs a single Node process, this is **not safe for concurrent writes or for serverless deployment**. Keep that in mind before suggesting Vercel-style hosting.
- Domain types live in `lib/types.ts`. Entity unions (`RestaurantGenre`, `SpotGenre`, `HotelCategory`) are Japanese string literals — preserve them as-is when editing.
- Hotels have three sub-ratings (food/bath/room); use `hotelOverallRating` from `lib/utils.ts` rather than averaging by hand.

### Routes

- App Router under `app/`. Each entity has `app/<entity>/page.tsx` (list), `app/<entity>/new/page.tsx` (create), and `app/<entity>/[id]/page.tsx` (detail/edit).
- API handlers under `app/api/<entity>/route.ts` are thin wrappers over the repos. The upload endpoint at `app/api/upload/route.ts` writes binaries to `public/uploads/` — referenced photos are stored as `/uploads/<filename>` paths and allowed in `next.config.ts` via `images.localPatterns`.

### Components

- `components/ui/` — generic, entity-agnostic widgets (rating displays, search bar, voice input, image upload, map embed, etc.).
- `components/<entity>/` — entity-specific Card / Detail / Form trios.
- `components/layout/` — `TabNavigation` (bottom tab bar) and `PwaInit` (service worker bootstrap; manifest + icons live in `public/`).

### Recommendations

`lib/recommendation.ts` ranks all entities by a hand-tuned scoring function (rating, favorite status, recency, genre variety) and returns the top N for `/plan`. When adding new entities or fields, extend the per-entity `score*` and `reasonsFor*` helpers — the public `getRecommendations` signature takes the three lists explicitly.

### Path alias

`@/*` resolves to the project root (see `tsconfig.json`). Use it for cross-directory imports.
