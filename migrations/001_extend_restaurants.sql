-- Idempotent migration: extend the existing restaurants table with the columns
-- the UI/types require (address, genre, photos, rating, geolocation, etc.).
-- Run once against your Neon/Vercel Postgres database.
--
-- Vercel dashboard → Storage → your Postgres → "Query" tab, paste, run.
-- Or locally: psql "$POSTGRES_URL" -f migrations/001_extend_restaurants.sql

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address      TEXT    NOT NULL DEFAULT '';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS hours        TEXT    NOT NULL DEFAULT '';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS open_days    TEXT    NOT NULL DEFAULT '';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS genre        TEXT    NOT NULL DEFAULT 'その他';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS foods        TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS photos       TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS price        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS rating       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS visited_at   DATE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS comment      TEXT    NOT NULL DEFAULT '';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_favorite  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS latitude     DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS longitude    DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill: copy legacy `description` into `comment` once, only when comment is empty.
UPDATE restaurants
SET comment = description
WHERE comment = '' AND description IS NOT NULL AND description <> '';

-- Backfill: lift legacy `image_url` into the photos array if photos is still empty.
UPDATE restaurants
SET photos = ARRAY[image_url]
WHERE (photos IS NULL OR photos = '{}') AND image_url IS NOT NULL AND image_url <> '';

-- Helpful index for genre filtering (not strictly required for tiny datasets).
CREATE INDEX IF NOT EXISTS restaurants_genre_idx ON restaurants (genre);
