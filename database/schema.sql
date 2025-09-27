-- Link UIU Database
-- Complete MySQL Schema (from user-provided file)
-- ======================================

-- Connection/session defaults
SET NAMES utf8mb4;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- Create and use database if not present
CREATE DATABASE IF NOT EXISTS link_uiu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE link_uiu_db;

-- 1. Drop existing tables if any
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS batches;

-- 2. Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Batches Table
CREATE TABLE batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trimester INT NOT NULL UNIQUE
);

-- 4. Users Table (Alumni & Students)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    student_id CHAR(10) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('alumni','student') NOT NULL,
    department_id INT NOT NULL,
    batch_id INT DEFAULT NULL,
    current_job VARCHAR(100),
    designation VARCHAR(100),
    company VARCHAR(100),
    location_city VARCHAR(50),
    location_country VARCHAR(50),
    skills TEXT,
    interests TEXT,
    linkedin VARCHAR(255),
    github VARCHAR(255),
    website VARCHAR(255),
    resume VARCHAR(255),
    profile_visibility ENUM('public','private') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4b. Sessions Table (Token-based auth)
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Connections Table
CREATE TABLE connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    connection_id INT NOT NULL,
    status ENUM('pending','accepted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_connection (user_id, connection_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Jobs Table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    posted_by INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    description TEXT,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Job Applications Table
CREATE TABLE job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    cover_letter TEXT,
    resume VARCHAR(255),
    status ENUM('applied','accepted','rejected') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (job_id, student_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================================
-- Indexes for performance
-- ======================================
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_batch ON users(batch_id);
CREATE INDEX idx_users_location ON users(location_city, location_country);
CREATE INDEX idx_users_skills ON users(skills(50));
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_messages_pair ON messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_connections_pair ON connections(user_id, connection_id);
CREATE INDEX idx_jobs_poster ON jobs(posted_by, created_at);
CREATE INDEX idx_job_applications_lookup ON job_applications(job_id, student_id, status);
CREATE INDEX idx_jobs_title_company ON jobs(title, company);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Optional (enable when advanced search is needed and MySQL version supports it):
-- ALTER TABLE users ADD FULLTEXT INDEX fulltext_users_skills (skills);

-- ======================================
-- Sample Data Insert (Optional)
-- ======================================
INSERT INTO departments (name) VALUES ('CSE'), ('EEE'), ('BBA'), ('CE'), ('ECO'), ('EDS'), ('English'), ('BGE'), ('Pharm');
INSERT INTO batches (trimester) VALUES (171), (172), (173), (181), (182), (183), (191), (192), (193), (201), (202), (203), (211), (212), (213), (221), (222), (223), (241), (242), (243), (251), (252);

-- Sample user inserts are provided in database/seed.sql. Keeping schema import clean.


