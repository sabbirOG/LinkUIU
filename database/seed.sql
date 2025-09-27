-- Seed data for LinkUIU (MySQL)
-- Adjust IDs/emails as needed. Assumes tables exist per schema.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Users
INSERT INTO users (id, name, email, student_id, password, user_type, department_id, batch_id, current_job, designation, company, location_city, location_country, skills, interests, linkedin, github, website, resume, profile_visibility) VALUES
  (1, 'Alice Ahmed', 'alice@alumni.uiu.ac.bd', '011111111', '$2y$10$Oq3Y0dJ3c0EO2v8v3v2W6O8oXwM4aQ9X3k4kK9w4H0Gkzq8o8m1mS', 'alumni', 1, 223, 'Software Engineer', 'Engineer', 'TechNova', 'Dhaka', 'Bangladesh', 'PHP,MySQL,REST', NULL, 'https://linkedin.com/in/alice', NULL, NULL, NULL, 'public'),
  (2, 'Bashir Khan', 'bashir@bscse.uiu.ac.bd', '012222222', '$2y$10$Oq3Y0dJ3c0EO2v8v3v2W6O8oXwM4aQ9X3k4kK9w4H0Gkzq8o8m1mS', 'student', 1, 243, NULL, NULL, NULL, 'Chittagong', 'Bangladesh', 'Python,Data', NULL, NULL, NULL, NULL, NULL, 'public'),
  (3, 'Chaya Rahman', 'chaya@alumni.uiu.ac.bd', '013333333', '$2y$10$Oq3Y0dJ3c0EO2v8v3v2W6O8oXwM4aQ9X3k4kK9w4H0Gkzq8o8m1mS', 'alumni', 1, 223, 'Product Manager', 'PM', 'BrightApps', 'Sylhet', 'Bangladesh', 'Product,Agile', NULL, 'https://linkedin.com/in/chaya', NULL, NULL, NULL, 'public')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Jobs
INSERT INTO jobs (id, posted_by, title, company, description, location, created_at) VALUES
  (1, 1, 'Backend Developer', 'TechNova', 'Build APIs in PHP', 'Dhaka', NOW()),
  (2, 1, 'Data Analyst', 'InsightWorks', 'SQL + dashboards', 'Chittagong', NOW()),
  (3, 3, 'Product Manager', 'BrightApps', 'Own roadmap and execution', 'Sylhet', NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Connections (1->2, 1->3)
INSERT INTO connections (id, user_id, connection_id, status) VALUES
  (1, 1, 2, 'accepted'),
  (2, 1, 3, 'pending')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Messages (between 1 and 2)
INSERT INTO messages (id, sender_id, receiver_id, message, created_at) VALUES
  (1, 1, 2, 'Hey Bashir, good to connect!', NOW()),
  (2, 2, 1, 'Hi Alice! Likewise. Are you hiring?', NOW())
ON DUPLICATE KEY UPDATE message = VALUES(message);

SET FOREIGN_KEY_CHECKS = 1;

-- Note: The password hash here is a placeholder. Consider regenerating
-- with password_hash('yourpassword', PASSWORD_DEFAULT) and replacing.


