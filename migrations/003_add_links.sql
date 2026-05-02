-- Migration 003 — add a `links` text[] column to every category.
-- Stores homepage / SNS / Tabelog / etc. URLs as a list. Idempotent.

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS links TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE hotels      ADD COLUMN IF NOT EXISTS links TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE spots       ADD COLUMN IF NOT EXISTS links TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE plans       ADD COLUMN IF NOT EXISTS links TEXT[] NOT NULL DEFAULT '{}';
