-- Activity Logging Tables for Nomad Bihari

-- User Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (activity_type),
  INDEX (created_at)
);

-- Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE,
  INDEX (admin_id),
  INDEX (activity_type),
  INDEX (created_at)
);

-- Website Analytics Table
CREATE TABLE IF NOT EXISTS website_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  activity_type VARCHAR(50),
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (user_id),
  INDEX (activity_type),
  INDEX (created_at)
);
