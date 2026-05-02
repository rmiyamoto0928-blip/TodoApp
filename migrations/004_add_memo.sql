-- Migration 004 — separate "メモ" field for line-itemized detail (often a
-- per-item price breakdown like "ラーメン 1200円 / 餃子 500円"). Distinct from
-- `comment` which is the user's overall 感想 / impression.

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS memo TEXT NOT NULL DEFAULT '';
ALTER TABLE hotels      ADD COLUMN IF NOT EXISTS memo TEXT NOT NULL DEFAULT '';
ALTER TABLE spots       ADD COLUMN IF NOT EXISTS memo TEXT NOT NULL DEFAULT '';
ALTER TABLE plans       ADD COLUMN IF NOT EXISTS memo TEXT NOT NULL DEFAULT '';
