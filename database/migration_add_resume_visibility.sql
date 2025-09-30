-- Migration: Add resume_visibility field to users table
-- This migration adds a new field to control resume visibility (public/private)

USE link_uiu_db;

-- Add resume_visibility field to users table
ALTER TABLE users 
ADD COLUMN resume_visibility ENUM('public','private') DEFAULT 'private' 
AFTER resume;

-- Update existing records to have private resume visibility by default
UPDATE users SET resume_visibility = 'private' WHERE resume_visibility IS NULL;
