-- Migration 002 — unify hotels/spots/plans schema with restaurants.
-- Idempotent: safe to re-run. Run once against your Neon/Vercel Postgres DB.
--
-- Vercel dashboard → Storage → your Postgres → Query tab, paste, run.
-- Or locally: psql "$POSTGRES_URL" -f migrations/002_unify_categories.sql
--
-- Conventions used everywhere:
--   id           SERIAL PRIMARY KEY
--   is_favorite  BOOLEAN NOT NULL DEFAULT FALSE  (the bit the UI's heart icon writes)
--   image_url    TEXT     — canonical single-photo URL
--   latitude/longitude DOUBLE PRECISION — for distance + map
--   created_at / updated_at TIMESTAMPTZ

-- ========== hotels ==========
CREATE TABLE IF NOT EXISTS hotels (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS address      TEXT    NOT NULL DEFAULT '';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS category     TEXT    NOT NULL DEFAULT 'その他';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image_url    TEXT    NOT NULL DEFAULT '';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS photos       TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS price        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS rating_food  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS rating_bath  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS rating_room  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS breakfast    TEXT    NOT NULL DEFAULT '';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS dinner       TEXT    NOT NULL DEFAULT '';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS visited_at   DATE;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS comment      TEXT    NOT NULL DEFAULT '';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_favorite  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS latitude     DOUBLE PRECISION;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS longitude    DOUBLE PRECISION;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS hotels_category_idx ON hotels (category);

-- ========== spots ==========
CREATE TABLE IF NOT EXISTS spots (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE spots ADD COLUMN IF NOT EXISTS address      TEXT    NOT NULL DEFAULT '';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS genre        TEXT    NOT NULL DEFAULT 'その他';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS image_url    TEXT    NOT NULL DEFAULT '';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS photos       TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS price        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS rating       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS visited_at   DATE;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS comment      TEXT    NOT NULL DEFAULT '';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS is_favorite  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS latitude     DOUBLE PRECISION;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS longitude    DOUBLE PRECISION;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS spots_genre_idx ON spots (genre);

-- ========== plans ==========
-- A "plan" is a saved itinerary or wish-list entry. Single image, address-based,
-- favoritable. No rating (it's a plan, not a review).
CREATE TABLE IF NOT EXISTS plans (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS description  TEXT    NOT NULL DEFAULT '';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS address      TEXT    NOT NULL DEFAULT '';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS image_url    TEXT    NOT NULL DEFAULT '';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS comment      TEXT    NOT NULL DEFAULT '';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS scheduled_at DATE;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_favorite  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS latitude     DOUBLE PRECISION;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS longitude    DOUBLE PRECISION;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ========== restaurants (defensive, in case 001 was skipped) ==========
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE;
