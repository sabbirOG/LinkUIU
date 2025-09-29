-- Update departments with full names
-- Run this if you have an existing database

SET NAMES utf8mb4;

-- Update existing departments with full names
UPDATE departments SET name = 'CSE (Computer Science & Engineering)' WHERE id = 1;
UPDATE departments SET name = 'EEE (Electrical & Electronic Engineering)' WHERE id = 2;
UPDATE departments SET name = 'BBA (Business Administration)' WHERE id = 3;
UPDATE departments SET name = 'CE (Civil Engineering)' WHERE id = 4;
UPDATE departments SET name = 'ECO (Economics)' WHERE id = 5;
UPDATE departments SET name = 'EDS (Environment and Development Studies)' WHERE id = 6;
UPDATE departments SET name = 'English (English Language & Literature)' WHERE id = 7;
UPDATE departments SET name = 'BGE (Biotechnology & Genetic Engineering)' WHERE id = 8;
UPDATE departments SET name = 'Pharmacy' WHERE id = 9;

-- Add new department if it doesn't exist
INSERT IGNORE INTO departments (id, name) VALUES (10, 'MSJ (Media Studies and Journalism)');

-- Verify the updates
SELECT * FROM departments ORDER BY id;
