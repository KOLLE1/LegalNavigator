-- MySQL Database Setup for LawHelp Application
-- Run this script in MySQL Workbench to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS lawhelp_db;
USE lawhelp_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'lawyer', 'admin') DEFAULT 'user',
  is_lawyer BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method VARCHAR(50),
  two_factor_secret VARCHAR(255),
  backup_codes JSON,
  location VARCHAR(255),
  profile_image_url VARCHAR(500),
  last_active TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('active', 'completed', 'archived') DEFAULT 'active',
  language ENUM('en', 'fr') DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  confidence DECIMAL(3,2),
  references_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Lawyers table
CREATE TABLE IF NOT EXISTS lawyers (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) NOT NULL UNIQUE,
  specialization JSON NOT NULL,
  experience_years INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  languages JSON NOT NULL,
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  education JSON,
  certifications JSON,
  availability_schedule JSON,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_ratings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Lawyer ratings table
CREATE TABLE IF NOT EXISTS lawyer_ratings (
  id VARCHAR(255) PRIMARY KEY,
  lawyer_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verification codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type ENUM('email_verification', 'password_reset', 'two_factor') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table for express-session
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires BIGINT UNSIGNED NOT NULL,
  data TEXT
);

-- Insert sample data for testing
INSERT INTO users (id, name, email, password_hash, first_name, last_name, role) VALUES
('user1', 'John Doe', 'john@example.com', '$2b$10$example_hash', 'John', 'Doe', 'user'),
('lawyer1', 'Jane Smith', 'jane@lawfirm.com', '$2b$10$example_hash', 'Jane', 'Smith', 'lawyer');

INSERT INTO lawyers (id, user_id, license_number, specialization, experience_years, location, languages) VALUES
('lawyer1', 'lawyer1', 'CAM001', '["Criminal Law", "Family Law"]', 5, 'Yaoundé', '["English", "French"]');

SELECT 'Database setup completed successfully!' as Result;