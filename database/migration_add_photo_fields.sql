-- Migration: Add cover_photo and profile_photo fields to users table
-- Run this if you have an existing database without these fields

USE link_uiu_db;

-- Add cover_photo field
ALTER TABLE users ADD COLUMN cover_photo VARCHAR(255) AFTER resume;

-- Add profile_photo field  
ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) AFTER cover_photo;

-- Verify the changes
DESCRIBE users;
