-- Add description column to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
