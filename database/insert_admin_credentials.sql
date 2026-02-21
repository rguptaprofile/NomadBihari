-- Insert Admin Credentials for Nomad Bihari
-- Use this script to add admin users to the database

-- Note: Passwords should be hashed using bcryptjs before storing
-- Temporary: Insert admins with placeholder hashes (you'll need to hash them using bcryptjs)
-- In production, use a secure password hashing mechanism

-- Admin 1: gupta.rahul.hru@gmail.com / Admin1-9525.com
-- Admin 2: kumarravi69600@gmail.com / Chudail@143

-- Delete existing admins (optional - for reset purposes)
-- DELETE FROM admin WHERE email IN ('gupta.rahul.hru@gmail.com', 'kumarravi69600@gmail.com');

-- Insert Admin 1
-- Hash password with bcryptjs: Admin1-9525.com -> $2a$10$...
INSERT INTO admin (email, password_hash, admin_name, created_at, updated_at) VALUES
('gupta.rahul.hru@gmail.com', '$2a$10$Q4Qjfj5B5T5gJ5gJ5gJ5g.U5gJ5gJ5gJ5gJ5gJ5gJ5gJ5gJ5gJ5gJ5', 'Rahul Gupta', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Insert Admin 2
-- Hash password with bcryptjs: Chudail@143 -> $2a$10$...
INSERT INTO admin (email, password_hash, admin_name, created_at, updated_at) VALUES
('kumarravi69600@gmail.com', '$2a$10$L4L4L4L4L4L4L4L4L4L4L.L4L4L4L4L4L4L4L4L4L4L4L4L4L4L4L4L', 'Ravi Kumar', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Verify insertion
SELECT id, email, admin_name, created_at FROM admin ORDER BY id DESC LIMIT 2;
